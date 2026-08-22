"""Comprehensive edge-case, boundary, and negative validation tests across all API routers."""

import pytest
from fastapi.testclient import TestClient
import uuid

from main import app
from database.connection import SessionLocal
from database.models import Contact, Deal, Customer, Email, Meeting
from tests.conftest import get_authenticated_client

client = get_authenticated_client()


# ============================================================================
# 1. NON-EXISTENT ENTITY / 404 TESTS
# ============================================================================


def test_get_nonexistent_lead_returns_404():
    """Verify requesting non-existent lead UUID returns 404."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/leads/{random_id}")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_get_nonexistent_deal_returns_404():
    """Verify requesting non-existent deal UUID returns 404."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/deals/{random_id}")
    assert res.status_code == 404


def test_get_nonexistent_customer_returns_404():
    """Verify requesting non-existent customer UUID returns 404."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/customers/{random_id}")
    assert res.status_code == 404


def test_get_nonexistent_voice_call_returns_404():
    """Verify requesting non-existent voice call returns 404."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/voice-calls/{random_id}")
    assert res.status_code == 404


def test_delete_nonexistent_voice_call_returns_404():
    """Verify deleting non-existent voice call returns 404."""
    random_id = str(uuid.uuid4())
    res = client.delete(f"/api/voice-calls/{random_id}")
    assert res.status_code == 404


def test_get_nonexistent_forecast_simulation_returns_404():
    """Verify requesting non-existent simulation scenario returns 404."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/forecasting/simulations/{random_id}")
    assert res.status_code == 404


# ============================================================================
# 2. VALIDATION & BOUNDARY TESTS (422 UNPROCESSABLE ENTITY)
# ============================================================================


def test_create_lead_missing_required_email():
    """Verify creating a lead without email returns 422."""
    res = client.post("/api/leads", json={"first_name": "NoEmail"})
    assert res.status_code == 422


def test_create_lead_invalid_email_format():
    """Verify creating a lead with invalid email format returns 422."""
    res = client.post(
        "/api/leads",
        json={"email": "not-an-email", "first_name": "Invalid", "last_name": "Email"},
    )
    assert res.status_code == 422


def test_create_voice_call_invalid_buyer_intent_bounds():
    """Verify buyer_intent_score must be between 0 and 100."""
    payload = {
        "contact_name": "Test Bound",
        "phone_number": "+15550001",
        "buyer_intent_score": 150,  # Invalid: > 100
    }
    res = client.post("/api/voice-calls", json=payload)
    assert res.status_code == 422


def test_create_voice_call_negative_duration():
    """Verify duration_seconds cannot be negative."""
    payload = {
        "contact_name": "Test Bound",
        "phone_number": "+15550001",
        "duration_seconds": -30,
    }
    res = client.post("/api/voice-calls", json=payload)
    assert res.status_code == 422


def test_whatsapp_broadcast_empty_recipients():
    """Verify broadcast fails with 422 if phone_numbers list is empty."""
    payload = {
        "phone_numbers": [],
        "template_text": "Hello World",
    }
    res = client.post("/api/whatsapp/broadcast", json=payload)
    assert res.status_code == 422


def test_whatsapp_send_empty_text():
    """Verify WhatsApp message fails with 422 if text is empty."""
    payload = {
        "phone_number": "+15551234567",
        "text": "",
    }
    res = client.post("/api/whatsapp/send", json=payload)
    assert res.status_code == 422


def test_monte_carlo_invalid_simulation_count():
    """Verify simulation iterations must be positive integer."""
    res = client.post(
        "/api/forecasting/monte-carlo",
        json={"iterations": -500},
    )
    assert res.status_code == 422


# ============================================================================
# 3. QUERY PARAMETER FILTERING & LIMITS
# ============================================================================


def test_voice_calls_filter_by_sentiment():
    """Verify sentiment filter returns matching results."""
    res = client.get("/api/voice-calls?sentiment=positive")
    assert res.status_code == 200
    calls = res.json()
    for call in calls:
        assert call["sentiment"] == "positive"


def test_voice_calls_filter_by_direction():
    """Verify direction filter returns matching results."""
    res = client.get("/api/voice-calls?direction=outbound")
    assert res.status_code == 200
    calls = res.json()
    for call in calls:
        assert call["direction"] == "outbound"


def test_whatsapp_search_no_results():
    """Verify searching for non-matching string returns empty list."""
    res = client.get("/api/whatsapp/conversations/search?q=NonExistentPersonXYZ999")
    assert res.status_code == 200
    assert res.json() == []


def test_analytics_dashboard_contains_all_core_keys():
    """Verify /api/analytics/dashboard contains all standard executive metric keys."""
    res = client.get("/api/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()
    expected_keys = ["leads", "deals", "customers"]
    for key in expected_keys:
        assert key in data
