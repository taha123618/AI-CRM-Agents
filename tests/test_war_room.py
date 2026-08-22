"""Tests for AI Deal War Room, Strategy Matrix, and Proposal Studio endpoints."""

import pytest
from fastapi.testclient import TestClient
from main import app
from database.models import Deal, AutomationRule
from database.connection import get_db
import uuid
from tests.conftest import get_authenticated_client

client = get_authenticated_client()


def test_list_war_room_deals():
    # 1. Base list
    response = client.get("/api/war-room/deals")
    assert response.status_code == 200
    deals = response.json()
    assert isinstance(deals, list)
    if len(deals) > 0:
        deal = deals[0]
        assert "id" in deal
        assert "title" in deal
        assert "company" in deal
        assert "win_probability_pct" in deal

    # 2. Search query parameter
    search_res = client.get("/api/war-room/deals?search=Acme")
    assert search_res.status_code == 200
    assert all("acme" in (d["title"] + d["company"]).lower() for d in search_res.json())

    # 3. Stage filter
    stage_res = client.get("/api/war-room/deals?stage=proposal")
    assert stage_res.status_code == 200
    assert all(d["stage"] == "proposal" for d in stage_res.json())

    # 4. Sorting and pagination
    sorted_res = client.get("/api/war-room/deals?sort_by=value&order=desc&skip=0&limit=2")
    assert sorted_res.status_code == 200
    data = sorted_res.json()
    assert len(data) <= 2
    if len(data) == 2:
        assert data[0]["value"] >= data[1]["value"]


def test_get_deal_strategy_matrix():
    # Fetch existing deals
    deals_res = client.get("/api/war-room/deals")
    deals = deals_res.json()
    assert len(deals) > 0
    deal_id = deals[0]["id"]

    res = client.get(f"/api/war-room/deals/{deal_id}/strategy")
    assert res.status_code == 200
    data = res.json()
    assert data["deal_id"] == deal_id
    assert "consensus_health_score" in data
    assert "agent_perspectives" in data
    assert len(data["agent_perspectives"]) == 4
    assert "swot_analysis" in data
    assert len(data["swot_analysis"]["strengths"]) > 0
    assert "competitor_battle_cards" in data
    assert len(data["competitor_battle_cards"]) > 0
    assert "stakeholder_influence_map" in data


def test_get_nonexistent_deal_strategy_returns_404():
    fake_id = str(uuid.uuid4())
    res = client.get(f"/api/war-room/deals/{fake_id}/strategy")
    assert res.status_code == 404
    assert res.json()["detail"] == "Deal not found"


def test_generate_deal_proposal():
    deals_res = client.get("/api/war-room/deals")
    deals = deals_res.json()
    assert len(deals) > 0
    deal_id = deals[0]["id"]

    payload = {
        "deal_id": deal_id,
        "tier": "enterprise",
        "custom_discount_pct": 10.0,
        "include_sla_guarantee": True,
        "custom_terms": "Special Pilot Clause",
    }
    res = client.post("/api/war-room/proposals/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["deal_id"] == deal_id
    assert data["tier"] == "Enterprise"
    assert data["pricing"]["discount_pct"] == 10.0
    assert "proposal_id" in data
    assert "modules_included" in data
    assert len(data["modules_included"]) > 0
    assert "esign_url" in data

    # Negative: Non-existent deal
    fake_payload = {
        "deal_id": str(uuid.uuid4()),
        "tier": "enterprise",
    }
    res_fake = client.post("/api/war-room/proposals/generate", json=fake_payload)
    assert res_fake.status_code == 404


def test_send_deal_proposal_email():
    deals_res = client.get("/api/war-room/deals")
    deals = deals_res.json()
    assert len(deals) > 0
    deal_id = deals[0]["id"]

    payload = {
        "recipient_email": "cfo@enterprise-corp.org",
        "proposal_id": "PROP-TEST-001",
        "tier": "Enterprise",
        "final_arr": 85000.0,
        "custom_note": "Approved terms attached.",
    }
    res = client.post(f"/api/war-room/deals/{deal_id}/send-proposal", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "sent"
    assert data["recipient"] == "cfo@enterprise-corp.org"
    assert "task_id" in data


def test_automation_rules_crud_and_toggle():
    # 1. List automations
    res = client.get("/api/war-room/automations")
    assert res.status_code == 200
    rules = res.json()
    assert isinstance(rules, list)
    initial_count = len(rules)

    # 2. Create rule
    new_rule_payload = {
        "name": "High Priority Deal ➔ Trigger Strategic Briefing",
        "trigger_event": "deal_health_below",
        "trigger_threshold": 40,
        "action_agent": "deal_agent",
        "action_type": "schedule_war_room",
    }
    create_res = client.post("/api/war-room/automations", json=new_rule_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == new_rule_payload["name"]
    rule_id = created["id"]

    # 3. Update rule
    update_payload = {
        "name": "Updated Strategic Trigger Name",
        "trigger_event": "deal_health_below",
        "trigger_threshold": 35,
        "action_agent": "deal_agent",
        "action_type": "schedule_war_room",
    }
    update_res = client.put(f"/api/war-room/automations/{rule_id}", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Strategic Trigger Name"

    # 4. Execute rule
    exec_res = client.post(f"/api/war-room/automations/{rule_id}/execute")
    assert exec_res.status_code == 200
    assert exec_res.json()["status"] == "executed"
    assert exec_res.json()["executions_count"] >= 1

    # 5. Toggle status
    toggle_res = client.post(f"/api/war-room/automations/{rule_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["rule"]["status"] == "paused"

    # 6. Delete rule
    del_res = client.delete(f"/api/war-room/automations/{rule_id}")
    assert del_res.status_code == 200
    assert del_res.json()["deleted_rule_id"] == rule_id

    # 7. Confirm deletion
    get_deleted = client.put(f"/api/war-room/automations/{rule_id}", json=update_payload)
    assert get_deleted.status_code == 404


def test_automation_rules_negative_and_validation():
    fake_id = str(uuid.uuid4())
    # 404 for non-existent execute, toggle, delete
    assert client.post(f"/api/war-room/automations/{fake_id}/execute").status_code == 404
    assert client.post(f"/api/war-room/automations/{fake_id}/toggle").status_code == 404
    assert client.delete(f"/api/war-room/automations/{fake_id}").status_code == 404

    # 422 for malformed create payload (name too short)
    bad_payload = {
        "name": "a",
        "trigger_event": "e",
        "trigger_threshold": 1,
        "action_agent": "a",
        "action_type": "t",
    }
    assert client.post("/api/war-room/automations", json=bad_payload).status_code == 422
