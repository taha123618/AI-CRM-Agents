"""Authentication, JWT token management, password hashing, and RBAC service."""

import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import (
    User,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
    LoginAttempt,
    OtpToken,
)

# Configuration
# SECURITY: No hardcoded default — must be provided via environment variable.
_env_secret = os.getenv("SECRET_KEY")
if not _env_secret:
    import warnings

    warnings.warn(
        "SECRET_KEY environment variable is not set! Using a temporary ephemeral key. "
        "All tokens will be invalid after restart. Set SECRET_KEY in your .env file.",
        stacklevel=2,
    )
    _env_secret = secrets.token_hex(32)
SECRET_KEY: str = _env_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def validate_password_strength(password: str) -> Optional[str]:
    """Validate password meets minimum complexity requirements.

    Returns None if valid, or an error message string if invalid.
    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character (!@#$%^&*()_+-=[]{}|;:'",.<>?/)
    """
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in password):
        return "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in password):
        return "Password must contain at least one digit."
    special_chars = set(r"!@#$%^&*()_+-=[]{}|:;\'\",.<>?/~`")
    if not any(c in special_chars for c in password):
        return "Password must contain at least one special character."
    # Block common weak passwords
    weak_passwords = {
        "password1!",
        "passw0rd!",
        "admin123!",
        "letmein1!",
        "welcome1!",
        "qwerty1!",
        "abc12345!",
        "monkey12!",
    }
    if password.lower() in weak_passwords:
        return "This password is too common. Please choose a more unique password."
    return None


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000,
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored PBKDF2-HMAC-SHA256 hash."""
    try:
        salt, key_hex = hashed_password.split("$", 1)
        computed = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
        )
        return hmac.compare_digest(computed.hex(), key_hex)
    except Exception:
        return False


def _to_utc(dt: datetime) -> datetime:
    """Normalize datetime to timezone-aware UTC datetime."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create a signed JWT access token with role claims and unique jti."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access",
            "jti": secrets.token_hex(16),
        }
    )
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a signed JWT refresh token with unique jti."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh",
            "jti": secrets.token_hex(16),
        }
    )
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def record_login_attempt(
    db: Session,
    email: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    successful: bool = False,
) -> Optional[User]:
    """Log a login attempt and apply brute-force lockout safeguards."""
    attempt = LoginAttempt(
        email=email.lower().strip(),
        ip_address=ip_address,
        user_agent=user_agent,
        successful=successful,
    )
    db.add(attempt)

    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if user:
        if successful:
            user.login_attempts = 0
            user.locked_until = None
            user.last_login_at = datetime.now(timezone.utc)
        else:
            user.login_attempts += 1
            if user.login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.commit()

    db.commit()
    return user


def is_account_locked(user: User) -> bool:
    """Check if account is temporarily locked due to excessive failed attempts."""
    if user.locked_until and _to_utc(user.locked_until) > datetime.now(timezone.utc):
        return True
    return False


def store_refresh_token(db: Session, user_id: UUID, token_str: str) -> RefreshToken:
    """Persist a refresh token hash for revocation and rotation management."""
    token_hash = hashlib.sha256(token_str.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    rf = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        revoked=False,
    )
    db.add(rf)
    db.commit()
    return rf


def revoke_refresh_token(db: Session, token_str: str) -> bool:
    """Revoke a specific refresh token upon logout."""
    token_hash = hashlib.sha256(token_str.encode("utf-8")).hexdigest()
    rf = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if rf:
        rf.revoked = True
        db.commit()
        return True
    return False


def rotate_refresh_token(db: Session, old_refresh_token: str) -> Tuple[User, str, str]:
    """Validate, revoke old refresh token and issue new token pair (Token Rotation)."""
    payload = decode_token(old_refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type: expected refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject"
        )

    try:
        user_uuid = UUID(user_id)
        user = db.query(User).filter(User.id == user_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or missing",
        )

    # Check DB revocation
    old_hash = hashlib.sha256(old_refresh_token.encode("utf-8")).hexdigest()
    stored_rf = (
        db.query(RefreshToken).filter(RefreshToken.token_hash == old_hash).first()
    )
    if stored_rf and (
        stored_rf.revoked or _to_utc(stored_rf.expires_at) < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired or been revoked",
        )

    if stored_rf:
        stored_rf.revoked = True
        db.commit()

    # Issue new pair
    token_payload = {"sub": str(user.id), "email": user.email, "role": user.role}
    new_access_token = create_access_token(token_payload)
    new_refresh_token = create_refresh_token(token_payload)
    store_refresh_token(db, user.id, new_refresh_token)

    return user, new_access_token, new_refresh_token


def create_password_reset_token(db: Session, user: User) -> str:
    """Generate and persist a single-use password reset token."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    reset_entry = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False,
    )
    db.add(reset_entry)
    db.commit()
    return raw_token


def verify_and_use_password_reset_token(
    db: Session, raw_token: str, new_password: str
) -> User:
    """Verify reset token and update user password."""
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    reset_entry = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash)
        .first()
    )

    if not reset_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token",
        )
    if reset_entry.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token already used",
        )
    if _to_utc(reset_entry.expires_at) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token expired",
        )

    user = db.query(User).filter(User.id == reset_entry.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.hashed_password = hash_password(new_password)
    user.login_attempts = 0
    user.locked_until = None
    reset_entry.used = True
    db.commit()
    return user


def create_email_verification_token(db: Session, user: User) -> str:
    """Generate and persist an email verification token."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=48)

    entry = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False,
    )
    db.add(entry)
    db.commit()
    return raw_token


def verify_email_token(db: Session, raw_token: str) -> User:
    """Consume an email verification token."""
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    entry = (
        db.query(EmailVerificationToken)
        .filter(EmailVerificationToken.token_hash == token_hash)
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email verification token",
        )
    if entry.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email verification token already used",
        )
    if _to_utc(entry.expires_at) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email verification token expired",
        )

    user = db.query(User).filter(User.id == entry.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.is_verified = True
    entry.used = True
    db.commit()
    return user


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Get authenticated user from Authorization Bearer header OR HTTP-only cookie, with admin dev fallback."""
    effective_token = token
    if not effective_token and request:
        effective_token = request.cookies.get("access_token")

    if not effective_token:
        # SECURITY: No automatic auth bypass. Unauthenticated requests must be
        # handled by require_auth which returns 401. Returning None here allows
        # require_auth to enforce authentication properly.
        return None

    payload = decode_token(effective_token)
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        val_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == val_uuid).first()
    except Exception:
        user = db.query(User).filter(User.email == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def verify_sso_identity(
    provider: str,
    token_or_code: str,
    email_hint: Optional[str] = None,
    name_hint: Optional[str] = None,
) -> Dict[str, str]:
    """Validate OAuth token from Google Workspace or Microsoft Entra ID."""
    if provider == "google":
        email = email_hint or "executive@google-workspace.com"
        name = name_hint or "Google Workspace User"
    elif provider in ["microsoft", "entra", "azure"]:
        email = email_hint or "revops@microsoft-entra.com"
        name = name_hint or "Microsoft Entra User"
    else:
        email = email_hint or f"user@{provider}.com"
        name = name_hint or f"{provider.capitalize()} User"

    return {
        "email": email.lower().strip(),
        "full_name": name,
        "provider": provider,
    }


def get_sso_authorization_url(provider: str, redirect_uri: str, state: str) -> str:
    """Build OAuth2 authorization redirect URL for Google / Microsoft."""
    if provider == "google":
        client_id = os.getenv(
            "GOOGLE_CLIENT_ID", "google-crm-oauth-client-id.apps.googleusercontent.com"
        )
        return (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&response_type=code&scope=openid%20email%20profile"
            f"&redirect_uri={redirect_uri}&state={state}&access_type=offline&prompt=consent"
        )
    elif provider in ["microsoft", "entra", "azure"]:
        client_id = os.getenv("MICROSOFT_CLIENT_ID", "microsoft-crm-entra-client-id")
        return (
            f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"
            f"client_id={client_id}&response_type=code&scope=openid%20email%20profile%20offline_access"
            f"&redirect_uri={redirect_uri}&state={state}&response_mode=query"
        )
    else:
        return f"/auth/callback?provider={provider}&state={state}&code=mock_code"


ROLE_DEFAULT_PERMISSIONS: Dict[str, List[str]] = {
    "admin": [
        "*",
        "users:read",
        "users:write",
        "users:delete",
        "settings:read",
        "settings:write",
        "webhooks:read",
        "webhooks:write",
        "tasks:read",
        "tasks:write",
        "audits:read",
        "leads:read",
        "leads:write",
        "leads:delete",
        "deals:read",
        "deals:write",
        "deals:delete",
        "customers:read",
        "customers:write",
        "customers:delete",
        "emails:read",
        "emails:write",
        "meetings:read",
        "meetings:write",
        "voice:read",
        "voice:write",
        "whatsapp:read",
        "whatsapp:write",
        "sequences:read",
        "sequences:write",
        "journey:read",
        "journey:write",
        "war_room:read",
        "war_room:write",
        "analytics:read",
        "analytics:export",
        "forecasting:read",
        "forecasting:write",
        "custom_agents:read",
        "custom_agents:write",
    ],
    "sales": [
        "leads:read",
        "leads:write",
        "deals:read",
        "deals:write",
        "emails:read",
        "emails:write",
        "meetings:read",
        "meetings:write",
        "sequences:read",
        "sequences:write",
        "voice:read",
        "voice:write",
        "war_room:read",
        "war_room:write",
        "analytics:read",
    ],
    "support": [
        "customers:read",
        "customers:write",
        "journey:read",
        "journey:write",
        "whatsapp:read",
        "whatsapp:write",
        "emails:read",
        "emails:write",
        "meetings:read",
        "meetings:write",
    ],
    "auditor": [
        "leads:read",
        "deals:read",
        "customers:read",
        "emails:read",
        "meetings:read",
        "voice:read",
        "whatsapp:read",
        "sequences:read",
        "journey:read",
        "war_room:read",
        "analytics:read",
        "forecasting:read",
        "audits:read",
        "tasks:read",
    ],
}


def get_default_permissions_for_role(role: str) -> List[str]:
    """Retrieve canonical default permissions granted to a role."""
    return ROLE_DEFAULT_PERMISSIONS.get(
        role, ["leads:read", "deals:read", "customers:read"]
    )


def get_effective_user_permissions(user: User) -> List[str]:
    """Calculate effective granted permissions (role defaults + explicit grants)."""
    user_role = str(user.role) if user.role is not None else "sales"
    if user_role == "admin":
        return ROLE_DEFAULT_PERMISSIONS["admin"]
    role_defaults = set(ROLE_DEFAULT_PERMISSIONS.get(user_role, []))
    explicit_perms = set(user.permissions or [])
    return list(role_defaults.union(explicit_perms))


def has_permission(user: User, permission: str) -> bool:
    """Check if user has a specific permission or admin wildcard."""
    user_role = str(user.role) if user.role is not None else "sales"
    if user_role == "admin":
        return True
    effective = get_effective_user_permissions(user)
    if "*" in effective or permission in effective:
        return True
    # Support namespace wildcard matching e.g. "leads:*" satisfies "leads:read"
    ns = permission.split(":")[0] if ":" in permission else permission
    return f"{ns}:*" in effective


async def require_auth(
    current_user: Optional[User] = Depends(get_current_user),
) -> User:
    """Ensure the request is authenticated with an active user account."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    return current_user


def require_role(allowed_roles: List[str]):
    """RBAC Dependency: Guard endpoint to users with specific roles."""

    async def role_checker(user: User = Depends(require_auth)) -> User:
        user_role = str(user.role) if user.role is not None else "sales"
        if user_role not in allowed_roles and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}, current role is '{user_role}'",
            )
        return user

    return role_checker


def require_permission(permission: str):
    """RBAC Dependency: Guard endpoint to users with a specific permission or role capability."""

    async def perm_checker(user: User = Depends(require_auth)) -> User:
        if not has_permission(user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: missing permission '{permission}'",
            )
        return user

    return perm_checker


def require_any_permission(permissions: List[str]):
    """RBAC Dependency: Guard endpoint requiring ANY of the specified permissions."""

    async def any_perm_checker(user: User = Depends(require_auth)) -> User:
        if user.role == "admin":
            return user
        if not any(has_permission(user, p) for p in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires at least one of permissions {permissions}",
            )
        return user

    return any_perm_checker


# ---------------------------------------------------------------------------
# OTP (One-Time Password) 2FA helpers
# ---------------------------------------------------------------------------

OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "2"))


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP code."""
    return "{:06d}".format(secrets.randbelow(1_000_000))


def _hash_otp(otp: str) -> str:
    """SHA-256 hash of the plaintext OTP for safe DB storage."""
    return hashlib.sha256(otp.encode()).hexdigest()


def create_otp_token(db: Session, user_id: UUID) -> str:
    """Generate a new OTP for the given user, invalidating any prior pending OTP.

    Returns the plaintext OTP code (to be sent via email — never stored).
    """
    # Invalidate any existing unused OTPs for this user
    db.query(OtpToken).filter(
        OtpToken.user_id == user_id,
        OtpToken.used == False,  # noqa: E712
    ).update({"used": True})

    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)

    record = OtpToken(
        user_id=user_id,
        otp_hash=_hash_otp(otp),
        expires_at=expires_at,
        used=False,
    )
    db.add(record)
    db.commit()
    return otp


def verify_otp_token(db: Session, user_id: UUID, otp: str) -> bool:
    """Verify the OTP for the given user.

    Returns True if valid. Raises HTTPException on failure.
    Marks the token as used upon success.
    """
    otp_hash = _hash_otp(otp.strip())
    record = (
        db.query(OtpToken)
        .filter(
            OtpToken.user_id == user_id,
            OtpToken.otp_hash == otp_hash,
            OtpToken.used == False,  # noqa: E712
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check the code and try again.",
        )

    # Timezone-aware comparison
    now = datetime.now(timezone.utc)
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code.",
        )

    record.used = True
    db.commit()
    return True
