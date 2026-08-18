"""Unit tests for MeetingSchedulerAgent and Email Dispatch Pipeline"""

# pyrefly: ignore [missing-import]
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.meeting_scheduler_agent import MeetingSchedulerAgent


@pytest.mark.asyncio
async def test_meeting_scheduler_agent_prep():
    """Test MeetingSchedulerAgent prep document generation and agenda drafting"""
    mock_llm = MagicMock()
    agent = MeetingSchedulerAgent(llm=mock_llm)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            "Executive Demo Prep: Acme Corp looking for enterprise migration.",  # prep doc
            "1. Introductions, 2. Live Demo, 3. Architecture Review, 4. Q&A",  # agenda
            "Send calendar invite and pre-read deck.",  # follow-up task
        ]

        task = {
            "title": "Acme Corp Executive Demo",
            "meeting_type": "Executive Demo",
            "attendee_email": "prospect@acme.com",
        }

        result = await agent.execute(task)

        assert "prep_materials" in result
        assert "agenda" in result
        assert "meeting_id" in result
        assert "invites_dispatched" in result


@pytest.mark.asyncio
async def test_meeting_scheduler_agent_dispatch_email_delegation():
    """Verify meeting scheduler agent dispatches emails through task queue"""
    mock_llm = MagicMock()
    agent = MeetingSchedulerAgent(llm=mock_llm)

    meeting_data = {
        "id": "meeting-123",
        "title": "Quarterly Security Review",
        "scheduled_time": "2026-09-01T10:00:00Z",
        "duration_minutes": 45,
        "location": "Google Meet (auto-generated)",
        "agenda": ["Security Audit", "RBAC Matrix", "Q&A"],
    }

    with patch("services.task_queue_service.task_queue.enqueue_email", new_callable=AsyncMock) as mock_enqueue:
        mock_job = MagicMock()
        mock_job.task_id = "task-meet-email-777"
        mock_enqueue.return_value = mock_job

        res = await agent.execute({
            "action": "send_invite",
            "to": "security-lead@enterprise.com",
            "meeting_data": meeting_data,
        })

        assert res["status"] == "queued"
        assert res["task_id"] == "task-meet-email-777"
        assert res["recipient"] == "security-lead@enterprise.com"
        mock_enqueue.assert_called_once()
        call_kwargs = mock_enqueue.call_args[1]
        assert call_kwargs["to_email"] == "security-lead@enterprise.com"
        assert "Quarterly Security Review" in call_kwargs["subject"]
