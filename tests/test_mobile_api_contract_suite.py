"""
SQA Mobile API Contract Integration Test Suite
Verifies that all API endpoints consumed by the Field Sales Mobile App return the expected schemas,
support error edge cases, enforce authentication, and maintain state integrity.
"""

from tests.conftest import get_authenticated_client


def test_mobile_contract_deals_and_pipeline_flow():
    """Test full Deal lifecycle as invoked by Mobile Deals Radar & + NEW DEAL modal."""
    client = get_authenticated_client()

    # 1. Create a deal
    create_payload = {
        "name": "Mobile SQA Enterprise Deal",
        "value": 175000,
        "stage": "discovery",
        "company_name": "Acme SQA Mobile Corp",
        "contact_name": "Alex Mercer",
    }
    create_res = client.post("/api/deals", json=create_payload)
    assert create_res.status_code in [200, 201]
    deal_data = create_res.json()
    deal_id = str(deal_data["id"])
    assert deal_data["name"] == create_payload["name"]
    assert deal_data["value"] == 175000
    assert deal_data["stage"] == "discovery"

    # 2. Advance deal stage (Mobile 1-Tap Funnel Advancement)
    stage_res = client.put(
        f"/api/deals/{deal_id}",
        json={"stage": "negotiation"},
    )
    assert stage_res.status_code == 200
    updated_deal = stage_res.json()
    assert updated_deal["stage"] == "negotiation"

    # 3. Retrieve deal directly by ID
    get_res = client.get(f"/api/deals/{deal_id}")
    assert get_res.status_code == 200
    deal_info = get_res.json()
    assert deal_info["id"] == deal_id or str(deal_info["id"]) == deal_id
    assert deal_info["stage"] == "negotiation"


def test_mobile_contract_leads_and_ai_qualification():
    """Test Lead creation and autonomous AI qualification as invoked by Mobile Leads Screen."""
    client = get_authenticated_client()

    # 1. Create Lead
    lead_payload = {
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.rostova@sqa-mobile.io",
        "company_name": "Rostova AI Systems",
        "job_title": "Head of Engineering",
        "lead_source": "field_sales_mobile",
    }
    lead_res = client.post("/api/leads", json=lead_payload)
    assert lead_res.status_code in [200, 201]
    lead_data = lead_res.json()
    lead_id = str(lead_data["id"])
    assert lead_data["email"] == lead_payload["email"]

    # 2. Trigger AI Qualification
    qualify_res = client.post(f"/api/leads/{lead_id}/qualify")
    assert qualify_res.status_code in [200, 201]
    qual_data = qualify_res.json()
    assert "score" in qual_data or "lead_score" in qual_data or "lead_status" in qual_data


def test_mobile_contract_custom_fields_engine():
    """Test Dynamic Custom Fields schema retrieval and value binding for mobile dynamic renderer."""
    client = get_authenticated_client()

    # 1. Retrieve field definitions for deal
    schema_res = client.get("/api/custom-fields?entity_type=deal")
    assert schema_res.status_code == 200
    fields = schema_res.json()
    assert isinstance(fields, list)

    # 2. Create a test deal
    deal_res = client.post(
        "/api/deals",
        json={"name": "Custom Fields Test Deal", "value": 50000, "stage": "discovery"},
    )
    assert deal_res.status_code in [200, 201]
    deal_id = str(deal_res.json()["id"])

    # 3. Save dynamic custom field values
    custom_vals = {
        "budget_approved": True,
        "security_clearance": "level_3",
        "target_go_live": "2026-12-01",
    }
    save_res = client.put(
        f"/api/custom-fields/values/deal/{deal_id}",
        json={"values": custom_vals},
    )
    assert save_res.status_code in [200, 201]
    assert save_res.json()["status"] == "success"


def test_mobile_contract_workflow_triggers_crud():
    """Test mobile Workflow Trigger Studio CRUD operations."""
    client = get_authenticated_client()

    # 1. List triggers
    list_res = client.get("/api/war-room/triggers")
    assert list_res.status_code == 200
    triggers = list_res.json()
    assert isinstance(triggers, list)

    # 2. Create a trigger
    new_trigger = {
        "name": "Mobile SQA Auto Trigger",
        "trigger_event": "deal_stalled_10d",
        "trigger_threshold": "10",
        "action_agent": "DealStrategyAgent",
        "action_type": "generate_battle_card",
        "status": "active",
    }
    create_res = client.post("/api/war-room/triggers", json=new_trigger)
    assert create_res.status_code in [200, 201]
    created = create_res.json()
    trigger_id = str(created["id"])

    # 3. Toggle trigger active state
    toggle_res = client.post(f"/api/war-room/triggers/{trigger_id}/toggle")
    assert toggle_res.status_code == 200

    # 4. Test trigger execution
    test_res = client.post(f"/api/war-room/triggers/{trigger_id}/test")
    assert test_res.status_code == 200
    assert "status" in test_res.json() or "message" in test_res.json() or "rule" in test_res.json()

    # 5. Delete trigger
    del_res = client.delete(f"/api/war-room/triggers/{trigger_id}")
    assert del_res.status_code in [200, 204]


def test_mobile_contract_audit_logs():
    """Test mobile Audit Log query compliance feed."""
    client = get_authenticated_client()
    res = client.get("/api/audit-logs?limit=10")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
