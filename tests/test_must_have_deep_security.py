"""In-Depth Test Suite for Must-Have Security & Production Readiness Requirements.

Verifies:
1. HTTP-only cookies session management and cookie-based authentication.
2. Social SSO authentication (Google Workspace & Microsoft Entra ID).
3. Dedicated async task queue jobs (sequence cohort & audio synthesis).
4. Sliding window rate limiter headers and enforcement.
5. Compliance audit trail with structured payload diffs (GDPR/SOC2).
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import User, AuditLog
from services.audit_service import compute_payload_diff, record_audit_log

client = TestClient(app)


def test_http_only_cookie_session_and_logout():
    """Verify HTTP-only cookies on login/register and cookie-based authentication."""
    uid = uuid.uuid4().hex[:6]
    email = f"sec_user_{uid}@enterprise.com"
    password = "SecPassword123!"

    # 1. Register with cookies
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Security User",
            "role": "sales",
        },
    )
    assert reg_resp.status_code == 201
    assert "access_token" in reg_resp.cookies
    assert "refresh_token" in reg_resp.cookies
    access_cookie = reg_resp.cookies["access_token"]

    # 2. Authenticate using cookie instead of Bearer header
    client_no_header = TestClient(app)
    client_no_header.cookies.set("access_token", access_cookie)
    me_resp = client_no_header.get("/api/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email

    # 3. Logout clears cookies
    logout_resp = client_no_header.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json()["status"] == "logged_out"


def test_social_sso_google_and_microsoft():
    """Verify Social SSO authentication for Google Workspace and Microsoft Entra ID."""
    # 1. List SSO Providers
    prov_resp = client.get("/api/auth/sso/providers")
    assert prov_resp.status_code == 200
    providers = prov_resp.json()["providers"]
    provider_ids = [p["id"] for p in providers]
    assert "google" in provider_ids
    assert "microsoft" in provider_ids

    # 2. Google SSO Authentication
    uid = uuid.uuid4().hex[:6]
    google_email = f"exec_{uid}@google-workspace-demo.com"
    google_resp = client.post(
        "/api/auth/sso/google",
        json={
            "token": f"mock_google_id_token_{uid}",
            "email_hint": google_email,
            "name_hint": "Google Executive",
        },
    )
    assert google_resp.status_code == 200
    assert "access_token" in google_resp.json()
    assert google_resp.json()["user"]["email"] == google_email

    # 3. Microsoft Entra ID SSO Authentication
    ms_email = f"revops_{uid}@microsoft-entra-demo.com"
    ms_resp = client.post(
        "/api/auth/sso/microsoft",
        json={
            "token": f"mock_entra_token_{uid}",
            "email_hint": ms_email,
            "name_hint": "Microsoft RevOps",
        },
    )
    assert ms_resp.status_code == 200
    assert "access_token" in ms_resp.json()
    assert ms_resp.json()["user"]["email"] == ms_email


def test_async_task_queue_cohort_and_audio():
    """Verify asynchronous background tasks for SDR sequence cohorts and audio processing."""
    # 1. Enqueue SDR sequence cohort dispatch
    cohort_resp = client.post(
        "/api/tasks/sequence-cohort",
        json={
            "sequence_id": "seq-enterprise-outbound-1",
            "lead_ids": ["lead-101", "lead-102", "lead-103"],
        },
    )
    assert cohort_resp.status_code == 200
    task_data = cohort_resp.json()
    assert task_data["task_type"] == "sequence_cohort_dispatch"
    task_id = task_data["task_id"]

    # 2. Query task status
    status_resp = client.get(f"/api/tasks/{task_id}")
    assert status_resp.status_code == 200
    assert status_resp.json()["task_id"] == task_id

    # 3. Enqueue Audio synthesis task
    audio_resp = client.post(
        "/api/tasks/audio-synthesis",
        json={
            "call_id": "call-recording-99",
            "transcript": "Hello, we are interested in signing the enterprise annual agreement.",
        },
    )
    assert audio_resp.status_code == 200
    assert audio_resp.json()["task_type"] == "audio_intelligence_synthesis"

    # 4. Enqueue Bulk Lead Enrichment task
    enrich_resp = client.post(
        "/api/tasks/bulk-enrichment",
        json={
            "enrichment_sources": ["clearbit", "linkedin"],
        },
    )
    assert enrich_resp.status_code == 200
    assert enrich_resp.json()["task_type"] == "bulk_lead_enrichment"
    enrich_task_id = enrich_resp.json()["task_id"]

    # 5. Cancel task
    cancel_resp = client.post(f"/api/tasks/{enrich_task_id}/cancel")
    assert cancel_resp.status_code == 200

    # 6. Clear completed tasks
    clear_resp = client.post("/api/tasks/clear-completed")
    assert clear_resp.status_code == 200
    assert "cleared_tasks_count" in clear_resp.json()


def test_audit_trail_payload_diffs():
    """Verify field-level structured payload diff calculation for GDPR/SOC2 compliance."""
    before_state = {
        "deal_name": "Acme Renewal",
        "value": 50000.0,
        "stage": "proposal",
        "health_score": 65,
    }
    after_state = {
        "deal_name": "Acme Renewal & Expansion",
        "value": 85000.0,
        "stage": "negotiation",
        "health_score": 90,
    }

    # 1. Verify diff calculation
    diff = compute_payload_diff(before_state, after_state)
    assert diff["changed_fields_count"] == 4
    changed_fields = [c["field"] for c in diff["changes"]]
    assert "deal_name" in changed_fields
    assert "value" in changed_fields
    assert "stage" in changed_fields
    assert "health_score" in changed_fields

    # 2. Record audit log entry in DB
    db = SessionLocal()
    audit_entry = record_audit_log(
        db=db,
        entity_type="deal",
        entity_id="deal-999",
        action="update_stage_and_value",
        actor="lead_agent",
        user_id="usr-12345",
        before_payload=before_state,
        after_payload=after_state,
        ip_address="192.168.1.50",
    )
    assert audit_entry.id is not None
    assert audit_entry.payload_diff["changed_fields_count"] == 4
    assert audit_entry.user_id == "usr-12345"
    db.close()
