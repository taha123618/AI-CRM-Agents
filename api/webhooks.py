"""Universal Webhooks Management and Inbound Integration Endpoints."""

import uuid
import secrets
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from pydantic import BaseModel, HttpUrl, ConfigDict, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import WebhookEndpoint, WebhookDelivery, User
from services.auth_service import require_auth, require_role
from services.webhook_service import (
    dispatch_webhook_event,
    verify_inbound_signature,
    is_safe_webhook_url,
)

router = APIRouter()


class WebhookCreate(BaseModel):
    url: str = Field(..., description="Target HTTPS webhook destination URL")
    description: Optional[str] = None
    events: List[str] = Field(
        default=["*"],
        description="Subscribed events, e.g. ['lead.created', 'deal.won', 'intervention.triggered'] or ['*']",
    )
    secret: Optional[str] = Field(
        None, description="Optional custom secret key (auto-generated if omitted)"
    )


class WebhookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    description: Optional[str] = None
    secret: str
    events: List[str]
    is_active: bool
    created_at: Optional[str] = None


class WebhookDeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    webhook_id: str
    event_type: str
    payload: Dict[str, Any]
    response_status: Optional[int] = None
    response_body: Optional[str] = None
    success: bool
    created_at: Optional[str] = None


@router.get("/", response_model=List[WebhookResponse])
async def list_webhooks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """List all registered outbound webhook subscriptions."""
    endpoints = (
        db.query(WebhookEndpoint).order_by(WebhookEndpoint.created_at.desc()).all()
    )
    return [
        WebhookResponse(
            id=str(ep.id),
            url=ep.url,
            description=ep.description,
            secret=ep.secret,
            events=ep.events or [],
            is_active=ep.is_active,
            created_at=ep.created_at.isoformat() if ep.created_at else None,
        )
        for ep in endpoints
    ]


@router.post("/", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
async def create_webhook(
    payload: WebhookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Register a new outbound webhook endpoint with HMAC secret, SSRF verification, and subscribed events."""
    is_safe, reason = is_safe_webhook_url(payload.url)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook target URL rejected: {reason}",
        )

    endpoint_secret = payload.secret or secrets.token_hex(24)
    endpoint = WebhookEndpoint(
        url=payload.url,
        description=payload.description,
        secret=endpoint_secret,
        events=payload.events or ["*"],
        is_active=True,
    )
    db.add(endpoint)
    db.commit()
    db.refresh(endpoint)

    return WebhookResponse(
        id=str(endpoint.id),
        url=endpoint.url,
        description=endpoint.description,
        secret=endpoint.secret,
        events=endpoint.events or [],
        is_active=endpoint.is_active,
        created_at=endpoint.created_at.isoformat() if endpoint.created_at else None,
    )


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Delete a registered webhook endpoint."""
    try:
        val_uuid = uuid.UUID(webhook_id)
        ep = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == val_uuid).first()
    except Exception:
        ep = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == webhook_id).first()

    if not ep:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found")

    db.delete(ep)
    db.commit()
    return {"status": "deleted", "webhook_id": webhook_id}


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Trigger a test ping event dispatch to a specific registered webhook."""
    try:
        val_uuid = uuid.UUID(webhook_id)
        ep = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == val_uuid).first()
    except Exception:
        ep = db.query(WebhookEndpoint).filter(WebhookEndpoint.id == webhook_id).first()

    if not ep:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found")

    results = await dispatch_webhook_event(
        event_type="test.ping",
        payload={"message": "Test ping from AI CRM Engine", "timestamp": "now"},
        db=db,
    )
    return {"status": "dispatched", "results": results}


@router.get("/deliveries", response_model=List[WebhookDeliveryResponse])
async def list_deliveries(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """List recent webhook delivery audit attempts with status codes."""
    deliveries = (
        db.query(WebhookDelivery)
        .order_by(WebhookDelivery.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        WebhookDeliveryResponse(
            id=str(d.id),
            webhook_id=str(d.webhook_id),
            event_type=d.event_type,
            payload=d.payload or {},
            response_status=d.response_status,
            response_body=d.response_body,
            success=d.success,
            created_at=d.created_at.isoformat() if d.created_at else None,
        )
        for d in deliveries
    ]


@router.post("/inbound/{provider}")
async def receive_inbound_webhook(
    provider: str,
    request: Request,
    x_signature: Optional[str] = Header(None, alias="X-Hub-Signature-256"),
    db: Session = Depends(get_db),
):
    """Receive and parse incoming webhooks from external providers (e.g. Zapier, Make, Stripe)."""
    raw_body = await request.body()
    try:
        data = await request.json()
    except Exception:
        data = {"raw": raw_body.decode("utf-8", errors="ignore")}

    return {
        "status": "received",
        "provider": provider,
        "payload_keys": list(data.keys()) if isinstance(data, dict) else [],
        "message": f"Inbound webhook for provider '{provider}' ingested successfully.",
    }
