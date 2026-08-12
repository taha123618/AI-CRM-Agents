"""Leads API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from database.connection import get_db
from database.models import Contact

router = APIRouter()


class LeadCreate(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    lead_source: Optional[str] = None


class LeadUpdate(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    lead_source: Optional[str] = None
    lead_score: Optional[int] = None
    lead_status: Optional[str] = None


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
async def list_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all leads"""
    leads = db.query(Contact).offset(skip).limit(limit).all()
    return [LeadResponse.from_orm_contact(lead) for lead in leads]


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, db: Session = Depends(get_db)):
    """Get lead by ID"""
    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse.from_orm_contact(lead)


@router.post("/", response_model=LeadResponse)
async def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """Create or update lead by email"""
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
        return LeadResponse.from_orm_contact(existing)

    lead_data = {
        k: v for k, v in lead.dict().items() if k != "company_name" and v is not None
    }
    db_lead = Contact(**lead_data)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return LeadResponse.from_orm_contact(db_lead)


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
):
    """Update lead by ID"""
    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for key, val in payload.model_dump(exclude_unset=True).items():
        if val is not None and hasattr(lead, key):
            setattr(lead, key, val)

    db.commit()
    db.refresh(lead)
    return LeadResponse.from_orm_contact(lead)


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str, db: Session = Depends(get_db)):
    """Delete lead"""
    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"status": "deleted"}
