"""Comprehensive Unit and Integration Tests for:
1. Email Threading & Bi-Directional IMAP/OAuth Sync (/api/email-sync)
2. Live Twilio / WebRTC Voice Gateway (/api/voice-calls/gateway)
3. Meta WhatsApp Cloud API Connector & Templates (/api/whatsapp)
4. Custom LLM Fine-Tuning Dataset Exporter & Jobs (/api/evaluations/finetuning)
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from tests.conftest import get_authenticated_client

client = get_authenticated_client()


# ============================================================================
# 1. EMAIL THREADING & IMAP / OAUTH SYNC TESTS
# ============================================================================


def test_email_sync_accounts_and_threading():
    """Verify connecting email accounts, syncing threads, and viewing message timelines."""
    # 1. Connect new Gmail OAuth account
    res_conn = client.post(
        "/api/email-sync/accounts",
        json={
            "provider": "gmail",
            "email_address": "sdr.lead@enterprise.ai",
            "display_name": "SDR Team Mailbox",
        },
    )
    assert res_conn.status_code == 201
    acc = res_conn.json()
    assert acc["provider"] == "gmail"
    assert acc["email_address"] == "sdr.lead@enterprise.ai"
    acc_id = acc["id"]

    # 2. List connected accounts
    res_list = client.get("/api/email-sync/accounts")
    assert res_list.status_code == 200
    accounts = res_list.json()
    assert len(accounts) >= 1

    # 3. Trigger account sync poll
    res_sync = client.post(f"/api/email-sync/accounts/{acc_id}/sync")
    assert res_sync.status_code == 200
    sync_data = res_sync.json()
    assert sync_data["status"] == "success"

    # 4. List conversation threads
    res_threads = client.get("/api/email-sync/threads")
    assert res_threads.status_code == 200
    threads = res_threads.json()
    assert len(threads) >= 1
    thread_id = threads[0]["id"]

    # 5. Get conversation thread timeline messages
    res_messages = client.get(f"/api/email-sync/threads/{thread_id}/messages")
    assert res_messages.status_code == 200
    thread_details = res_messages.json()
    assert "messages" in thread_details
    assert len(thread_details["messages"]) >= 1


# ============================================================================
# 2. LIVE TWILIO / WEBRTC VOICE GATEWAY TESTS
# ============================================================================


def test_voice_gateway_token_and_twiml():
    """Verify WebRTC client token dispatch and Twilio SIP TwiML generation."""
    # 1. WebRTC client token generation
    res_token = client.post(
        "/api/voice-calls/gateway/token",
        json={
            "identity": "rep-taha",
            "room_name": "executive-war-room",
            "phone_number": "+14155550199",
        },
    )
    assert res_token.status_code == 200
    token_data = res_token.json()
    assert "token" in token_data
    assert token_data["gateway_status"] == "ready"
    assert len(token_data["ice_servers"]) >= 1

    # 2. Twilio SIP TwiML generation
    res_twiml = client.post(
        "/api/voice-calls/gateway/twiml",
        json={
            "to_number": "+14155552671",
            "caller_id": "+18005550199",
            "record": True,
        },
    )
    assert res_twiml.status_code == 200
    assert "application/xml" in res_twiml.headers.get("content-type", "")
    assert "<Dial" in res_twiml.text
    assert "<Number>+14155552671</Number>" in res_twiml.text


# ============================================================================
# 3. META WHATSAPP CLOUD API MEDIA & TEMPLATES TESTS
# ============================================================================


def test_whatsapp_cloud_api_media_and_templates():
    """Verify Meta Cloud API media uploads and template synchronization."""
    # 1. Upload media asset
    res_media = client.post(
        "/api/whatsapp/media/upload",
        json={
            "media_type": "document",
            "filename": "Enterprise_SLA_2026.pdf",
            "file_size_bytes": 1048576,
        },
    )
    assert res_media.status_code == 200
    media_data = res_media.json()
    assert media_data["status"] == "uploaded"
    assert "media_id" in media_data

    # 2. List Meta message templates
    res_tpl = client.get("/api/whatsapp/templates")
    assert res_tpl.status_code == 200
    templates = res_tpl.json()
    assert len(templates) >= 1
    assert any(t["status"] == "APPROVED" for t in templates)

    # 3. Sync templates
    res_sync_tpl = client.post("/api/whatsapp/templates/sync")
    assert res_sync_tpl.status_code == 200
    assert res_sync_tpl.json()["status"] == "success"


# ============================================================================
# 4. CUSTOM LLM FINE-TUNING EXPORT & JOBS TESTS
# ============================================================================


def test_custom_llm_finetuning_export_and_job():
    """Verify JSONL dataset formatting and model fine-tuning job launching."""
    # 1. Export JSONL dataset
    res_export = client.get("/api/evaluations/finetuning/export?target_agent=lead_qualification")
    assert res_export.status_code == 200
    export_data = res_export.json()
    assert export_data["agent"] == "lead_qualification"
    assert "dataset" in export_data
    assert len(export_data["dataset"]) >= 1
    sample = export_data["dataset"][0]
    assert "messages" in sample
    assert any(m["role"] == "system" for m in sample["messages"])

    # 2. Launch Fine-Tuning Job
    res_job = client.post(
        "/api/evaluations/finetuning/jobs",
        json={
            "model_base": "gpt-4o-mini",
            "agent_target": "lead_qualification",
            "epochs": 3,
        },
    )
    assert res_job.status_code == 200
    job_data = res_job.json()
    assert job_data["status"] == "queued"
    assert "job_id" in job_data
    assert job_data["epochs"] == 3
