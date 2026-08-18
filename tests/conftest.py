"""Shared test utilities for authenticated API testing."""
import uuid
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_authenticated_client() -> TestClient:
    """Register a test user and return a client with valid auth cookies."""
    uid = uuid.uuid4().hex[:8]
    email = f"test_user_{uid}@enterprise-crm.ai"
    password = "SecureTest2026!"

    # Register user
    client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": f"Test User {uid}",
            "role": "sales",
        },
    )

    # Login and get token
    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    token = login_res.json()["access_token"]

    # Create a new client with the auth header
    auth_client = TestClient(app, headers={"Authorization": f"Bearer {token}"})
    return auth_client
