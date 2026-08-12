"""Deals API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from database.connection import get_db
from database.models import Deal

router = APIRouter()


class DealCreate(BaseModel):
    name: str
    value: float
    stage: str
    contact_id: Optional[str] = None
    company_id: Optional[str] = None


class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[str, UUID]
    name: str
    value: Optional[float] = 0.0
    stage: str
    health_score: Optional[int] = 50
    is_stalled: Optional[bool] = False
    risk_factors: Optional[List[str]] = None

    # AI SalesPipelineAgent fields
    close_probability: Optional[int] = None
    next_actions: Optional[List[str]] = None
    forecast_close_date: Optional[str] = None

    @field_validator("risk_factors", "next_actions", mode="before")
    @classmethod
    def coerce_list(cls, v: Any) -> Optional[List[str]]:
        if isinstance(v, list):
            return v
        return None

    @classmethod
    def from_orm_deal(cls, deal: Deal) -> "DealResponse":
        meta = deal.additional_metadata or {}
        return cls(
            id=deal.id,
            name=deal.name,
            value=deal.value,
            stage=deal.stage,
            health_score=deal.health_score,
            is_stalled=deal.is_stalled,
            risk_factors=deal.risk_factors,
            close_probability=deal.probability,
            next_actions=meta.get("next_actions"),
            forecast_close_date=deal.expected_close_date.isoformat()
            if deal.expected_close_date
            else meta.get("forecast_close_date"),
        )


class DealUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    health_score: Optional[int] = None
    is_stalled: Optional[bool] = None
    risk_factors: Optional[List[str]] = None
    close_probability: Optional[int] = None
    next_actions: Optional[List[str]] = None
    forecast_close_date: Optional[str] = None


@router.get("/", response_model=List[DealResponse])
async def list_deals(
    skip: int = 0,
    limit: int = 100,
    stage: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all deals"""
    query = db.query(Deal)
    if stage:
        query = query.filter(Deal.stage == stage)
    deals = query.offset(skip).limit(limit).all()
    return [DealResponse.from_orm_deal(d) for d in deals]


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(deal_id: str, db: Session = Depends(get_db)):
    """Get deal by ID"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return DealResponse.from_orm_deal(deal)


@router.post("/", response_model=DealResponse)
async def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    """Create new deal"""
    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return DealResponse.from_orm_deal(db_deal)


@router.put("/{deal_id}", response_model=DealResponse)
async def update_deal(deal_id: str, payload: DealUpdate, db: Session = Depends(get_db)):
    """Update deal details"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    data = payload.model_dump(exclude_unset=True)
    # Map close_probability -> probability column
    if "close_probability" in data:
        deal.probability = data.pop("close_probability")
    # Store next_actions and forecast_close_date in metadata JSONB
    meta = dict(deal.additional_metadata or {})
    if "next_actions" in data:
        meta["next_actions"] = data.pop("next_actions")
    if "forecast_close_date" in data:
        meta["forecast_close_date"] = data.pop("forecast_close_date")
    deal.additional_metadata = meta

    for key, val in data.items():
        if hasattr(deal, key):
            setattr(deal, key, val)

    db.commit()
    db.refresh(deal)
    return DealResponse.from_orm_deal(deal)


@router.patch("/{deal_id}/stage")
async def update_deal_stage(deal_id: str, stage: str, db: Session = Depends(get_db)):
    """Update deal stage"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal.stage = stage
    db.commit()
    return {"status": "updated", "stage": stage}


@router.delete("/{deal_id}")
async def delete_deal(deal_id: str, db: Session = Depends(get_db)):
    """Delete deal"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    db.delete(deal)
    db.commit()
    return {"status": "deleted", "deal_id": deal_id}
