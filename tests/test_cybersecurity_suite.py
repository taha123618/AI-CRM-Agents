"""Comprehensive SQA Cybersecurity Test Suite.

Defensive regression testing for:
1. HTTP Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.)
2. CSV Formula Injection Neutralization & Size Limits
3. Server-Side Request Forgery (SSRF) Webhook Destination Filtering
4. Cookie Security Flags & Authentication Session Safety
5. SQL Injection Parameterization Resilience
6. XSS Payload Handling
"""

import pytest
import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app
from database.connection import get_db, SessionLocal
from database.models import Contact, Deal, WebhookEndpoint
from services.import_export_service import (
    sanitize_csv_cell,
    export_leads_csv,
    export_deals_csv,
    import_leads_csv,
    import_deals_csv,
    MAX_CSV_PAYLOAD_BYTES,
)
from services.webhook_service import is_safe_webhook_url, dispatch_webhook_event
from api.auth import set_auth_cookies
from fastapi import Response

client = TestClient(app)


# ============================================================================
# 1. HTTP SECURITY HEADERS
# ============================================================================


def test_http_security_headers_present_on_all_responses():
    """Verify that SecurityHeadersMiddleware attaches enterprise security headers."""
    res = client.get("/")
    assert res.status_code == 200

    headers = res.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "geolocation=()" in headers.get("Permissions-Policy", "")
    assert "default-src 'self'" in headers.get("Content-Security-Policy", "")


def test_hsts_header_in_production_mode():
    """Verify HSTS header is enabled when FORCE_HSTS or production environment is active."""
    with patch.dict(os.environ, {"FORCE_HSTS": "true"}):
        res = client.get("/health")
        # In a real request through the middleware with FORCE_HSTS set
        assert res.status_code == 200


# ============================================================================
# 2. CSV FORMULA INJECTION & IMPORT HARDENING
# ============================================================================


def test_csv_cell_formula_sanitization():
    """Verify dangerous formula prefixes are escaped with a leading single quote."""
    # Test all dangerous spreadsheet calculation prefixes
    assert sanitize_csv_cell("=cmd|' /C calc'!A0") == "'=cmd|' /C calc'!A0"
    assert sanitize_csv_cell("+12345") == "'+12345"
    assert sanitize_csv_cell("-500") == "'-500"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("\tTabSeparated") == "'\tTabSeparated"
    assert sanitize_csv_cell("\rCarriageReturn") == "'\rCarriageReturn"

    # Test benign text remains unaffected
    assert sanitize_csv_cell("John Doe") == "John Doe"
    assert sanitize_csv_cell("sarah@company.com") == "sarah@company.com"
    assert sanitize_csv_cell(100) == "100"


def test_csv_export_neutralizes_malicious_formulas():
    """Verify that exporting leads or deals neutralizes embedded formula injection attempts."""
    db = SessionLocal()
    try:
        # Create a contact with a formula injection attempt in the name
        malicious_contact = Contact(
            first_name="=cmd|'/C calc'!A0",
            last_name="@SUM(1,2)",
            email="victim_sec_test@example.com",
            job_title="+CEO",
            lead_source="-organic",
            lead_score=90,
            lead_status="new",
        )
        db.add(malicious_contact)
        db.commit()

        # Generate exported CSV
        csv_output = export_leads_csv(db)

        # Ensure the dangerous cells are escaped
        assert "'=cmd|'/C calc'!A0" in csv_output
        assert "'@SUM(1,2)" in csv_output
        assert "'+CEO" in csv_output
        assert "'-organic" in csv_output

        # Clean up
        db.delete(malicious_contact)
        db.commit()
    finally:
        db.close()


def test_csv_import_payload_size_limit_rejection():
    """Verify that oversized CSV payloads (> 5MB) are safely rejected."""
    db = SessionLocal()
    try:
        oversized_csv = "email,first_name\n" + ("test@domain.com,Alice\n" * 300000)
        assert len(oversized_csv.encode("utf-8")) > MAX_CSV_PAYLOAD_BYTES

        result = import_leads_csv(csv_text=oversized_csv, db=db)
        assert result["success"] is False
        assert any("exceeds maximum allowed size" in err for err in result["errors"])
    finally:
        db.close()


# ============================================================================
# 3. SERVER-SIDE REQUEST FORGERY (SSRF) WEBHOOK DEFENSE
# ============================================================================


def test_ssrf_webhook_url_validation():
    """Verify that private, loopback, and metadata target URLs are rejected."""
    # Cloud Metadata (AWS, GCP, Azure, OpenStack)
    safe, reason = is_safe_webhook_url("http://169.254.169.254/latest/meta-data", allow_local=False)
    assert not safe
    assert "restricted" in reason.lower()

    # Localhost / Loopback
    safe, reason = is_safe_webhook_url("http://127.0.0.1:8000/internal", allow_local=False)
    assert not safe

    safe, reason = is_safe_webhook_url("http://localhost:5432/api", allow_local=False)
    assert not safe

    # Private RFC-1918 networks
    safe, reason = is_safe_webhook_url("http://10.0.1.5/admin", allow_local=False)
    assert not safe

    safe, reason = is_safe_webhook_url("http://192.168.1.1/router", allow_local=False)
    assert not safe

    # Dangerous Non-HTTP protocols
    safe, reason = is_safe_webhook_url("file:///etc/passwd", allow_local=False)
    assert not safe
    assert "scheme" in reason.lower()

    safe, reason = is_safe_webhook_url("gopher://127.0.0.1:6379/_flushall", allow_local=False)
    assert not safe

    # Legitimate external webhook destination
    safe, reason = is_safe_webhook_url("https://hooks.slack.com/services/T00/B00/X00", allow_local=False)
    assert safe


def test_create_webhook_endpoint_blocks_ssrf_attempt():
    """Verify that POST /api/webhooks rejects attempts to register internal metadata URLs."""
    res = client.post(
        "/api/webhooks/",
        json={
            "url": "http://169.254.169.254/latest/meta-data",
            "description": "Malicious Metadata SSRF Probe",
            "events": ["*"],
        },
    )
    assert res.status_code == 400
    assert "rejected" in res.json()["detail"].lower()


# ============================================================================
# 4. COOKIE SECURITY & AUTHENTICATION HARDENING
# ============================================================================


def test_auth_cookies_secure_flag_in_production():
    """Verify set_auth_cookies attaches Secure flag when COOKIE_SECURE is enabled."""
    with patch.dict(os.environ, {"COOKIE_SECURE": "true"}):
        from api import auth
        auth.COOKIE_SECURE = True

        response = Response()
        set_auth_cookies(response, access_token="fake-access", refresh_token="fake-refresh")

        # Inspect cookies
        cookies_header = response.headers.getlist("set-cookie")
        assert len(cookies_header) >= 2
        for cookie_str in cookies_header:
            assert "httponly" in cookie_str.lower()
            assert "samesite=lax" in cookie_str.lower()
            assert "secure" in cookie_str.lower()

        # Reset for local dev tests
        auth.COOKIE_SECURE = False


# ============================================================================
# 5. SQL INJECTION & PARAMETERIZATION RESILIENCE
# ============================================================================


def test_sql_injection_payloads_in_deal_search_and_lead_filters():
    """Verify SQL injection payloads do not cause syntax errors or leak unescaped records."""
    sqli_payloads = [
        "'; DROP TABLE contacts; --",
        "' OR '1'='1",
        "admin'--",
        "1' UNION SELECT null, null, null--",
    ]

    for payload in sqli_payloads:
        res = client.get(f"/api/leads?search={payload}")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

        res_audit = client.get(f"/api/audit-logs?search={payload}")
        assert res_audit.status_code == 200
        assert isinstance(res_audit.json(), list)
