"""Unit tests for LeadQualificationAgent"""

# pyrefly: ignore [missing-import]
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.lead_qualification_agent import LeadQualificationAgent


@pytest.mark.asyncio
async def test_lead_qualification_agent_high_value():
    """Test qualification logic for a high-value lead"""
    mock_llm = MagicMock()
    agent = LeadQualificationAgent(llm=mock_llm)

    # Mock agent.think to return sequential mock responses for:
    # 1. enrichment analysis
    # 2. lead score
    # 3. buying signals
    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            '{"company_size": "enterprise", "seniority": "executive"}',
            "85",
            "demo request, timeline urgent",
        ]

        task = {
            "lead_data": {
                "email": "alice@acme.com",
                "name": "Alice Smith",
                "job_title": "VP of Engineering",
            }
        }

        result = await agent.execute(task)

        # Assertions
        assert result["lead_id"] == result["enriched_data"].get("id")
        assert result["score"] == 85
        assert any("demo request" in s for s in result["signals"])
        assert result["routing"]["team"] == "Enterprise Sales"
        assert result["routing"]["priority"] == "high"
        assert (
            result["routing"]["recommended_action"]
            == "Schedule executive demo within 24 hours"
        )  # noqa: E501


@pytest.mark.asyncio
async def test_lead_qualification_agent_low_value():
    """Test qualification logic for a low-value lead"""
    mock_llm = MagicMock()
    agent = LeadQualificationAgent(llm=mock_llm)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            '{"company_size": "small", "seniority": "junior"}',
            "20",
            "no urgency, pricing browsing",
        ]

        task = {
            "lead_data": {
                "email": "bob@personal.com",
                "name": "Bob Jones",
                "job_title": "Student",
            }
        }

        result = await agent.execute(task)

        # Assertions
        assert result["score"] == 20
        assert result["routing"]["team"] == "Marketing Nurture"
        assert result["routing"]["priority"] == "low"
        assert (
            result["routing"]["recommended_action"]
            == "Add to monthly newsletter"  # noqa: E501
        )


@pytest.mark.asyncio
async def test_lead_qualification_agent_with_pydantic_agent_tracing():
    """Test LeadQualificationAgent execution when pydantic_agent is configured"""
    mock_llm = MagicMock()
    mock_pydantic_agent = MagicMock()
    mock_pydantic_agent.name = "PydanticLeadAgent"

    stream_cm = MagicMock()
    stream_cm.__aenter__ = AsyncMock(
        return_value=MagicMock(
            all_messages=MagicMock(return_value=[]),
            usage=MagicMock(return_value=MagicMock(total_tokens=100)),
            stream_text=None,
        )
    )
    stream_cm.__aexit__ = AsyncMock(return_value=None)
    mock_pydantic_agent.run_stream = MagicMock(return_value=stream_cm)

    agent = LeadQualificationAgent(llm=mock_llm, pydantic_agent=mock_pydantic_agent)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            '{"company_size": "medium"}',
            "70",
            "urgent requirement",
        ]

        task = {
            "lead_data": {
                "email": "carol@midmarket.com",
                "description": "Looking for CRM migration ASAP",
            }
        }

        result = await agent.execute(task)

        assert result["score"] == 70
        events = []
        while not agent.event_queue.empty():
            events.append(await agent.event_queue.get())

        event_types = [e["type"] for e in events]
        assert "llm_think_start" in event_types
        assert "llm_complete" in event_types
