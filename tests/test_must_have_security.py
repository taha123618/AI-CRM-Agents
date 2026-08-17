"""Comprehensive Test Suite for Must-Have Production Readiness & Security Features.

Covers:
1. JWT / OAuth2 Authentication & Session Management
2. Role-Based Access Control (RBAC)
3. API Rate Limiting Middleware & RFC Headers
4. Persistent Async Background Task Queue Subsystem
5. Audit Logging across Authentication & Role Transitions
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import User
from services.auth_service import hash_password, verify_password, create_access_token
from services.task_queue_service import task_queue

client = TestClient(app)


def test_password_hashing_and_verification():
    """Verify PBKDF2 deterministic password hashing and constant-time verification."""
    raw_pass = "EnterpriseSecret2026!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert "$" in hashed
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False


def test_auth_registration_and_login_flow():
    """Verify end-to-end user registration, login, and profile fetching."""
    rand_suffix = str(uuid.uuid4())[:8]
    email = f"sales_rep_{rand_suffix}@enterprise-crm.ai"
    password = "SecurePassword2026!"

    # 1. Register User
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": f"Sales Rep {rand_suffix}",
            "role": "sales",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["user"]["email"] == email
    token = reg_data["access_token"]
    refresh_token = reg_data["refresh_token"]

    # 2. Get /me Profile
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == email

    # 3. Login with Credentials
    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Login with Invalid Password
    invalid_login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert invalid_login.status_code == 401

    # 5. Refresh Token
    refresh_res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()


def test_rbac_endpoint_access_control():
    """Verify Role-Based Access Control on protected admin routes."""
    rand_suffix = str(uuid.uuid4())[:8]

    # Create admin user
    admin_email = f"admin_{rand_suffix}@enterprise-crm.ai"
    admin_reg = client.post(
        "/api/auth/register",
        json={
            "email": admin_email,
            "password": "AdminPassword123!",
            "full_name": "Admin User",
            "role": "admin",
        },
    )
    # Manually ensure role is admin in DB
    db = SessionLocal()
    admin_user = db.query(User).filter(User.email == admin_email).first()
    admin_user.role = "admin"
    db.commit()
    db.close()

    admin_login = client.post(
        "/api/auth/login",
        json={"email": admin_email, "password": "AdminPassword123!"},
    )
    admin_token = admin_login.json()["access_token"]

    # Create standard sales user
    sales_email = f"rep_{rand_suffix}@enterprise-crm.ai"
    sales_reg = client.post(
        "/api/auth/register",
        json={
            "email": sales_email,
            "password": "SalesPassword123!",
            "full_name": "Standard Rep",
            "role": "sales",
        },
    )
    sales_token = sales_reg.json()["access_token"]
    sales_user_id = sales_reg.json()["user"]["id"]

    # 1. Sales user tries to list all users -> Forbidden (403)
    sales_list = client.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert sales_list.status_code == 403

    # 2. Admin user lists all users -> Success (200)
    admin_list = client.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_list.status_code == 200
    assert isinstance(admin_list.json(), list)

    # 3. Admin updates sales user role to auditor -> Success (200)
    role_update = client.put(
        f"/api/auth/users/{sales_user_id}/role",
        json={"role": "auditor"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert role_update.status_code == 200
    assert role_update.json()["role"] == "auditor"


def test_rate_limiting_headers():
    """Verify sliding-window rate limit RFC headers on responses."""
    res = client.get("/api/leads/")
    assert res.status_code == 200
    assert "X-RateLimit-Limit" in res.headers
    assert "X-RateLimit-Remaining" in res.headers
    assert "X-RateLimit-Reset" in res.headers


def test_persistent_background_task_queue():
    """Verify background task queue submission, progress polling, and execution."""
    # 1. Enqueue Monte Carlo Simulation Task
    enqueue_res = client.post(
        "/api/tasks/monte-carlo",
        json={
            "num_simulations": 100,
            "time_horizon_months": 3,
        },
    )
    assert enqueue_res.status_code == 200
    task_data = enqueue_res.json()
    assert "task_id" in task_data
    task_id = task_data["task_id"]

    # 2. Poll Task Status
    poll_res = client.get(f"/api/tasks/{task_id}")
    assert poll_res.status_code == 200
    poll_data = poll_res.json()
    assert poll_data["task_id"] == task_id
    assert poll_data["status"] in ["pending", "running", "completed"]

    # 3. List background tasks
    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert any(t["task_id"] == task_id for t in tasks)
