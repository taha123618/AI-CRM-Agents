---
name: cybersecurity
description: Guide for database safety, XSS protection, SSRF validation, HTTP header defense, file upload security, and secure session management.
---

# Cybersecurity & Threat Modeling Skill

Use this skill when implementing backend routers, endpoints, integrations, webhooks, or processing user-supplied inputs, files, uploads, and URLs.

---

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

### 3. File Upload, Import & Malware Protection
- **Strict File Type Allowlists**: Only allow safe formats (e.g. `.csv`, `.json`, `.wav`, `.m4a` for voice notes).
- **Request Body & File Size Limits**: Enforce maximum file size limits (e.g. 10MB limit in `main.py` `limit_request_body`).
- **Path Traversal Defense**: Never use user-supplied file paths directly. Always sanitize filenames using `os.path.basename()` and store files under server-generated UUID identifiers.
- **Non-Executable Storage**: Uploaded files and attachments must never be stored in executable web-accessible directories.
- **CSV Formula Injection Prevention**: When exporting or importing CSV/Excel data, sanitize every cellular value using `sanitize_csv_cell(value)`:
  - Detect dangerous calculation prefix triggers: `=`, `+`, `-`, `@`, `\t`, `\r`.
  - Prefix malicious trigger patterns with a single quote character (`'`) to neutralize automatic spreadsheet formula execution.

### 4. Session & Cookie Hardening
- **Secure Authentication Cookies**: Enforce secure flags when dispatching JWT or refresh token cookies:
  - Always enable `HttpOnly=True` to block client-side JavaScript access (`document.cookie`).
  - Set `Secure=True` in production (`APP_ENV=production` or `COOKIE_SECURE=true`) to mandate TLS/SSL transport.
  - Set `SameSite=Strict` in production (when `COOKIE_SECURE=true`) or `SameSite=Lax` in development to prevent Cross-Site Request Forgery (CSRF).
  - Single-use, cryptographically hashed tokens for password recovery and email verification.

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
- **Two-Factor Authentication (2FA)**: Mandatory 6-digit OTP delivery via Gmail SMTP for new registrations, single-use SHA-256 token hash persistence in `OtpToken`, 2-minute expiration (`OTP_EXPIRE_MINUTES=2`), and strict rate-limiting on resend requests.
- **SECRET_KEY**: Never hardcode SECRET_KEY. Generate ephemeral fallback if env var is missing. Always require SECRET_KEY in production.
- **Password Complexity**: All passwords must pass `validate_password_strength()`:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character
  - Block common weak passwords
- **Brute-Force Protection**: Account lockout after 5 consecutive failed login attempts (15-minute lockout).
- **Account Enumeration Prevention**: `/api/auth/forgot-password` and `/api/auth/resend-otp` return identical generic responses for existing and non-existing emails.
- **No Auth Bypass**: `get_current_user()` returns `None` for unauthenticated requests — no automatic admin fallback. `require_auth()` enforces 401.

### 8. RBAC & Authorization
- **Admin-Only Endpoints**: Webhook CRUD, user management, and audit log export require `require_role(["admin"])`.
- **Authenticated Endpoints**: Leads, deals, customers, import/export, and agent triggers require `Depends(require_auth)`.
- **Public Registration**: Admin role cannot be self-registered. Only `sales`, `support`, `auditor` roles are available during public registration. Seeded super admin account (`admin@gmail.com`) is protected.

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
- **Production CORS**: Wildcard origins (`*`) are automatically replaced with explicit allowed domains in production when `APP_ENV=production`.
- **Allowed Methods**: Restricted to `GET, POST, PUT, PATCH, DELETE, OPTIONS` (no wildcard `*`).
- **Allowed Headers**: Restricted to `Authorization, Content-Type, Accept`.

---

## 🎯 OWASP Top 10 Coverage Matrix

| OWASP Category | Threat Description | Mitigations in AI-Powered CRM |
|---|---|---|
| **A01: Broken Access Control** | Unauthorized privilege escalation or IDOR | Server-side `require_permission` and `require_role` guards, permission matrix checks. |
| **A02: Cryptographic Failures** | Plaintext tokens or weak hashing | Bcrypt password hashing (12 rounds), ephemeral fallback keys, single-use DB-hashed reset tokens. |
| **A03: Injection** | SQL, XSS, or CSV formula injection | Parameterized SQLAlchemy queries, `sanitize_csv_cell()`, WebSocket HTML/script tag stripping. |
| **A04: Insecure Design** | Unprotected rate or volume abuse | Sliding-window `RateLimitingMiddleware` with 5 RPM login limit and 10MB body size cap. |
| **A05: Security Misconfiguration** | Missing headers, verbose error traces | `SecurityHeadersMiddleware` (CSP, HSTS, X-Frame-Options), clean JSON HTTPException responses. |
| **A06: Vulnerable Components** | Outdated or compromised dependencies | Trivy container vulnerability scanner (`.github/workflows/docker-build.yml`), pinned pip/npm/bun locks. |
| **A07: Identification & Auth Failures** | Credential stuffing, brute-force | 5-attempt account lockout (15 min), generic auth error messages, zero-enumeration password recovery. |
| **A08: Software & Data Integrity** | Deserialization or untrusted webhooks | Pydantic V2 schema validation, frozen lockfiles (`bun.lock`, `requirements.txt`). |
| **A09: Security Logging & Monitoring** | Undetected intrusion or tampering | Immutable `audit_logs` table tracking mutations, actor metadata, IP tracking, Prometheus metrics. |
| **A10: Server-Side Request Forgery** | Cloud metadata extraction (`169.254...`) | Strict `is_safe_webhook_url()` with DNS rebinding resolution before outbound transmission. |

---

## 📋 Security Checklist for Pull Requests

Before deploying or merging code:
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
11. [ ] Verify all 59 security tests pass (`pytest tests/test_security_hardening_suite.py tests/test_cybersecurity_suite.py ...`)
