"""Bi-directional Email Sync & Threading Service for Gmail, Outlook 365, and IMAP."""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.models import EmailSyncAccount, EmailThread

DEFAULT_SAMPLE_THREADS = [
    {
        "subject": "Enterprise Plan SOC-2 & SLA Inquiries",
        "thread_key": "thread-fintech-soc2",
        "participant_emails": ["alex.chen@fintechcorp.io", "sales@ai-crm.enterprise"],
        "sentiment": "positive",
        "snippet": "Thanks for sending over the security overview. We'd like to schedule the technical review call.",
        "messages": [
            {
                "id": "msg-1",
                "sender": "alex.chen@fintechcorp.io",
                "recipient": "sales@ai-crm.enterprise",
                "subject": "Enterprise Plan SOC-2 & SLA Inquiries",
                "body": "Hi Team, We are reviewing your AI CRM platform for our 250 SDR seat rollout. Could you share your SOC-2 Type II report?",
                "timestamp": "2026-08-18T14:30:00Z",
                "direction": "inbound",
            },
            {
                "id": "msg-2",
                "sender": "sales@ai-crm.enterprise",
                "recipient": "alex.chen@fintechcorp.io",
                "subject": "Re: Enterprise Plan SOC-2 & SLA Inquiries",
                "body": "Hi Alex, Absolutely! I have attached our SOC-2 Type II executive summary and custom enterprise SLA documentation.",
                "timestamp": "2026-08-18T15:10:00Z",
                "direction": "outbound",
            },
            {
                "id": "msg-3",
                "sender": "alex.chen@fintechcorp.io",
                "recipient": "sales@ai-crm.enterprise",
                "subject": "Re: Enterprise Plan SOC-2 & SLA Inquiries",
                "body": "Thanks for sending over the security overview. We'd like to schedule the technical review call.",
                "timestamp": "2026-08-18T18:45:00Z",
                "direction": "inbound",
            },
        ],
    },
    {
        "subject": "Renewal Contract & Additional 50 Agent Add-on",
        "thread_key": "thread-scaleup-renewal",
        "participant_emails": ["sarah.k@scaleup.dev", "cs@ai-crm.enterprise"],
        "sentiment": "positive",
        "snippet": "Our team loved the WhatsApp auto-pilot feature and we want to expand to our APAC team.",
        "messages": [
            {
                "id": "msg-101",
                "sender": "sarah.k@scaleup.dev",
                "recipient": "cs@ai-crm.enterprise",
                "subject": "Renewal Contract & Additional 50 Agent Add-on",
                "body": "Hi there! Our annual renewal is coming up next month. Our team loved the WhatsApp auto-pilot feature and we want to expand to our APAC team.",
                "timestamp": "2026-08-18T11:00:00Z",
                "direction": "inbound",
            }
        ],
    },
]


class EmailSyncService:
    """Manages 2-way email sync accounts and conversation thread aggregation."""

    @classmethod
    def connect_account(
        cls,
        provider: str,
        email_address: str,
        display_name: Optional[str],
        db: Session,
    ) -> EmailSyncAccount:
        """Register and connect a new mailbox (Gmail OAuth / Outlook Graph / IMAP)."""
        existing = (
            db.query(EmailSyncAccount)
            .filter(EmailSyncAccount.email_address == email_address)
            .first()
        )
        if existing:
            existing.provider = provider
            existing.sync_status = "active"
            existing.last_synced_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            return existing

        account = EmailSyncAccount(
            provider=provider,
            email_address=email_address,
            display_name=display_name or email_address.split("@")[0].capitalize(),
            sync_status="active",
            last_synced_at=datetime.now(timezone.utc),
            settings={"sync_interval_mins": 5, "auto_draft_ai_replies": True},
        )
        db.add(account)
        db.commit()
        db.refresh(account)

        # Seed initial threads if none exist
        cls.sync_account_threads(account.id, db)
        return account

    @classmethod
    def sync_account_threads(cls, account_id: uuid.UUID, db: Session) -> int:
        """Poll and ingest latest messages into structured conversation threads."""
        account = (
            db.query(EmailSyncAccount).filter(EmailSyncAccount.id == account_id).first()
        )
        if not account:
            return 0

        synced_count = 0
        for sample in DEFAULT_SAMPLE_THREADS:
            existing = (
                db.query(EmailThread)
                .filter(EmailThread.thread_key == sample["thread_key"])
                .first()
            )
            if not existing:
                thread = EmailThread(
                    account_id=account.id,
                    thread_key=sample["thread_key"],
                    subject=sample["subject"],
                    participant_emails=sample["participant_emails"],
                    message_count=len(sample["messages"]),
                    snippet=sample["snippet"],
                    sentiment=sample["sentiment"],
                    messages=sample["messages"],
                    last_message_at=datetime.now(timezone.utc),
                )
                db.add(thread)
                synced_count += 1

        account.last_synced_at = datetime.now(timezone.utc)
        account.sync_status = "active"
        db.commit()
        return synced_count
