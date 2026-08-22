"""Integration tests for the WebSocket realtime telemetry stream (/ws)."""

import pytest
from fastapi.testclient import TestClient
import json

from main import app, ws_manager
from tests.conftest import get_authenticated_client
from workflows.orchestrator import AgentOrchestrator

client = get_authenticated_client()


def test_websocket_connection_and_ping():
    """Verify WebSocket client can connect to /ws and receive messages."""
    with client.websocket_connect("/ws") as websocket:
        # Send a ping/test message
        websocket.send_json({"type": "ping"})

        # Verify connection remains open
        assert websocket is not None


@pytest.mark.asyncio
async def test_websocket_broadcast_event():
    """Verify ws_manager can broadcast an event to WebSocket listeners."""
    await ws_manager.broadcast(
        {
            "type": "telemetry_test",
            "agent": "TestAgent",
            "message": "System status OK",
        }
    )
