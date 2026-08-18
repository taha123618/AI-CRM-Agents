# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_api_leads_endpoints():
    """Test /api/leads endpoints"""
    response = client.get("/api/leads")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_api_update_lead():
    """Test PUT /api/leads/{lead_id} endpoint"""
    response = client.get("/api/leads")
    leads = response.json()
    if leads:
        lead_id = leads[0]["id"]
        res = client.put(
            f"/api/leads/{lead_id}",
            json={"first_name": "UpdatedLead", "lead_score": 95},
        )
        assert res.status_code == 200
        assert res.json()["first_name"] == "UpdatedLead"
        assert res.json()["lead_score"] == 95


def test_api_deals_endpoints():
    """Test /api/deals endpoints"""
    response = client.get("/api/deals")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_api_update_deal():
    """Test PUT /api/deals/{deal_id} endpoint"""
    response = client.get("/api/deals")
    deals = response.json()
    if deals:
        deal_id = deals[0]["id"]
        res = client.put(
            f"/api/deals/{deal_id}",
            json={"name": "Updated Deal Name", "value": 75000.0, "stage": "proposal"},
        )
        assert res.status_code == 200
        assert res.json()["name"] == "Updated Deal Name"
        assert res.json()["value"] == 75000.0
        assert res.json()["stage"] == "proposal"


def test_api_customers_endpoints():
    """Test /api/customers endpoints"""
    response = client.get("/api/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_api_emails_endpoints():
    """Test /api/emails endpoints"""
    response = client.get("/api/emails")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_api_emails_send_response():
    """Test /api/emails/{email_id}/send endpoint with recipient resolution and delivery queueing"""
    response = client.get("/api/emails")
    emails = response.json()
    if emails:
        email_id = emails[0]["id"]
        res = client.post(
            f"/api/emails/{email_id}/send",
            json={"reply_text": "Thank you for reaching out! Here is your requested information.", "to_email": "prospect@customer.com"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "sent"
        assert data["recipient"] == "prospect@customer.com"
        assert "task_id" in data


def test_api_emails_compose():
    """Test POST /api/emails/compose for outbound direct emails"""
    res = client.post(
        "/api/emails/compose",
        json={
            "to_email": "new.lead@enterprise.com",
            "subject": "Exclusive Enterprise Demonstration",
            "body": "Hi there, We would love to showcase our multi-agent AI features.",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "sent"
    assert data["recipient"] == "new.lead@enterprise.com"
    assert "task_id" in data


def test_api_update_meeting():
    """Test PUT /api/meetings/{meeting_id} endpoint"""
    response = client.get("/api/meetings")
    meetings = response.json()
    if meetings:
        meeting_id = meetings[0]["id"]
        res = client.put(
            f"/api/meetings/{meeting_id}",
            json={"title": "Updated Meeting Title", "duration_minutes": 45},
        )
        assert res.status_code == 200
        assert res.json()["title"] == "Updated Meeting Title"
        assert res.json()["duration_minutes"] == 45


def test_api_send_meeting_invite():
    """Test POST /api/meetings/{meeting_id}/send-invite endpoint"""
    response = client.get("/api/meetings")
    meetings = response.json()
    if meetings:
        meeting_id = meetings[0]["id"]
        res = client.post(
            f"/api/meetings/{meeting_id}/send-invite",
            json={"attendee_emails": ["executive@enterprise.org"], "custom_note": "Please review architecture deck"},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "sent"
        assert res.json()["dispatched_count"] >= 1


def test_api_delete_meeting():
    """Test DELETE /api/meetings/{meeting_id} endpoint"""
    response = client.get("/api/meetings")
    meetings = response.json()
    if meetings:
        meeting_id = meetings[0]["id"]
        res = client.delete(f"/api/meetings/{meeting_id}")
        assert res.status_code == 200
        assert res.json()["status"] == "deleted"



def test_api_analytics_dashboard():
    """Test /api/analytics/dashboard endpoint"""
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "leads" in data
    assert "deals" in data
    assert "customers" in data


def test_api_analytics_pipeline():
    """Test /api/analytics/pipeline endpoint"""
    response = client.get("/api/analytics/pipeline")
    assert response.status_code == 200
    data = response.json()
    assert "prospecting" in data
    assert "closed_won" in data


def test_websocket_endpoint():
    """Test WebSocket /ws real-time stream endpoint"""
    with client.websocket_connect("/ws") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "connection_established"
        assert "agents" in data

        websocket.send_text("ping")
        msg = websocket.receive_json()
        if msg.get("type") == "client_message":
            msg = websocket.receive_json()
        assert msg["type"] == "pong"
        assert msg["received"] == "ping"


def test_api_analytics_insights():
    """Test /api/analytics/insights endpoint"""
    response = client.get("/api/analytics/insights")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert "kpis" in data
    assert "summary" in data


def test_api_update_customer():
    """Test PUT /api/customers/{customer_id} endpoint"""
    response = client.get("/api/customers")
    customers = response.json()
    if customers:
        customer_id = customers[0]["id"]
        res = client.put(
            f"/api/customers/{customer_id}",
            json={
                "health_score": 85,
                "churn_risk": "low",
                "churn_probability": 15,
                "recommended_actions": ["Increase seats", "Setup review"],
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["health_score"] == 85
        assert data["churn_risk"] == "low"
        assert data["churn_probability"] == 15
        assert "Increase seats" in data["recommended_actions"]
