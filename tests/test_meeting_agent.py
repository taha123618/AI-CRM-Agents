"""Unit tests for MeetingSchedulerAgent"""

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
            "meeting_request": {
                "title": "Acme Corp Executive Demo",
                "meeting_type": "Executive Demo",
                "attendee_email": "prospect@acme.com",
            }
        }

        result = await agent.execute(task)

        assert "prep_materials" in result
        assert "agenda" in result
        assert "meeting_id" in result
