"""FastAPI Router for WhatsApp Business Multi-Agent Integration."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Annotated, Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

from database.connection import get_db
from database.models import WhatsAppConversation, WhatsAppMessage
from agents.whatsapp_agent import WhatsAppAgent

router = APIRouter()
whatsapp_agent = WhatsAppAgent()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class WhatsAppSendMessageSchema(BaseModel):
    phone_number: str = Field(..., min_length=5)
    contact_name: Optional[str] = Field("Prospect")
    text: str = Field(..., min_length=1)
    sender_type: str = Field("agent")  # 'agent', 'bot', 'prospect'


class WhatsAppInboundWebhookSchema(BaseModel):
    phone_number: str = Field(..., min_length=5)
    contact_name: str = Field("Prospect")
    text: str = Field(..., min_length=1)


class WhatsAppAutoPilotToggleSchema(BaseModel):
    ai_auto_pilot: bool


class WhatsAppTagsSchema(BaseModel):
    tags: List[str]


class WhatsAppBroadcastSchema(BaseModel):
    phone_numbers: Annotated[List[str], Field(min_length=1)]
    template_text: str = Field(..., min_length=1)
    contact_name_override: Optional[str] = None


# ============================================================================
# HELPER
# ============================================================================


def _conv_to_dict(c: WhatsAppConversation) -> Dict[str, Any]:
    return {
        "id": str(c.id),
        "contact_name": c.contact_name,
        "phone_number": c.phone_number,
        "status": c.status,
        "unread_count": c.unread_count,
        "ai_auto_pilot": c.ai_auto_pilot,
        "tags": c.tags or [],
        "last_message_at": c.last_message_at.isoformat() if c.last_message_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("/stats", response_model=Dict[str, Any])
def get_whatsapp_stats(db: Session = Depends(get_db)):
    """Aggregate WhatsApp conversation and messaging statistics."""
    convs = db.query(WhatsAppConversation).all()
    msgs = db.query(WhatsAppMessage).all()

    total_convs = len(convs)
    active_convs = sum(1 for c in convs if c.status == "active")
    auto_pilot_convs = sum(1 for c in convs if c.ai_auto_pilot)
    handed_off = sum(1 for c in convs if c.status == "handed_off")

    total_msgs = len(msgs)
    bot_msgs = sum(1 for m in msgs if m.sender_type == "bot")
    bot_rate = round((bot_msgs / total_msgs * 100), 1) if total_msgs > 0 else 0.0

    return {
        "total_conversations": total_convs,
        "active_conversations": active_convs,
        "auto_pilot_enabled": auto_pilot_convs,
        "handed_off_conversations": handed_off,
        "total_messages": total_msgs,
        "bot_auto_reply_rate": bot_rate,
        "avg_response_time_seconds": 8,  # simulated
        "unread_total": sum(c.unread_count for c in convs),
    }


@router.get("/conversations/search", response_model=List[Dict[str, Any]])
def search_whatsapp_conversations(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """Search conversations by contact name or phone number."""
    convs = (
        db.query(WhatsAppConversation)
        .filter(
            WhatsAppConversation.contact_name.ilike(f"%{q}%")
            | WhatsAppConversation.phone_number.ilike(f"%{q}%")
        )
        .order_by(WhatsAppConversation.last_message_at.desc())
        .limit(20)
        .all()
    )
    return [_conv_to_dict(c) for c in convs]


@router.get("/conversations", response_model=List[Dict[str, Any]])
def list_whatsapp_conversations(
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve WhatsApp conversation threads with optional status filter."""
    q = db.query(WhatsAppConversation)
    if status:
        q = q.filter(WhatsAppConversation.status == status)
    convs = q.order_by(WhatsAppConversation.last_message_at.desc()).limit(limit).all()
    return [_conv_to_dict(c) for c in convs]


@router.get(
    "/conversations/{conversation_id}/messages", response_model=List[Dict[str, Any]]
)
def get_conversation_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve chat message history for a WhatsApp thread."""
    try:
        val_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format.")

    messages = (
        db.query(WhatsAppMessage)
        .filter(WhatsAppMessage.conversation_id == val_uuid)
        .order_by(WhatsAppMessage.created_at.asc())
        .all()
    )

    return [
        {
            "id": str(m.id),
            "conversation_id": str(m.conversation_id),
            "sender_type": m.sender_type,
            "text": m.text,
            "media_url": m.media_url,
            "media_type": m.media_type,
            "status": m.status,
            "intent": m.intent,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]


@router.post("/send", response_model=Dict[str, Any])
def send_whatsapp_message(
    payload: WhatsAppSendMessageSchema,
    db: Session = Depends(get_db),
):
    """Dispatch an outbound WhatsApp message."""
    conv = (
        db.query(WhatsAppConversation)
        .filter(WhatsAppConversation.phone_number == payload.phone_number)
        .first()
    )
    if not conv:
        conv = WhatsAppConversation(
            id=uuid.uuid4(),
            contact_name=payload.contact_name or "Prospect",
            phone_number=payload.phone_number,
            status="active",
            ai_auto_pilot=True,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    msg = WhatsAppMessage(
        id=uuid.uuid4(),
        conversation_id=conv.id,
        sender_type=payload.sender_type,
        text=payload.text,
        status="delivered",
    )
    db.add(msg)
    conv.last_message_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)

    return {
        "status": "success",
        "message_id": str(msg.id),
        "conversation_id": str(conv.id),
        "text": msg.text,
    }


@router.post("/broadcast", response_model=Dict[str, Any])
def send_broadcast(
    payload: WhatsAppBroadcastSchema,
    db: Session = Depends(get_db),
):
    """Send a broadcast template message to multiple phone numbers."""
    sent_count = 0
    conversation_ids = []

    for phone in payload.phone_numbers:
        conv = (
            db.query(WhatsAppConversation)
            .filter(WhatsAppConversation.phone_number == phone)
            .first()
        )
        if not conv:
            conv = WhatsAppConversation(
                id=uuid.uuid4(),
                contact_name=payload.contact_name_override or "Prospect",
                phone_number=phone,
                status="active",
                ai_auto_pilot=True,
            )
            db.add(conv)
            db.commit()
            db.refresh(conv)

        msg = WhatsAppMessage(
            id=uuid.uuid4(),
            conversation_id=conv.id,
            sender_type="agent",
            text=payload.template_text,
            status="delivered",
        )
        db.add(msg)
        conv.last_message_at = datetime.now(timezone.utc)
        sent_count += 1
        conversation_ids.append(str(conv.id))

    db.commit()
    return {
        "status": "broadcast_sent",
        "recipients": sent_count,
        "conversation_ids": conversation_ids,
    }


@router.post("/webhook/inbound", response_model=Dict[str, Any])
async def handle_inbound_whatsapp_webhook(
    payload: WhatsAppInboundWebhookSchema,
    db: Session = Depends(get_db),
):
    """Webhook parsing inbound message and triggering autonomous WhatsAppAgent reply if auto-pilot enabled."""
    conv = (
        db.query(WhatsAppConversation)
        .filter(WhatsAppConversation.phone_number == payload.phone_number)
        .first()
    )
    if not conv:
        conv = WhatsAppConversation(
            id=uuid.uuid4(),
            contact_name=payload.contact_name,
            phone_number=payload.phone_number,
            status="active",
            ai_auto_pilot=True,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Inbound message
    inbound_msg = WhatsAppMessage(
        id=uuid.uuid4(),
        conversation_id=conv.id,
        sender_type="prospect",
        text=payload.text,
        status="read",
    )
    db.add(inbound_msg)
    conv.last_message_at = datetime.now(timezone.utc)
    db.commit()

    agent_reply = None
    if conv.ai_auto_pilot:
        agent_res = await whatsapp_agent.handle_inbound_message(
            contact_name=conv.contact_name,
            phone_number=conv.phone_number,
            message_text=payload.text,
        )
        inbound_msg.intent = agent_res.get("intent")

        bot_msg = WhatsAppMessage(
            id=uuid.uuid4(),
            conversation_id=conv.id,
            sender_type="bot",
            text=agent_res.get("reply_text", "Thanks for reaching out!"),
            intent=agent_res.get("intent"),
            status="delivered",
        )
        db.add(bot_msg)
        conv.last_message_at = datetime.now(timezone.utc)
        db.commit()
        agent_reply = agent_res.get("reply_text")

    return {
        "status": "received",
        "conversation_id": str(conv.id),
        "ai_replied": bool(agent_reply),
        "agent_reply": agent_reply,
    }


@router.put(
    "/conversations/{conversation_id}/auto-pilot", response_model=Dict[str, Any]
)
def toggle_whatsapp_auto_pilot(
    conversation_id: str,
    payload: WhatsAppAutoPilotToggleSchema,
    db: Session = Depends(get_db),
):
    """Toggle AI auto-pilot mode for conversation."""
    try:
        val_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")

    conv = (
        db.query(WhatsAppConversation)
        .filter(WhatsAppConversation.id == val_uuid)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.ai_auto_pilot = payload.ai_auto_pilot
    db.commit()
    return {
        "status": "success",
        "conversation_id": str(conv.id),
        "ai_auto_pilot": conv.ai_auto_pilot,
    }


@router.put(
    "/conversations/{conversation_id}/tags", response_model=Dict[str, Any]
)
def update_conversation_tags(
    conversation_id: str,
    payload: WhatsAppTagsSchema,
    db: Session = Depends(get_db),
):
    """Update tags/labels on a WhatsApp conversation."""
    try:
        val_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")

    conv = (
        db.query(WhatsAppConversation)
        .filter(WhatsAppConversation.id == val_uuid)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.tags = payload.tags
    db.commit()
    return {
        "status": "success",
        "conversation_id": str(conv.id),
        "tags": conv.tags,
    }


@router.put(
    "/conversations/{conversation_id}/archive", response_model=Dict[str, Any]
)
def archive_whatsapp_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
):
    """Archive or hand off a WhatsApp conversation."""
    try:
        val_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")

    conv = (
        db.query(WhatsAppConversation)
        .filter(WhatsAppConversation.id == val_uuid)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.status = "archived"
    db.commit()
    return {
        "status": "success",
        "conversation_id": str(conv.id),
        "new_status": conv.status,
    }
