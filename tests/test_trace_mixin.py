"""Unit tests for TraceMixin and LLM Event Bridge"""

# pyrefly: ignore [missing-import]
import pytest
from unittest.mock import AsyncMock, MagicMock
from agents.base_agent import BaseAgent
from agents.mixins.trace_mixin import trace_agent_to_bus


class DummyAgent(BaseAgent):
    """Dummy agent implementation for testing"""

    async def execute(self, task):
        return {"status": "success"}


@pytest.mark.asyncio
async def test_trace_mixin_think_events():
    """Test that traced_think publishes llm_think_start and llm_complete events"""
    mock_llm = MagicMock()
    mock_response = MagicMock()
    mock_response.generations = [[MagicMock(text="Enriched data for acme.com")]]
    mock_llm.agenerate = AsyncMock(return_value=mock_response)

    agent = DummyAgent(name="TestAgent", llm=mock_llm, enable_tracing=True)

    result = await agent.think("Analyze domain acme.com")
    assert result == "Enriched data for acme.com"

    # Verify events in queue
    events = []
    while not agent.event_queue.empty():
        events.append(await agent.event_queue.get())

    event_types = [e["type"] for e in events]
    assert "llm_think_start" in event_types
    assert "llm_complete" in event_types

    complete_event = next(e for e in events if e["type"] == "llm_complete")
    assert complete_event["data"]["agent"] == "TestAgent"
    assert complete_event["data"]["tokens"] > 0
    assert "duration_seconds" in complete_event["data"]


@pytest.mark.asyncio
async def test_trace_mixin_tool_call_events():
    """Test that traced_use_tool publishes llm_tool_call event"""
    mock_llm = MagicMock()
    mock_tool = MagicMock()
    mock_tool.name = "company_enrichment"
    mock_tool.arun = AsyncMock(return_value={"size": "enterprise"})

    agent = DummyAgent(
        name="TestAgent", llm=mock_llm, tools=[mock_tool], enable_tracing=True
    )

    tool_result = await agent.use_tool("company_enrichment", domain="acme.com")
    assert tool_result == {"size": "enterprise"}

    events = []
    while not agent.event_queue.empty():
        events.append(await agent.event_queue.get())

    tool_event = next((e for e in events if e["type"] == "llm_tool_call"), None)
    assert tool_event is not None
    assert tool_event["data"]["tool"] == "company_enrichment"
    assert tool_event["data"]["args"] == {"domain": "acme.com"}


@pytest.mark.asyncio
async def test_trace_agent_to_bus_wrapper():
    """Test trace_agent_to_bus helper with a mock stream runner"""
    published_events = []

    async def mock_publish(event_type, data):
        published_events.append({"type": event_type, "data": data})

    class MockRunner:
        name = "StreamAgent"

    runner = MockRunner()
    await trace_agent_to_bus(runner, mock_publish, estimated_tokens=150)

    event_types = [e["type"] for e in published_events]
    assert "llm_think_start" in event_types
    assert "llm_complete" in event_types

    complete_event = next(e for e in published_events if e["type"] == "llm_complete")
    assert complete_event["data"]["tokens"] == 150
    assert complete_event["data"]["agent"] == "StreamAgent"
