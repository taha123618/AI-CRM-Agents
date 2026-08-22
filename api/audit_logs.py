"""Audit Logs API Router for Compliance and Activity Tracking."""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from database.connection import get_db
from database.models import AuditLog, User
from services.auth_service import require_auth
from pydantic import ConfigDict

router = APIRouter()


class AuditLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    entity_id: str
    action: str
    actor: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None


class AuditLogStatsSchema(BaseModel):
    total_logs: int
    by_entity: Dict[str, int]
    by_action: Dict[str, int]
    recent_actors: List[str]


@router.get("", response_model=List[AuditLogSchema])
def list_audit_logs(
    entity_type: Optional[str] = Query(
        None, description="Filter by entity type (lead, deal, customer, etc.)"
    ),
    action: Optional[str] = Query(
        None, description="Filter by action (create, update, delete, etc.)"
    ),
    actor: Optional[str] = Query(
        None, description="Filter by actor (system, user, agent)"
    ),
    search: Optional[str] = Query(None, description="Search keyword"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve compliance audit logs with filtering and pagination."""
    query = db.query(AuditLog)

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if actor:
        query = query.filter(AuditLog.actor == actor)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (AuditLog.entity_type.ilike(search_fmt))
            | (AuditLog.action.ilike(search_fmt))
            | (AuditLog.actor.ilike(search_fmt))
        )

    logs = query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()

    return [
        AuditLogSchema(
            id=str(log.id),
            entity_type=str(log.entity_type),
            entity_id=str(log.entity_id),
            action=str(log.action),
            actor=str(log.actor),
            details=log.details or {},
            ip_address=log.ip_address,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.get("/stats", response_model=AuditLogStatsSchema)
def get_audit_log_stats(
    db: Session = Depends(get_db), current_user: User = Depends(require_auth)
):
    """Get audit activity summary metrics."""
    total_logs = db.query(func.count(AuditLog.id)).scalar() or 0

    # Counts by entity
    entity_counts = (
        db.query(AuditLog.entity_type, func.count(AuditLog.id))
        .group_by(AuditLog.entity_type)
        .all()
    )
    by_entity = {str(ent): int(cnt) for ent, cnt in entity_counts}

    # Counts by action
    action_counts = (
        db.query(AuditLog.action, func.count(AuditLog.id))
        .group_by(AuditLog.action)
        .all()
    )
    by_action = {str(act): int(cnt) for act, cnt in action_counts}

    # Recent distinct actors
    actors = db.query(AuditLog.actor).distinct().limit(10).all()
    recent_actors = [str(a[0]) for a in actors if a[0]]

    return AuditLogStatsSchema(
        total_logs=total_logs,
        by_entity=by_entity,
        by_action=by_action,
        recent_actors=recent_actors,
    )
