---
name: testing
description: Instructions for writing unit and integration tests with pytest, pytest-asyncio, mocks, Vitest, Expo Doctor, and SQA quality standards.
---

# Testing & Quality Assurance Skill

Use this skill when designing, writing, executing, or debugging automated test suites across the Backend (pytest), Frontend Web (Vitest + React Testing Library), and Field Sales Mobile (Expo SDK 57 + TypeScript).

---

## 🚀 SQA Standards & Test Pyramid

1. **Backend Testing (`pytest` + `FastAPI TestClient`)**:
   - Location: `tests/test_*.py` (32 suites, 196 tests)
   - Use `TestClient(app)` with `get_authenticated_client()` for authenticated endpoint testing.
   - Use `@pytest.mark.asyncio` for asynchronous services, background task queues, and agent think loops.
   - Always write **both positive (200/201)** and **negative (400/401/403/404/422)** test cases.
   - Example endpoint test:
     ```python
     from tests.conftest import get_authenticated_client

     def test_get_lead_not_found():
         client = get_authenticated_client()
         res = client.get("/api/leads/nonexistent-id")
         assert res.status_code == 404
         assert "not found" in res.json()["detail"].lower()
     ```

2. **Mobile API Contract Testing**:
   - Location: `tests/test_mobile_api_contract_suite.py`
   - Verifies all REST and WebSocket payloads consumed by the React Native Expo client:
     - Deal CRUD and 1-tap stage advancement (`/api/deals`)
     - Lead creation and autonomous AI qualification (`/api/leads`, `/api/leads/{id}/qualify`)
     - Dynamic custom fields schema evaluation and value persistence (`/api/custom-fields/values/{entity}/{id}`)
     - Workflow Trigger CRUD and manual swarm execution (`/api/war-room/triggers`, `/api/war-room/triggers/{id}/test`)
     - Real-time audit log compliance query (`/api/audit-logs`)

3. **Negative & Boundary Validation**:
   - Verify non-existent UUIDs return `404 Not Found`.
   - Verify invalid emails, empty strings, and negative values return `422 Unprocessable Entity`.
   - Test score bounds (0–100) and iteration constraints.

4. **Security & Injection Testing**:
   - Location: `tests/test_security_hardening_suite.py`, `tests/test_cybersecurity_suite.py`, `tests/test_must_have_security.py`
   - Test search queries with SQL injection payloads (`'; DROP TABLE ...; --`).
   - Test dialogue and message text with XSS payloads (`<script>alert(1)</script>`).
   - Verify SSRF defense blocks cloud metadata IP `169.254.169.254` and private ranges.
   - Verify CSV formula injection sanitation (`=1+1`, `@SUM`, `+CMD`).
   - Ensure error responses return clean JSON without raw Python stack traces.

5. **Frontend Web Testing (`Vitest` + `React Testing Library`)**:
   - Location: `frontend/src/**/__tests__/*.test.tsx` (24 suites, 86 tests)
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

6. **Field Sales Mobile Verification (`Expo SDK 57`)**:
   - Dependency Health: `cd mobile && bunx expo-doctor` (21/21 checks passed)
   - TypeScript Strictness: `cd mobile && npx tsc --noEmit` (0 errors)
   - Static Route Compilation: `cd mobile && bunx expo export --platform web` (78/78 routes compiled, 0 errors)
   - List Virtualization: `@shopify/flash-list` cell recycling verified on all collection screens

7. **Mocking External LLMs**:
   - Always mock LLMs in unit tests to prevent network delays and live token costs:
     ```python
     from unittest.mock import AsyncMock, patch

     @pytest.mark.asyncio
     @patch("workflows.orchestrator.AgentOrchestrator._init_llm")
     async def test_workflow(mock_init_llm):
         mock_llm = AsyncMock()
         mock_init_llm.return_value = mock_llm
     ```

---

## 🧪 Test Execution & SQA Quality Gates

```bash
# 1. Run all Backend Pytest Suites (196 tests across 32 suites)
PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v

# 2. Run all Frontend Vitest Suites (86 tests across 24 suites)
cd frontend && npm run test

# 3. Verify Frontend TypeScript static analysis & build
cd frontend && npm run type-check && npm run build

# 4. Verify Field Sales Mobile Application (21 checks, 0 errors, 78 routes)
cd mobile && bunx expo-doctor && npx tsc --noEmit && bunx expo export --platform web
```

**Quality Status:** **282 / 282 Automated Tests Passing (100%)**

---

## 📋 SQA Pre-PR Checklist

Before submitting a pull request or merging changes:
- [ ] Backend tests passing (`pytest tests/`)
- [ ] Mobile API contracts passing (`pytest tests/test_mobile_api_contract_suite.py`)
- [ ] Frontend tests passing (`npm run test`)
- [ ] Frontend TypeScript check passing (`npm run type-check`)
- [ ] Frontend production build succeeds (`npm run build`)
- [ ] Mobile Expo Doctor checks passing (`bunx expo-doctor`)
- [ ] Mobile TypeScript strict check passing (`npx tsc --noEmit`)
- [ ] Mobile production static bundle succeeds (`bunx expo export --platform web`)
- [ ] Outbound webhooks validated against SSRF (`is_safe_webhook_url`)
- [ ] Outgoing CSV data sanitized against formula injection (`sanitize_csv_cell`)
- [ ] If agent rules or skills were modified, ran `python3 .agents/scripts/sync_rules.py`
