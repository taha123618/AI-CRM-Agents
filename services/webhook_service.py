"""Universal Outbound Webhook Dispatch and Inbound Verification Engine."""

import hmac
import hashlib
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from database.models import WebhookEndpoint, WebhookDelivery


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
    """Dispatch an event asynchronously to all active subscribed webhook endpoints."""
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
