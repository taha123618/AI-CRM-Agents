"""Unit tests for SalesPipelineAgent"""

# pyrefly: ignore [missing-import]
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.sales_pipeline_agent import SalesPipelineAgent


@pytest.mark.asyncio
async def test_sales_pipeline_agent_deal_health():
    """Test SalesPipelineAgent health scoring and stalled deal detection"""
    mock_llm = MagicMock()
    agent = SalesPipelineAgent(llm=mock_llm)

    with patch.object(agent, "think", new_callable=AsyncMock) as mock_think:
        mock_think.side_effect = [
            "85",  # health score
            "false",  # is stalled
            "0.75",  # win probability
            "High executive engagement and clear timeline.",  # key risk/insight
            "Schedule follow-up call with procurement.",  # recommended action
        ]

        task = {
            "deal_id": "deal-123",
            "deal_data": {
                "name": "Acme Corp Enterprise Deal",
                "value": 150000,
                "stage": "negotiation",
                "last_activity_days": 2,
            },
        }

        result = await agent.execute(task)

        assert result["deal_id"] == "deal-123"
        assert result["health_score"] == 85
        assert result["is_stalled"] is False
        assert "close_probability" in result
