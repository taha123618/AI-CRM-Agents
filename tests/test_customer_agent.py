"""Unit tests for CustomerSuccessAgent"""

# pyrefly: ignore [missing-import]
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.customer_success_agent import CustomerSuccessAgent


@pytest.mark.asyncio
async def test_customer_success_agent_churn_monitoring():
    """Test CustomerSuccessAgent health scoring and churn risk evaluation"""
    mock_llm = MagicMock()
    agent = CustomerSuccessAgent(llm=mock_llm)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            "90",  # health score
            "low",  # churn risk
            "0.05",  # churn probability
            "High weekly active logins and usage.",  # health indicators
            "Offer QBR and expansion demo.",  # retention playbook action
        ]

        task = {
            "customer_id": "cust-456",
            "usage_data": {
                "logins_per_week": 45,
                "active_seats": 20,
                "total_seats": 20,
                "support_tickets": 1,
            },
        }

        result = await agent.execute(task)

        assert result["customer_id"] == "cust-456"
        assert result["health_score"] == 90
        assert result["churn_risk"]["level"] == "low"
        assert "recommended_actions" in result
