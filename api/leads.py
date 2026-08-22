"""Leads API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from database.connection import get_db
from database.models import Contact
from services.auth_service import require_auth
from database.models import User

router = APIRouter()


class LeadCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    company_name: Optional[str] = Field(None, max_length=255)
    job_title: Optional[str] = Field(None, max_length=255)
    lead_source: Optional[str] = Field(None, max_length=100)


class LeadUpdate(BaseModel):
    email: Optional[str] = Field(None, max_length=255)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=255)
    lead_source: Optional[str] = Field(None, max_length=100)
    lead_score: Optional[int] = Field(None, ge=0, le=100)
    lead_status: Optional[str] = Field(None, max_length=50)


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[str, UUID]
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    lead_source: Optional[str] = None
    lead_score: int
    lead_status: str
    # AI LeadQualificationAgent enriched fields
    buying_signals: Optional[List[str]] = None
    routing_team: Optional[str] = None
    recommended_action: Optional[str] = None

    @field_validator("buying_signals", mode="before")
    @classmethod
    def coerce_signals(cls, v: Any) -> Optional[List[str]]:
        if isinstance(v, list):
            return v
        return None

    @classmethod
    def from_orm_contact(cls, contact: Contact) -> "LeadResponse":
        enrichment = contact.enrichment_data or {}
        routing = enrichment.get("routing", {})
        if not isinstance(routing, dict):
            routing = {}
        return cls(
            id=contact.id,
            email=contact.email,
            first_name=contact.first_name,
            last_name=contact.last_name,
            job_title=contact.job_title,
            lead_source=contact.lead_source,
            lead_score=contact.lead_score,
            lead_status=contact.lead_status,
            buying_signals=enrichment.get("signals")
            or enrichment.get("buying_signals"),
            routing_team=routing.get("team") or enrichment.get("routing_team"),
            recommended_action=routing.get("recommended_action")
            or enrichment.get("recommended_action"),
        )


@router.get("/", response_model=List[LeadResponse])
async def list_leads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """List all leads"""
    leads = db.query(Contact).offset(skip).limit(min(limit, 200)).all()
    return [LeadResponse.from_orm_contact(lead) for lead in leads]


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Get lead by ID"""
    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.from_orm_contact(lead)


@router.post("/", response_model=LeadResponse)
async def create_lead(
    lead: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Create or update lead by email"""
    from services.audit_service import record_audit_log

    existing = db.query(Contact).filter(Contact.email == lead.email).first()
    if existing:
        if lead.first_name:
            existing.first_name = lead.first_name
        if lead.last_name:
            existing.last_name = lead.last_name
        if lead.job_title:
            existing.job_title = lead.job_title
        if lead.lead_source:
            existing.lead_source = lead.lead_source
        db.commit()
        db.refresh(existing)
        record_audit_log(
            db=db,
            entity_type="lead",
            entity_id=str(existing.id),
            action="update",
            actor="user",
            details={"email": existing.email, "type": "upsert_existing"},
        )
        return LeadResponse.from_orm_contact(existing)

    lead_data = {
        k: v
        for k, v in lead.model_dump().items()
        if k != "company_name" and v is not None
    }
    db_lead = Contact(**lead_data)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    record_audit_log(
        db=db,
        entity_type="lead",
        entity_id=str(db_lead.id),
        action="create",
        actor="user",
        details={"email": db_lead.email, "lead_score": db_lead.lead_score},
    )
    return LeadResponse.from_orm_contact(db_lead)


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Update lead by ID"""
    from services.audit_service import record_audit_log

    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    updated_fields = {}
    for key, val in payload.model_dump(exclude_unset=True).items():
        if val is not None and hasattr(lead, key):
            setattr(lead, key, val)
            updated_fields[key] = val

    db.commit()
    db.refresh(lead)
    record_audit_log(
        db=db,
        entity_type="lead",
        entity_id=str(lead.id),
        action="update",
        actor="user",
        details={"updated_fields": list(updated_fields.keys())},
    )
    return LeadResponse.from_orm_contact(lead)


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Delete lead"""
    from services.audit_service import record_audit_log

    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    del_id = str(lead.id)
    email = lead.email
    db.delete(lead)
    db.commit()
    record_audit_log(
        db=db,
        entity_type="lead",
        entity_id=del_id,
        action="delete",
        actor="user",
        details={"email": email},
    )
    return {"status": "deleted"}
