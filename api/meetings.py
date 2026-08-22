"""Meetings API Endpoints with Centralized Email Notification Pipeline"""

import uuid
from datetime import datetime
from typing import Any, List, Optional, Union
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Meeting, User
from services.task_queue_service import task_queue
from services.audit_service import record_audit_log
from services.auth_service import require_auth
from loguru import logger

router = APIRouter()


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[str, UUID]
    title: str
    meeting_type: Optional[str] = None
    scheduled_at: Union[str, datetime]
    duration_minutes: Optional[int] = 30
    location: Optional[str] = None
    agenda: Optional[Any] = None
    prep_materials: Optional[Any] = None
    notes: Optional[str] = None
    status: Optional[str] = "scheduled"

    # AI MeetingSchedulerAgent enriched fields
    attendees: Optional[Any] = None
    followup_tasks: Optional[List[str]] = None

    @field_validator("followup_tasks", mode="before")
    @classmethod
    def coerce_tasks(cls, v: Any) -> Optional[List[str]]:
        if isinstance(v, list):
            return v
        return None


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    meeting_type: Optional[str] = None
    scheduled_at: Optional[Union[str, datetime]] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    attendees: Optional[Any] = None


class MeetingInviteRequest(BaseModel):
    attendee_emails: Optional[List[str]] = Field(None, description="Optional override list of attendee email addresses")
    custom_note: Optional[str] = Field(None, description="Optional custom preparation note")


@router.get("/", response_model=List[MeetingResponse])
async def list_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(require_auth)):
    """List meetings with attendee and prep information."""
    meetings = db.query(Meeting).order_by(Meeting.scheduled_at.desc()).offset(skip).limit(limit).all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_auth)):
    """Get single meeting details by ID."""
    meeting = None
    try:
        meeting = db.query(Meeting).filter(Meeting.id == uuid.UUID(meeting_id)).first()
    except Exception:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Update meeting details by ID."""
    meeting = None
    try:
        meeting = db.query(Meeting).filter(Meeting.id == uuid.UUID(meeting_id)).first()
    except Exception:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if payload.title is not None:
        meeting.title = payload.title
    if payload.meeting_type is not None:
        meeting.meeting_type = payload.meeting_type
    if payload.scheduled_at is not None:
        if isinstance(payload.scheduled_at, str):
            try:
                meeting.scheduled_at = datetime.fromisoformat(
                    payload.scheduled_at.replace("Z", "+00:00")
                )
            except ValueError:
                pass
        else:
            meeting.scheduled_at = payload.scheduled_at
    if payload.duration_minutes is not None:
        meeting.duration_minutes = payload.duration_minutes
    if payload.location is not None:
        meeting.location = payload.location
    if payload.notes is not None:
        meeting.notes = payload.notes
    if payload.status is not None:
        meeting.status = payload.status
    if payload.attendees is not None:
        meeting.attendees = payload.attendees

    db.commit()
    db.refresh(meeting)
    return meeting


@router.post("/{meeting_id}/send-invite")
async def send_meeting_invite_email(
    meeting_id: str,
    payload: Optional[MeetingInviteRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Dispatch meeting briefing & Google Meet invitation email to attendees via the centralized email queue."""
    meeting = None
    try:
        meeting = db.query(Meeting).filter(Meeting.id == uuid.UUID(meeting_id)).first()
    except Exception:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Resolve recipient email addresses
    recipients = []
    if payload and payload.attendee_emails:
        recipients.extend(payload.attendee_emails)

    if not recipients and meeting.attendees:
        if isinstance(meeting.attendees, list):
            for a in meeting.attendees:
                if isinstance(a, str) and "@" in a:
                    recipients.append(a)
                elif isinstance(a, dict) and a.get("email"):
                    recipients.append(a["email"])
        elif isinstance(meeting.attendees, str) and "@" in meeting.attendees:
            recipients.append(meeting.attendees)

    if not recipients and meeting.deal and meeting.deal.contact and meeting.deal.contact.email:
        recipients.append(meeting.deal.contact.email)

    if not recipients:
        raise HTTPException(
            status_code=422,
            detail="No valid attendee email addresses found for this meeting.",
        )

    # Format email content
    scheduled_str = meeting.scheduled_at.isoformat() if hasattr(meeting.scheduled_at, "isoformat") else str(meeting.scheduled_at)
    agenda_str = ""
    if isinstance(meeting.agenda, list) and meeting.agenda:
        agenda_str = "\n".join([f"• {item}" for item in meeting.agenda])
    elif meeting.agenda:
        agenda_str = str(meeting.agenda)
    else:
        agenda_str = "• Welcome & Project Alignment\n• Architecture Review & Security Q&A\n• Next Steps & Pricing"

    prep_notes = ""
    if payload and payload.custom_note:
        prep_notes = f"\n\nOrganizer Note:\n{payload.custom_note}"
    elif meeting.notes:
        prep_notes = f"\n\nPreparation Briefing:\n{meeting.notes}"

    subject = f"Meeting Invitation & Briefing: {meeting.title}"
    body = f"""You have a confirmed meeting scheduled.

Meeting Summary:
• Title: {meeting.title}
• Type: {meeting.meeting_type or 'Meeting'}
• Date & Time: {scheduled_str}
• Duration: {meeting.duration_minutes or 30} minutes
• Location: {meeting.location or 'Google Meet (auto-generated)'}

Proposed Agenda:
{agenda_str}{prep_notes}

Please let us know if you need any adjustments."""

    dispatched = []
    for recipient in set(recipients):
        job = await task_queue.enqueue_email(
            to_email=recipient,
            subject=subject,
            body=body,
            metadata={
                "meeting_id": str(meeting.id),
                "action": "meeting_invitation",
                "source": "MeetingsFeature",
            },
        )
        dispatched.append({"recipient": recipient, "task_id": job.task_id})

    record_audit_log(
        db=db,
        entity_type="meeting",
        entity_id=str(meeting.id),
        action="invitation_emails_dispatched",
        actor="system_user",
        details={"recipients": recipients, "count": len(dispatched)},
    )

    return {
        "status": "sent",
        "meeting_id": str(meeting.id),
        "dispatched_count": len(dispatched),
        "dispatched": dispatched,
        "message": f"Meeting briefing email queued for {len(dispatched)} attendee(s)",
    }


@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_auth)):
    """Delete meeting by ID."""
    meeting = None
    try:
        meeting = db.query(Meeting).filter(Meeting.id == uuid.UUID(meeting_id)).first()
    except Exception:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"status": "deleted", "meeting_id": meeting_id}
