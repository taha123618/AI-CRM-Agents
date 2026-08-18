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

1. **Do NOT open a public GitHub issue.**
2. Send an email with full reproduction steps, payload details, and affected endpoints to the security team or maintainer: `security@aicrmagents.internal` (or directly via private repository security advisory).
3. Include the following details:
   - Affected file(s) and line numbers
   - Proof of Concept (PoC) or cURL command
   - Potential impact (e.g. privilege escalation, data leak)

---

## 🔒 Security Architecture & Best Practices for Deployments

- **HTTP Security Headers & HSTS**: All endpoints enforce strict browser security headers via `SecurityHeadersMiddleware`:
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
  - `X-Frame-Options: DENY` (prevents Clickjacking)
  - `X-XSS-Protection: 1; mode=block` (enables browser XSS filtering)
  - `Referrer-Policy: strict-origin-when-cross-origin` (prevents referrer credential leakage)
  - `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()`
  - `Content-Security-Policy` with hardened origin allowlists
  - `Strict-Transport-Security` (HSTS enabled in production)
- **CSV Formula Injection & DDE Neutralization**: All spreadsheet exports (leads, deals, compliance audit trails) sanitize cells starting with dangerous formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) by prefixing them with a single quote (`'`), neutralizing potential remote code execution when opened in Excel, LibreOffice, or Google Sheets.
- **Server-Side Request Forgery (SSRF) Defense**: Outbound webhook subscriptions validate target URLs against loopback (`127.0.0.1`, `localhost`), link-local metadata endpoints (`169.254.169.254`), and private cloud IP ranges in production mode.
- **Dynamic Secure Cookies**: Authentication cookies automatically enforce `Secure=True`, `HttpOnly=True`, and `SameSite=Lax` in production environments (`APP_ENV=production` or `COOKIE_SECURE=true`).
- **SMTP & Google App Passwords**: Never store or transmit normal Google account passwords. Google App Passwords (`16` characters) must be kept strictly inside environment secrets (`EMAIL_PASSWORD`) and never logged.
- **Single-Use Password Reset Tokens**: Reset tokens are generated with cryptographically secure random nonces, stored strictly as SHA-256 hashes (`PasswordResetToken`), and invalidated immediately upon first use or expiration (60 minutes).
- **Brute-Force Account Lockout**: Consecutive failed login attempts trigger an automated account lockout (5 attempts threshold, 15 minutes lockout duration) to prevent password guessing.
- **Zero User Enumeration**: Authentication endpoints (`/api/auth/forgot-password`) return unified responses regardless of whether the submitted email address exists in the system.
- **Role-Based Access Control (RBAC)**: All administrative and data manipulation endpoints enforce strict permission checks (`require_permission` and `require_role`). Super Admin accounts cannot be registered publicly and are governed through the `/settings` user management console.
- **Secret Rotation**: Always replace the default `.env.example` secret keys (`SECRET_KEY`, `POSTGRES_PASSWORD`, `EMAIL_PASSWORD`) before deploying to production.
- **Network Isolation**: Restrict database and Redis ports (`5432`, `6379`) to the internal Docker bridge network (`crm_net`) rather than exposing them to the public internet (`0.0.0.0`).
