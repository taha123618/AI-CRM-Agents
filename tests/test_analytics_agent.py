"""Unit tests for AnalyticsAgent"""

# pyrefly: ignore [missing-import]
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.analytics_agent import AnalyticsAgent


@pytest.mark.asyncio
async def test_analytics_agent_dashboard_generation():
    """Test AnalyticsAgent dashboard generation and predictive insight extraction"""
    mock_llm = MagicMock()
    agent = AnalyticsAgent(llm=mock_llm)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            "Revenue is projected to grow by 18% Q/Q based on pipeline conversion.",  # forecast insight
            "Key drivers: Enterprise expansion and accelerated lead qualification.",  # key drivers
        ]

        task = {
            "category": "revenue_forecast",
            "crm_metrics": {
                "total_leads": 120,
                "pipeline_value": 450000,
                "mrr": 55000,
            },
        }

        result = await agent.execute(task)

        assert "insights" in result
        assert result["category"] == "revenue_forecast"
