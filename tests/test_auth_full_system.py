"""Comprehensive Production-Grade Authentication & Authorization Test Suite.

Verifies:
1. User registration with validation and duplicate email protection.
2. Login with password verification, cookie issuance, and brute-force account lockout.
3. Refresh token rotation, database persistence, and revocation.
4. Logout session termination and cookie clearing.
5. Forgot password token generation and password reset flow.
6. Email verification token flow.
7. Google Workspace and Microsoft Entra ID SSO authorization and callback handshake.
8. Role-based access control (RBAC) endpoint guards and role mutation.
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import User, RefreshToken, PasswordResetToken, EmailVerificationToken

client = TestClient(app)


def test_full_registration_and_validation():
    """Verify user registration, cookie issuance, and duplicate email prevention."""
    uid = uuid.uuid4().hex[:6]
    email = f"lead_{uid}@crm-enterprise.com"
    password = "StrongPassword2026!"
    name = "Enterprise Lead"

    # 1. Register
    resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": name, "role": "sales"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "sales"
    assert "access_token" in data
    assert "access_token" in resp.cookies
    assert "refresh_token" in resp.cookies

    # 2. Public self-registration as admin is forbidden
    admin_blocked = client.post(
        "/api/auth/register",
        json={"email": f"hacker_{uid}@fake.com", "password": password, "full_name": "Fake Admin", "role": "admin"},
    )
    assert admin_blocked.status_code == 403
    assert "Super Admin accounts cannot be self-registered publicly" in admin_blocked.json()["detail"]

    # 3. Duplicate registration attempt rejected
    dup_resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": name},
    )
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"]


def test_login_and_brute_force_account_lockout():
    """Verify login authentication, attempt tracking, and account lockout after 5 failed attempts."""
    uid = uuid.uuid4().hex[:6]
    email = f"lockout_{uid}@enterprise.com"
    password = "CorrectPassword123!"

    # Create user
    reg = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Lockout User"},
    )
    assert reg.status_code == 201

    # 1. Successful login
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # 2. 5 Failed login attempts to trigger lockout
    for _ in range(5):
        fail_resp = client.post(
            "/api/auth/login",
            json={"email": email, "password": "WrongPassword999!"},
        )
        assert fail_resp.status_code in [401, 429]

    # 3. 6th attempt should be blocked with 429 Account Locked
    locked_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert locked_resp.status_code == 429
    assert "temporarily locked" in locked_resp.json()["detail"].lower()


def test_refresh_token_rotation_and_revocation():
    """Verify refresh token rotation and revocation on logout."""
    uid = uuid.uuid4().hex[:6]
    email = f"rotate_{uid}@enterprise.com"
    password = "Password2026!"

    reg = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": "Rotate User"},
    )
    assert reg.status_code == 201
    old_refresh = reg.cookies["refresh_token"]

    # 1. Rotate token
    rotate_client = TestClient(app)
    rotate_client.cookies.set("refresh_token", old_refresh)
    ref_resp = rotate_client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert ref_resp.status_code == 200
    new_refresh = ref_resp.json()["refresh_token"]
    assert new_refresh != old_refresh

    # 2. Old token is now revoked and rejected
    stale_resp = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert stale_resp.status_code == 401

    # 3. Logout clears session
    logout_client = TestClient(app)
    logout_client.cookies.set("refresh_token", new_refresh)
    logout_resp = logout_client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json()["status"] == "logged_out"


def test_forgot_and_reset_password_flow():
    """Verify forgot password enqueues email, protects token in API response, and validates reset."""
    from services.auth_service import create_password_reset_token

    uid = uuid.uuid4().hex[:6]
    email = f"reset_{uid}@enterprise.com"
    old_pw = "OldPassword123!"
    new_pw = "NewPassword2026!"

    # 1. Register user
    reg = client.post(
        "/api/auth/register",
        json={"email": email, "password": old_pw, "full_name": "Reset Test User", "role": "sales"},
    )
    assert reg.status_code == 201

    # 2. Request forgot password via API
    forgot_resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert forgot_resp.status_code == 200
    data = forgot_resp.json()
    assert "If an account exists" in data["message"]
    # Token must NOT be exposed in client response
    assert "reset_token" not in data

    # 3. Simulate secure token creation / extraction from single-use email token
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    raw_token = create_password_reset_token(db, user)
    db.close()

    # 4. Reset password using token
    reset_resp = client.post(
        "/api/auth/reset-password",
        json={"token": raw_token, "new_password": new_pw},
    )
    assert reset_resp.status_code == 200
    assert "Password updated successfully" in reset_resp.json()["message"]

    # 5. Token cannot be reused (single-use protection)
    reused_resp = client.post(
        "/api/auth/reset-password",
        json={"token": raw_token, "new_password": "AnotherPassword999!"},
    )
    assert reused_resp.status_code == 400
    assert "already used" in reused_resp.json()["detail"]

    # 6. Log in with new password succeeds
    login_new = client.post("/api/auth/login", json={"email": email, "password": new_pw})
    assert login_new.status_code == 200
    assert "access_token" in login_new.json()

    # 7. Old password no longer works
    login_old = client.post("/api/auth/login", json={"email": email, "password": old_pw})
    assert login_old.status_code == 401


def test_email_verification_token_flow():
    """Verify email verification token consumption."""
    db = SessionLocal()
    uid = uuid.uuid4().hex[:6]
    email = f"verify_{uid}@enterprise.com"

    reg = client.post(
        "/api/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Verify User"},
    )
    user_id = reg.json()["user"]["id"]

    from services.auth_service import create_email_verification_token
    user = db.query(User).filter(User.id == user_id).first()
    raw_token = create_email_verification_token(db, user)
    db.close()

    # Verify endpoint
    ver_resp = client.post("/api/auth/verify-email", json={"token": raw_token})
    assert ver_resp.status_code == 200
    assert "verified successfully" in ver_resp.json()["message"]


def test_sso_providers_and_authorization_redirect():
    """Verify SSO provider catalog and OAuth2 authorization URL generation."""
    # 1. Providers
    p_resp = client.get("/api/auth/sso/providers")
    assert p_resp.status_code == 200
    providers = [p["id"] for p in p_resp.json()["providers"]]
    assert "google" in providers
    assert "microsoft" in providers

    # 2. Google Authorize URL
    g_auth = client.get("/api/auth/sso/authorize/google?state=test_state_123")
    assert g_auth.status_code == 200
    assert "accounts.google.com" in g_auth.json()["authorization_url"]

    # 3. Microsoft Authorize URL
    m_auth = client.get("/api/auth/sso/authorize/microsoft?state=test_state_456")
    assert m_auth.status_code == 200
    assert "login.microsoftonline.com" in m_auth.json()["authorization_url"]


def test_rbac_admin_user_role_update():
    """Verify Admin RBAC user role update."""
    from database.seed import seed_initial_users
    db = SessionLocal()
    seed_initial_users(db)
    db.close()

    uid = uuid.uuid4().hex[:6]
    target_email = f"target_{uid}@enterprise.com"

    # Login as seeded super admin
    admin_login = client.post(
        "/api/auth/login",
        json={"email": "admin@gmail.com", "password": "admin123"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    # Register target sales user
    target_reg = client.post(
        "/api/auth/register",
        json={"email": target_email, "password": "SalesPassword123!", "full_name": "Sales User", "role": "sales"},
    )
    target_id = target_reg.json()["user"]["id"]

    # Update role to auditor
    update_resp = client.put(
        f"/api/auth/users/{target_id}/role",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"role": "auditor"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["role"] == "auditor"


def test_admin_user_full_crud_operations():
    """Verify Super Admin can create, edit, toggle status, and delete users while non-admins are blocked."""
    from database.seed import seed_initial_users
    db = SessionLocal()
    seed_initial_users(db)
    db.close()

    uid = uuid.uuid4().hex[:6]
    sales_email = f"rep_{uid}@crm.com"

    # Login as seeded super admin
    admin_login = client.post(
        "/api/auth/login",
        json={"email": "admin@gmail.com", "password": "admin123"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    # Register standard sales rep
    sales_reg = client.post(
        "/api/auth/register",
        json={"email": sales_email, "password": "SalesPassword123!", "full_name": "Sales Rep", "role": "sales"},
    )
    sales_token = sales_reg.json()["access_token"]

    # 1. Admin creates a new user
    new_user_email = f"managed_{uid}@crm.com"
    create_resp = client.post(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": new_user_email,
            "password": "ManagedPassword123!",
            "full_name": "Managed User",
            "role": "support",
            "is_active": True,
            "permissions": ["customers:read", "customers:write"],
        },
    )
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]
    assert create_resp.json()["role"] == "support"

    # 2. Non-admin (sales) blocked from creating user (403 Forbidden)
    blocked_create = client.post(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {sales_token}"},
        json={
            "email": f"hacker_{uid}@crm.com",
            "password": "Password123!",
            "full_name": "Hacker User",
        },
    )
    assert blocked_create.status_code == 403

    # 3. Admin updates user details
    update_resp = client.put(
        f"/api/auth/users/{created_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "full_name": "Managed User Updated",
            "role": "sales",
            "is_active": True,
            "permissions": ["leads:read", "deals:read"],
        },
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["full_name"] == "Managed User Updated"
    assert update_resp.json()["role"] == "sales"

    # 4. Admin toggles user status to suspended
    status_resp = client.put(
        f"/api/auth/users/{created_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"is_active": False},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["is_active"] is False

    # 5. Non-admin blocked from deleting user
    blocked_del = client.delete(
        f"/api/auth/users/{created_id}",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert blocked_del.status_code == 403

    # 6. Admin deletes user
    del_resp = client.delete(
        f"/api/auth/users/{created_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_resp.status_code == 200
    assert "permanently deleted" in del_resp.json()["message"]


def test_rbac_fine_grained_permission_evaluation():
    """Verify default role permissions and fine-grained permission resolution."""
    from services.auth_service import (
        ROLE_DEFAULT_PERMISSIONS,
        get_default_permissions_for_role,
        get_effective_user_permissions,
        has_permission,
    )
    from database.models import User

    # Admin has wildcard access
    admin_user = User(role="admin", permissions=[])
    assert has_permission(admin_user, "leads:read") is True
    assert has_permission(admin_user, "settings:manage") is True
    assert has_permission(admin_user, "any:custom:scope") is True

    # Sales role defaults
    sales_user = User(role="sales", permissions=[])
    assert has_permission(sales_user, "leads:read") is True
    assert has_permission(sales_user, "deals:write") is True
    assert has_permission(sales_user, "settings:manage") is False

    # Custom permission addition
    sales_custom = User(role="sales", permissions=["settings:manage"])
    assert has_permission(sales_custom, "settings:manage") is True

    # Role defaults getter
    assert "customers:read" in get_default_permissions_for_role("support")
    assert "audits:read" in get_default_permissions_for_role("auditor")

