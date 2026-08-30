---
name: backend-development
description: Guide for developing FastAPI routers, endpoints, dependencies, and Pydantic schemas.
---

# Backend Development Skill

Use this skill when you are modifying or creating FastAPI API routers, endpoints, request/response models, or FastAPI dependencies.

## 🚀 Guidelines

1. **Endpoint Routing**:
   - Create route modules under `api/` (e.g. `api/leads.py`, `api/deals.py`, `api/customers.py`, `api/emails.py`, `api/meetings.py`, `api/analytics.py`, `api/voice_calls.py`, `api/whatsapp.py`, `api/forecasting.py`, `api/custom_agents.py`, `api/i18n.py`, `api/war_room.py`, `api/journey.py`, `api/sequences.py`, `api/auth.py`, `api/audit_logs.py`, `api/tasks.py`, `api/webhooks.py`, `api/observability.py`, `api/tenants.py`, `api/custom_fields.py`, `api/import_export.py`).
   - Use `router = APIRouter()` to define endpoints.
   - Include the new router in `main.py` using `app.include_router(new_router, prefix="/api/...", tags=["..."])`.

2. **Validation & Schemas (Pydantic V2)**:
   - Define all request payloads and response bodies as Pydantic V2 models.
   - Match the project's validation style (`model_config = ConfigDict(from_attributes=True)` or `class Config: from_attributes = True`).
   - Use `Annotated[List[T], Field(min_length=N)]` for list length constraints instead of deprecated `min_items`.
   - Ensure all response models are typed explicitly with `response_model=...`.

3. **Database Integration & Session Lifecycles**:
   - Always inject database sessions into endpoints using FastAPI dependency injection:
     ```python
     db: Session = Depends(get_db)
     ```
   - **CRITICAL**: Do NOT pass request-scoped `db: Session` to `BackgroundTasks.add_task(...)` if the task requires writing to PostgreSQL after response delivery, because FastAPI closes the request session as soon as the response returns. Instead, await the orchestrator workflow synchronously in the endpoint or instantiate `SessionLocal()` inside background task runners.
   - Support both string and UUID primary keys when querying models (e.g. attempting `uuid.UUID(id_str)` before falling back to string match).
   - Coerce SQLAlchemy column attributes to Python primitives (`str()`, `int()`, `float()`) when using them as dictionary keys, in `round()`, or in `dict.get()`.
   - Run `db.commit()` for writes and `db.refresh(db_obj)` when returning updated models.

4. **Authentication, 2FA OTP & RBAC Security Patterns**:
   - Multi-step Two-Factor Authentication (2FA) registration: `POST /api/auth/register` creates pending `is_verified=False` account and sends 6-digit OTP via Gmail SMTP.
   - OTP Token Lifecycle: Generate via `create_otp_token()` with 2-minute TTL (`OTP_EXPIRE_MINUTES=2`), store as SHA-256 hash in `OtpToken`, verify via `POST /api/auth/verify-otp`, and support resend via `POST /api/auth/resend-otp`.
   - Protect sensitive endpoints using dependency guards: `Depends(require_auth)`, `Depends(require_role(["admin", "sales"]))`, or `Depends(require_permission("deals:write"))`.
   - Compute fine-grained user permissions via `get_effective_user_permissions(user)` based on `ROLE_DEFAULT_PERMISSIONS` and custom assigned permissions.
   - Prevent user enumeration in auth endpoints (e.g. `POST /api/auth/forgot-password` and `POST /api/auth/resend-otp` always return uniform responses).
   - Never leak raw tokens, session credentials, or internal passwords in HTTP response bodies or application logs.

5. **Transactional Email & Background Task Queue**:
   - Dispatch long-running or external network tasks (e.g. email delivery, audio analysis) asynchronously via `task_queue.enqueue(...)`, `task_queue.enqueue_email(...)`, or `task_queue.enqueue_password_reset_email(...)`.
   - Use `EmailService` (`services/email_service.py`) as the single source of truth for SMTP delivery with STARTTLS on port 587 and HTML/text templating (including `send_otp_email` for 2FA verification).
   - Always parse envelope senders with `email.utils.parseaddr` to ensure RFC-5321 compliance with strict SMTP servers (e.g., Gmail SMTP).
   - In all email dispatching endpoints (in `/api/emails`, `/api/meetings`, `/api/war-room`, `/api/journey`, and `/api/sequences`), delegate transmissions to `task_queue.enqueue_email(...)` with verified recipient email resolution.

6. **Datetime & Timezone Standards**:
   - **CRITICAL**: Never use deprecated `datetime.utcnow()`. Always use timezone-aware `datetime.now(timezone.utc)`.
   - When comparing timestamps from the database that may be naive, normalize them using `_to_utc()` or `dt.replace(tzinfo=timezone.utc)` before comparing against `datetime.now(timezone.utc)`.

7. **Senior Cybersecurity & Defense-in-Depth Standards**:
   - **HTTP Security Headers**: Enforce `SecurityHeadersMiddleware` on all responses (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`).
   - **CSV Formula Injection Prevention**: Always sanitize outgoing spreadsheet cells (`sanitize_csv_cell`) by prefixing dangerous calculation triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) with `'`.
   - **SSRF Defense**: Validate all user-supplied outbound URLs via `is_safe_webhook_url(...)` to block loopback (`127.0.0.1`), link-local metadata (`169.254.169.254`), and private cloud IP subnets in production.
   - **Secure Cookies**: Ensure authentication cookies dynamically enforce `secure=True` in production environments (`APP_ENV=production` or `COOKIE_SECURE=true`).

8. **Error Handling**:
   - Avoid catching and silencing database or logic errors directly.
   - Raise `HTTPException` for user errors or state conflicts (e.g., `raise HTTPException(status_code=404, detail="Item not found")`).

## 📋 Example Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Contact
from pydantic import BaseModel

router = APIRouter()

class LeadResponse(BaseModel):
    id: str
    email: str
    lead_score: int

    class Config:
        from_attributes = True

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Contact).filter(Contact.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
```
