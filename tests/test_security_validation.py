"""Security, injection, and error disclosure tests for API gateways and database layers."""

import pytest
from fastapi.testclient import TestClient
import uuid

from main import app

client = TestClient(app)


# ============================================================================
# 1. SQL INJECTION PAYLOAD RESILIENCE
# ============================================================================


def test_sql_injection_in_search_leads():
    """Verify SQL injection payload in search string does not execute raw SQL."""
    sqli_payload = "'; DROP TABLE contacts; --"
    res = client.get(f"/api/leads?search={sqli_payload}")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Verify table was not dropped
    check_res = client.get("/api/leads")
    assert check_res.status_code == 200


def test_sql_injection_in_whatsapp_search():
    """Verify SQL injection payload in WhatsApp search query is safely parameterized."""
    sqli_payload = "' OR 1=1; --"
    res = client.get(f"/api/whatsapp/conversations/search?q={sqli_payload}")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_sql_injection_in_custom_agents_search():
    """Verify SQL injection payload in custom agent query is safely parameterized."""
    sqli_payload = "1' OR '1'='1"
    res = client.get(f"/api/custom-agents?search={sqli_payload}")
    assert res.status_code == 200


# ============================================================================
# 2. XSS PAYLOAD HANDLING
# ============================================================================


def test_xss_in_whatsapp_message_body():
    """Verify HTML/Script tags in messages are stored safely and not executed."""
    xss_payload = "<script>alert('XSS')</script><img src='x' onerror='alert(1)'>"
    unique_phone = f"+1888{uuid.uuid4().hex[:7]}"
    send_payload = {
        "phone_number": unique_phone,
        "contact_name": "Security Tester",
        "text": xss_payload,
        "sender_type": "agent",
    }
    res = client.post("/api/whatsapp/send", json=send_payload)
    assert res.status_code == 200
    conv_id = res.json()["conversation_id"]

    msg_res = client.get(f"/api/whatsapp/conversations/{conv_id}/messages")
    assert msg_res.status_code == 200
    messages = msg_res.json()
    assert len(messages) >= 1
    # Verify string was saved as plain literal text
    assert messages[0]["text"] == xss_payload


def test_xss_in_voice_call_transcript():
    """Verify XSS payloads in speech transcripts are safely processed."""
    xss_text = "<svg onload=alert(document.cookie)>"
    turn_payload = {
        "speaker": "prospect",
        "text": xss_text,
    }
    res = client.post("/api/voice-calls/analyze-turn", json=turn_payload)
    assert res.status_code == 200
    assert "sentiment" in res.json()


# ============================================================================
# 3. INFORMATION DISCLOSURE & ERROR HANDLING
# ============================================================================


def test_invalid_route_returns_clean_404():
    """Verify requesting non-existent endpoint returns standard JSON 404 without server leaks."""
    res = client.get("/api/non-existent-endpoint-xyz-999")
    assert res.status_code == 404
    assert res.headers.get("content-type", "").startswith("application/json")


def test_validation_error_structure():
    """Verify 422 errors provide structured field error details rather than python tracebacks."""
    res = client.post("/api/leads", json={})
    assert res.status_code == 422
    data = res.json()
    assert "detail" in data
    assert isinstance(data["detail"], list)
    assert len(data["detail"]) > 0
    assert "loc" in data["detail"][0]
    assert "msg" in data["detail"][0]
