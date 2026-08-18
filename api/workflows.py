"""Visual Multi-Agent Workflow Pipelines API Router."""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.connection import get_db
from database.models import WorkflowDefinition

router = APIRouter()

DEFAULT_STARTER_WORKFLOWS = [
    {
        "name": "High-Value Inbound Lead ➔ Autonomous SDR Cadence",
        "description": "Qualifies new inbound leads, generates SWOT matrix, and auto-schedules Discovery Call via Email and WhatsApp.",
        "trigger_type": "event",
        "trigger_config": {"event_name": "lead.created", "condition": "lead_score >= 75"},
        "nodes": [
            {"id": "node-1", "type": "trigger", "label": "Lead Created (Score >= 75)", "position": {"x": 50, "y": 100}},
            {"id": "node-2", "type": "agent", "label": "Lead Qualification Agent", "agent": "lead_qualification", "position": {"x": 280, "y": 100}},
            {"id": "node-3", "type": "agent", "label": "AI SDR Cadence Step 1 (Email)", "agent": "email_intelligence", "position": {"x": 520, "y": 60}},
            {"id": "node-4", "type": "agent", "label": "WhatsApp Auto-Pilot Intro", "agent": "whatsapp_agent", "position": {"x": 520, "y": 160}},
            {"id": "node-5", "type": "action", "label": "Create Pipeline Opportunity", "position": {"x": 760, "y": 100}},
        ],
        "edges": [
            {"id": "edge-1-2", "source": "node-1", "target": "node-2"},
            {"id": "edge-2-3", "source": "node-2", "target": "node-3"},
            {"id": "edge-2-4", "source": "node-2", "target": "node-4"},
            {"id": "edge-3-5", "source": "node-3", "target": "node-5"},
            {"id": "edge-4-5", "source": "node-4", "target": "node-5"},
        ],
        "is_active": True,
        "execution_count": 18,
    },
    {
        "name": "Deal War Room ➔ 1-Click Proposal & SLA Automation",
        "description": "Synthesizes multi-agent consensus, extracts battle-card objections, and drafts pricing tiers.",
        "trigger_type": "event",
        "trigger_config": {"event_name": "deal.stage_changed", "stage": "proposal"},
        "nodes": [
            {"id": "n-1", "type": "trigger", "label": "Stage Changed to Proposal", "position": {"x": 50, "y": 100}},
            {"id": "n-2", "type": "agent", "label": "Sales Pipeline & War Room Consensus", "agent": "sales_pipeline", "position": {"x": 300, "y": 100}},
            {"id": "n-3", "type": "action", "label": "Generate Smart Proposal SLA", "position": {"x": 560, "y": 100}},
        ],
        "edges": [
            {"id": "e-1-2", "source": "n-1", "target": "n-2"},
            {"id": "e-2-3", "source": "n-2", "target": "n-3"},
        ],
        "is_active": True,
        "execution_count": 9,
    },
]


class WorkflowCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    trigger_type: str = Field("event", description="'event', 'manual', 'schedule', 'webhook'")
    trigger_config: Dict[str, Any] = Field(default_factory=dict)
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    is_active: bool = Field(True)


class WorkflowUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None


class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Dict[str, Any]
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    is_active: bool
    execution_count: int
    last_executed_at: Optional[str] = None
    created_at: Optional[str] = None


@router.get("", response_model=List[WorkflowResponse])
def list_workflows(db: Session = Depends(get_db)):
    """List all visual multi-agent workflows (seeds default pipelines if empty)."""
    workflows = db.query(WorkflowDefinition).order_by(desc(WorkflowDefinition.created_at)).all()

    if not workflows:
        for starter in DEFAULT_STARTER_WORKFLOWS:
            wf = WorkflowDefinition(
                name=starter["name"],
                description=starter["description"],
                trigger_type=starter["trigger_type"],
                trigger_config=starter["trigger_config"],
                nodes=starter["nodes"],
                edges=starter["edges"],
                is_active=starter["is_active"],
                execution_count=starter["execution_count"],
            )
            db.add(wf)
        db.commit()
        workflows = db.query(WorkflowDefinition).order_by(desc(WorkflowDefinition.created_at)).all()

    return [
        WorkflowResponse(
            id=str(w.id),
            name=w.name,
            description=w.description,
            trigger_type=w.trigger_type,
            trigger_config=w.trigger_config or {},
            nodes=w.nodes or [],
            edges=w.edges or [],
            is_active=bool(w.is_active),
            execution_count=int(w.execution_count or 0),
            last_executed_at=w.last_executed_at.isoformat() if w.last_executed_at else None,
            created_at=w.created_at.isoformat() if w.created_at else None,
        )
        for w in workflows
    ]


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
def create_workflow(payload: WorkflowCreateRequest, db: Session = Depends(get_db)):
    """Create a new visual multi-agent workflow pipeline."""
    new_wf = WorkflowDefinition(
        name=payload.name.strip(),
        description=payload.description,
        trigger_type=payload.trigger_type,
        trigger_config=payload.trigger_config,
        nodes=payload.nodes,
        edges=payload.edges,
        is_active=payload.is_active,
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)

    return WorkflowResponse(
        id=str(new_wf.id),
        name=new_wf.name,
        description=new_wf.description,
        trigger_type=new_wf.trigger_type,
        trigger_config=new_wf.trigger_config or {},
        nodes=new_wf.nodes or [],
        edges=new_wf.edges or [],
        is_active=bool(new_wf.is_active),
        execution_count=int(new_wf.execution_count or 0),
        last_executed_at=new_wf.last_executed_at.isoformat() if new_wf.last_executed_at else None,
        created_at=new_wf.created_at.isoformat() if new_wf.created_at else None,
    )


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Get workflow canvas definition by ID."""
    try:
        val_id = uuid.UUID(workflow_id) if isinstance(workflow_id, str) else workflow_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid workflow ID.")

    wf = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == val_id).first()
    if not wf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found.")

    return WorkflowResponse(
        id=str(wf.id),
        name=wf.name,
        description=wf.description,
        trigger_type=wf.trigger_type,
        trigger_config=wf.trigger_config or {},
        nodes=wf.nodes or [],
        edges=wf.edges or [],
        is_active=bool(wf.is_active),
        execution_count=int(wf.execution_count or 0),
        last_executed_at=wf.last_executed_at.isoformat() if wf.last_executed_at else None,
        created_at=wf.created_at.isoformat() if wf.created_at else None,
    )


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(workflow_id: str, payload: WorkflowUpdateRequest, db: Session = Depends(get_db)):
    """Update workflow graph nodes, edges, or activation state."""
    try:
        val_id = uuid.UUID(workflow_id) if isinstance(workflow_id, str) else workflow_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid workflow ID.")

    wf = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == val_id).first()
    if not wf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found.")

    if payload.name is not None:
        wf.name = payload.name.strip()
    if payload.description is not None:
        wf.description = payload.description
    if payload.trigger_type is not None:
        wf.trigger_type = payload.trigger_type
    if payload.trigger_config is not None:
        wf.trigger_config = payload.trigger_config
    if payload.nodes is not None:
        wf.nodes = payload.nodes
    if payload.edges is not None:
        wf.edges = payload.edges
    if payload.is_active is not None:
        wf.is_active = payload.is_active

    db.commit()
    db.refresh(wf)

    return WorkflowResponse(
        id=str(wf.id),
        name=wf.name,
        description=wf.description,
        trigger_type=wf.trigger_type,
        trigger_config=wf.trigger_config or {},
        nodes=wf.nodes or [],
        edges=wf.edges or [],
        is_active=bool(wf.is_active),
        execution_count=int(wf.execution_count or 0),
        last_executed_at=wf.last_executed_at.isoformat() if wf.last_executed_at else None,
        created_at=wf.created_at.isoformat() if wf.created_at else None,
    )


@router.delete("/{workflow_id}")
def delete_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Delete workflow definition."""
    try:
        val_id = uuid.UUID(workflow_id) if isinstance(workflow_id, str) else workflow_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid workflow ID.")

    wf = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == val_id).first()
    if not wf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found.")

    db.delete(wf)
    db.commit()
    return {"status": "success", "message": f"Workflow '{wf.name}' deleted successfully."}


@router.post("/{workflow_id}/execute")
def execute_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Execute live simulation run of a visual workflow graph."""
    try:
        val_id = uuid.UUID(workflow_id) if isinstance(workflow_id, str) else workflow_id
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid workflow ID.")

    wf = db.query(WorkflowDefinition).filter(WorkflowDefinition.id == val_id).first()
    if not wf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found.")

    wf.execution_count = (wf.execution_count or 0) + 1
    wf.last_executed_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "status": "success",
        "workflow_id": str(wf.id),
        "workflow_name": wf.name,
        "nodes_processed": len(wf.nodes or []),
        "executed_at": wf.last_executed_at.isoformat(),
        "trace": [
            {"node": node.get("label", "Node"), "status": "completed", "latency_ms": 120}
            for node in (wf.nodes or [])
        ],
    }
