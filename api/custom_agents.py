"""FastAPI Router for Custom Agent Builder & Execution Studio."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from database.connection import get_db
from database.models import User
from services.auth_service import require_auth
from services.custom_agent_service import CustomAgentService

router = APIRouter()


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================


class CustomAgentCreateSchema(BaseModel):
    model_config = {"protected_namespaces": ()}

    name: str = Field(
        ..., min_length=2, max_length=150, description="Agent Display Name"
    )
    description: Optional[str] = Field(None, description="Agent Mission Description")
    icon: Optional[str] = Field("Bot", description="Lucide icon name")
    trigger_type: str = Field(
        "manual", description="Trigger mechanism: manual, event, webhook, schedule"
    )
    trigger_config: Dict[str, Any] = Field(
        default_factory=dict, description="Configuration for the trigger"
    )
    model_provider: str = Field("smart-fallback", description="LLM Provider")
    model_name: str = Field("smart-fallback", description="Model Name")
    temperature: float = Field(
        0.3, ge=0.0, le=1.0, description="Creativity Temperature"
    )
    system_prompt: str = Field(
        ..., min_length=5, description="Persona and system instructions"
    )
    tools_enabled: List[str] = Field(
        default_factory=list, description="Enabled capability tool IDs"
    )
    is_active: bool = Field(True, description="Whether the agent is active")


class CustomAgentUpdateSchema(BaseModel):
    model_config = {"protected_namespaces": ()}

    name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    icon: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=1.0)
    system_prompt: Optional[str] = Field(None, min_length=5)
    tools_enabled: Optional[List[str]] = None
    is_active: Optional[bool] = None


class CustomAgentExecuteSchema(BaseModel):
    input_payload: Dict[str, Any] = Field(
        default_factory=dict, description="Dynamic context payload for variables"
    )
    trigger_event: str = Field(
        "manual_test", description="Event name initiating execution"
    )


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("", response_model=List[Dict[str, Any]])
def list_custom_agents(
    active_only: bool = Query(False, description="Filter only active agents"),
    db: Session = Depends(get_db),
):
    """List all custom agents."""
    agents = CustomAgentService.list_custom_agents(db, active_only=active_only)
    return [
        {
            "id": str(a.id),
            "name": a.name,
            "description": a.description,
            "icon": a.icon,
            "trigger_type": a.trigger_type,
            "trigger_config": a.trigger_config,
            "model_provider": a.model_provider,
            "model_name": a.model_name,
            "temperature": a.temperature,
            "system_prompt": a.system_prompt,
            "tools_enabled": a.tools_enabled or [],
            "is_active": a.is_active,
            "execution_count": a.execution_count or 0,
            "last_run_at": a.last_run_at.isoformat() if a.last_run_at else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }
        for a in agents
    ]


@router.post("", response_model=Dict[str, Any], status_code=201)
def create_custom_agent(
    payload: CustomAgentCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Create a new custom agent."""
    try:
        agent = CustomAgentService.create_custom_agent(db, payload.model_dump())
        return {
            "status": "success",
            "message": f"Custom agent '{agent.name}' created successfully",
            "agent": {
                "id": str(agent.id),
                "name": agent.name,
                "description": agent.description,
                "icon": agent.icon,
                "trigger_type": agent.trigger_type,
                "trigger_config": agent.trigger_config,
                "model_name": agent.model_name,
                "temperature": agent.temperature,
                "system_prompt": agent.system_prompt,
                "tools_enabled": agent.tools_enabled or [],
                "is_active": agent.is_active,
            },
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.get("/tools", response_model=List[Dict[str, Any]])
def get_available_tools():
    """Retrieve catalog of CRM capability tools that custom agents can use."""
    return CustomAgentService.get_available_tools()


@router.get("/executions", response_model=List[Dict[str, Any]])
def list_global_executions(
    limit: int = Query(50, ge=1, le=200, description="Max execution records"),
    db: Session = Depends(get_db),
):
    """Retrieve recent executions across all custom agents."""
    executions = CustomAgentService.list_executions(db, agent_id=None, limit=limit)
    return [
        {
            "id": str(e.id),
            "agent_id": str(e.agent_id),
            "status": e.status,
            "trigger_event": e.trigger_event,
            "input_payload": e.input_payload,
            "output_payload": e.output_payload,
            "thought_trace": e.thought_trace,
            "tool_calls": e.tool_calls,
            "duration_ms": e.duration_ms,
            "tokens_used": e.tokens_used,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in executions
    ]


@router.get("/{agent_id}", response_model=Dict[str, Any])
def get_custom_agent(agent_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Get single custom agent configuration."""
    agent = CustomAgentService.get_custom_agent(db, agent_id)
    if not agent:
        raise HTTPException(
            status_code=404, detail=f"Custom agent '{agent_id}' not found."
        )
    return {
        "id": str(agent.id),
        "name": agent.name,
        "description": agent.description,
        "icon": agent.icon,
        "trigger_type": agent.trigger_type,
        "trigger_config": agent.trigger_config,
        "model_provider": agent.model_provider,
        "model_name": agent.model_name,
        "temperature": agent.temperature,
        "system_prompt": agent.system_prompt,
        "tools_enabled": agent.tools_enabled or [],
        "is_active": agent.is_active,
        "execution_count": agent.execution_count or 0,
        "last_run_at": agent.last_run_at.isoformat() if agent.last_run_at else None,
        "created_at": agent.created_at.isoformat() if agent.created_at else None,
        "updated_at": agent.updated_at.isoformat() if agent.updated_at else None,
    }


@router.put("/{agent_id}", response_model=Dict[str, Any])
def update_custom_agent(
    agent_id: str,
    payload: CustomAgentUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Update custom agent configuration."""
    agent = CustomAgentService.update_custom_agent(
        db, agent_id=agent_id, data=payload.model_dump(exclude_unset=True)
    )
    if not agent:
        raise HTTPException(
            status_code=404, detail=f"Custom agent '{agent_id}' not found."
        )
    return {
        "status": "success",
        "message": f"Custom agent '{agent.name}' updated successfully",
        "agent": {
            "id": str(agent.id),
            "name": agent.name,
            "description": agent.description,
            "icon": agent.icon,
            "trigger_type": agent.trigger_type,
            "is_active": agent.is_active,
            "tools_enabled": agent.tools_enabled or [],
        },
    }


@router.delete("/{agent_id}", response_model=Dict[str, Any])
def delete_custom_agent(agent_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(require_auth)):
    """Delete a custom agent and all its execution history."""
    deleted = CustomAgentService.delete_custom_agent(db, agent_id)
    if not deleted:
        raise HTTPException(
            status_code=404, detail=f"Custom agent '{agent_id}' not found."
        )
    return {
        "status": "success",
        "message": f"Custom agent '{agent_id}' deleted successfully.",
    }


@router.post("/{agent_id}/execute", response_model=Dict[str, Any])
async def execute_custom_agent(
    agent_id: str,
    payload: CustomAgentExecuteSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """Run an interactive sandbox test or execution for a custom agent."""
    try:
        res = await CustomAgentService.execute_custom_agent(
            db=db,
            agent_id=agent_id,
            input_payload=payload.input_payload,
            trigger_event=payload.trigger_event,
        )
        return res
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))
    except Exception as err:
        raise HTTPException(
            status_code=500, detail=f"Agent execution failed: {str(err)}"
        )


@router.get("/{agent_id}/executions", response_model=List[Dict[str, Any]])
def list_agent_executions(
    agent_id: str,
    limit: int = Query(30, ge=1, le=100, description="Max execution records"),
    db: Session = Depends(get_db),
):
    """Retrieve execution history for a specific custom agent."""
    executions = CustomAgentService.list_executions(db, agent_id=agent_id, limit=limit)
    return [
        {
            "id": str(e.id),
            "agent_id": str(e.agent_id),
            "status": e.status,
            "trigger_event": e.trigger_event,
            "input_payload": e.input_payload,
            "output_payload": e.output_payload,
            "thought_trace": e.thought_trace,
            "tool_calls": e.tool_calls,
            "duration_ms": e.duration_ms,
            "tokens_used": e.tokens_used,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in executions
    ]
