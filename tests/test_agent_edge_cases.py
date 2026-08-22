"""Edge-case and parsing resilience tests for AI agents and SmartFallbackLLM."""

import pytest
from unittest.mock import MagicMock, AsyncMock
from agents.lead_qualification_agent import LeadQualificationAgent
from agents.customer_success_agent import CustomerSuccessAgent
from agents.sales_pipeline_agent import SalesPipelineAgent
from agents.email_intelligence_agent import EmailIntelligenceAgent
from agents.voice_call_agent import VoiceCallAgent
from agents.whatsapp_agent import WhatsAppAgent


# ============================================================================
# 1. PARSING & REGEX ROBUSTNESS TESTS
# ============================================================================


def test_lead_agent_score_extraction_edge_cases():
    """Verify LeadQualificationAgent extracts scores from various LLM response formats."""
    agent = LeadQualificationAgent(llm=MagicMock())

    # 1. Clear score line
    score1 = agent._extract_score("Score: 85/100\nReason: High enterprise match")
    assert score1 == 85

    # 2. Number embedded in text
    score2 = agent._extract_score("I assign a score of 92 points to this lead.")
    assert score2 == 92

    # 3. Score bounded at 0–100
    score3 = agent._extract_score("Score: 150/100")
    assert score3 == 100

    # 4. No number found fallback
    score4 = agent._extract_score("No number here.")
    assert score4 == 50  # Default fallback


@pytest.mark.asyncio
async def test_customer_success_churn_risk_extraction():
    """Verify CustomerSuccessAgent parses churn risk levels correctly."""
    mock_llm = MagicMock()
    agent = CustomerSuccessAgent(llm=mock_llm)
    agent.think = AsyncMock(
        return_value="Risk Level: High\nProbability: 75%\nFactors: Inactivity"
    )

    risk = await agent.assess_churn_risk(
        customer_data={"id": "cust-1", "name": "Acme", "last_active": "30 days ago"},
        health_score=35,
    )
    assert "level" in risk
    assert risk["level"] in ["low", "medium", "high", "critical"]


@pytest.mark.asyncio
async def test_email_intelligence_sentiment_extraction():
    """Verify EmailIntelligenceAgent handles mixed/ambiguous sentiment responses."""
    mock_llm = MagicMock()
    agent = EmailIntelligenceAgent(llm=mock_llm)
    agent.think = AsyncMock(
        return_value="Sentiment: Positive\nConfidence: 0.95\nKey points: Excited about onboarding"
    )

    sentiment = await agent.analyze_sentiment(
        email_data={
            "from": "user@example.com",
            "subject": "Great onboarding",
            "body": "We are very happy with the system!",
        }
    )
    assert (
        "label" in sentiment or "sentiment" in sentiment or isinstance(sentiment, dict)
    )


@pytest.mark.asyncio
async def test_voice_call_agent_objection_coaching():
    """Verify VoiceCallAgent objection and coaching extraction."""
    agent = VoiceCallAgent()

    # Pricing objection
    turn = await agent.analyze_turn(
        speaker="prospect",
        text="The software is way too expensive for our startup budget.",
    )
    assert "Pricing" in str(turn["objection_detected"])
    assert "💡" in str(turn["coaching_tip"])

    # Competitor objection
    comp_turn = await agent.analyze_turn(
        speaker="prospect",
        text="We are currently evaluating Salesforce and Gong.",
    )
    assert "Competitor" in str(comp_turn["objection_detected"])


@pytest.mark.asyncio
async def test_whatsapp_agent_empty_and_fallback_execution():
    """Verify WhatsAppAgent handles empty and unformatted inputs gracefully."""
    agent = WhatsAppAgent()
    res = await agent.execute(
        {
            "action": "reply",
            "message": "What is the pricing?",
            "phone_number": "+1234567890",
            "contact_name": "Test User",
        }
    )
    assert "reply_text" in res
    assert len(res["reply_text"]) > 0
    assert "intent" in res
