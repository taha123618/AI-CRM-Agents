"""FastAPI Main Application - AI-Powered CRM"""

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import os
import uvicorn
from datetime import datetime

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
)
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

# Create database tables (fallback/convenience)
Base.metadata.create_all(bind=engine)

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
# In production, restrict allowed origins via ALLOWED_ORIGINS env var
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
_origins = (
    [o.strip() for o in _allowed_origins.split(",")]
    if _allowed_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time event stream WebSocket endpoint"""
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json(
            {
                "type": "connection_established",
                "message": "Connected to AI CRM Realtime Event Stream",
                "agents": orchestrator.get_agent_status(),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        while True:
            data = await websocket.receive_text()
            # Broadcast the received message out to everyone
            await ws_manager.broadcast(
                {"type": "client_message", "message": f"Client said: {data}"}
            )
            await websocket.send_json(
                {
                    "type": "pong",
                    "received": data,
                    # pyrefly: ignore [deprecated]
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        await ws_manager.broadcast("A client disconnected")


# ============================================================================
# INCLUDE ROUTERS
# ============================================================================

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
app.include_router(
    war_room.router, prefix="/api/war-room", tags=["AI Deal War Room"]
)
app.include_router(
    journey.router, prefix="/api/journey", tags=["Customer Journey & Churn Prevention"]
)
app.include_router(
    sequences.router, prefix="/api/sequences", tags=["AI SDR Cadences"]
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


@app.post("/api/agents/qualify-lead")
async def qualify_lead(
    lead_data: Dict[str, Any],
    db: Session = Depends(get_db),
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
):
    """Trigger Email Intelligence Agent"""
    result = await orchestrator.process_email(email_data, db)
    return {
        "status": "success",
        "message": "Email analysis completed",
        "result": result,
    }


@app.post("/api/agents/analyze-deal/{deal_id}")
async def analyze_deal(deal_id: str, db: Session = Depends(get_db)):
    """Trigger Sales Pipeline Agent"""
    result = await orchestrator.analyze_deal(deal_id, db)
    return {
        "status": "success",
        "message": f"Deal analysis completed for {deal_id}",
        "result": result,
    }


@app.post("/api/agents/monitor-customer/{customer_id}")
async def monitor_customer(customer_id: str, db: Session = Depends(get_db)):
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
):
    """Trigger Meeting Scheduler Agent"""
    result = await orchestrator.schedule_meeting(meeting_request, db)
    return {
        "status": "success",
        "message": "Meeting scheduling completed",
        "result": result,
    }


@app.post("/api/agents/generate-dashboard")
async def generate_dashboard(category: str = "all", db: Session = Depends(get_db)):
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
