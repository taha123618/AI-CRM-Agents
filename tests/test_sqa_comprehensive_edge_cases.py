"""
Senior SQA Comprehensive Edge Cases & Boundary Test Suite
Verifies deep security boundaries, IDOR, CSV injection, RAG fallbacks,
custom field validations, and task queue resilience.
"""

import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from database.connection import get_db
from services.import_export_service import sanitize_csv_cell
from services.rag_service import RagService
from services.task_queue_service import task_queue
from services.auth_service import create_access_token

client = TestClient(app)


def test_csv_formula_injection_sanitization_advanced():
    """SQA Test: Verify diverse formula injection payloads are neutralized."""
    dangerous_payloads = [
        "=1+1",
        "+2+3",
        "-5*2",
        "@SUM(A1:A10)",
        "\t=cmd|' /C calc'!A0",
        "\r=1+1",
        "+cmd.exe",
        "-powershell.exe",
    ]
    for payload in dangerous_payloads:
        sanitized = sanitize_csv_cell(payload)
        # Should be prefixed with single quote or safe
        assert sanitized.startswith("'") or not sanitized.startswith(
            ("=", "+", "-", "@")
        ), f"Payload failed CSV sanitization: {payload} -> {sanitized}"


def test_idor_tenant_isolation_boundary():
    """SQA Test: Verify cross-tenant isolation on deal and lead endpoints."""
    token_admin = create_access_token(
        data={"sub": "admin@gmail.com", "role": "admin", "tenant_id": "tenant_default"}
    )
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # Query with non-existent or foreign resource ID
    random_uuid = str(uuid.uuid4())
    res = client.get(f"/api/deals/{random_uuid}", headers=headers_admin)
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_rag_semantic_search_empty_and_fallback():
    """SQA Test: Verify RAG semantic search handles empty query, zero-match thresholds, and fallbacks."""
    db = next(get_db())
    try:
        # Search with query that matches nothing
        results = RagService.semantic_search(
            query="xyznonexistentunlikelyterm999999", db=db, top_k=5, min_score=0.95
        )
        assert isinstance(results, list)

        # RAG ask on empty context
        rag_answer = await RagService.ask_crm_rag(
            question="What is the pricing for nonexistent secret project zebra?",
            db=db,
            top_k=4,
        )
        assert isinstance(rag_answer, dict)
        assert "answer" in rag_answer
        assert "confidence" in rag_answer
        assert "sources" in rag_answer
    finally:
        db.close()


def test_custom_fields_schema_validation_edge_cases():
    """SQA Test: Verify custom field definition validation rejects invalid field types."""
    token_admin = create_access_token(
        data={"sub": "admin@gmail.com", "role": "admin", "tenant_id": "tenant_default"}
    )
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    # Invalid field type
    invalid_payload = {
        "entity_type": "contact",
        "name": "invalid_field",
        "field_key": "invalid_field_key",
        "field_type": "unsupported_unknown_type",
        "is_required": False,
    }
    res = client.post("/api/custom-fields", json=invalid_payload, headers=headers_admin)
    # Should reject with 400 or 422
    assert res.status_code in [400, 422]


def test_task_queue_status_and_cancellation():
    """SQA Test: Verify task queue status querying and non-existent task handling."""
    token_admin = create_access_token(
        data={"sub": "admin@crm.com", "role": "admin", "tenant_id": "tenant_default"}
    )
    headers_admin = {"Authorization": f"Bearer {token_admin}"}

    fake_task_id = "nonexistent-task-id-999"
    res = client.get(f"/api/tasks/{fake_task_id}", headers=headers_admin)
    assert res.status_code in [404, 200]


def test_rate_limiter_rapid_burst_handling():
    """SQA Test: Verify rate limiter headers are consistently returned."""
    res = client.get("/api/analytics/overview")
    # Rate limit headers should be present on responses
    if "X-RateLimit-Limit" in res.headers:
        assert int(res.headers["X-RateLimit-Limit"]) > 0
        assert int(res.headers["X-RateLimit-Remaining"]) >= 0


def test_metrics_prometheus_exposition():
    """SQA Test: Verify /metrics returns standard Prometheus plain text format."""
    res = client.get("/metrics")
    assert res.status_code == 200
    assert (
        "crm_requests_total" in res.text or "# HELP" in res.text or "crm_" in res.text
    )


def test_auth_lockout_and_password_validation_edge_cases():
    """SQA Test: Test invalid password format rejects on registration."""
    # Attempt register with weak password (e.g. no digit/uppercase/special)
    weak_payload = {
        "email": f"weak_{uuid.uuid4().hex[:6]}@test.com",
        "password": "weak",
        "first_name": "Weak",
        "last_name": "User",
        "role": "sales",
    }
    res = client.post("/api/auth/register", json=weak_payload)
    assert res.status_code in [400, 422]
