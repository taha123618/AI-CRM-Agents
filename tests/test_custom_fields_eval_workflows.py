"""Unit and Integration Tests for:
1. Dynamic Custom Fields Studio (/api/custom-fields)
2. Custom LLM Evaluation & Prompt Benchmarking (/api/evaluations)
3. Visual Multi-Agent Workflow Automation Pipelines (/api/workflows)
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from tests.conftest import get_authenticated_client
from database.connection import SessionLocal

client = get_authenticated_client()


# ============================================================================
# 1. DYNAMIC CUSTOM FIELDS TESTS
# ============================================================================


def test_custom_fields_full_crud():
    """Verify creating, listing, updating, and deleting custom field definitions."""
    # 1. Create a custom select field for deals
    res_create = client.post(
        "/api/custom-fields",
        json={
            "entity_type": "deal",
            "name": "Security Compliance Tier",
            "field_type": "select",
            "options": ["SOC-2 Type II", "HIPAA", "ISO 27001", "FedRAMP"],
            "is_required": True,
        },
    )
    assert res_create.status_code == 201
    created_field = res_create.json()
    assert created_field["name"] == "Security Compliance Tier"
    assert created_field["entity_type"] == "deal"
    assert created_field["field_type"] == "select"
    assert len(created_field["options"]) == 4
    field_id = created_field["id"]

    # 2. List custom fields filtered by entity
    res_list = client.get("/api/custom-fields?entity_type=deal")
    assert res_list.status_code == 200
    fields = res_list.json()
    assert any(f["id"] == field_id for f in fields)

    # 3. Update field
    res_update = client.put(
        f"/api/custom-fields/{field_id}",
        json={
            "name": "Enterprise Security Tier",
            "options": ["SOC-2 Type II", "HIPAA", "ISO 27001", "FedRAMP High"],
        },
    )
    assert res_update.status_code == 200
    updated_field = res_update.json()
    assert updated_field["name"] == "Enterprise Security Tier"
    assert "FedRAMP High" in updated_field["options"]

    # 4. Delete field
    res_delete = client.delete(f"/api/custom-fields/{field_id}")
    assert res_delete.status_code == 200
    assert res_delete.json()["status"] == "success"

    # 5. Verify deleted returns 404
    res_get_deleted = client.put(
        f"/api/custom-fields/{field_id}", json={"name": "Test"}
    )
    assert res_get_deleted.status_code == 404


# ============================================================================
# 2. CUSTOM LLM EVALUATION & BENCHMARKING TESTS
# ============================================================================


def test_llm_prompt_benchmarking():
    """Verify side-by-side prompt benchmarking and metrics history."""
    prompt_a = (
        "You are a sales qualification assistant. Assess the prospect's company size, ARR, and intent. "
        "Categorize their intent as high, medium, or low."
    )
    prompt_b = (
        "You are an enterprise AI SDR Lead Qualification Specialist. Rigorously score buyer intent "
        "using BANT qualification criteria. Extract security requirements, seat rollouts, and exact budget bounds."
    )

    # 1. Run Benchmark
    res_bench = client.post(
        "/api/evaluations/benchmark",
        json={
            "agent_name": "LeadQualificationAgent",
            "prompt_variant_a": prompt_a,
            "prompt_variant_b": prompt_b,
            "dataset_size": 4,
        },
    )
    assert res_bench.status_code == 200
    bench_data = res_bench.json()
    assert "winner" in bench_data
    assert "score_a" in bench_data
    assert "score_b" in bench_data
    assert "metrics" in bench_data
    assert "variant_a" in bench_data["metrics"]
    assert "variant_b" in bench_data["metrics"]
    assert len(bench_data["metrics"]["cases"]) == 4

    # 2. Get Evaluation History
    res_history = client.get("/api/evaluations/history?limit=10")
    assert res_history.status_code == 200
    history = res_history.json()
    assert len(history) >= 1
    assert any(h["agent_name"] == "LeadQualificationAgent" for h in history)


# ============================================================================
# 3. VISUAL MULTI-AGENT WORKFLOWS TESTS
# ============================================================================


def test_visual_workflows_full_lifecycle():
    """Verify visual workflow pipeline listing, creation, execution, and deletion."""
    # 1. List workflows (seeds defaults)
    res_list = client.get("/api/workflows")
    assert res_list.status_code == 200
    workflows = res_list.json()
    assert len(workflows) >= 2

    # 2. Create custom workflow
    res_create = client.post(
        "/api/workflows",
        json={
            "name": "High-Risk Customer Instant Retention Cadence",
            "description": "Triggered when churn risk is elevated above 60%. Deploys Customer Success Agent.",
            "trigger_type": "event",
            "trigger_config": {
                "event_name": "customer.churn_risk_high",
                "threshold": 60,
            },
            "nodes": [
                {"id": "n1", "type": "trigger", "label": "Churn Risk > 60%"},
                {
                    "id": "n2",
                    "type": "agent",
                    "label": "Customer Success Agent",
                    "agent": "customer_success",
                },
                {"id": "n3", "type": "action", "label": "Executive QBR Invitation"},
            ],
            "edges": [
                {"id": "e1-2", "source": "n1", "target": "n2"},
                {"id": "e2-3", "source": "n2", "target": "n3"},
            ],
            "is_active": True,
        },
    )
    assert res_create.status_code == 201
    wf = res_create.json()
    wf_id = wf["id"]
    assert wf["name"] == "High-Risk Customer Instant Retention Cadence"
    assert len(wf["nodes"]) == 3

    # 3. Execute workflow simulation
    res_exec = client.post(f"/api/workflows/{wf_id}/execute")
    assert res_exec.status_code == 200
    exec_data = res_exec.json()
    assert exec_data["status"] == "success"
    assert exec_data["nodes_processed"] == 3
    assert len(exec_data["trace"]) == 3

    # 4. Clean up
    res_del = client.delete(f"/api/workflows/{wf_id}")
    assert res_del.status_code == 200
