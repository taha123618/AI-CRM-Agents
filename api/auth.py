"""Authentication & RBAC User Management Endpoints."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Query
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User
from services.auth_service import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    store_refresh_token,
    rotate_refresh_token,
    revoke_refresh_token,
    record_login_attempt,
    is_account_locked,
    create_password_reset_token,
    verify_and_use_password_reset_token,
    create_email_verification_token,
    verify_email_token,
    verify_sso_identity,
    get_sso_authorization_url,
    require_auth,
    require_role,
    get_current_user,
    get_default_permissions_for_role,
    create_otp_token,
    verify_otp_token,
    OTP_EXPIRE_MINUTES,
)
from services.audit_service import record_audit_log
from services.task_queue_service import task_queue
from services.email_service import email_service

router = APIRouter()


import os

COOKIE_SECURE = (
    os.getenv("COOKIE_SECURE", "false").lower() in ("true", "1", "yes")
    or os.getenv("APP_ENV", "").lower() == "production"
    or os.getenv("ENVIRONMENT", "").lower() == "production"
)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set secure HTTP-only cookies for access and refresh tokens."""
    # SECURITY: Use SameSite=Strict in production to prevent CSRF
    samesite_value = "strict" if COOKIE_SECURE else "lax"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600 * 24,  # 1 day
        samesite=samesite_value,
        secure=COOKIE_SECURE,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=3600 * 24 * 7,  # 7 days
        samesite=samesite_value,
        secure=COOKIE_SECURE,
    )


def clear_auth_cookies(response: Response) -> None:
    """Delete authentication cookies upon logout."""
    response.delete_cookie(key="access_token", samesite="lax", secure=COOKIE_SECURE)
    response.delete_cookie(key="refresh_token", samesite="lax", secure=COOKIE_SECURE)


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password min 8 characters")
    full_name: str = Field(..., min_length=2, max_length=150)
    role: Optional[str] = Field(
        "sales", description="'admin', 'sales', 'support', 'auditor'"
    )


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class SsoLoginRequest(BaseModel):
    token: str = Field(
        ..., description="OAuth2 ID token or authorization code from SSO provider"
    )
    email_hint: Optional[EmailStr] = None
    name_hint: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class VerifyEmailRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool = True
    permissions: List[str] = Field(default_factory=list)
    last_login_at: Optional[str] = None
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: UserResponse


class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., description="'admin', 'sales', 'support', 'auditor'")


class UserCreateAdminRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=150)
    role: str = Field("sales", description="'admin', 'sales', 'support', 'auditor'")
    is_active: bool = True
    permissions: Optional[List[str]] = Field(default_factory=list)


class UserUpdateAdminRequest(BaseModel):
    full_name: Optional[str] = Field(None, max_length=150)
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[List[str]] = None
    password: Optional[str] = Field(None, min_length=8)


class UserStatusUpdateRequest(BaseModel):
    is_active: bool


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")


class ResendOtpRequest(BaseModel):
    email: EmailStr


class OtpPendingResponse(BaseModel):
    status: str
    email: str
    message: str


@router.post(
    "/register", response_model=OtpPendingResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: UserRegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Register a new CRM user and send a 6-digit OTP to their email for 2FA verification."""
    # Password complexity validation
    pw_error = validate_password_strength(payload.password)
    if pw_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pw_error,
        )

    existing = (
        db.query(User).filter(User.email == payload.email.lower().strip()).first()
    )
    if existing:
        if not existing.is_verified:
            # Allow resending OTP for unverified accounts
            otp = create_otp_token(db, existing.id)
            await email_service.send_otp_email(
                to_email=existing.email,
                recipient_name=existing.full_name,
                otp_code=otp,
                expires_in_minutes=OTP_EXPIRE_MINUTES,
            )
            return OtpPendingResponse(
                status="otp_sent",
                email=existing.email,
                message=f"A new verification code has been sent to {existing.email}. Please check your inbox.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists",
        )

    if payload.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin accounts cannot be self-registered publicly. They must be provisioned by an existing Super Admin via Settings > Access Control & RBAC.",
        )

    # SECURITY: Only allow safe non-admin roles during public registration
    valid_roles = ["sales", "support", "auditor"]
    user_role = payload.role if payload.role in valid_roles else "sales"
    user_permissions = get_default_permissions_for_role(user_role)

    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=user_role,
        is_active=True,
        is_verified=False,  # Requires OTP verification
        permissions=user_permissions,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate OTP and dispatch email
    otp = create_otp_token(db, new_user.id)
    await email_service.send_otp_email(
        to_email=new_user.email,
        recipient_name=new_user.full_name,
        otp_code=otp,
        expires_in_minutes=OTP_EXPIRE_MINUTES,
    )

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(new_user.id),
        action="user_registered_pending_otp",
        actor=new_user.email,
        user_id=str(new_user.id),
        details={"role": new_user.role, "email": new_user.email},
        ip_address=client_ip,
    )

    return OtpPendingResponse(
        status="otp_sent",
        email=new_user.email,
        message=f"A 6-digit verification code has been sent to {new_user.email}. Please check your inbox.",
    )


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(
    payload: OtpVerifyRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Verify the OTP emailed on registration and issue JWT tokens to complete sign-in."""
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending registration found for this email address.",
        )

    if user.is_verified and user.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This account has already been verified. Please sign in.",
        )

    # Will raise HTTPException on invalid/expired OTP
    verify_otp_token(db, user.id, payload.otp)

    # Mark user as verified
    user.is_verified = True
    db.commit()
    db.refresh(user)

    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    }
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)
    store_refresh_token(db, user.id, refresh_token)

    set_auth_cookies(response, access_token, refresh_token)

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="user_otp_verified",
        actor=user.email,
        user_id=str(user.id),
        details={"email": user.email, "role": user.role},
        ip_address=client_ip,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            permissions=user.permissions or [],
            last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )


@router.post("/resend-otp", status_code=status.HTTP_200_OK)
async def resend_otp(
    payload: ResendOtpRequest,
    db: Session = Depends(get_db),
):
    """Resend the OTP email for an unverified account (rate-limited by single-use invalidation)."""
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    # Always respond the same way to prevent user enumeration
    if not user or user.is_verified:
        return {"status": "ok", "message": "If the email is registered and unverified, a new code has been dispatched."}

    otp = create_otp_token(db, user.id)
    await email_service.send_otp_email(
        to_email=user.email,
        recipient_name=user.full_name,
        otp_code=otp,
        expires_in_minutes=OTP_EXPIRE_MINUTES,
    )
    return {"status": "ok", "message": "A new verification code has been dispatched to your email."}


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate user with password verification, brute-force protection, and HTTP-only cookies."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()

    if user and is_account_locked(user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Account temporarily locked due to excessive failed attempts. Please try again in 15 minutes.",
        )

    if not user or not verify_password(payload.password, user.hashed_password):
        record_login_attempt(db, payload.email, client_ip, user_agent, successful=False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated",
        )

    record_login_attempt(db, payload.email, client_ip, user_agent, successful=True)

    token_payload = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)
    store_refresh_token(db, user.id, refresh_token)

    set_auth_cookies(response, access_token, refresh_token)

    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="user_login",
        actor=user.email,
        user_id=str(user.id),
        details={"role": user.role, "method": "password"},
        ip_address=client_ip,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            permissions=user.permissions or [],
            last_login_at=user.last_login_at.isoformat()
            if user.last_login_at
            else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    request: Request,
    response: Response,
    payload: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db),
):
    """Rotate JWT refresh token, issue fresh access token, and renew HTTP-only cookies."""
    token_str = (
        payload.refresh_token if payload and payload.refresh_token else None
    ) or request.cookies.get("refresh_token")
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    user, new_access, new_refresh = rotate_refresh_token(db, token_str)
    set_auth_cookies(response, new_access, new_refresh)

    return TokenResponse(
        access_token=new_access,
        token_type="bearer",
        refresh_token=new_refresh,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            permissions=user.permissions or [],
            last_login_at=user.last_login_at.isoformat()
            if user.last_login_at
            else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Invalidate session cookies, revoke refresh token in database, and record audit log."""
    rf_token = request.cookies.get("refresh_token") or (
        request.json().get("refresh_token")
        if request.headers.get("content-type", "").startswith("application/json")
        else None
    )
    if rf_token:
        revoke_refresh_token(db, rf_token)

    clear_auth_cookies(response)

    if current_user:
        client_ip = request.client.host if request.client else None
        record_audit_log(
            db=db,
            entity_type="user",
            entity_id=str(current_user.id),
            action="user_logout",
            actor=current_user.email,
            user_id=str(current_user.id),
            details={"email": current_user.email},
            ip_address=client_ip,
        )

    return {"status": "logged_out", "message": "Session terminated successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(require_auth),
):
    """Get the authenticated user's profile and active permissions."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        permissions=current_user.permissions or [],
        last_login_at=current_user.last_login_at.isoformat()
        if current_user.last_login_at
        else None,
        created_at=current_user.created_at.isoformat()
        if current_user.created_at
        else None,
    )


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Generate a password reset token and enqueue email delivery task in the background."""
    normalized_email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if user and user.is_active:
        # Generate and persist single-use token in DB
        raw_token = create_password_reset_token(db, user)
        # Enqueue background email delivery task (non-blocking)
        await task_queue.enqueue_password_reset_email(
            to_email=normalized_email,
            recipient_name=user.full_name or "CRM User",
            reset_token=raw_token,
            expires_in_minutes=60,
        )
        record_audit_log(
            db=db,
            entity_type="user",
            entity_id=str(user.id),
            action="password_reset_requested",
            actor=user.email,
            user_id=str(user.id),
            details={"email": user.email},
        )

    # Always return a generic success message to prevent user enumeration
    return {
        "status": "success",
        "message": "If an account exists for this email address, a password reset link has been sent.",
    }


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Reset account password using a validated single-use reset token."""
    # Password complexity validation
    pw_error = validate_password_strength(payload.new_password)
    if pw_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pw_error,
        )

    user = verify_and_use_password_reset_token(db, payload.token, payload.new_password)
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="password_reset",
        actor=user.email,
        user_id=str(user.id),
        details={"email": user.email},
    )
    return {
        "status": "success",
        "message": "Password updated successfully. Please log in with your new credentials.",
    }


@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    """Verify user email address using single-use verification token."""
    user = verify_email_token(db, payload.token)
    return {
        "status": "success",
        "message": f"Email {user.email} verified successfully.",
    }


@router.get("/sso/providers")
async def get_sso_providers():
    """List available enterprise SSO identity providers."""
    return {
        "providers": [
            {
                "id": "google",
                "name": "Google Workspace",
                "enabled": True,
                "protocol": "OpenID Connect / OAuth2",
                "auth_url": "/api/auth/sso/authorize/google",
            },
            {
                "id": "microsoft",
                "name": "Microsoft Entra ID (Azure AD)",
                "enabled": True,
                "protocol": "OAuth 2.0 / SAML 2.0",
                "auth_url": "/api/auth/sso/authorize/microsoft",
            },
        ]
    }


@router.get("/sso/authorize/{provider}")
async def get_sso_redirect_url(
    provider: str,
    redirect_uri: str = Query("http://localhost:5173/auth/callback"),
    state: str = Query("default_state"),
):
    """Generate OAuth2 authorization URL for SSO provider."""
    auth_url = get_sso_authorization_url(provider, redirect_uri, state)
    return {"provider": provider, "authorization_url": auth_url}


@router.post("/sso/{provider}", response_model=TokenResponse)
@router.post("/sso/callback/{provider}", response_model=TokenResponse)
async def sso_login(
    provider: str,
    payload: SsoLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate or provision user via Google Workspace / Microsoft Entra ID SSO."""
    sso_data = verify_sso_identity(
        provider=provider,
        token_or_code=payload.token,
        email_hint=payload.email_hint,
        name_hint=payload.name_hint,
    )

    email = sso_data["email"]
    full_name = sso_data["full_name"]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Provision new SSO user
        user = User(
            email=email,
            hashed_password=hash_password(f"sso_{provider}_{email}"),
            full_name=full_name,
            role="sales",
            is_active=True,
            is_verified=True,
            oauth_provider=provider,
            oauth_id=f"{provider}_{email}",
            permissions=["leads:read", "deals:read", "customers:read"],
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_payload = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)
    store_refresh_token(db, user.id, refresh_token)

    set_auth_cookies(response, access_token, refresh_token)

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="sso_login",
        actor=user.email,
        user_id=str(user.id),
        details={"provider": provider, "role": user.role},
        ip_address=client_ip,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            permissions=user.permissions or [],
            last_login_at=user.last_login_at.isoformat()
            if user.last_login_at
            else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(require_role(["admin", "auditor"])),
    db: Session = Depends(get_db),
):
    """List system users (Admin & Auditor only)."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            is_verified=u.is_verified,
            permissions=u.permissions or [],
            last_login_at=u.last_login_at.isoformat() if u.last_login_at else None,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in users
    ]


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    payload: UserCreateAdminRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Create a new user account (Admin only)."""
    existing = (
        db.query(User).filter(User.email == payload.email.lower().strip()).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists",
        )

    valid_roles = ["admin", "sales", "support", "auditor"]
    role_val = payload.role if payload.role in valid_roles else "sales"

    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=role_val,
        is_active=payload.is_active,
        is_verified=True,
        permissions=payload.permissions
        if payload.permissions is not None
        else ["leads:read", "deals:read", "customers:read"],
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(new_user.id),
        action="admin_create_user",
        actor=current_user.email,
        user_id=str(current_user.id),
        details={
            "created_user_id": str(new_user.id),
            "email": new_user.email,
            "role": new_user.role,
        },
        ip_address=client_ip,
    )

    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active,
        is_verified=new_user.is_verified,
        permissions=new_user.permissions or [],
        last_login_at=new_user.last_login_at.isoformat()
        if new_user.last_login_at
        else None,
        created_at=new_user.created_at.isoformat() if new_user.created_at else None,
    )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_details(
    user_id: str,
    payload: UserUpdateAdminRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Update all attributes of a user including role, status, permissions, password (Admin only)."""
    try:
        user_uuid = UUID(user_id)
        user = db.query(User).filter(User.id == user_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    before_state = {
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "permissions": user.permissions,
    }

    if payload.full_name is not None and payload.full_name.strip():
        user.full_name = payload.full_name.strip()

    if payload.email is not None and payload.email.lower().strip() != user.email:
        new_email = payload.email.lower().strip()
        existing = db.query(User).filter(User.email == new_email).first()
        if existing and str(existing.id) != str(user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another user with this email address already exists",
            )
        user.email = new_email

    if payload.role is not None:
        valid_roles = ["admin", "sales", "support", "auditor"]
        if payload.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of {valid_roles}",
            )
        user.role = payload.role

    if payload.is_active is not None:
        # Prevent admin from deactivating themselves
        if str(user.id) == str(current_user.id) and not payload.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own administrative account",
            )
        user.is_active = payload.is_active

    if payload.permissions is not None:
        user.permissions = payload.permissions

    if payload.password is not None and payload.password.strip():
        pw_error = validate_password_strength(payload.password.strip())
        if pw_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"New password does not meet requirements: {pw_error}",
            )
        user.hashed_password = hash_password(payload.password.strip())

    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="admin_update_user",
        actor=current_user.email,
        user_id=str(current_user.id),
        before_payload=before_state,
        after_payload={
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "permissions": user.permissions,
        },
        details={"target_user_id": str(user.id)},
        ip_address=client_ip,
    )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        permissions=user.permissions or [],
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )


@router.put("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Toggle user active / suspended status (Admin only)."""
    try:
        user_uuid = UUID(user_id)
        user = db.query(User).filter(User.id == user_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if str(user.id) == str(current_user.id) and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot suspend your own administrative account",
        )

    old_status = user.is_active
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="update_user_status",
        actor=current_user.email,
        user_id=str(current_user.id),
        details={
            "user_id": str(user.id),
            "old_status": old_status,
            "new_status": user.is_active,
        },
        ip_address=client_ip,
    )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        permissions=user.permissions or [],
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Delete a user account and revoke all tokens (Admin only)."""
    try:
        user_uuid = UUID(user_id)
        user = db.query(User).filter(User.id == user_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if str(user.id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own administrative account",
        )

    # If deleting an admin, ensure at least one active admin remains
    if user.role == "admin":
        admin_count = (
            db.query(User).filter(User.role == "admin", User.is_active == True).count()
        )
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last remaining active administrator",
            )

    deleted_email = user.email
    deleted_role = user.role

    db.delete(user)
    db.commit()

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=user_id,
        action="admin_delete_user",
        actor=current_user.email,
        user_id=str(current_user.id),
        details={
            "deleted_user_id": user_id,
            "deleted_email": deleted_email,
            "role": deleted_role,
        },
        ip_address=client_ip,
    )

    return {
        "status": "success",
        "message": f"User {deleted_email} has been permanently deleted",
    }


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    """Update a user's RBAC role (Admin only)."""
    valid_roles = ["admin", "sales", "support", "auditor"]
    if payload.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of {valid_roles}",
        )

    try:
        user_uuid = UUID(user_id)
        user = db.query(User).filter(User.id == user_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    old_role = user.role
    user.role = payload.role
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    record_audit_log(
        db=db,
        entity_type="user",
        entity_id=str(user.id),
        action="update_user_role",
        actor=current_user.email,
        user_id=str(current_user.id),
        before_payload={"role": old_role},
        after_payload={"role": user.role},
        details={"user_id": str(user.id), "old_role": old_role, "new_role": user.role},
        ip_address=client_ip,
    )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        permissions=user.permissions or [],
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )
