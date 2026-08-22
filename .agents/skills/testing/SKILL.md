---
name: testing
description: Instructions for writing unit and integration tests with pytest, pytest-asyncio, mocks, Vitest, and SQA quality standards.
---

# Testing & Quality Assurance Skill

Use this skill when designing, writing, executing, or debugging automated test suites across the backend (pytest) and frontend (Vitest + React Testing Library).

---

## 🚀 SQA Standards & Test Pyramid

1. **Backend Testing (`pytest` + `FastAPI TestClient`)**:
   - Location: `tests/test_*.py`
   - Use `TestClient(app)` for synchronous endpoint checks and `@pytest.mark.asyncio` for async services and agents.
   - Always write **both positive (200/201)** and **negative (404/422)** tests for every endpoint.
   - Example endpoint test:
     ```python
     from fastapi.testclient import TestClient
     from main import app

     client = TestClient(app)

     def test_get_lead_not_found():
         res = client.get("/api/leads/nonexistent-id")
         assert res.status_code == 404
         assert "not found" in res.json()["detail"].lower()
     ```

2. **Negative & Boundary Validation**:
   - Verify non-existent UUIDs return `404 Not Found`.
   - Verify invalid emails, empty strings, and negative values return `422 Unprocessable Entity`.
   - Test score bounds (0–100) and iteration constraints.

3. **Security & Injection Testing**:
   - Test search queries with SQL injection payloads (`'; DROP TABLE ...; --`).
   - Test dialogue and message text with XSS payloads (`<script>alert(1)</script>`).
   - Ensure error responses return clean JSON without raw Python stack traces.

4. **Frontend Testing (`Vitest` + `React Testing Library`)**:
   - Location: `frontend/src/**/__tests__/*.test.tsx`
   - Run via: `cd frontend && npm run test`
   - Use `render`, `screen`, and `fireEvent` to test component behavior:
     ```typescript
     import { describe, it, expect, vi } from 'vitest';
     import { render, screen, fireEvent } from '@testing-library/react';
     import { Button } from '../Button';

     describe('Button', () => {
       it('handles click events', () => {
         const onClick = vi.fn();
         render(<Button onClick={onClick}>Submit</Button>);
         fireEvent.click(screen.getByRole('button', { name: /submit/i }));
         expect(onClick).toHaveBeenCalledTimes(1);
       });
     });
     ```

5. **WebSocket & Realtime Testing**:
   - Use `TestClient(app).websocket_connect("/ws")` to verify stream events and agent status payloads.

6. **Full Test Suite Commands**:
   - Backend: `PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v` (182 tests across 26 suites, including `tests/test_observability_rag_tenancy.py` and `tests/test_cybersecurity_suite.py`)
   - Frontend: `cd frontend && npm run test && npm run type-check && npm run build` (63 tests across 17 suites)

7. **Mocking External LLMs**:
   - Always mock LLMs in unit tests to prevent network delays and costs:
     ```python
     from unittest.mock import AsyncMock, patch

     @pytest.mark.asyncio
     @patch("workflows.orchestrator.AgentOrchestrator._init_llm")
     async def test_workflow(mock_init_llm):
         mock_llm = AsyncMock()
         mock_init_llm.return_value = mock_llm
     ```

---

## 📋 Pre-PR / Definition of Done Checklist

- [ ] Run backend tests: `PYTHONPATH=. ./.venv/bin/pytest -v` (all passing).
- [ ] Run frontend tests: `cd frontend && npm run test` (all passing).
- [ ] Run frontend type check: `cd frontend && npm run type-check` (0 errors).
- [ ] Run frontend build: `cd frontend && npm run build` (success).
- [ ] Synchronize rules: `python3 .agents/scripts/sync_rules.py`.
