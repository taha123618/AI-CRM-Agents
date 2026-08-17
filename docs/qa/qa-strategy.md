# 🛡️ Quality Assurance (QA) Strategy & Standards

This document establishes the comprehensive software quality assurance strategy, test pyramid architecture, automation standards, and CI/CD quality gates for the AI-Powered CRM platform.

---

## 🏗️ 1. Test Pyramid Architecture

```
                 / \
                /   \     E2E / Workflow Tests
               / E2E \    (Playwright / Smoke Flows)
              /-------\
             /         \    Integration & API Tests
            /  API/INT  \   (pytest + TestClient + WebSocket)
           /-------------\
          /               \   Unit & Component Tests
         /   UNIT / DOM    \  (pytest, Vitest, React Testing Library)
        /-------------------\
```

| Layer | Framework / Tool | Scope | Target Execution Time |
|---|---|---|---|
| **Backend Unit & Integration** | `pytest`, `pytest-asyncio`, `FastAPI TestClient` | All 11 routers, 9 AI agents, services, ORM models | `< 5.0s` |
| **Frontend Unit & Component** | `Vitest`, `@testing-library/react`, `jsdom` | UI components, forms, layout state, stores | `< 3.0s` |
| **Realtime Telemetry** | `TestClient.websocket_connect` | `/ws` connection, broadcast events, reconnection | `< 1.0s` |
| **Static Analysis & Types** | `mypy`, `flake8`, `tsc --noEmit` | Strict type safety, no implicit anys, PEP 8 linting | `< 3.0s` |

---

## 🎯 2. Testing Levels & Standards

### 2.1 Backend API & Service Testing
1. **Positive / Happy Path**:
   - Verify expected status codes (`200 OK`, `201 Created`).
   - Validate response schemas with typed Pydantic models.
2. **Negative & Boundary Validation**:
   - Non-existent IDs return `404 Not Found` with structured JSON detail.
   - Malformed payloads, invalid emails, negative numbers return `422 Unprocessable Entity`.
   - String fields with whitespace or invalid formats are rejected.
3. **Database Isolation**:
   - Unit tests use session fixtures with rollback or deterministic seeding (`ensure_future_features_seeded`).

### 2.2 Security & Resilience Testing
1. **Injection Attacks**:
   - Parameterized SQL queries tested with SQL injection payloads (`'; DROP TABLE ...; --`).
2. **XSS Protection**:
   - Dialogue turns and message strings tested with script injection (`<script>alert(1)</script>`).
3. **Error Masking**:
   - Production error responses must never expose raw stack traces or internal filenames.

### 2.3 Frontend Component Testing
1. **Rendering & Accessibility**:
   - Test that components render expected accessible roles (`role="button"`, `role="table"`).
2. **User Interaction**:
   - Verify `onClick`, `onChange`, and form submissions using `@testing-library/user-event` or `fireEvent`.
3. **Disabled & Loading States**:
   - Ensure buttons and form controls are properly disabled when loading.

---

## 🚀 3. How to Run Tests

### Run Full Test Suite
```bash
# Backend Pytest Suite
PYTHONPATH=. ./.venv/bin/pytest -v

# Frontend Vitest Suite
cd frontend && npm run test

# Frontend Type Check
cd frontend && npm run type-check

# Frontend Production Build
cd frontend && npm run build
```

---

## ✅ 4. Pre-PR / Definition of Done Quality Checklist

Before submitting a Pull Request or deploying:
- [ ] `pytest` passes with 100% green tests (83+ tests).
- [ ] `npm run test` passes (Vitest).
- [ ] `npm run type-check` returns 0 TypeScript errors.
- [ ] `npm run build` succeeds without build warnings.
- [ ] All new endpoints have corresponding positive and negative test cases.
- [ ] `.agents/scripts/sync_rules.py` executed to synchronize AI rules.
