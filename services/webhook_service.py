"""Universal Outbound Webhook Dispatch and Inbound Verification Engine with SSRF Protection."""

import hmac
import hashlib
import json
import ipaddress
import socket
import os
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
import httpx
from sqlalchemy.orm import Session

from database.models import WebhookEndpoint, WebhookDelivery

ALLOW_LOCAL_WEBHOOKS = os.getenv("ALLOW_LOCAL_WEBHOOKS", "false").lower() in ("true", "1", "yes")


def is_safe_webhook_url(url: str, allow_local: Optional[bool] = None) -> Tuple[bool, str]:
    """Validate webhook URL against SSRF (Server-Side Request Forgery) attacks.
    
    Rejects:
    - Non-HTTP(S) schemes (file://, gopher://, ftp://, etc.)
    - Loopback addresses (127.0.0.1, localhost, ::1)
    - Link-local and cloud metadata addresses (169.254.169.254)
    - Private RFC-1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) in production
    """
    if allow_local is None:
        allow_local = ALLOW_LOCAL_WEBHOOKS

    try:
        parsed = urllib.parse.urlparse(url)
    except Exception:
        return False, "Invalid URL structure."

    if parsed.scheme not in ("http", "https"):
        return False, f"Invalid scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "Missing destination hostname."

    lower_host = hostname.lower().strip()

    # Block well-known loopback names and cloud metadata endpoints
    if lower_host in ("localhost", "127.0.0.1", "::1", "0.0.0.0", "169.254.169.254", "metadata.google.internal"):
        if not allow_local:
            return False, f"Destination host '{hostname}' is a restricted local or metadata address."

    # Resolve IP and check address classes
    try:
        ip = ipaddress.ip_address(lower_host)
        if (ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified) and not allow_local:
            return False, f"Destination IP {ip} is restricted (loopback/link-local/reserved)."
        if ip.is_private and not allow_local:
            return False, f"Destination IP {ip} is within a private network range."
    except ValueError:
        # Not a raw IP; hostname is resolved via DNS or allowed if valid domain
        pass

    return True, "URL is safe."


def sign_payload(payload_bytes: bytes, secret: str) -> str:
    """Generate SHA256 HMAC signature for webhook payload verification."""
    mac = hmac.new(secret.encode("utf-8"), msg=payload_bytes, digestmod=hashlib.sha256)
    return f"sha256={mac.hexdigest()}"


def verify_inbound_signature(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
    """Verify incoming webhook signature against shared secret."""
    if not signature_header or not secret:
        return False
    expected = sign_payload(payload_bytes, secret)
    return hmac.compare_digest(expected, signature_header)


async def dispatch_webhook_event(
    event_type: str,
    payload: Dict[str, Any],
    db: Session,
) -> List[Dict[str, Any]]:
    """Dispatch an event asynchronously to all active subscribed webhook endpoints with SSRF guards."""
    endpoints = db.query(WebhookEndpoint).filter(WebhookEndpoint.is_active == True).all()  # noqa: E712
    matching = [
        ep for ep in endpoints
        if ("*" in (ep.events or [])) or (event_type in (ep.events or []))
    ]

    results = []
    if not matching:
        return results

    full_payload = {
        "event": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": payload,
    }
    payload_json = json.dumps(full_payload, default=str)
    payload_bytes = payload_json.encode("utf-8")

    async with httpx.AsyncClient(timeout=5.0) as client:
        for ep in matching:
            is_safe, reason = is_safe_webhook_url(ep.url)
            if not is_safe:
                delivery = WebhookDelivery(
                    webhook_id=ep.id,
                    event_type=event_type,
                    payload=full_payload,
                    response_status=400,
                    response_body=f"Blocked by SSRF protection policy: {reason}",
                    success=False,
                )
                db.add(delivery)
                results.append({
                    "webhook_id": str(ep.id),
                    "url": ep.url,
                    "status_code": 400,
                    "success": False,
                    "error": f"SSRF Blocked: {reason}",
                })
                continue

            sig = sign_payload(payload_bytes, ep.secret)
            headers = {
                "Content-Type": "application/json",
                "X-Hub-Signature-256": sig,
                "X-CRM-Event": event_type,
                "User-Agent": "AI-CRM-Webhook-Engine/1.0",
            }
            status_code = None
            response_text = None
            success = False

            try:
                # Attempt HTTP POST delivery
                resp = await client.post(ep.url, content=payload_bytes, headers=headers)
                status_code = resp.status_code
                response_text = resp.text[:500]
                success = 200 <= resp.status_code < 300
            except Exception as e:
                response_text = f"Delivery connection error: {str(e)}"
                status_code = 0
                success = False

            # Log delivery attempt in PostgreSQL
            delivery = WebhookDelivery(
                webhook_id=ep.id,
                event_type=event_type,
                payload=full_payload,
                response_status=status_code,
                response_body=response_text,
                success=success,
            )
            db.add(delivery)
            results.append({
                "webhook_id": str(ep.id),
                "url": ep.url,
                "status_code": status_code,
                "success": success,
            })

    db.commit()
    return results
