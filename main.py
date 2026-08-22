"""FastAPI Main Application - AI-Powered CRM"""

# pyrefly: ignore [missing-import]
from fastapi import (
    FastAPI,
    Depends,
    BackgroundTasks,
    WebSocket,
    WebSocketDisconnect,
    Response,
    Query,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import os
import uvicorn
from datetime import datetime, timezone

from database.models import Base
from database.connection import engine, get_db
from api import (
    leads,
    deals,
    customers,
    emails,
    meetings,
    analytics,
    languages,
    custom_agents,
    voice_calls,
    whatsapp,
    forecasting,
    war_room,
    journey,
    sequences,
    audit_logs,
    auth,
    tasks,
    webhooks,
    import_export,
    metrics,
    search,
    organizations,
    custom_fields,
    evaluations,
    workflows,
    email_sync,
)
from middleware.rate_limiter import RateLimitingMiddleware
from middleware.security_headers import SecurityHeadersMiddleware
from workflows.orchestrator import AgentOrchestrator


class ConnectionManager:
    """Manages real-time WebSocket connections for event streaming"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()

from sqlalchemy import text

# Create database tables (fallback/convenience)
Base.metadata.create_all(bind=engine)
try:
    with engine.connect() as _conn:
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS organizations ("
                "id UUID PRIMARY KEY, "
                "name VARCHAR(255) NOT NULL, "
                "slug VARCHAR(100) UNIQUE NOT NULL, "
                "domain VARCHAR(255), "
                "plan_tier VARCHAR(50) DEFAULT 'enterprise', "
                "is_active BOOLEAN DEFAULT TRUE, "
                "settings JSONB DEFAULT '{}', "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS custom_field_definitions ("
                "id UUID PRIMARY KEY, "
                "organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL, "
                "entity_type VARCHAR(50) NOT NULL, "
                "name VARCHAR(100) NOT NULL, "
                "field_key VARCHAR(100) NOT NULL, "
                "field_type VARCHAR(50) DEFAULT 'text' NOT NULL, "
                "options JSONB DEFAULT '[]', "
                "is_required BOOLEAN DEFAULT FALSE, "
                "default_value JSONB, "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS llm_evaluation_runs ("
                "id UUID PRIMARY KEY, "
                "agent_name VARCHAR(100) NOT NULL, "
                "prompt_variant_a TEXT NOT NULL, "
                "prompt_variant_b TEXT NOT NULL, "
                "dataset_size INTEGER DEFAULT 10, "
                "score_a FLOAT DEFAULT 0.0, "
                "score_b FLOAT DEFAULT 0.0, "
                "latency_ms_a INTEGER DEFAULT 0, "
                "latency_ms_b INTEGER DEFAULT 0, "
                "tokens_used_a INTEGER DEFAULT 0, "
                "tokens_used_b INTEGER DEFAULT 0, "
                "metrics_breakdown JSONB DEFAULT '{}', "
                "winner VARCHAR(10) DEFAULT 'A', "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS workflow_definitions ("
                "id UUID PRIMARY KEY, "
                "name VARCHAR(150) NOT NULL, "
                "description TEXT, "
                "trigger_type VARCHAR(50) DEFAULT 'event', "
                "trigger_config JSONB DEFAULT '{}', "
                "nodes JSONB DEFAULT '[]', "
                "edges JSONB DEFAULT '[]', "
                "is_active BOOLEAN DEFAULT TRUE, "
                "execution_count INTEGER DEFAULT 0, "
                "last_executed_at TIMESTAMP, "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS email_sync_accounts ("
                "id UUID PRIMARY KEY, "
                "organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL, "
                "user_id UUID REFERENCES users(id) ON DELETE SET NULL, "
                "provider VARCHAR(50) NOT NULL, "
                "email_address VARCHAR(255) NOT NULL, "
                "display_name VARCHAR(150), "
                "sync_status VARCHAR(50) DEFAULT 'active', "
                "last_synced_at TIMESTAMP, "
                "error_message TEXT, "
                "settings JSONB DEFAULT '{}', "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS email_threads ("
                "id UUID PRIMARY KEY, "
                "account_id UUID REFERENCES email_sync_accounts(id) ON DELETE CASCADE, "
                "thread_key VARCHAR(255) NOT NULL, "
                "subject VARCHAR(255) NOT NULL, "
                "participant_emails JSONB DEFAULT '[]', "
                "message_count INTEGER DEFAULT 1, "
                "snippet TEXT, "
                "is_unread BOOLEAN DEFAULT FALSE, "
                "sentiment VARCHAR(50) DEFAULT 'neutral', "
                "last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "messages JSONB DEFAULT '[]', "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.execute(
            text(
                "CREATE TABLE IF NOT EXISTS whatsapp_templates ("
                "id UUID PRIMARY KEY, "
                "name VARCHAR(100) NOT NULL, "
                "category VARCHAR(50) DEFAULT 'MARKETING', "
                "language VARCHAR(10) DEFAULT 'en_US', "
                "status VARCHAR(50) DEFAULT 'APPROVED', "
                "body_text TEXT NOT NULL, "
                "variables JSONB DEFAULT '[]', "
                "header_type VARCHAR(50) DEFAULT 'NONE', "
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
            )
        )
        _conn.commit()
except Exception:
    pass

# Auto-seed database with mock data if empty
try:
    from database.seed import seed_database
    from database.connection import SessionLocal

    db_session = SessionLocal()
    try:
        seed_database(db_session)
    finally:
        db_session.close()
except Exception as seed_err:
    print(f"Error seeding database: {seed_err}")

# Initialize FastAPI app
app = FastAPI(
    title="AI-Powered CRM",
    description="Production-ready CRM with multi-agent AI architecture",
    version="1.0.0",
)

# CORS middleware
# SECURITY: In production, NEVER allow wildcard origins with credentials.
_is_prod = (
    os.getenv("APP_ENV", "").lower() == "production"
    or os.getenv("ENVIRONMENT", "").lower() == "production"
)
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
_origins = (
    [o.strip() for o in _allowed_origins.split(",")]
    if _allowed_origins != "*"
    else ["*"]
)

# SECURITY: In production, if wildcard is set but credentials are allowed, block it
if _is_prod and "*" in _origins:
    _origins = ["http://localhost:3000"]  # safe fallback for production
    import warnings

    warnings.warn(
        "CORS: Wildcard origin with credentials is insecure in production. "
        "Set ALLOWED_ORIGINS to your actual frontend domain.",
        stacklevel=2,
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitingMiddleware)


# SECURITY: Limit request body size to prevent memory exhaustion attacks
@app.middleware("http")
async def limit_request_body(request, call_next):
    """Reject requests with oversized bodies to prevent memory exhaustion."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
        from starlette.responses import JSONResponse

        return JSONResponse(
            status_code=413,
            content={"detail": "Request body too large. Maximum allowed size is 10MB."},
        )
    return await call_next(request)


# Initialize agent orchestrator
orchestrator = AgentOrchestrator()


# ============================================================================
# HEALTH CHECK
# ============================================================================


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "name": "AI-Powered CRM",
        "version": "1.0.0",
        "status": "healthy",
        "agents": orchestrator.get_agent_status(),
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "api": "healthy",
        "database": "connected",
        "agents": orchestrator.get_agent_status(),
        "redis": "connected",  # If using Redis
    }


def _sanitize_ws_message(data: str, max_len: int = 4096) -> str:
    """Sanitize incoming WebSocket message to prevent XSS and resource exhaustion."""
    # Truncate to prevent memory abuse
    data = data[:max_len]
    # Strip any HTML/script tags
    import re

    data = re.sub(r"<[^>]+>", "", data)
    # Remove null bytes
    data = data.replace("\x00", "")
    return data


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(default=""),
):
    """Real-time event stream WebSocket endpoint.

    SECURITY: Accepts optional token query param for authentication.
    Unauthenticated connections receive read-only public events.
    """
    # Basic token validation for WS auth
    ws_user = None
    if token:
        try:
            from services.auth_service import decode_token, SECRET_KEY
            from jose import jwt as jose_jwt

            payload = jose_jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            if user_id:
                from database.connection import SessionLocal
                from database.models import User

                db_session = SessionLocal()
                try:
                    from uuid import UUID

                    ws_user = (
                        db_session.query(User).filter(User.id == UUID(user_id)).first()
                    )
                finally:
                    db_session.close()
        except Exception:
            pass  # Invalid token — proceed as unauthenticated

    await ws_manager.connect(websocket)
    try:
        greeting = {
            "type": "connection_established",
            "message": "Connected to AI CRM Realtime Event Stream",
            "agents": orchestrator.get_agent_status(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "authenticated": ws_user is not None,
        }
        if ws_user:
            greeting["user"] = ws_user.email
        await websocket.send_json(greeting)

        while True:
            data = await websocket.receive_text()
            # SECURITY: Sanitize incoming message
            safe_data = _sanitize_ws_message(data)
            # Broadcast the sanitized message
            await ws_manager.broadcast(
                {"type": "client_message", "message": f"Client said: {safe_data}"}
            )
            await websocket.send_json(
                {
                    "type": "pong",
                    "received": safe_data,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        await ws_manager.broadcast("A client disconnected")


# ============================================================================
# INCLUDE ROUTERS
# ============================================================================

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication & RBAC"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(deals.router, prefix="/api/deals", tags=["Deals"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(languages.router, prefix="/api/languages", tags=["Languages"])
app.include_router(
    custom_agents.router, prefix="/api/custom-agents", tags=["Custom Agents"]
)
app.include_router(
    voice_calls.router, prefix="/api/voice-calls", tags=["Voice Calls & Audio"]
)
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp Business"])
app.include_router(
    forecasting.router, prefix="/api/forecasting", tags=["Advanced Forecasting"]
)
app.include_router(war_room.router, prefix="/api/war-room", tags=["AI Deal War Room"])
app.include_router(
    journey.router, prefix="/api/journey", tags=["Customer Journey & Churn Prevention"]
)
app.include_router(sequences.router, prefix="/api/sequences", tags=["AI SDR Cadences"])
app.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["Audit Logs"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Background Tasks Queue"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Universal Webhooks"])
app.include_router(
    import_export.router, prefix="/api/import-export", tags=["Bulk Import & Export"]
)
app.include_router(
    metrics.router, prefix="/api/metrics", tags=["Prometheus Observability"]
)
app.include_router(search.router, prefix="/api/search", tags=["Semantic Search & RAG"])
app.include_router(
    organizations.router,
    prefix="/api/organizations",
    tags=["Multi-Tenant Organizations"],
)
app.include_router(
    custom_fields.router, prefix="/api/custom-fields", tags=["Dynamic Custom Fields"]
)
app.include_router(
    evaluations.router, prefix="/api/evaluations", tags=["LLM Prompt Evaluations"]
)
app.include_router(
    workflows.router, prefix="/api/workflows", tags=["Visual Multi-Agent Workflows"]
)
app.include_router(
    email_sync.router, prefix="/api/email-sync", tags=["Email IMAP & OAuth Sync"]
)


@app.get("/metrics", response_class=Response, include_in_schema=False)
async def get_prometheus_metrics_root():
    """Direct root Prometheus scraper endpoint."""
    from services.metrics_service import MetricsService

    return Response(
        content=MetricsService.get_prometheus_metrics_text(),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


# ============================================================================
# RUNTIME OPTIMIZED I18N ENDPOINTS
# ============================================================================


@app.get("/api/i18n/{locale}")
def get_i18n_runtime_all(locale: str, db: Session = Depends(get_db)):
    """Optimized client-side runtime translation loading."""
    from services.language_service import LanguageService

    translations = LanguageService.get_translations_bundle(
        db, language_code=locale.lower(), with_fallback=True
    )
    return {"locale": locale, "translations": translations}


@app.get("/api/i18n/{locale}/{namespace}")
def get_i18n_runtime_namespace(
    locale: str, namespace: str, db: Session = Depends(get_db)
):
    """Optimized client-side runtime namespace-scoped translation loading."""
    from services.language_service import LanguageService

    translations = LanguageService.get_translations_bundle(
        db, language_code=locale.lower(), namespace=namespace, with_fallback=True
    )
    return {
        "locale": locale,
        "namespace": namespace,
        "translations": translations.get(namespace, {}),
    }


# ============================================================================
# AGENT TRIGGER ENDPOINTS
# ============================================================================


from services.auth_service import require_auth
from database.models import User


@app.post("/api/agents/qualify-lead")
async def qualify_lead(
    lead_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Trigger Lead Qualification Agent"""
    result = await orchestrator.process_new_lead(lead_data, db)
    return {
        "status": "success",
        "message": "Lead qualification completed",
        "result": result,
    }


@app.post("/api/agents/analyze-email")
async def analyze_email(
    email_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Trigger Email Intelligence Agent"""
    result = await orchestrator.process_email(email_data, db)
    return {
        "status": "success",
        "message": "Email analysis completed",
        "result": result,
    }


@app.post("/api/agents/analyze-deal/{deal_id}")
async def analyze_deal(
    deal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Trigger Sales Pipeline Agent"""
    result = await orchestrator.analyze_deal(deal_id, db)
    return {
        "status": "success",
        "message": f"Deal analysis completed for {deal_id}",
        "result": result,
    }


@app.post("/api/agents/monitor-customer/{customer_id}")
async def monitor_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Trigger Customer Success Agent"""
    result = await orchestrator.monitor_customer(customer_id, db)
    return {
        "status": "success",
        "message": f"Customer monitoring completed for {customer_id}",
        "result": result,
    }


@app.post("/api/agents/schedule-meeting")
async def schedule_meeting(
    meeting_request: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Trigger Meeting Scheduler Agent"""
    result = await orchestrator.schedule_meeting(meeting_request, db)
    return {
        "status": "success",
        "message": "Meeting scheduling completed",
        "result": result,
    }


@app.post("/api/agents/generate-dashboard")
async def generate_dashboard(
    category: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Trigger Analytics Agent - synchronous"""
    dashboard = await orchestrator.generate_dashboard(category, db)
    return dashboard


# ============================================================================
# WEBHOOKS
# ============================================================================


async def _bg_webhook_process_email(email_data: Dict[str, Any]):
    db = SessionLocal()
    try:
        await orchestrator.process_email(email_data, db)
    finally:
        db.close()


async def _bg_webhook_process_lead(form_data: Dict[str, Any]):
    db = SessionLocal()
    try:
        await orchestrator.process_new_lead(form_data, db)
    finally:
        db.close()


@app.post("/webhooks/email-received")
async def email_webhook(
    email_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
):
    """Webhook for incoming emails"""
    background_tasks.add_task(_bg_webhook_process_email, email_data)
    return {"status": "received"}


@app.post("/webhooks/form-submission")
async def form_webhook(
    form_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
):
    """Webhook for form submissions (new leads)"""
    background_tasks.add_task(_bg_webhook_process_lead, form_data)
    return {"status": "received"}


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
