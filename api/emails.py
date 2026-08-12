"""Emails API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from database.connection import get_db
from database.models import Email

router = APIRouter()


class EmailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[str, UUID]
    subject: Optional[str] = None
    sentiment: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    draft_response: Optional[str] = None
    response_sent: Optional[bool] = False
    received_at: Optional[str] = None

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
        received = None
        if email.received_at:
            received = email.received_at.isoformat()
        return cls(
            id=email.id,
            subject=email.subject,
            sentiment=email.sentiment,
            category=email.category,
            priority=email.priority,
            draft_response=email.draft_response,
            response_sent=email.response_sent,
            received_at=received,
            sentiment_score=email.sentiment_score,
            emotion=email.emotion,
            follow_up_suggestions=meta.get("follow_up_suggestions"),
        )


class EmailSendRequest(BaseModel):
    reply_text: str


@router.get("/", response_model=List[EmailResponse])
async def list_emails(
    skip: int = 0,
    limit: int = 100,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List emails"""
    query = db.query(Email)
    if priority:
        query = query.filter(Email.priority == priority)
    emails = query.offset(skip).limit(limit).all()
    return [EmailResponse.from_orm_email(e) for e in emails]


@router.post("/{email_id}/send")
async def send_email_response(
    email_id: str,
    payload: EmailSendRequest,
    db: Session = Depends(get_db),
):
    """Mark email response as sent with final reply text"""
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    email.draft_response = payload.reply_text
    email.response_sent = True
    db.commit()
    db.refresh(email)
    return {"status": "sent", "email_id": email_id, "reply_text": payload.reply_text}
