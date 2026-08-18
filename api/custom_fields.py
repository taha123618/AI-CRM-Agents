"""Dynamic Custom Field Definitions API Router."""

import re
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.connection import get_db
from database.models import CustomFieldDefinition

router = APIRouter()


def slugify_key(name: str) -> str:
    """Generate a valid snake_case field key."""
    s = name.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s-]+", "_", s)
    return s.strip("_") or f"field_{uuid.uuid4().hex[:6]}"


class CustomFieldCreateRequest(BaseModel):
    entity_type: str = Field(..., description="'contact', 'deal', 'customer', 'company'")
    name: str = Field(..., min_length=2, max_length=100, description="Display Label")
    field_key: Optional[str] = Field(None, max_length=100, description="snake_case key")
    field_type: str = Field("text", description="'text', 'number', 'select', 'boolean', 'date', 'currency'")
    options: Optional[List[str]] = Field(default_factory=list, description="Dropdown options if select")
    is_required: bool = Field(False)
    default_value: Optional[Any] = None


class CustomFieldUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    field_type: Optional[str] = None
    options: Optional[List[str]] = None
    is_required: Optional[bool] = None
    default_value: Optional[Any] = None


class CustomFieldResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    name: str
    field_key: str
    field_type: str
    options: List[str]
    is_required: bool
    default_value: Optional[Any] = None
    created_at: Optional[str] = None


@router.get("", response_model=List[CustomFieldResponse])
def list_custom_fields(
    entity_type: Optional[str] = Query(None, description="Filter by entity type: contact, deal, customer, company"),
    db: Session = Depends(get_db),
):
    """List all user-defined dynamic custom fields."""
    query = db.query(CustomFieldDefinition)
    if entity_type:
        query = query.filter(CustomFieldDefinition.entity_type == entity_type)
    fields = query.order_by(desc(CustomFieldDefinition.created_at)).all()

    return [
        CustomFieldResponse(
            id=str(f.id),
            entity_type=f.entity_type,
            name=f.name,
            field_key=f.field_key,
            field_type=f.field_type,
            options=f.options or [],
            is_required=bool(f.is_required),
            default_value=f.default_value,
            created_at=f.created_at.isoformat() if f.created_at else None,
        )
        for f in fields
    ]


@router.post("", response_model=CustomFieldResponse, status_code=status.HTTP_201_CREATED)
def create_custom_field(
    payload: CustomFieldCreateRequest,
    db: Session = Depends(get_db),
):
    """Create a new dynamic custom metadata field."""
    key = slugify_key(payload.field_key or payload.name)
    existing = db.query(CustomFieldDefinition).filter(
        CustomFieldDefinition.entity_type == payload.entity_type,
        CustomFieldDefinition.field_key == key,
    ).first()

    if existing:
        key = f"{key}_{uuid.uuid4().hex[:4]}"

    new_field = CustomFieldDefinition(
        entity_type=payload.entity_type,
        name=payload.name.strip(),
        field_key=key,
        field_type=payload.field_type,
        options=payload.options or [],
        is_required=payload.is_required,
        default_value=payload.default_value,
    )
    db.add(new_field)
    db.commit()
    db.refresh(new_field)

    return CustomFieldResponse(
        id=str(new_field.id),
        entity_type=new_field.entity_type,
        name=new_field.name,
        field_key=new_field.field_key,
        field_type=new_field.field_type,
        options=new_field.options or [],
        is_required=bool(new_field.is_required),
        default_value=new_field.default_value,
        created_at=new_field.created_at.isoformat() if new_field.created_at else None,
    )


@router.put("/{field_id}", response_model=CustomFieldResponse)
def update_custom_field(
    field_id: str,
    payload: CustomFieldUpdateRequest,
    db: Session = Depends(get_db),
):
    """Update dynamic field options, required status, or display label."""
    try:
        val_id = uuid.UUID(field_id) if isinstance(field_id, str) else field_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid field UUID.")

    field = db.query(CustomFieldDefinition).filter(CustomFieldDefinition.id == val_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Custom field not found.")

    if payload.name is not None:
        field.name = payload.name.strip()
    if payload.field_type is not None:
        field.field_type = payload.field_type
    if payload.options is not None:
        field.options = payload.options
    if payload.is_required is not None:
        field.is_required = payload.is_required
    if payload.default_value is not None:
        field.default_value = payload.default_value

    db.commit()
    db.refresh(field)

    return CustomFieldResponse(
        id=str(field.id),
        entity_type=field.entity_type,
        name=field.name,
        field_key=field.field_key,
        field_type=field.field_type,
        options=field.options or [],
        is_required=bool(field.is_required),
        default_value=field.default_value,
        created_at=field.created_at.isoformat() if field.created_at else None,
    )


@router.delete("/{field_id}")
def delete_custom_field(
    field_id: str,
    db: Session = Depends(get_db),
):
    """Remove custom field definition."""
    try:
        val_id = uuid.UUID(field_id) if isinstance(field_id, str) else field_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid field UUID.")

    field = db.query(CustomFieldDefinition).filter(CustomFieldDefinition.id == val_id).first()
    if not field:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Custom field not found.")

    db.delete(field)
    db.commit()
    return {"status": "success", "message": f"Field '{field.name}' deleted successfully."}
