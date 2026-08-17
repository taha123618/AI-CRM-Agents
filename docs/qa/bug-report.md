# 🐞 SQA Bug Tracking & Resolution Audit Report

This report documents all software quality issues, inconsistencies, and edge-case bugs identified, diagnosed, resolved, and verified during the SQA audit.

---

## 📋 Summary of Findings

| Bug ID | Severity | Feature Area | Description | Resolution Status | Verified By |
|---|---|---|---|---|---|
| **BUG-001** | High | Validation | `LeadCreate` schema allowed arbitrary invalid strings as email without 422 | Fixed via `EmailStr` in `api/leads.py` | `tests/test_api_edge_cases.py` |
| **BUG-002** | Medium | Forecasting | `GET /api/forecasting/simulations/{id}` returned 405 Method Not Allowed | Added `GET` endpoint for single simulation in `api/forecasting.py` | `tests/test_api_edge_cases.py` |
| **BUG-003** | Low | Code Quality | Deprecated `lead.dict()` usage causing Pydantic v2 warnings | Migrated to `lead.model_dump()` | `api/leads.py` |
| **BUG-004** | Medium | Frontend QA | Missing frontend unit testing framework | Installed and configured Vitest + React Testing Library + jsdom | `npm run test` (7 passed) |
| **BUG-005** | Low | Test Resilience | WebSocket stream broadcast had no direct integration test | Added `tests/test_websocket_stream.py` | `tests/test_websocket_stream.py` |

---

## 🔍 Detailed Bug Analysis & Fixes

### BUG-001: Missing Email Format Validation on Lead Ingestion
* **Severity**: High
* **Affected Component**: `api/leads.py` (`LeadCreate`)
* **Problem**: Ingestion endpoint accepted strings like `"not-an-email"`, creating corrupt contact records.
* **Root Cause**: `LeadCreate.email` was typed as plain `str` instead of Pydantic's `EmailStr`.
* **Fix**: Imported `EmailStr` from `pydantic` and updated `LeadCreate.email: EmailStr`.
* **Verification**: Added `test_create_lead_invalid_email_format` in `tests/test_api_edge_cases.py` returning `422`.

### BUG-002: Missing Single Simulation Scenario Retrieval Endpoint
* **Severity**: Medium
* **Affected Component**: `api/forecasting.py`
* **Problem**: Requesting `/api/forecasting/simulations/{id}` returned `405 Method Not Allowed` because only `DELETE` was registered.
* **Fix**: Implemented `GET /api/forecasting/simulations/{simulation_id}` returning full scenario details with 404 handling.
* **Verification**: Verified with `test_get_nonexistent_forecast_simulation_returns_404`.

### BUG-003: Deprecated `dict()` Method Warnings in Pydantic v2
* **Severity**: Low
* **Affected Component**: `api/leads.py`
* **Problem**: `PydanticDeprecatedSince20: The dict method is deprecated; use model_dump instead`.
* **Fix**: Replaced `lead.dict()` with `lead.model_dump()`.
* **Verification**: Clean test run without deprecation warnings.
