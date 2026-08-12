---
name: testing
description: Instructions for writing unit and integration tests with pytest, pytest-asyncio, and mocks.
---

# Testing Skill

Use this skill when you are writing, executing, or fixing tests for agents, FastAPI endpoints, or workflows.

## 🚀 Guidelines

1. **Test Location & Naming**:
   - Save all test files under the `tests/` directory (e.g. `tests/test_api_leads.py`).
   - Test files must start with `test_`.
   - Test functions must start with `test_`.

2. **Async Tests**:
   - Since the project relies on async methods, use `@pytest.mark.asyncio` for async tests:
     ```python
     import pytest

     @pytest.mark.asyncio
     async def test_async_behavior():
         # Your test code here
         pass
     ```

3. **FastAPI Client Testing**:
   - Use `httpx.AsyncClient` or pytest fixtures with `TestClient` from `fastapi.testclient` to test route responses.
   - Example endpoint test:
     ```python
     from fastapi.testclient import TestClient
     from main import app

     client = TestClient(app)

     def test_health():
         response = client.get("/health")
         assert response.status_code == 200
         assert response.json()["api"] == "healthy"
     ```

4. **Mocking External Agents and LLMs**:
   - Mock LLM calls to prevent spending money and blocking execution:
     ```python
     from unittest.mock import AsyncMock, patch

     @pytest.mark.asyncio
     @patch("workflows.orchestrator.AgentOrchestrator._init_llm")
     async def test_workflow(mock_init_llm):
         mock_llm = AsyncMock()
         mock_init_llm.return_value = mock_llm
         # Rest of test execution
     ```
