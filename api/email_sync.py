"""Email Threading & Bi-Directional IMAP/OAuth Synchronization API Router."""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.connection import get_db
from database.models import EmailSyncAccount, EmailThread, User
from services.auth_service import require_auth
from services.email_sync_service import EmailSyncService

router = APIRouter()


class ConnectAccountRequest(BaseModel):
    provider: str = Field(..., description="'gmail', 'outlook_365', 'imap'")
    email_address: str = Field(..., min_length=5, max_length=255)
    display_name: Optional[str] = None


class SyncAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    provider: str
    email_address: str
    display_name: Optional[str] = None
    sync_status: str
    last_synced_at: Optional[str] = None
    created_at: Optional[str] = None


class EmailThreadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    thread_key: str
    subject: str
    participant_emails: List[str]
    message_count: int
    snippet: Optional[str] = None
    is_unread: bool
    sentiment: str
    last_message_at: Optional[str] = None


@router.get("/accounts", response_model=List[SyncAccountResponse])
def list_connected_accounts(db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """List all connected 2-way sync email mailboxes."""
    accounts = db.query(EmailSyncAccount).order_by(desc(EmailSyncAccount.created_at)).all()
    if not accounts:
        # Seed default connected account for demonstration
        default_acc = EmailSyncService.connect_account(
            provider="gmail",
            email_address="executive.sales@enterprise.ai",
            display_name="Enterprise Sales Mailbox",
            db=db,
        )
        accounts = [default_acc]

    return [
        SyncAccountResponse(
            id=str(a.id),
            provider=a.provider,
            email_address=a.email_address,
            display_name=a.display_name,
            sync_status=a.sync_status,
            last_synced_at=a.last_synced_at.isoformat() if a.last_synced_at else None,
            created_at=a.created_at.isoformat() if a.created_at else None,
        )
        for a in accounts
    ]


@router.post("/accounts", response_model=SyncAccountResponse, status_code=status.HTTP_201_CREATED)
def connect_email_account(payload: ConnectAccountRequest, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Connect a new Google Workspace, Microsoft Graph, or IMAP mailbox."""
    account = EmailSyncService.connect_account(
        provider=payload.provider,
        email_address=payload.email_address,
        display_name=payload.display_name,
        db=db,
    )
    return SyncAccountResponse(
        id=str(account.id),
        provider=account.provider,
        email_address=account.email_address,
        display_name=account.display_name,
        sync_status=account.sync_status,
        last_synced_at=account.last_synced_at.isoformat() if account.last_synced_at else None,
        created_at=account.created_at.isoformat() if account.created_at else None,
    )


@router.post("/accounts/{account_id}/sync")
def trigger_account_sync(account_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Trigger an immediate 2-way IMAP/OAuth synchronization poll."""
    try:
        val_id = uuid.UUID(account_id) if isinstance(account_id, str) else account_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid account UUID.")

    count = EmailSyncService.sync_account_threads(val_id, db)
    return {
        "status": "success",
        "synced_threads_count": count,
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/threads", response_model=List[EmailThreadResponse])
def list_email_threads(db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """List conversation threads with sentiment and unread status."""
    threads = db.query(EmailThread).order_by(desc(EmailThread.last_message_at)).all()
    if not threads:
        # If empty, ensure default account & threads seeded
        list_connected_accounts(db)
        threads = db.query(EmailThread).order_by(desc(EmailThread.last_message_at)).all()

    return [
        EmailThreadResponse(
            id=str(t.id),
            thread_key=t.thread_key,
            subject=t.subject,
            participant_emails=t.participant_emails or [],
            message_count=t.message_count or 1,
            snippet=t.snippet,
            is_unread=bool(t.is_unread),
            sentiment=t.sentiment or "neutral",
            last_message_at=t.last_message_at.isoformat() if t.last_message_at else None,
        )
        for t in threads
    ]


@router.get("/threads/{thread_id}/messages")
def get_thread_messages(thread_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Retrieve full chronological conversation timeline for a given thread."""
    try:
        val_id = uuid.UUID(thread_id) if isinstance(thread_id, str) else thread_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid thread UUID.")

    thread = db.query(EmailThread).filter(EmailThread.id == val_id).first()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found.")

    return {
        "id": str(thread.id),
        "subject": thread.subject,
        "participant_emails": thread.participant_emails or [],
        "sentiment": thread.sentiment,
        "messages": thread.messages or [],
        "last_message_at": thread.last_message_at.isoformat() if thread.last_message_at else None,
    }
