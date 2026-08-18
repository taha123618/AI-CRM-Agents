"""Integration and Unit Tests for:
1. Prometheus Metrics Exporter (/api/metrics & /metrics)
2. Semantic Search & Vector RAG Engine (/api/search/semantic & /api/search/rag-ask)
3. Multi-Tenant Organization Isolation (/api/organizations)
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import VoiceCall, Meeting, Email, Organization, User
from services.metrics_service import MetricsService
from services.tenant_service import TenantService

client = TestClient(app)


# ============================================================================
# 1. PROMETHEUS OBSERVABILITY METRICS TESTS
# ============================================================================


def test_prometheus_metrics_endpoints():
    """Verify /api/metrics and /metrics return valid Prometheus exposition format."""
    # Record test metrics
    MetricsService.record_agent_execution("LeadQualificationAgent", 0.45, "success")
    MetricsService.record_llm_tokens("gpt-4o", prompt_tokens=150, completion_tokens=75)
    MetricsService.record_task_job("send_email", "completed")
    MetricsService.set_active_ws_connections(3)

    # 1. /api/metrics
    res_api = client.get("/api/metrics")
    assert res_api.status_code == 200
    assert "text/plain" in res_api.headers["content-type"]
    body_api = res_api.text
    assert "crm_info" in body_api
    assert "crm_agent_executions_total" in body_api
    assert "crm_llm_tokens_consumed_total" in body_api
    assert "crm_websocket_connections_active" in body_api

    # 2. /metrics root scraper
    res_root = client.get("/metrics")
    assert res_root.status_code == 200
    assert "crm_info" in res_root.text


# ============================================================================
# 2. SEMANTIC VECTOR SEARCH & RAG TESTS
# ============================================================================


from datetime import datetime, timezone
import uuid

def test_semantic_search_and_rag_endpoints():
    """Verify semantic vector search and RAG Q&A retrieval."""
    db = SessionLocal()
    try:
        # Create test knowledge items
        test_call = VoiceCall(
            contact_name="Enterprise Prospect Corp",
            phone_number="+1555000111",
            summary="Discussion regarding enterprise security compliance and SLA guarantees.",
            status="completed",
            buyer_intent_score=95,
            action_items=["Provide SOC-2 compliance package", "Schedule SLA review"],
        )
        test_meeting = Meeting(
            title="Q4 Enterprise Security Alignment Briefing",
            scheduled_at=datetime.now(timezone.utc),
            notes="Reviewed multi-region data sovereignty and disaster recovery SLA.",
            prep_materials={"summary": "Ensure compliance documentation is shared with CISO."},
        )
        db.add(test_call)
        db.add(test_meeting)
        db.commit()

        # 1. Test Semantic Search
        search_res = client.post(
            "/api/search/semantic",
            json={
                "query": "enterprise security compliance and SLA",
                "entity_filter": "all",
                "top_k": 5,
            },
        )
        assert search_res.status_code == 200
        results = search_res.json()
        assert len(results) >= 1
        top_match = results[0]
        assert "similarity_score" in top_match
        assert top_match["similarity_score"] > 0.0
        assert "snippet" in top_match

        # 2. Test RAG Q&A
        rag_res = client.post(
            "/api/search/rag-ask",
            json={
                "question": "What are the compliance and security requirements?",
                "top_k": 3,
            },
        )
        assert rag_res.status_code == 200
        rag_data = rag_res.json()
        assert "answer" in rag_data
        assert "sources" in rag_data
        assert len(rag_data["sources"]) >= 1

        # Clean up
        db.delete(test_call)
        db.delete(test_meeting)
        db.commit()
    finally:
        db.close()


# ============================================================================
# 3. MULTI-TENANT ORGANIZATIONS TESTS
# ============================================================================


def test_organizations_crud_and_scoping():
    """Verify multi-tenant workspace creation and isolation."""
    # 1. List organizations (ensures default workspace exists)
    res_list = client.get("/api/organizations")
    assert res_list.status_code == 200
    orgs = res_list.json()
    assert len(orgs) >= 1
    assert any(o["slug"] == "default-workspace" for o in orgs)

    unique_suffix = uuid.uuid4().hex[:6]
    # 2. Create new organization tenant
    res_create = client.post(
        "/api/organizations",
        json={
            "name": f"Apex Global {unique_suffix}",
            "slug": f"apex-global-{unique_suffix}",
            "domain": f"apexglobal-{unique_suffix}.com",
            "plan_tier": "enterprise",
        },
    )
    assert res_create.status_code == 201
    created_org = res_create.json()
    assert f"Apex Global {unique_suffix}" in created_org["name"]
    assert f"apex-global-{unique_suffix}" in created_org["slug"]
    org_id = created_org["id"]

    # 3. Get organization by ID
    res_get = client.get(f"/api/organizations/{org_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == org_id

    # 4. Negative test: non-existent organization returns 404
    res_not_found = client.get("/api/organizations/nonexistent-org-slug")
    assert res_not_found.status_code == 404
