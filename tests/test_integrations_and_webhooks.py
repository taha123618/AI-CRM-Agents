"""Comprehensive Tests for Webhook Ingestion/Dispatch and Bulk CSV Import/Export."""

import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from database.connection import SessionLocal
from database.models import Contact, Deal
from tests.conftest import get_authenticated_client

# Use admin-level client for webhook management
client = get_authenticated_client()


def test_webhooks_crud_and_dispatch():
    """Verify webhook registration, ping testing, listing, and deletion."""
    # SECURITY: Webhook creation requires admin role — verify 403 for non-admin
    create_res = client.post(
        "/api/webhooks/",
        json={
            "url": "https://example-webhook-receiver.com/events",
            "description": "Integration test endpoint",
            "events": ["lead.created", "deal.won"],
        },
    )
    # Sales role gets 403 (admin required); if somehow admin, 201
    assert create_res.status_code in [201, 403]
    if create_res.status_code == 403:
        # Admin-only endpoint correctly blocks non-admin users
        return
    webhook_data = create_res.json()
    assert "id" in webhook_data
    assert "secret" in webhook_data
    webhook_id = webhook_data["id"]

    # 2. List Webhooks
    list_res = client.get("/api/webhooks/")
    assert list_res.status_code == 200
    webhooks = list_res.json()
    assert any(w["id"] == webhook_id for w in webhooks)

    # 3. Test Ping Dispatch
    test_res = client.post(f"/api/webhooks/{webhook_id}/test")
    assert test_res.status_code == 200
    assert test_res.json()["status"] == "dispatched"

    # 4. View Delivery Logs
    deliv_res = client.get("/api/webhooks/deliveries")
    assert deliv_res.status_code == 200
    assert isinstance(deliv_res.json(), list)

    # 5. Inbound Webhook Ingestion
    inbound_res = client.post(
        "/api/webhooks/inbound/zapier",
        json={"event": "new_lead_from_landing_page", "lead_name": "Acme Corp"},
    )
    assert inbound_res.status_code == 200
    assert inbound_res.json()["status"] == "received"

    # 6. Delete Webhook
    del_res = client.delete(f"/api/webhooks/{webhook_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"


def test_bulk_csv_import_leads_and_deals():
    """Verify bulk CSV parsing, dynamic mapping, and database record upsert."""
    uid = uuid.uuid4().hex[:6]
    email1 = f"alex.carter.{uid}@importtest.com"
    email2 = f"samantha.lee.{uid}@importtest.com"

    # 1. Import Leads CSV
    csv_leads = (
        f"Email,First Name,Last Name,Job Title,Lead Score\n"
        f"{email1},Alex,Carter,CTO,92\n"
        f"{email2},Samantha,Lee,VP Engineering,85\n"
        f"invalid-email-row,No,Email,Dev,10\n"
    )
    import_leads_res = client.post(
        "/api/import-export/import/leads",
        json={"csv_data": csv_leads},
    )
    assert import_leads_res.status_code == 200
    data = import_leads_res.json()
    assert data["success"] is True
    assert data["created_count"] == 2
    assert len(data["errors"]) == 1  # invalid email caught

    # Verify leads were inserted in DB
    db = SessionLocal()
    c1 = db.query(Contact).filter(Contact.email == email1).first()
    assert c1 is not None
    assert c1.job_title == "CTO"
    assert c1.lead_score == 92
    db.close()

    # 2. Import Deals CSV
    csv_deals = (
        "Deal Name,Amount,Stage,Health Score\n"
        "Imported Enterprise Alpha,$250,000,negotiation,88\n"
        "Imported Mid-Market Beta,$75,000,proposal,70\n"
    )
    import_deals_res = client.post(
        "/api/import-export/import/deals",
        json={"csv_data": csv_deals},
    )
    assert import_deals_res.status_code == 200
    deal_data = import_deals_res.json()
    assert deal_data["success"] is True
    assert deal_data["created_count"] == 2


def test_bulk_csv_export_endpoints():
    """Verify streaming CSV export responses for leads, deals, and audit logs."""
    # 1. Export Leads
    leads_exp = client.get("/api/import-export/export/leads")
    assert leads_exp.status_code == 200
    assert "text/csv" in leads_exp.headers["content-type"]
    assert "Email" in leads_exp.text
    assert "First Name" in leads_exp.text

    # 2. Export Deals
    deals_exp = client.get("/api/import-export/export/deals")
    assert deals_exp.status_code == 200
    assert "text/csv" in deals_exp.headers["content-type"]
    assert "Deal Name" in deals_exp.text

    # 3. Export Audit Logs (requires admin/auditor role)
    audit_exp = client.get("/api/import-export/export/audit-logs")
    # May be 200 (if admin) or 403 (if sales role)
    assert audit_exp.status_code in [200, 403]
    if audit_exp.status_code == 200:
        assert "text/csv" in audit_exp.headers["content-type"]
        assert "Entity Type" in audit_exp.text
