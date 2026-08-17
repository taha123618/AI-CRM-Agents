"""Authentication & RBAC User Management Endpoints."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_sso_identity,
    require_auth,
    require_role,
)
from services.audit_service import record_audit_log

router = APIRouter()


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set secure HTTP-only cookies for access and refresh tokens."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600 * 24,  # 1 day
        samesite="lax",
        secure=False,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=3600 * 24 * 7,  # 7 days
        samesite="lax",
        secure=False,
    )


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password min 6 characters")
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = Field("sales", description="'admin', 'sales', 'support', 'auditor'")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class SsoLoginRequest(BaseModel):
    token: str = Field(..., description="OAuth2 ID token or authorization code from SSO provider")
    email_hint: Optional[EmailStr] = None
    name_hint: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    last_login_at: Optional[str] = None
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: UserResponse


class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., description="'admin', 'sales', 'support', 'auditor'")


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Register a new CRM user, set secure HTTP-only cookies, and return JWT access token."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    # First user automatically becomes admin
    user_count = db.query(User).count()
    assigned_role = "admin" if user_count == 0 else (payload.role or "sales")
    if assigned_role not in ["admin", "sales", "support", "auditor"]:
        assigned_role = "sales"

    new_user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=assigned_role,
        is_active=True,
        last_login_at=datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(new_user.id),
        action="register",
        actor=new_user.email,
        details={"role": new_user.role, "full_name": new_user.full_name},
        ip_address=client_ip,
    )

    token_data = {"sub": str(new_user.id), "email": new_user.email, "role": new_user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    set_auth_cookies(response, access_token, refresh_token)

    user_resp = UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active,
        last_login_at=new_user.last_login_at.isoformat() if new_user.last_login_at else None,
        created_at=new_user.created_at.isoformat() if new_user.created_at else None,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=user_resp,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate with email and password, set secure HTTP-only cookies, and receive JWT tokens."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact an administrator.",
        )

    user.last_login_at = datetime.utcnow()
    db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="login",
        actor=user.email,
        details={"role": user.role},
        ip_address=client_ip,
    )

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    set_auth_cookies(response, access_token, refresh_token)

    user_resp = UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=user_resp,
    )


@router.post("/logout")
async def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    """Clear session HTTP-only cookies and log termination."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id="session",
        action="logout",
        actor="user",
        ip_address=client_ip,
    )
    return {"status": "logged_out", "message": "Authentication cookies successfully cleared."}


@router.get("/sso/providers")
async def list_sso_providers():
    """List configured enterprise SSO identity providers (Google Workspace & Microsoft Entra ID)."""
    return {
        "providers": [
            {
                "id": "google",
                "name": "Google Workspace",
                "enabled": True,
                "protocol": "OpenID Connect / OAuth2",
                "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
            },
            {
                "id": "microsoft",
                "name": "Microsoft Entra ID (Azure AD)",
                "enabled": True,
                "protocol": "OAuth 2.0 / SAML 2.0",
                "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            },
        ]
    }


@router.post("/sso/{provider}", response_model=TokenResponse)
async def sso_login(
    provider: str,
    payload: SsoLoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    """Authenticate or provision user via Social/Enterprise SSO (Google Workspace, Microsoft Entra ID)."""
    if provider not in ["google", "microsoft", "entra"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported SSO provider '{provider}'. Supported: google, microsoft",
        )

    sso_user_info = verify_sso_identity(
        provider=provider,
        token_or_code=payload.token,
        email_hint=payload.email_hint,
        name_hint=payload.name_hint,
    )

    email = sso_user_info["email"]
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Provision new SSO user
        user_count = db.query(User).count()
        assigned_role = "admin" if user_count == 0 else "sales"
        user = User(
            email=email,
            hashed_password=hash_password(f"sso_{provider}_{email}"),
            full_name=sso_user_info["full_name"],
            role=assigned_role,
            is_active=True,
            last_login_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login_at = datetime.utcnow()
        db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action=f"sso_login_{provider}",
        actor=user.email,
        details={"provider": provider, "role": user.role},
        ip_address=client_ip,
    )

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    set_auth_cookies(response, access_token, refresh_token)

    user_resp = UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=user_resp,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(require_auth)):
    """Get the profile of the currently authenticated user."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        last_login_at=current_user.last_login_at.isoformat() if current_user.last_login_at else None,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Obtain a new access token using a valid refresh token."""
    decoded = decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided token is not a refresh token",
        )

    user_id = decoded.get("sub")
    try:
        val_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == val_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with refresh token is invalid or inactive",
        )

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )

    return TokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        refresh_token=new_refresh_token,
        user=user_resp,
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "auditor"])),
):
    """List all registered users (Admin and Auditor role only)."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            last_login_at=u.last_login_at.isoformat() if u.last_login_at else None,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in users
    ]


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Update a user's RBAC role (Admin only)."""
    if payload.role not in ["admin", "sales", "support", "auditor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be one of: 'admin', 'sales', 'support', 'auditor'",
        )

    try:
        val_uuid = UUID(user_id)
        user = db.query(User).filter(User.id == val_uuid).first()
    except Exception:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role
    user.role = payload.role
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else "127.0.0.1"
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="role_change",
        actor=current_user.email,
        details={"from_role": old_role, "to_role": user.role},
        ip_address=client_ip,
    )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )
