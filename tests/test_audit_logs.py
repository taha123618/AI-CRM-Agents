"""Integration & Unit Tests for Compliance Audit Logging System."""

import pytest
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import AuditLog
from services.audit_service import record_audit_log
import uuid
from tests.conftest import get_authenticated_client

client = get_authenticated_client()


def test_audit_logs_crud_and_service():
    # 1. Record an audit log via service
    db = SessionLocal()
    try:
        lead_id = str(uuid.uuid4())
        log_entry = record_audit_log(
            db=db,
            entity_type="lead",
            entity_id=lead_id,
            action="qualify",
            actor="LeadQualificationAgent",
            details={"score": 88, "tier": "Tier 1"},
            ip_address="127.0.0.1",
        )
        assert log_entry.id is not None
        assert log_entry.entity_type == "lead"
        assert log_entry.action == "qualify"
    finally:
        db.close()

    # 2. List audit logs via API
    res = client.get("/api/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    assert any(l["entity_id"] == lead_id for l in logs)

    # 3. Filter by entity_type and action
    filtered = client.get("/api/audit-logs?entity_type=lead&action=qualify")
    assert filtered.status_code == 200
    filtered_logs = filtered.json()
    assert all(l["entity_type"] == "lead" for l in filtered_logs)
    assert all(l["action"] == "qualify" for l in filtered_logs)

    # 4. Search keyword
    searched = client.get("/api/audit-logs?search=LeadQualificationAgent")
    assert searched.status_code == 200
    assert len(searched.json()) > 0

    # 5. Summary statistics
    stats_res = client.get("/api/audit-logs/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_logs" in stats
    assert stats["total_logs"] >= 1
    assert "by_entity" in stats
    assert "by_action" in stats
    assert "lead" in stats["by_entity"]


def test_system_metrics_endpoint():
    res = client.get("/api/analytics/system-metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert "database" in data
    assert data["database"]["status"] == "connected"
    assert "row_counts" in data["database"]
    assert "leads" in data["database"]["row_counts"]
    assert "agents" in data
    assert data["agents"]["registered_count"] == 9

