"""Audit Logging Service for Tracking CRM Mutations and Agent Actions."""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from database.models import AuditLog
import uuid
from loguru import logger


def compute_payload_diff(before: Optional[Dict[str, Any]], after: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate structured field-level diffs between before and after payloads."""
    if not before and not after:
        return {}
    before = before or {}
    after = after or {}
    changes = []
    all_keys = set(before.keys()).union(set(after.keys()))
    for k in sorted(all_keys):
        v_before = before.get(k)
        v_after = after.get(k)
        if v_before != v_after:
            changes.append({
                "field": k,
                "old": v_before,
                "new": v_after,
            })
    return {
        "before": before,
        "after": after,
        "changes": changes,
        "changed_fields_count": len(changes),
    }


def record_audit_log(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor: str = "system",
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    before_payload: Optional[Dict[str, Any]] = None,
    after_payload: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Synchronously record an audit log entry with payload diffs for GDPR/SOC2 compliance."""
    try:
        diff = compute_payload_diff(before_payload, after_payload) if (before_payload or after_payload) else {}
        log_entry = AuditLog(
            id=uuid.uuid4(),
            entity_type=str(entity_type),
            entity_id=str(entity_id),
            action=str(action),
            actor=str(actor),
            user_id=str(user_id) if user_id else None,
            details=details or {},
            payload_diff=diff,
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
