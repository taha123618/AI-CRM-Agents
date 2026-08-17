# 🔒 Security Architecture & Threat Model

This document outlines the security architecture, threat model, input sanitization policies, and vulnerability prevention standards implemented in the AI-Powered CRM system.

---

## 🛡️ Core Security Controls

### 1. SQL Injection Prevention
- **Parameterized Queries**: All database queries are constructed exclusively via SQLAlchemy 2.0 ORM expression constructs.
- **Strict Typing**: Primary keys and foreign keys are validated as UUID objects before execution.
- **Search Sanitization**: Raw string interpolation in `LIKE` / `ILIKE` clauses is strictly prohibited; wildcard characters are escaped.

### 2. Cross-Site Scripting (XSS) Mitigation
- **Automatic React JSX Escaping**: All user-generated strings, transcript tokens, and custom copy templates are rendered within React JSX trees, preventing DOM injection.
- **Transcript Sanitization**: Real-time voice audio transcripts and WhatsApp chat messages are normalized and stripped of executable `<script>` and HTML payload tags prior to database storage.

### 3. Mass-Assignment & Schema Validation
- **Pydantic V2 Schemas**: All incoming REST payloads must pass strict Pydantic V2 model validation.
- **Bound Checking**: Numerical inputs (e.g. `win_probability_pct`, `health_score`, `simulation_runs`) enforce hard mathematical boundaries (`ge=0`, `le=100`).
- **Forbidden Extra Fields**: Pydantic schema configurations prevent arbitrary property injection.

---

## 🔐 API Token & Secret Management

- **Zero Hardcoded Secrets**: Secrets and API credentials (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `POSTGRES_PASSWORD`) are loaded strictly from environment variables or `.env`.
- **Docker Non-Root User**: Production container processes execute under unprivileged user IDs (`appuser`).
- **Deterministic Test Mocks**: The unit and integration test suites run 100% offline with zero external network requests and mock LLM pipelines.

---

## 🧪 Security Validation Test Suite

Security assertions are validated continuously via [`tests/test_security_validation.py`](../tests/test_security_validation.py):

```bash
PYTHONPATH=. .venv/bin/python3 -m pytest tests/test_security_validation.py -v
```

Covered test vectors:
- SQL injection payload injection in `/api/leads?search=...`
- SQL injection in WhatsApp message search `/api/whatsapp/conversations/search?query=...`
- SQL injection in Custom Agent query `/api/custom-agents?search=...`
- XSS script payload injection in WhatsApp message body
- XSS script tag injection in Voice Call audio transcripts
- Clean RFC 7807 404 handler verification on invalid routes
- Pydantic V2 422 validation structure tests
