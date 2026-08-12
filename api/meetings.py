"""Meetings API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from database.connection import get_db
from database.models import Meeting

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


@router.get("/", response_model=List[MeetingResponse])
async def list_meetings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List meetings"""
    meetings = db.query(Meeting).offset(skip).limit(limit).all()
    return meetings


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
):
    """Update meeting details by ID"""
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

    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    """Delete meeting by ID"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"status": "deleted", "meeting_id": meeting_id}
