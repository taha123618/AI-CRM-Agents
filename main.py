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
from api import leads, deals, customers, emails, meetings, analytics
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
            await ws_manager.broadcast(f"Client said: {data}")
            await websocket.send_json(
                {
                    "type": "pong",
                    "received": data,
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


# ============================================================================
# AGENT TRIGGER ENDPOINTS
# ============================================================================


@app.post("/api/agents/qualify-lead")
async def qualify_lead(
    lead_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger Lead Qualification Agent"""
    background_tasks.add_task(orchestrator.process_new_lead, lead_data, db)
    return {"status": "processing", "message": "Lead qualification started"}


@app.post("/api/agents/analyze-email")
async def analyze_email(
    email_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger Email Intelligence Agent"""
    background_tasks.add_task(orchestrator.process_email, email_data, db)
    return {"status": "processing", "message": "Email analysis started"}


@app.post("/api/agents/analyze-deal/{deal_id}")
async def analyze_deal(
    deal_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    """Trigger Sales Pipeline Agent"""
    background_tasks.add_task(orchestrator.analyze_deal, deal_id, db)
    return {"status": "processing", "message": "Deal analysis started"}


@app.post("/api/agents/monitor-customer/{customer_id}")
async def monitor_customer(
    customer_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    """Trigger Customer Success Agent"""
    background_tasks.add_task(orchestrator.monitor_customer, customer_id, db)
    return {"status": "processing", "message": "Customer monitoring started"}


@app.post("/api/agents/schedule-meeting")
async def schedule_meeting(
    meeting_request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Trigger Meeting Scheduler Agent"""
    background_tasks.add_task(orchestrator.schedule_meeting, meeting_request, db)
    return {"status": "processing", "message": "Meeting scheduling started"}


@app.post("/api/agents/generate-dashboard")
async def generate_dashboard(category: str = "all", db: Session = Depends(get_db)):
    """Trigger Analytics Agent - synchronous"""
    dashboard = await orchestrator.generate_dashboard(category, db)
    return dashboard


# ============================================================================
# WEBHOOKS
# ============================================================================


@app.post("/webhooks/email-received")
async def email_webhook(
    email_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Webhook for incoming emails"""
    background_tasks.add_task(orchestrator.process_email, email_data, db)
    return {"status": "received"}


@app.post("/webhooks/form-submission")
async def form_webhook(
    form_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Webhook for form submissions (new leads)"""
    background_tasks.add_task(orchestrator.process_new_lead, form_data, db)
    return {"status": "received"}


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
