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
  - Resolve domain names to IPs before verification to prevent DNS Rebinding bypasses.

### 3. CSV Formula Injection Prevention (Formula Sanitization)
- **Data Export Protection**: When exporting data to CSV/Excel format (e.g. leads, deals, or audit logs), sanitize every cellular value using `sanitize_csv_cell(value)`:
  - Detect dangerous calculation prefix triggers: `=`, `+`, `-`, `@`, `\t`, `\r`.
  - Prefix malicious trigger patterns with a single quote character (`'`) to neutralize automatic spreadsheet command execution.

### 4. Session & Cookie Hardening
- **Secure Authentication Cookies**: Enforce secure flags when dispatching JWT or refresh token cookies:
  - Always enable `HttpOnly=True` to block client-side JavaScript access.
  - Set `Secure=True` in production (`APP_ENV=production` or `COOKIE_SECURE=true`) to mandate TLS/SSL transport.
  - Set `SameSite=Lax` or `SameSite=Strict` to prevent Cross-Site Request Forgery (CSRF).

### 5. SQL Injection & Parameter Injection Defense
- **SQL ORM Safety**: Always utilize SQLAlchemy's query binding mechanisms. Avoid string interpolation or concatenating raw variables into queries:
  - Prefer `.filter(Model.field == value)` or parameterized statements (`text("SELECT * FROM table WHERE field = :val")`).
  - Sanitize wildcards (`%`, `_`) when performing fuzzy string matching (`LIKE`).

### 6. XSS (Cross-Site Scripting) Sanitization
- **Input Neutralization**: Sanitize user-generated content, voice transcripts, email body inputs, and WhatsApp message payloads before storing or rendering:
  - Clean HTML tags and attributes to prevent malicious script tag injections.
  - Validate and restrict inputs using strict Pydantic schemas.
