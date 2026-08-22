---
name: cybersecurity
description: Guide for database safety, XSS protection, SSRF validation, HTTP header defense, and secure session management.
---

# Cybersecurity & Threat Modeling Skill

Use this skill when implementing backend routers, endpoints, integrations, webhooks, or processing user-supplied inputs, files, and URLs.

## 🛡️ Security Hardening Guidelines

### 1. HTTP Security Headers & Transport Hardening
- **Middleware Integration**: Enforce the custom `SecurityHeadersMiddleware` on all API responses to mitigate Clickjacking, XSS, and MIME-sniffing:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (enforced when `APP_ENV=production` or `COOKIE_SECURE=true`).
  - Strict `Content-Security-Policy` and `Permissions-Policy`.

### 2. SSRF (Server-Side Request Forgery) Defense
- **Outbound Webhook URL Validation**: Before dispatching external webhook events or downloading files, validate the target host using `is_safe_webhook_url(url)`:
  - Block loopback / local IP ranges (`127.0.0.1`, `localhost`, `::1`).
  - Block link-local metadata endpoints (e.g. AWS/GCP metadata `169.254.169.254`).
  - Block private RFC-1918 Class A/B/C subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - **DNS Rebinding Protection**: Resolve domain names to IPs via `socket.getaddrinfo()` before verification to prevent DNS Rebinding bypasses.
  - Block metadata endpoints (`metadata.google.internal`, `metadata.gcp.internal`).

### 3. CSV Formula Injection Prevention (Formula Sanitization)
- **Data Export Protection**: When exporting data to CSV/Excel format (e.g. leads, deals, or audit logs), sanitize every cellular value using `sanitize_csv_cell(value)`:
  - Detect dangerous calculation prefix triggers: `=`, `+`, `-`, `@`, `\t`, `\r`.
  - Prefix malicious trigger patterns with a single quote character (`'`) to neutralize automatic spreadsheet command execution.

### 4. Session & Cookie Hardening
- **Secure Authentication Cookies**: Enforce secure flags when dispatching JWT or refresh token cookies:
  - Always enable `HttpOnly=True` to block client-side JavaScript access.
  - Set `Secure=True` in production (`APP_ENV=production` or `COOKIE_SECURE=true`) to mandate TLS/SSL transport.
  - Set `SameSite=Strict` in production (when `COOKIE_SECURE=true`) or `SameSite=Lax` in development to prevent Cross-Site Request Forgery (CSRF).
  - Authentication cookies use `samesite="strict" if COOKIE_SECURE else "lax"`.

### 5. SQL Injection & Parameter Injection Defense
- **SQL ORM Safety**: Always utilize SQLAlchemy's query binding mechanisms. Avoid string interpolation or concatenating raw variables into queries:
  - Prefer `.filter(Model.field == value)` or parameterized statements (`text("SELECT * FROM table WHERE field = :val")`).
  - Sanitize wildcards (`%`, `_`) when performing fuzzy string matching (`LIKE`).

### 6. XSS (Cross-Site Scripting) Sanitization
- **Input Neutralization**: Sanitize user-generated content, voice transcripts, email body inputs, and WhatsApp message payloads before storing or rendering:
  - Clean HTML tags and attributes to prevent malicious script tag injections.
  - Validate and restrict inputs using strict Pydantic schemas.
  - **WebSocket XSS**: All incoming WebSocket messages are sanitized via `_sanitize_ws_message()` which strips HTML tags, removes null bytes, and truncates to 4096 characters.

### 7. Authentication & Password Security
- **SECRET_KEY**: Never hardcode SECRET_KEY. Generate ephemeral fallback if env var is missing. Always require SECRET_KEY in production.
- **Password Complexity**: All passwords must pass `validate_password_strength()`:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character
  - Block common weak passwords
- **Brute-Force Protection**: Account lockout after 5 consecutive failed login attempts (15-minute lockout).
- **Account Enumeration Prevention**: `/api/auth/forgot-password` returns identical responses for existing and non-existing emails.
- **No Auth Bypass**: `get_current_user()` returns `None` for unauthenticated requests — no automatic admin fallback. `require_auth()` enforces 401.

### 8. RBAC & Authorization
- **Admin-Only Endpoints**: Webhook CRUD, user management, and audit log export require `require_role(["admin"])`.
- **Authenticated Endpoints**: Leads, deals, customers, import/export, and agent triggers require `Depends(require_auth)`.
- **Public Registration**: Admin role cannot be self-registered. Only `sales`, `support`, `auditor` roles are available during public registration.

### 9. Rate Limiting & Abuse Prevention
- **Sliding Window**: Rate limiter uses per-client sliding window tracking.
- **Route-Specific Limits**:
  - Login endpoints: 5 requests per minute
  - Registration / forgot-password: 10 requests per minute
  - Auth endpoints: 10 requests per minute
  - General API: 300 requests per minute
  - Test/localhost: 5000 requests per minute
- **RFC Headers**: All responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### 10. CORS Security
- **Production CORS**: Wildcard origins (`*`) are automatically replaced in production when `APP_ENV=production`.
- **Allowed Methods**: Restricted to `GET, POST, PUT, PATCH, DELETE, OPTIONS` (no wildcard `*`).
- **Allowed Headers**: Restricted to `Authorization, Content-Type, Accept`.

### 11. Input Validation & Pydantic
- **Length Limits**: All string fields use `Field(max_length=N)` to prevent memory abuse.
- **Range Validation**: Numeric fields use `Field(ge=0, le=100)` for bounded values.
- **Schema Validation**: Pydantic V2 `model_config = ConfigDict(from_attributes=True)` for ORM models.

### 12. WebSocket Security
- **Token Authentication**: WebSocket endpoint accepts optional `token` query parameter for authentication.
- **Message Sanitization**: All incoming messages pass through `_sanitize_ws_message()`:
  - Strip HTML/script tags via regex
  - Remove null bytes
  - Truncate to 4096 characters max

### 13. Security Testing
- **Test Suite**: `tests/test_security_hardening_suite.py` covers 32 security-specific tests:
  - SECRET_KEY not hardcoded
  - Password complexity validation
  - Auth guards on protected endpoints
  - Brute-force account lockout
  - WebSocket XSS sanitization
  - CORS production protection
  - DNS rebinding SSRF protection
  - Input boundary validation
  - Rate limiting headers
  - Security headers presence
  - Account enumeration prevention
  - JWT token rejection
- **Regression Testing**: `tests/test_cybersecurity_suite.py` covers HTTP headers, CSV injection, SSRF, cookies, SQL injection.
- **Command**: `PYTHONPATH=. ./.venv/bin/python3 -m pytest tests/ -v`

## 📋 Security Checklist for New Endpoints

Before deploying any new endpoint:
1. [ ] Add `Depends(require_auth)` or `Depends(require_role([...]))` for protected endpoints
2. [ ] Validate all inputs with Pydantic models (Field constraints for length, range)
3. [ ] Use SQLAlchemy ORM queries — never raw SQL with user input
4. [ ] Sanitize user text for HTML/XSS before storage
5. [ ] Validate outbound URLs with `is_safe_webhook_url()` for SSRF
6. [ ] Sanitize CSV exports with `sanitize_csv_cell()`
7. [ ] Add rate limiting awareness (sensitive endpoints get lower limits)
8. [ ] Return generic error messages — never leak stack traces or internal details
9. [ ] Use timezone-aware `datetime.now(timezone.utc)` — never `datetime.utcnow()`
10. [ ] Add audit logging for significant mutations
11. [ ] Write security regression tests in `tests/test_security_hardening_suite.py`
