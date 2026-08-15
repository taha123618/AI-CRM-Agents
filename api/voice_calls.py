"""FastAPI Router for Voice AI Call Intelligence & Transcripts."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import uuid

from database.connection import get_db
from database.models import VoiceCall
from agents.voice_call_agent import VoiceCallAgent

router = APIRouter()
voice_agent = VoiceCallAgent()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class VoiceCallCreateSchema(BaseModel):
    contact_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=5)
    direction: str = Field("outbound")
    status: str = Field("completed")
    duration_seconds: int = Field(120, ge=0)
    sentiment: str = Field("positive")
    buyer_intent_score: int = Field(75, ge=0, le=100)
    summary: Optional[str] = None
    recording_url: Optional[str] = None
    action_items: List[str] = Field(default_factory=list)
    objections_handled: List[str] = Field(default_factory=list)


class VoiceTurnAnalyzeSchema(BaseModel):
    speaker: str = Field("prospect", description="rep or prospect")
    text: str = Field(..., min_length=1)
    call_context: Optional[Dict[str, Any]] = None


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("", response_model=List[Dict[str, Any]])
def list_voice_calls(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Fetch call records with sentiment and buyer intent score."""
    calls = db.query(VoiceCall).order_by(VoiceCall.created_at.desc()).limit(limit).all()
    return [
        {
            "id": str(c.id),
            "contact_name": c.contact_name,
            "phone_number": c.phone_number,
            "direction": c.direction,
            "status": c.status,
            "duration_seconds": c.duration_seconds,
            "sentiment": c.sentiment,
            "buyer_intent_score": c.buyer_intent_score,
            "summary": c.summary,
            "recording_url": c.recording_url,
            "action_items": c.action_items or [],
            "objections_handled": c.objections_handled or [],
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in calls
    ]


@router.post("", response_model=Dict[str, Any], status_code=201)
def create_voice_call(
    payload: VoiceCallCreateSchema,
    db: Session = Depends(get_db),
):
    """Record a voice call and generate automated action items."""
    call = VoiceCall(
        id=uuid.uuid4(),
        contact_name=payload.contact_name,
        phone_number=payload.phone_number,
        direction=payload.direction,
        status=payload.status,
        duration_seconds=payload.duration_seconds,
        sentiment=payload.sentiment,
        buyer_intent_score=payload.buyer_intent_score,
        summary=payload.summary or f"Call with {payload.contact_name} concluded.",
        recording_url=payload.recording_url,
        action_items=payload.action_items or [f"Follow up with {payload.contact_name}"],
        objections_handled=payload.objections_handled or ["Pricing", "Timeline"],
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    return {
        "status": "success",
        "id": str(call.id),
        "contact_name": call.contact_name,
        "buyer_intent_score": call.buyer_intent_score,
    }


@router.get("/{call_id}", response_model=Dict[str, Any])
def get_voice_call(call_id: str, db: Session = Depends(get_db)):
    """Fetch call details and associated dialogue transcripts."""
    try:
        val_uuid = uuid.UUID(call_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid call ID format.")

    call = db.query(VoiceCall).filter(VoiceCall.id == val_uuid).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found.")

    transcripts = [
        {
            "id": str(t.id),
            "speaker": t.speaker,
            "text": t.text,
            "timestamp_seconds": t.timestamp_seconds,
            "sentiment": t.sentiment,
            "coaching_tip": t.coaching_tip,
        }
        for t in call.transcripts
    ]

    return {
        "id": str(call.id),
        "contact_name": call.contact_name,
        "phone_number": call.phone_number,
        "direction": call.direction,
        "status": call.status,
        "duration_seconds": call.duration_seconds,
        "sentiment": call.sentiment,
        "buyer_intent_score": call.buyer_intent_score,
        "summary": call.summary,
        "action_items": call.action_items or [],
        "objections_handled": call.objections_handled or [],
        "transcripts": transcripts,
        "created_at": call.created_at.isoformat() if call.created_at else None,
    }


@router.post("/analyze-turn", response_model=Dict[str, Any])
async def analyze_realtime_turn(payload: VoiceTurnAnalyzeSchema):
    """Analyze real-time speech turn, detect objections, and generate rep coaching battle-cards."""
    res = await voice_agent.analyze_turn(
        speaker=payload.speaker,
        text=payload.text,
        call_context=payload.call_context,
    )
    return res
