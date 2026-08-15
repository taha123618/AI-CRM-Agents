"""Tests for Custom Agent Builder & Studio endpoints, runtime engine, and tools."""

import pytest
from fastapi.testclient import TestClient
import uuid

from main import app
from database.connection import SessionLocal
from database.seed import seed_custom_agents

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_custom_agents_seeded():
    """Ensure database has sample custom agents before tests."""
    db = SessionLocal()
    try:
        seed_custom_agents(db)
    finally:
        db.close()


def test_get_available_tools():
    """Test GET /api/custom-agents/tools returns authorized capabilities."""
    res = client.get("/api/custom-agents/tools")
    assert res.status_code == 200
    tools = res.json()
    assert len(tools) >= 5

    tool_ids = [t["id"] for t in tools]
    assert "query_crm" in tool_ids
    assert "update_deal" in tool_ids
    assert "send_email" in tool_ids
    assert "schedule_meeting" in tool_ids


def test_create_and_get_custom_agent():
    """Test creating a new custom agent and fetching by ID."""
    unique_name = f"Test Revenue Sentinel {uuid.uuid4().hex[:6]}"
    payload = {
        "name": unique_name,
        "description": "Monitors expansion ARR and alerts account team on contract renewals.",
        "icon": "Zap",
        "trigger_type": "event",
        "trigger_config": {"event_name": "deal.renewal_due"},
        "model_provider": "smart-fallback",
        "model_name": "smart-fallback",
        "temperature": 0.2,
        "system_prompt": "Analyze renewal for {{customer.name}} with current MRR ${{customer.mrr}}.",
        "tools_enabled": ["query_crm", "send_email"],
        "is_active": True,
    }

    create_res = client.post("/api/custom-agents", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    agent_id = created_data["agent"]["id"]

    # Fetch agent by ID
    get_res = client.get(f"/api/custom-agents/{agent_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == unique_name
    assert get_res.json()["tools_enabled"] == ["query_crm", "send_email"]

    # Cleanup
    client.delete(f"/api/custom-agents/{agent_id}")


def test_update_custom_agent():
    """Test updating custom agent properties."""
    # 1. Create agent
    payload = {
        "name": "Initial Agent",
        "system_prompt": "Initial prompt",
        "tools_enabled": ["query_crm"],
    }
    create_res = client.post("/api/custom-agents", json=payload)
    agent_id = create_res.json()["agent"]["id"]

    # 2. Update agent
    update_res = client.put(
        f"/api/custom-agents/{agent_id}",
        json={
            "name": "Updated Sentinel Agent",
            "is_active": False,
            "tools_enabled": ["query_crm", "schedule_meeting"],
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["agent"]["name"] == "Updated Sentinel Agent"
    assert update_res.json()["agent"]["is_active"] is False

    # Cleanup
    client.delete(f"/api/custom-agents/{agent_id}")


def test_execute_custom_agent_with_interpolation_and_tools():
    """Test executing a custom agent and verifying prompt interpolation and tool trace."""
    # 1. Create agent
    payload = {
        "name": "Interactive QA Agent",
        "system_prompt": "You are assisting prospect {{lead.name}} with budget ${{deal.value}}.",
        "tools_enabled": ["query_crm", "generate_summary"],
        "is_active": True,
    }
    create_res = client.post("/api/custom-agents", json=payload)
    agent_id = create_res.json()["agent"]["id"]

    # 2. Execute test
    exec_payload = {
        "input_payload": {
            "lead": {"name": "Alex Mercer"},
            "deal": {"value": 75000},
            "message": "We need custom API rate limits and SLA guarantees.",
        },
        "trigger_event": "manual_test_run",
    }
    exec_res = client.post(f"/api/custom-agents/{agent_id}/execute", json=exec_payload)
    assert exec_res.status_code == 200
    data = exec_res.json()
    assert data["status"] == "success"
    assert "thought_trace" in data
    assert len(data["thought_trace"]) >= 2
    assert "tool_calls" in data
    assert len(data["tool_calls"]) == 2

    # 3. Check executions history endpoint
    history_res = client.get(f"/api/custom-agents/{agent_id}/executions")
    assert history_res.status_code == 200
    executions = history_res.json()
    assert len(executions) >= 1
    assert executions[0]["status"] == "success"

    # Cleanup
    client.delete(f"/api/custom-agents/{agent_id}")


def test_delete_custom_agent():
    """Test deleting custom agent."""
    payload = {
        "name": "Agent to Delete",
        "system_prompt": "Ephemeral prompt",
    }
    create_res = client.post("/api/custom-agents", json=payload)
    agent_id = create_res.json()["agent"]["id"]

    del_res = client.delete(f"/api/custom-agents/{agent_id}")
    assert del_res.status_code == 200

    # Verify 404
    get_res = client.get(f"/api/custom-agents/{agent_id}")
    assert get_res.status_code == 404
