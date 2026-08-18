"""Multi-Tenant Organization Management and Scoping Service."""

import re
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from database.models import Organization, User


def slugify(text: str) -> str:
    """Generate URL and system safe identifier slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-") or f"org-{uuid.uuid4().hex[:6]}"


class TenantService:
    """Business logic for Multi-Tenant Workspace isolation."""

    @staticmethod
    def get_or_create_default_organization(db: Session) -> Organization:
        """Retrieve primary organization or seed it if empty."""
        org = db.query(Organization).filter(Organization.slug == "default-workspace").first()
        if not org:
            org = Organization(
                name="Default Workspace",
                slug="default-workspace",
                domain="company.internal",
                plan_tier="enterprise",
                is_active=True,
            )
            db.add(org)
            db.commit()
            db.refresh(org)
        return org

    @staticmethod
    def list_organizations(db: Session, limit: int = 50) -> List[Organization]:
        """List all active organization tenants."""
        return db.query(Organization).order_by(Organization.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_organization(db: Session, org_id: str) -> Optional[Organization]:
        """Fetch organization by UUID or slug."""
        try:
            val_uuid = uuid.UUID(org_id) if isinstance(org_id, str) else org_id
            return db.query(Organization).filter(Organization.id == val_uuid).first()
        except (ValueError, TypeError):
            return db.query(Organization).filter(Organization.slug == str(org_id)).first()

    @staticmethod
    def create_organization(
        db: Session,
        name: str,
        slug: Optional[str] = None,
        domain: Optional[str] = None,
        plan_tier: str = "enterprise",
    ) -> Organization:
        """Create a new isolated organization workspace."""
        clean_name = name.strip()
        if not clean_name:
            raise ValueError("Organization name cannot be empty.")

        org_slug = slugify(slug or clean_name)
        existing = db.query(Organization).filter(Organization.slug == org_slug).first()
        if existing:
            org_slug = f"{org_slug}-{uuid.uuid4().hex[:4]}"

        new_org = Organization(
            name=clean_name,
            slug=org_slug,
            domain=domain.strip() if domain else None,
            plan_tier=plan_tier,
            is_active=True,
        )
        db.add(new_org)
        db.commit()
        db.refresh(new_org)
        return new_org

    @staticmethod
    def assign_user_to_org(db: Session, user_id: str, org_id: str) -> bool:
        """Assign a user to an organization tenant."""
        try:
            val_uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
            val_oid = uuid.UUID(org_id) if isinstance(org_id, str) else org_id
            user = db.query(User).filter(User.id == val_uid).first()
            org = db.query(Organization).filter(Organization.id == val_oid).first()
            if user and org:
                user.organization_id = org.id
                db.commit()
                return True
        except Exception:
            pass
        return False
