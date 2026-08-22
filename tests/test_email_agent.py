"""Unit tests for EmailIntelligenceAgent and outbound dispatch delegation."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.email_intelligence_agent import EmailIntelligenceAgent


@pytest.mark.asyncio
async def test_email_intelligence_agent_sentiment_and_response():
    """Test EmailIntelligenceAgent sentiment analysis, categorization, priority, and draft response"""
    mock_llm = MagicMock()
    agent = EmailIntelligenceAgent(llm=mock_llm)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            "positive",  # sentiment
            "pricing_question",  # category
            "high",  # priority
            "Thank you for inquiring about enterprise pricing!",  # draft response
            "1. Send pricing matrix, 2. Schedule demo call",  # follow-ups
        ]

        task = {
            "email_data": {
                "from": "executive@acme.com",
                "subject": "Enterprise Pricing Inquiry",
                "body": "We are looking to migrate 500 users to your CRM. Please send pricing.",
            }
        }

        result = await agent.execute(task)

        assert result["sentiment"]["label"] == "positive"
        assert result["category"] == "pricing_question"
        assert result["priority"] in ["high", "medium", "low"]
        assert "follow_up_suggestions" in result


@pytest.mark.asyncio
async def test_email_intelligence_agent_dispatch_delegation():
    """Test that EmailIntelligenceAgent delegates outbound email delivery to task_queue / email_service."""
    mock_llm = MagicMock()
    agent = EmailIntelligenceAgent(llm=mock_llm)

    # Test asynchronous queue dispatch action
    task = {
        "action": "send_response",
        "to": "lead.recipient@customer.com",
        "subject": "Re: Enterprise Contract",
        "body": "We have updated the terms to include priority SLA.",
        "async": True,
    }

    result = await agent.execute(task)
    assert result["status"] == "queued"
    assert result["recipient"] == "lead.recipient@customer.com"
    assert "task_id" in result

    # Test synchronous direct dispatch
    task_sync = {
        "action": "send_email",
        "to": "lead.recipient@customer.com",
        "subject": "Direct Confirmation",
        "body": "Your inquiry has been resolved.",
        "async": False,
    }

    result_sync = await agent.execute(task_sync)
    assert result_sync["status"] in ("delivered", "queued")
    assert result_sync["recipient"] == "lead.recipient@customer.com"
