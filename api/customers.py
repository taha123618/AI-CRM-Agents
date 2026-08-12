"""Customers API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from database.connection import get_db
from database.models import Customer

router = APIRouter()


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[str, UUID]
    plan: Optional[str] = None
    mrr: Optional[float] = 0.0
    health_score: Optional[int] = 50
    churn_risk: Optional[str] = "low"

    # AI CustomerSuccessAgent enriched fields
    churn_probability: Optional[int] = None
    logins_per_week: Optional[int] = None
    features_used: Optional[int] = None
    license_usage_percent: Optional[int] = None
    recommended_actions: Optional[List[str]] = None

    @field_validator("recommended_actions", mode="before")
    @classmethod
    def coerce_actions(cls, v: Any) -> Optional[List[str]]:
        if isinstance(v, list):
            return v
        return None

    @classmethod
    def from_orm_customer(cls, customer: Customer) -> "CustomerResponse":
        meta = customer.additional_metadata or {}
        return cls(
            id=customer.id,
            plan=customer.plan,
            mrr=customer.mrr,
            health_score=customer.health_score,
            churn_risk=customer.churn_risk,
            churn_probability=customer.churn_probability,
            logins_per_week=customer.logins_per_week,
            features_used=customer.features_used,
            license_usage_percent=customer.license_usage_percent,
            recommended_actions=meta.get("recommended_actions"),
        )


class CustomerUpdate(BaseModel):
    health_score: Optional[int] = None
    churn_risk: Optional[str] = None
    churn_probability: Optional[int] = None
    recommended_actions: Optional[List[str]] = None


@router.get("/", response_model=List[CustomerResponse])
async def list_customers(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """List all customers"""
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return [CustomerResponse.from_orm_customer(c) for c in customers]


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, db: Session = Depends(get_db)):
    """Get customer by ID"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse.from_orm_customer(customer)


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str, payload: CustomerUpdate, db: Session = Depends(get_db)
):
    """Update customer AI metrics"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    data = payload.model_dump(exclude_unset=True)
    meta = dict(customer.additional_metadata or {})

    if "recommended_actions" in data:
        meta["recommended_actions"] = data.pop("recommended_actions")
        customer.additional_metadata = meta

    for key, val in data.items():
        if hasattr(customer, key):
            setattr(customer, key, val)

    db.commit()
    db.refresh(customer)
    return CustomerResponse.from_orm_customer(customer)


@router.get("/{customer_id}/health")
async def get_customer_health(customer_id: str, db: Session = Depends(get_db)):
    """Get customer health metrics"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {
        "health_score": customer.health_score,
        "churn_risk": customer.churn_risk,
        "churn_probability": customer.churn_probability,
        "engagement": {
            "logins_per_week": customer.logins_per_week,
            "features_used": customer.features_used,
            "license_usage_percent": customer.license_usage_percent,
        },
    }
