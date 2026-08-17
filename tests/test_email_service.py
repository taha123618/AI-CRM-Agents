"""Unit and Integration Tests for Email Delivery Service & SMTP Infrastructure."""

import os
import pytest
from services.email_service import EmailService, _sanitize_recipient
from services.task_queue_service import task_queue


def test_recipient_sanitization_privacy():
    """Verify email recipient masking in diagnostic logs."""
    assert _sanitize_recipient("alex.johnson@enterprise.com") == "a***n@enterprise.com"
    assert _sanitize_recipient("saad@devteampro.com") == "s***d@devteampro.com"
    assert _sanitize_recipient("ed@crm.ai") == "e***@crm.ai"


def test_email_service_configuration_and_templates():
    """Verify EmailService renders valid HTML and text with proper branding."""
    service = EmailService(
        host="smtp.gmail.com",
        port=587,
        user="saad@devteampro.com",
        password="mock_app_password",
        use_tls=True,
        from_address="AI Social Media Automation <saad@devteampro.com>",
    )

    html, text = service.render_password_reset_email(
        recipient_name="Jordan Vance",
        reset_token="sample_secure_nonce_12345",
        expires_in_minutes=60,
    )

    # Assertions on HTML Content
    assert "Reset Your Password" in html
    assert "Jordan Vance" in html
    assert "sample_secure_nonce_12345" in html
    assert "reset-password?token=sample_secure_nonce_12345" in html
    assert "60 minutes" in html

    # Assertions on Plain Text Fallback
    assert "Hello Jordan Vance" in text
    assert "sample_secure_nonce_12345" in text
    assert "60 minutes" in text


@pytest.mark.asyncio
async def test_email_service_send_simulated_in_test_mode():
    """Verify email dispatch in test mode operates cleanly without throwing."""
    service = EmailService(
        host="smtp.gmail.com",
        port=587,
        user="saad@devteampro.com",
        password="",  # Mock mode
    )

    res = await service.send_password_reset_email(
        to_email="test.user@enterprise.com",
        recipient_name="Test User",
        reset_token="test_token_abc123",
        expires_in_minutes=60,
    )

    assert res["delivered"] is True
    assert "simulated" in res


def test_smtp_connection_verification_placeholder_check():
    """Verify SMTP connection returns clean diagnostic warning when placeholder password used."""
    service = EmailService(
        host="smtp.gmail.com",
        port=587,
        user="saad@devteampro.com",
        password="<GMAIL_APP_PASSWORD>",
    )
    result = service.verify_smtp_connection()
    assert result["status"] == "warning"
    assert "Google App Password" in result["message"]


@pytest.mark.asyncio
async def test_task_queue_enqueue_password_reset_email():
    """Verify background task queue enqueues and tracks password reset email jobs."""
    job = await task_queue.enqueue_password_reset_email(
        to_email="recipient@client-domain.com",
        recipient_name="Client Executive",
        reset_token="token_queue_verification_456",
        expires_in_minutes=60,
    )

    assert job.task_type == "send_password_reset_email"
    assert job.status in ("pending", "running", "completed")
    assert job.metadata.get("email_type") == "password_reset"
    assert job.metadata.get("recipient_domain") == "client-domain.com"
