# 🔒 Security Policy & Vulnerability Reporting

The AI-Powered CRM project team is committed to maintaining the highest security standards for all contributors and enterprise users.

---

## 🛡️ Supported Versions

| Version | Supported |
|---|---|
| 1.x (Current Master) | :white_check_mark: |
| < 1.0.0 | :x: |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or potential threat in this repository:

1. **DO NOT open a public GitHub issue.**
2. Send an email with full reproduction steps, payload details, and affected endpoints to the security team or maintainer: `security@aicrmagents.internal` (or directly via private repository security advisory).
3. Include the following details:
   - Affected file(s) and line numbers
   - Proof of Concept (PoC) or cURL command
   - Potential impact (e.g. privilege escalation, data leak)

---

## 🔒 Security Architecture & Best Practices for Deployments

### Authentication & Session Security
- **Two-Factor Authentication (2FA)**: Mandatory 6-digit OTP delivery via Gmail SMTP for new accounts, single-use SHA-256 token hash persistence (`OtpToken`), 2-minute expiration, and strict rate-limiting on resend requests.
- **Eye/EyeOff Password Visibility & Match**: Password visibility toggling and live password match validation on all registration/login interfaces.
- **SECRET_KEY**: No hardcoded fallback. Environment variable must be set. Ephemeral key generated if missing (tokens invalid after restart).
- **Password Complexity**: Minimum 8 characters with uppercase, lowercase, digit, and special character requirements. Common weak passwords blocked.
- **JWT Tokens**: HS256-signed with unique `jti` claim per token. Access tokens expire in 24 hours. Refresh tokens expire in 7 days with DB-backed revocation.
- **Token Rotation**: Refresh token rotation on every `/api/auth/refresh` call. Old tokens immediately revoked in DB.
- **HTTP-Only Cookies**: Authentication tokens stored in `HttpOnly`, `Secure` (production), `SameSite=Strict` (production) cookies.
- **Brute-Force Protection**: Account lockout after 5 consecutive failed login attempts (15-minute lockout).
- **Zero User Enumeration**: `/api/auth/forgot-password` and `/api/auth/resend-otp` return identical responses regardless of email existence.
- **No Auth Bypass**: `get_current_user()` returns `None` for unauthenticated requests — no automatic admin fallback.
- **SSO Security**: Social SSO (Google/Microsoft) provisions users with minimal default permissions.

### Authorization & RBAC
- **Role-Based Access Control**: `admin`, `sales`, `support`, `auditor` roles with fine-grained permissions.
- **Admin-Only Endpoints**: Webhook CRUD, user management, audit log export require `require_role(["admin"])`.
- **Public Registration**: Admin role cannot be self-registered. Only safe roles available during public signup.
- **Permission Guards**: `require_auth()`, `require_role()`, `require_permission()`, `require_any_permission()` FastAPI dependencies.

### API Security
- **Authentication Required**: Leads, deals, customers, import/export, agent triggers all require authentication.
- **Input Validation**: Pydantic V2 models with `Field(max_length=N)` and `Field(ge=0, le=N)` constraints.
- **Rate Limiting**: Sliding-window rate limiter with per-client tracking. Stricter limits for login (5/min), registration (10/min), general API (300/min).
- **RFC Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` on all responses.
- **CORS**: Production wildcard origins auto-restricted. Methods and headers explicitly allowlisted.
- **HTTP Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`.

### SQL Injection Prevention
- **ORM Safety**: All database queries use SQLAlchemy ORM parameterized queries — no raw SQL with user input.
- **Tested**: SQL injection payloads (`'; DROP TABLE...`, `' OR '1'='1`, etc.) verified safe via automated test suite.

### XSS Prevention
- **WebSocket Sanitization**: All incoming WebSocket messages sanitized via `_sanitize_ws_message()` — strips HTML tags, removes null bytes, truncates to 4096 chars.
- **Output Encoding**: Pydantic models enforce type-safe responses.
- **CSP Headers**: `Content-Security-Policy: default-src 'self'` enforced.

### CSRF Protection
- **SameSite Cookies**: `SameSite=Strict` in production, `SameSite=Lax` in development.
- **Secure Flags**: `Secure=True` in production (`APP_ENV=production` or `COOKIE_SECURE=true`).

### SSRF Defense
- **Webhook URL Validation**: `is_safe_webhook_url()` blocks loopback, link-local, cloud metadata, and private RFC-1918 IPs.
- **DNS Rebinding Protection**: Hostnames resolved to IP via `socket.getaddrinfo()` before validation.
- **Blocked Hosts**: `localhost`, `169.254.169.254`, `metadata.google.internal`, `metadata.gcp.internal`.

### CSV Formula Injection
- **Cell Sanitization**: `sanitize_csv_cell()` prefixes dangerous formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with single quote.
- **Export Protection**: All CSV exports (leads, deals, audit logs) sanitized.
- **Import Limits**: 5MB max payload, 5000 row limit.

### File Upload Security
- **Import Validation**: CSV imports validate email format, enforce size limits, and reject malformed data.

### Secrets Management
- **Environment Variables**: All secrets loaded from `.env` file or environment variables.
- **No Hardcoded Credentials**: SECRET_KEY, API keys, database passwords never hardcoded.
- **`.env` Excluded**: `.env` file excluded from version control via `.gitignore`.
- **SMTP Credentials**: Google App Passwords stored in `EMAIL_PASSWORD` env var, never logged.

### Docker & Infrastructure Security
- **Non-Root Container**: Production Dockerfile runs as `appuser` (UID 1001).
- **Multi-Stage Build**: Builder stage separated from runtime for minimal attack surface.
- **Health Checks**: All services have health check configurations.
- **Network Isolation**: Internal bridge network (`crm_net`) isolates services.
- **No Exposed Ports**: Database (5432) and Redis (6379) not exposed to host.

### Logging & Monitoring
- **Audit Trail**: All authentication events, role changes, and data mutations logged to `audit_logs` table.
- **Sanitized Logs**: Email addresses masked in logs via `_sanitize_recipient()`. Passwords and tokens never logged.
- **Structured Logging**: `loguru` used for structured, level-based logging.

---

## 🧪 Security Test Coverage

| Test Suite | Tests | Coverage |
|---|---|---|
| `test_security_hardening_suite.py` | 32 | SECRET_KEY, password complexity, auth guards, brute-force, WebSocket XSS, CORS, SSRF, input validation, rate limiting, security headers, account enumeration, JWT tokens |
| `test_cybersecurity_suite.py` | 8 | HTTP headers, CSV injection, SSRF, cookie security, SQL injection |
| `test_must_have_security.py` | 5 | Password hashing, auth flow, RBAC, rate limiting, task queue |
| `test_must_have_deep_security.py` | 4 | Cookie sessions, SSO, async tasks, audit trails |
| `test_security_validation.py` | 7 | SQL injection, XSS, information disclosure, error handling |
| **Total** | **56** | **Comprehensive security regression testing** |

Run all security tests:
```bash
PYTHONPATH=. ./.venv/bin/python3 -m pytest tests/test_security_hardening_suite.py tests/test_cybersecurity_suite.py tests/test_must_have_security.py tests/test_must_have_deep_security.py tests/test_security_validation.py -v
```

---

## 🔐 Deployment Security Checklist

- [ ] Set strong `SECRET_KEY` in `.env` (at least 64 characters)
- [ ] Set `APP_ENV=production` or `COOKIE_SECURE=true`
- [ ] Set `ALLOWED_ORIGINS` to your actual frontend domain (not `*`)
- [ ] Configure valid `EMAIL_PASSWORD` (Google App Password)
- [ ] Ensure PostgreSQL and Redis are not exposed to public internet
- [ ] Enable HTTPS/TLS termination at reverse proxy or load balancer
- [ ] Set strong database credentials (not default `crm_password`)
- [ ] Review and rotate API keys regularly
- [ ] Monitor audit logs for suspicious activity
- [ ] Run security test suite before each deployment

---

## 📚 Security Documentation Files

| File | Description |
|---|---|
| `SECURITY.md` | This file — security policy and architecture |
| `.agents/skills/cybersecurity/SKILL.md` | Detailed developer security guidelines |
| `CLAUDE.md` | Project coding standards including security rules |
| `tests/test_security_hardening_suite.py` | 32 comprehensive security regression tests |
| `tests/test_cybersecurity_suite.py` | Core cybersecurity test suite |
