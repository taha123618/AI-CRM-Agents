"""Multi-Tenant Organization Workspaces API Router."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from services.auth_service import require_auth
from services.tenant_service import TenantService

router = APIRouter()


class OrganizationCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Workspace Organization Name")
    slug: Optional[str] = Field(None, max_length=100, description="URL-safe unique identifier slug")
    domain: Optional[str] = Field(None, description="Primary company email domain")
    plan_tier: str = Field("enterprise", description="'starter', 'growth', 'enterprise'")


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    domain: Optional[str] = None
    plan_tier: str
    is_active: bool
    created_at: Optional[str] = None


@router.get("", response_model=List[OrganizationResponse])
def list_organizations(db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """List all registered organization workspaces."""
    orgs = TenantService.list_organizations(db)
    if not orgs:
        default_org = TenantService.get_or_create_default_organization(db)
        orgs = [default_org]

    return [
        OrganizationResponse(
            id=str(o.id),
            name=o.name,
            slug=o.slug,
            domain=o.domain,
            plan_tier=o.plan_tier or "enterprise",
            is_active=bool(o.is_active),
            created_at=o.created_at.isoformat() if o.created_at else None,
        )
        for o in orgs
    ]


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(payload: OrganizationCreateRequest, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Create a new isolated organization tenant workspace."""
    try:
        org = TenantService.create_organization(
            db=db,
            name=payload.name,
            slug=payload.slug,
            domain=payload.domain,
            plan_tier=payload.plan_tier,
        )
        return OrganizationResponse(
            id=str(org.id),
            name=org.name,
            slug=org.slug,
            domain=org.domain,
            plan_tier=org.plan_tier or "enterprise",
            is_active=bool(org.is_active),
            created_at=org.created_at.isoformat() if org.created_at else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization_by_id(org_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Get organization details by ID or slug."""
    org = TenantService.get_organization(db, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    return OrganizationResponse(
        id=str(org.id),
        name=org.name,
        slug=org.slug,
        domain=org.domain,
        plan_tier=org.plan_tier or "enterprise",
        is_active=bool(org.is_active),
        created_at=org.created_at.isoformat() if org.created_at else None,
    )
