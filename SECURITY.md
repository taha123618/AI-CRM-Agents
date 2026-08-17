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

## 🔒 Security Best Practices for Deployments

- Always replace the default `.env.example` secret keys (`SECRET_KEY`, `POSTGRES_PASSWORD`) before deploying to public servers.
- Keep the backend container behind an HTTPS-terminating reverse proxy (e.g. Nginx, Cloudflare, Traefik).
- Restrict database and Redis ports (`5432`, `6379`) to the internal Docker network rather than exposing them to the public internet (`0.0.0.0`).
