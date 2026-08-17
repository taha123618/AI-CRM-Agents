"""Audit Logging Service for Tracking CRM Mutations and Agent Actions."""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from database.models import AuditLog
import uuid
from loguru import logger


def record_audit_log(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor: str = "system",
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Synchronously record an audit log entry in the database."""
    try:
        log_entry = AuditLog(
            id=uuid.uuid4(),
            entity_type=str(entity_type),
            entity_id=str(entity_id),
            action=str(action),
            actor=str(actor),
            details=details or {},
            ip_address=ip_address,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
        db.rollback()
        raise e
