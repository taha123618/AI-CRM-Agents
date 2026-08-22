# 🛡️ Senior SQA Strategy & Enterprise Quality Assurance Framework

This document defines the quality engineering methodology, test taxonomy, continuous verification gates, and defect classification standards for the **AI-Powered CRM Autonomous Multi-Agent Swarm**.

---

## 🏛️ 1. Test Pyramid & Architectural Layers

```
             ▲
            / \
           /   \     E2E / Workflow Swarm Integrations (FastAPI + React SPA)
          /-----\
         /   ▲   \   Integration & Security Hardening Tests (Pytest + Vitest)
        /---/ \---\
       /   /   \   \  Unit & Component Atomic Tests (Pydantic + React Testing Library)
      /___/_____\___\
```

| Layer | Framework & Tooling | Scope & Focus | Test Count |
|---|---|---|---|
| **Backend Testing** | `pytest`, `pytest-asyncio`, `FastAPI TestClient` | Auth/RBAC, 9 AI Agents, Monte Carlo simulations, RAG semantic search, Task Queue, CSV sanitization, WebSocket streams, rate limiting. | **190 tests** (27 suites) |
| **Frontend Testing** | `Vitest`, `@testing-library/react`, `jsdom` | React 19 Feature modules, UI primitives (`Modal`, `Input`, `Select`, `Button`), Zustand state stores, utility functions, Lenis momentum scrolling. | **81 tests** (22 suites) |
| **Static Analysis** | `mypy`, `flake8`, `black`, `tsc --noEmit` | Strict static typing (PEP 484 & TypeScript 5), zero `any` allocations, PEP 8 code formatting. | Continuous |
| **Security Scanning** | `Trivy`, GitHub Actions Security Hardening | Container vulnerability scans, SSRF defenses, CSV formula injection sanitization, HTTP security headers. | Continuous |

---

## 🔍 2. Defect Classification & Severity Taxonomy

Defects discovered during testing must be categorized according to the following matrix:

| Severity | Criteria & Impact | SLA / Resolution Priority |
|---|---|---|
| **🔴 Critical (S1)** | Authentication bypass, privilege escalation, cross-tenant data leak (IDOR), remote code execution, or total system crash. | Immediate hotfix (< 24 hours). Blocks deployment. |
| **🟠 High (S2)** | Core agent workflow failure (e.g. Lead scoring failing, Monte Carlo simulations aborting), database transaction rollback, or email delivery crash. | Fix within 48 hours. Blocks release branch. |
| **🟡 Medium (S3)** | UI layout glitch without data loss, edge-case validation omission (e.g. malformed phone format accepted), or rate limiter header anomaly. | Scheduled in next sprint release. |
| **🟢 Low (S4)** | Minor cosmetic misalignment, typographical error, or non-critical telemetry log format warning. | Addressed during regular refactoring cycles. |

---

## 🧪 3. SQA Verification Checklist & Definition of Done (DoD)

Before any feature or bug fix is merged to `master`:

1. **Unit & Integration Tests**:
   - Backend: All new logic covered by unit tests in `tests/test_*.py`.
   - Frontend: All UI components and modal interactions tested in `src/**/__tests__/*.test.tsx`.
2. **Deterministic Execution**: Zero flaky tests, zero race conditions in async queue execution.
3. **Security Validation**:
   - Outbound webhooks validated against SSRF using `is_safe_webhook_url()`.
   - CSV export data sanitized with `sanitize_csv_cell()`.
   - All protected routes verified with `require_auth` and `require_role`.
4. **Automated Quality Gate**:
   ```bash
   # Run full quality gate
   PYTHONPATH=. .venv/bin/python3 -m pytest -q
   cd frontend && npm run type-check && npm run test && npm run build
   ```

---

## 🚀 4. Automated Test Commands

```bash
# 1. Run all Backend Pytest Suites
PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v

# 2. Run all Frontend Vitest Suites
cd frontend && npm run test

# 3. Run Frontend Static Type Checking
cd frontend && npm run type-check

# 4. Build Production Distribution
cd frontend && npm run build

# 5. Run Complete Pre-Commit Quality Gate
make ci-qa
```
