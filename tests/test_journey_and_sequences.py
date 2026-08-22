"""Comprehensive Integration and Unit Tests for Database-Backed AI Customer Journey & SDR Sequences."""

import pytest
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import Customer, Company, Contact, CustomerIntervention, OutreachSequence
import uuid
from tests.conftest import get_authenticated_client

client = get_authenticated_client()


def test_get_customer_journey_stages():
    """Test retrieving customer lifecycle stages and ARR distribution with search and filtering."""
    res = client.get("/api/journey/stages")
    assert res.status_code == 200
    data = res.json()
    assert "stages" in data
    assert "distribution" in data
    assert "summary" in data
    assert len(data["stages"]) == 5
    assert "total_customers" in data["summary"]
    assert "total_arr" in data["summary"]
    assert "at_risk_arr" in data["summary"]

    # Filter with query params
    search_res = client.get("/api/journey/stages?search=Acme")
    assert search_res.status_code == 200

    stage_res = client.get("/api/journey/stages?stage=onboarding")
    assert stage_res.status_code == 200


def test_get_customer_journey_details_and_dynamic_db_intervention():
    """Test retrieving customer journey details, triggering an intervention, and verifying DB persistence & health score boost."""
    # 1. Fetch stages to grab a customer ID
    stages_res = client.get("/api/journey/stages")
    assert stages_res.status_code == 200
    distribution = stages_res.json()["distribution"]
    
    all_custs = []
    for stage_data in distribution.values():
        all_custs.extend(stage_data.get("customers", []))

    if all_custs:
        cust_id = all_custs[0]["id"]
        
        # Get baseline health score from DB
        db = SessionLocal()
        try:
            cust_db = db.query(Customer).filter(Customer.id == cust_id).first()
            baseline_health = cust_db.health_score if cust_db else 50
        finally:
            db.close()

        res = client.get(f"/api/journey/customers/{cust_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["customer_id"] == cust_id
        assert "current_health_score" in data
        assert "timeline" in data
        assert "recommended_plays" in data
        assert len(data["recommended_plays"]) > 0

        # Trigger intervention
        trigger_payload = {
            "customer_id": cust_id,
            "intervention_type": "executive_check_in",
            "custom_notes": "Urgent ARR retention check.",
        }
        trig_res = client.post("/api/journey/interventions/trigger", json=trigger_payload)
        assert trig_res.status_code == 200
        trig_data = trig_res.json()
        assert trig_data["status"] == "success"
        assert "intervention" in trig_data
        intv_id = trig_data["intervention"]["id"]
        assert trig_data["intervention"]["intervention_type"] == "executive_check_in"

        # Verify DB health score updated dynamically
        db = SessionLocal()
        try:
            cust_db_after = db.query(Customer).filter(Customer.id == cust_id).first()
            if cust_db_after:
                assert cust_db_after.health_score >= baseline_health
            # Verify intervention saved to PostgreSQL table
            saved_intv = db.query(CustomerIntervention).filter(CustomerIntervention.id == intv_id).first()
            assert saved_intv is not None
            assert saved_intv.status == "active"
        finally:
            db.close()

        # Query interventions list with filters
        intv_list = client.get(f"/api/journey/interventions?status=active&search=executive")
        assert intv_list.status_code == 200
        assert isinstance(intv_list.json(), list)

        # Test resolving intervention
        resolve_res = client.post(f"/api/journey/interventions/{intv_id}/resolve")
        assert resolve_res.status_code == 200
        assert resolve_res.json()["intervention"]["status"] == "completed"

        # Verify resolution in DB
        db = SessionLocal()
        try:
            resolved_db = db.query(CustomerIntervention).filter(CustomerIntervention.id == intv_id).first()
            assert resolved_db is not None
            assert resolved_db.status == "completed"
        finally:
            db.close()


def test_get_nonexistent_customer_journey_returns_404():
    """Test requesting non-existent customer journey returns 404."""
    res = client.get("/api/journey/customers/00000000-0000-0000-0000-000000000000")
    assert res.status_code == 404

    # Non-existent resolve returns 404
    assert client.post(f"/api/journey/interventions/{uuid.uuid4()}/resolve").status_code == 404


def test_sequences_full_database_crud_toggle_and_step_execution():
    """Test full database CRUD lifecycle, toggle, lead enrollment, copy generation, and live step execution for SDR sequences."""
    # 1. List sequences and available prospects with filters
    res = client.get("/api/sequences?channel=multichannel&status=active")
    assert res.status_code == 200
    sequences = res.json()
    assert isinstance(sequences, list)

    prospects_res = client.get("/api/sequences/prospects/available?search=a&skip=0&limit=5")
    assert prospects_res.status_code == 200
    assert isinstance(prospects_res.json(), list)

    # 2. Create new sequence
    new_seq_payload = {
        "name": "Enterprise Security Evaluation Cadence",
        "channel": "multichannel",
        "target_persona": "CISO / Head of Security",
        "steps": [
            {
                "step_number": 1,
                "channel": "email",
                "delay_days": 0,
                "subject": "SOC2 & Compliance Verification for {{company_name}}",
                "template": "Hi {{first_name}}, sharing our SOC2 Type II audit report.",
            },
            {
                "step_number": 2,
                "channel": "whatsapp",
                "delay_days": 3,
                "subject": "Security FAQ Video",
                "template": "Hi {{first_name}}, here is our 2-min encryption overview.",
            },
        ],
    }
    create_res = client.post("/api/sequences", json=new_seq_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == new_seq_payload["name"]
    seq_id = created["id"]

    # 3. Update sequence details (PUT)
    update_payload = {
        "name": "Updated Enterprise Security Cadence",
        "target_persona": "Chief Information Security Officer",
    }
    update_res = client.put(f"/api/sequences/{seq_id}", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Enterprise Security Cadence"

    # 4. Toggle sequence status (Pause / Resume)
    toggle_res = client.post(f"/api/sequences/{seq_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["new_status"] == "paused"

    toggle_back = client.post(f"/api/sequences/{seq_id}/toggle")
    assert toggle_back.status_code == 200
    assert toggle_back.json()["new_status"] == "active"

    # 5. Enroll real contacts from database
    db = SessionLocal()
    try:
        contacts = db.query(Contact).limit(2).all()
        contact_ids = [str(c.id) for c in contacts]
    finally:
        db.close()

    enroll_payload = {"contact_ids": contact_ids or ["c1", "c2"]}
    enroll_res = client.post(f"/api/sequences/{seq_id}/enroll", json=enroll_payload)
    assert enroll_res.status_code == 200
    assert enroll_res.json()["enrolled_count"] >= len(enroll_payload["contact_ids"])

    # 6. Generate AI Personalized Step Copy
    copy_payload = {
        "step_number": 1,
        "channel": "email",
        "prospect_pain_point": "Manual SOC2 vendor security questionnaire delays",
    }
    copy_res = client.post(f"/api/sequences/{seq_id}/generate-copy", json=copy_payload)
    assert copy_res.status_code == 200
    copy_data = copy_res.json()
    assert "ai_generated_copy" in copy_data
    assert len(copy_data["ai_generated_copy"]) > 0

    # 7. Execute Step Live via Orchestrator
    exec_payload = {
        "step_number": 1,
        "channel": "email",
        "custom_note": "Direct test execution from unit test suite.",
    }
    exec_res = client.post(f"/api/sequences/{seq_id}/execute-step", json=exec_payload)
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["status"] == "success"
    assert "executed_by" in exec_data

    # 8. Delete sequence
    del_res = client.delete(f"/api/sequences/{seq_id}")
    assert del_res.status_code == 200
    assert del_res.json()["deleted_sequence_id"] == seq_id

    # 9. Confirm deletion via 404 and exclusion
    get_deleted = client.get(f"/api/sequences/{seq_id}")
    assert get_deleted.status_code == 404
    list_after = client.get("/api/sequences").json()
    assert not any(s["id"] == seq_id for s in list_after)


def test_sequences_negative_and_validation():
    fake_id = str(uuid.uuid4())
    assert client.get(f"/api/sequences/{fake_id}").status_code == 404
    assert client.put(f"/api/sequences/{fake_id}", json={"name": "test"}).status_code == 404
    assert client.post(f"/api/sequences/{fake_id}/toggle").status_code == 404
    assert client.post(f"/api/sequences/{fake_id}/enroll", json={"contact_ids": ["c1"]}).status_code == 404
    assert client.post(f"/api/sequences/{fake_id}/execute-step", json={"channel": "email"}).status_code == 404
    assert client.delete(f"/api/sequences/{fake_id}").status_code == 404

    # 422 validation
    assert client.post("/api/sequences", json={"name": "a"}).status_code == 422
