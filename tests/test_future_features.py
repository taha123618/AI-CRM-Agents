"""Integration & unit tests for Voice AI, WhatsApp Business, and Monte Carlo Forecasting."""

import pytest
from fastapi.testclient import TestClient
import uuid

from main import app
from database.connection import SessionLocal
from database.seed import seed_voice_and_whatsapp

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_future_features_seeded():
    """Ensure sample voice calls and WhatsApp threads are seeded."""
    db = SessionLocal()
    try:
        seed_voice_and_whatsapp(db)
    finally:
        db.close()


# ============================================================================
# 1. VOICE AI TESTS
# ============================================================================


def test_list_voice_calls():
    """Test listing voice calls."""
    res = client.get("/api/voice-calls")
    assert res.status_code == 200
    calls = res.json()
    assert len(calls) >= 1
    assert "contact_name" in calls[0]
    assert "buyer_intent_score" in calls[0]


def test_create_and_get_voice_call():
    """Test creating a new call record and retrieving details."""
    payload = {
        "contact_name": "Samantha Wright",
        "phone_number": "+1 (555) 349-2100",
        "direction": "outbound",
        "status": "completed",
        "duration_seconds": 180,
        "sentiment": "positive",
        "buyer_intent_score": 92,
        "summary": "Enterprise demo completed with high interest in autonomous lead scoring.",
        "action_items": ["Send custom security whitepaper"],
        "objections_handled": ["Pricing", "Timeline"],
    }
    create_res = client.post("/api/voice-calls", json=payload)
    assert create_res.status_code == 201
    call_id = create_res.json()["id"]

    get_res = client.get(f"/api/voice-calls/{call_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["contact_name"] == "Samantha Wright"
    assert data["buyer_intent_score"] == 92


def test_analyze_realtime_speech_turn():
    """Test real-time speech turn objection detection & sales coaching."""
    turn_payload = {
        "speaker": "prospect",
        "text": "Your platform looks powerful, but it seems too expensive for our current quarterly budget.",
    }
    res = client.post("/api/voice-calls/analyze-turn", json=turn_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["sentiment"] == "negative"
    assert "Pricing" in data["objection_detected"]
    assert "coaching_tip" in data
    assert data["coaching_tip"] is not None


# ============================================================================
# 2. WHATSAPP BUSINESS TESTS
# ============================================================================


def test_list_whatsapp_conversations():
    """Test listing WhatsApp conversation threads."""
    res = client.get("/api/whatsapp/conversations")
    assert res.status_code == 200
    convs = res.json()
    assert len(convs) >= 1
    assert "phone_number" in convs[0]


def test_send_and_get_whatsapp_messages():
    """Test sending outbound message and querying message history."""
    unique_phone = f"+1555{uuid.uuid4().hex[:7]}"
    send_payload = {
        "phone_number": unique_phone,
        "contact_name": "David Chen",
        "text": "Hi David, here is the executive proposal we discussed.",
        "sender_type": "agent",
    }
    send_res = client.post("/api/whatsapp/send", json=send_payload)
    assert send_res.status_code == 200
    conv_id = send_res.json()["conversation_id"]

    # Get messages
    msg_res = client.get(f"/api/whatsapp/conversations/{conv_id}/messages")
    assert msg_res.status_code == 200
    messages = msg_res.json()
    assert len(messages) >= 1
    assert (
        messages[0]["text"] == "Hi David, here is the executive proposal we discussed."
    )


def test_inbound_webhook_with_ai_auto_pilot():
    """Test inbound message triggering autonomous AI reply."""
    unique_phone = f"+1444{uuid.uuid4().hex[:7]}"
    webhook_payload = {
        "phone_number": unique_phone,
        "contact_name": "Chloe Bennett",
        "text": "Can we schedule a 15-minute demo call for tomorrow?",
    }
    res = client.post("/api/whatsapp/webhook/inbound", json=webhook_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "received"
    assert data["ai_replied"] is True
    assert "agent_reply" in data
    assert len(data["agent_reply"]) > 0


def test_toggle_whatsapp_auto_pilot():
    """Test toggling conversation AI auto-pilot mode."""
    convs = client.get("/api/whatsapp/conversations").json()
    conv_id = convs[0]["id"]

    res = client.put(
        f"/api/whatsapp/conversations/{conv_id}/auto-pilot",
        json={"ai_auto_pilot": False},
    )
    assert res.status_code == 200
    assert res.json()["ai_auto_pilot"] is False


# ============================================================================
# 3. ADVANCED FORECASTING TESTS
# ============================================================================


def test_run_monte_carlo_simulation():
    """Test running 1000 Monte Carlo simulation iterations."""
    payload = {
        "iterations": 500,
        "deal_slippage_rate": 0.10,
    }
    res = client.post("/api/forecasting/monte-carlo", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "p10_conservative" in data
    assert "p50_expected" in data
    assert "p90_optimistic" in data
    assert data["p10_conservative"] <= data["p50_expected"] <= data["p90_optimistic"]
    assert "distribution_curve" in data
    assert len(data["distribution_curve"]) == 10


def test_get_pipeline_velocity_matrix():
    """Test pipeline velocity matrix calculations."""
    res = client.get("/api/forecasting/pipeline-velocity")
    assert res.status_code == 200
    data = res.json()
    assert "win_rate_percentage" in data
    assert "avg_sales_cycle_days" in data
    assert "stages" in data
    assert len(data["stages"]) >= 4


def test_save_and_list_simulations():
    """Test persisting a forecast simulation scenario."""
    payload = {
        "name": "Q3 2026 Executive Base Case",
        "target_quarter": "Q3 2026",
        "pipeline_total_value": 750000.0,
        "iterations": 1000,
        "p10_conservative": 240000.0,
        "p50_expected": 380000.0,
        "p90_optimistic": 520000.0,
        "deal_slippage_rate": 0.15,
        "stage_probabilities": {"proposal": 0.60, "negotiation": 0.80},
    }
    save_res = client.post("/api/forecasting/simulations", json=payload)
    assert save_res.status_code == 201
    assert save_res.json()["name"] == "Q3 2026 Executive Base Case"

    list_res = client.get("/api/forecasting/simulations")
    assert list_res.status_code == 200
    sims = list_res.json()
    assert len(sims) >= 1
