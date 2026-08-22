"""Emails API Endpoints with Centralized Email Service Delivery Pipeline."""

import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional, Union
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Email, Contact, User
from services.task_queue_service import task_queue
from services.audit_service import record_audit_log
from services.auth_service import require_auth
from loguru import logger

router = APIRouter()


class EmailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[str, UUID]
    from_email: Optional[str] = None
    to_email: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    direction: Optional[str] = None
    sentiment: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    draft_response: Optional[str] = None
    response_sent: Optional[bool] = False
    received_at: Optional[str] = None
    sent_at: Optional[str] = None

    # AI EmailIntelligenceAgent enriched fields
    sentiment_score: Optional[int] = None
    emotion: Optional[str] = None
    follow_up_suggestions: Optional[List[str]] = None

    @field_validator("follow_up_suggestions", mode="before")
    @classmethod
    def coerce_suggestions(cls, v: Any) -> Optional[List[str]]:
        if isinstance(v, list):
            return v
        return None

    @classmethod
    def from_orm_email(cls, email: Email) -> "EmailResponse":
        meta = email.additional_metadata or {}
        received = email.received_at.isoformat() if email.received_at else None
        sent = email.sent_at.isoformat() if email.sent_at else None
        return cls(
            id=email.id,
            from_email=email.from_email,
            to_email=email.to_email,
            subject=email.subject,
            body=email.body,
            direction=email.direction,
            sentiment=email.sentiment,
            category=email.category,
            priority=email.priority,
            draft_response=email.draft_response,
            response_sent=bool(email.response_sent),
            received_at=received,
            sent_at=sent,
            sentiment_score=email.sentiment_score,
            emotion=email.emotion,
            follow_up_suggestions=meta.get("follow_up_suggestions"),
        )


class EmailSendRequest(BaseModel):
    reply_text: str = Field(..., min_length=1, description="Reply content to deliver")
    to_email: Optional[str] = Field(None, description="Optional recipient email override")
    subject: Optional[str] = Field(None, description="Optional custom reply subject")


class EmailComposeRequest(BaseModel):
    to_email: EmailStr = Field(..., description="Target recipient email address")
    subject: str = Field(..., min_length=1, max_length=255, description="Email subject line")
    body: str = Field(..., min_length=1, description="Email body content")
    recipient_name: Optional[str] = Field(None, description="Optional recipient display name")
    contact_id: Optional[str] = Field(None, description="Optional associated contact ID")


@router.get("/", response_model=List[EmailResponse])
async def list_emails(
    skip: int = 0,
    limit: int = 100,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """List emails with priority filtering and AI enrichment."""
    query = db.query(Email)
    if priority and priority.lower() != "all":
        query = query.filter(Email.priority == priority)
    emails = query.order_by(Email.created_at.desc()).offset(skip).limit(limit).all()
    return [EmailResponse.from_orm_email(e) for e in emails]


@router.get("/{email_id}", response_model=EmailResponse)
async def get_email(email_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_auth)):
    """Fetch single email details by ID."""
    email = None
    try:
        email = db.query(Email).filter(Email.id == uuid.UUID(email_id)).first()
    except Exception:
        email = db.query(Email).filter(Email.id == email_id).first()

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return EmailResponse.from_orm_email(email)


@router.post("/{email_id}/send")
async def send_email_response(
    email_id: str,
    payload: EmailSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Deliver email reply to the intended recipient via the background task queue and centralized email_service."""
    email = None
    try:
        email = db.query(Email).filter(Email.id == uuid.UUID(email_id)).first()
    except Exception:
        email = db.query(Email).filter(Email.id == email_id).first()

    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    # Step 1: Resolve intended recipient address
    resolved_recipient = payload.to_email
    if not resolved_recipient:
        # Inbound email: send reply to the sender (from_email)
        resolved_recipient = email.from_email or email.to_email

    if not resolved_recipient and email.contact_id:
        contact = db.query(Contact).filter(Contact.id == email.contact_id).first()
        if contact and contact.email:
            resolved_recipient = contact.email

    if not resolved_recipient or "@" not in resolved_recipient:
        raise HTTPException(
            status_code=422,
            detail="Cannot determine valid recipient email address for response.",
        )

    # Step 2: Determine reply subject
    subject = payload.subject
    if not subject:
        orig_subject = email.subject or "Inquiry"
        if not orig_subject.lower().startswith("re:"):
            subject = f"Re: {orig_subject}"
        else:
            subject = orig_subject

    recipient_name = None
    if email.contact:
        recipient_name = f"{email.contact.first_name} {email.contact.last_name}".strip()

    logger.info(f"Queueing email response for email_id={email_id} to recipient='{resolved_recipient}'")

    # Step 3: Enqueue delivery in background task queue (delegates to centralized email_service)
    job = await task_queue.enqueue_email(
        to_email=resolved_recipient,
        subject=subject,
        body=payload.reply_text,
        recipient_name=recipient_name,
        metadata={
            "email_id": str(email.id),
            "action": "reply_response",
            "source": "EmailsFeature",
        },
    )

    # Step 4: Update Email record in database
    email.draft_response = payload.reply_text
    email.response_sent = True
    email.sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(email)

    record_audit_log(
        db=db,
        entity_type="email",
        entity_id=str(email.id),
        action="reply_dispatched",
        actor="system_user",
        details={"recipient": resolved_recipient, "task_id": job.task_id, "subject": subject},
    )

    return {
        "status": "sent",
        "email_id": str(email.id),
        "recipient": resolved_recipient,
        "subject": subject,
        "task_id": job.task_id,
        "reply_text": payload.reply_text,
        "message": f"Email reply queued for delivery to {resolved_recipient}",
    }


@router.post("/compose", status_code=201)
async def compose_and_send_email(
    payload: EmailComposeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Compose and immediately queue a new outbound email to a customer or lead."""
    contact = None
    contact_id = None
    if payload.contact_id:
        try:
            contact = db.query(Contact).filter(Contact.id == uuid.UUID(payload.contact_id)).first()
            if contact:
                contact_id = contact.id
        except Exception:
            pass

    # Create outbound Email record
    new_email = Email(
        contact_id=contact_id,
        from_email=None,  # Handled by EMAIL_FROM
        to_email=payload.to_email,
        subject=payload.subject,
        body=payload.body,
        direction="outbound",
        priority="medium",
        draft_response=payload.body,
        response_sent=True,
        sent_at=datetime.now(timezone.utc),
    )
    db.add(new_email)
    db.commit()
    db.refresh(new_email)

    # Enqueue delivery in background queue
    job = await task_queue.enqueue_email(
        to_email=payload.to_email,
        subject=payload.subject,
        body=payload.body,
        recipient_name=payload.recipient_name,
        metadata={
            "email_id": str(new_email.id),
            "action": "compose_outbound",
            "source": "EmailsFeature",
        },
    )

    return {
        "status": "sent",
        "email_id": str(new_email.id),
        "recipient": payload.to_email,
        "subject": payload.subject,
        "task_id": job.task_id,
        "message": f"Outbound email queued for delivery to {payload.to_email}",
    }
