"""Service layer for Custom Agent Studio - CRUD, execution, history, and tools catalog."""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from database.models import CustomAgent, CustomAgentExecution
from agents.custom_agent_runtime import CustomAgentRuntime


AVAILABLE_CRM_TOOLS = [
    {
        "id": "query_crm",
        "name": "Query CRM Records",
        "category": "Data Access",
        "description": "Fetch leads, active deals, high-risk customers, and emails matching criteria.",
        "icon": "Database",
        "parameters": ["entity", "limit", "filter"],
    },
    {
        "id": "update_deal",
        "name": "Update Pipeline Deal",
        "category": "Sales Actions",
        "description": "Advance deal stage, update win probability, or set next follow-up action.",
        "icon": "TrendingUp",
        "parameters": ["deal_id", "stage", "notes"],
    },
    {
        "id": "send_email",
        "name": "Send AI Email Response",
        "category": "Communications",
        "description": "Compose and dispatch contextual email replies to prospects or customers.",
        "icon": "Mail",
        "parameters": ["recipient", "subject", "body"],
    },
    {
        "id": "schedule_meeting",
        "name": "Schedule Briefing & Prep",
        "category": "Calendar",
        "description": "Generate meeting agenda, prep briefing, and book calendar invite.",
        "icon": "Calendar",
        "parameters": ["title", "attendees", "duration_minutes"],
    },
    {
        "id": "generate_summary",
        "name": "Generate Executive Summary",
        "category": "Analytics",
        "description": "Synthesize conversation context or pipeline telemetry into executive takeaways.",
        "icon": "FileText",
        "parameters": ["text", "format"],
    },
    {
        "id": "webhook_call",
        "name": "Trigger External Webhook",
        "category": "Integrations",
        "description": "Post payload to external Zapier, Slack, or webhook URL.",
        "icon": "Webhook",
        "parameters": ["url", "payload"],
    },
]


class CustomAgentService:
    """Business logic for Custom Agents studio management and execution."""

    @staticmethod
    def get_available_tools() -> List[Dict[str, Any]]:
        """Return list of authorized CRM tools that custom agents can leverage."""
        return AVAILABLE_CRM_TOOLS

    @staticmethod
    def list_custom_agents(
        db: Session,
        active_only: bool = False,
    ) -> List[CustomAgent]:
        """List custom agents with optional active status filter."""
        query = db.query(CustomAgent)
        if active_only:
            query = query.filter(CustomAgent.is_active.is_(True))
        return query.order_by(CustomAgent.created_at.desc()).all()

    @staticmethod
    def get_custom_agent(db: Session, agent_id: str) -> Optional[CustomAgent]:
        """Fetch custom agent by UUID."""
        try:
            val_uuid = uuid.UUID(agent_id) if isinstance(agent_id, str) else agent_id
            return db.query(CustomAgent).filter(CustomAgent.id == val_uuid).first()
        except (ValueError, TypeError):
            return None

    @staticmethod
    def create_custom_agent(db: Session, data: Dict[str, Any]) -> CustomAgent:
        """Create a new custom agent configuration."""
        name = data.get("name", "").strip()
        if not name:
            raise ValueError("Agent name is required.")

        system_prompt = data.get("system_prompt", "").strip()
        if not system_prompt:
            raise ValueError("System prompt is required.")

        agent = CustomAgent(
            id=uuid.uuid4(),
            name=name,
            description=data.get("description", ""),
            icon=data.get("icon", "Bot"),
            trigger_type=data.get("trigger_type", "manual"),
            trigger_config=data.get("trigger_config", {}),
            model_provider=data.get("model_provider", "smart-fallback"),
            model_name=data.get("model_name", "smart-fallback"),
            temperature=float(data.get("temperature", 0.3)),
            system_prompt=system_prompt,
            tools_enabled=data.get("tools_enabled", []),
            is_active=data.get("is_active", True),
            execution_count=0,
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def update_custom_agent(
        db: Session,
        agent_id: str,
        data: Dict[str, Any],
    ) -> Optional[CustomAgent]:
        """Update existing custom agent configuration."""
        agent = CustomAgentService.get_custom_agent(db, agent_id)
        if not agent:
            return None

        if "name" in data and data["name"]:
            agent.name = data["name"].strip()
        if "description" in data:
            agent.description = data["description"]
        if "icon" in data:
            agent.icon = data["icon"]
        if "trigger_type" in data:
            agent.trigger_type = data["trigger_type"]
        if "trigger_config" in data:
            agent.trigger_config = data["trigger_config"]
        if "model_provider" in data:
            agent.model_provider = data["model_provider"]
        if "model_name" in data:
            agent.model_name = data["model_name"]
        if "temperature" in data:
            agent.temperature = float(data["temperature"])
        if "system_prompt" in data and data["system_prompt"]:
            agent.system_prompt = data["system_prompt"].strip()
        if "tools_enabled" in data:
            agent.tools_enabled = data["tools_enabled"]
        if "is_active" in data:
            agent.is_active = bool(data["is_active"])

        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def delete_custom_agent(db: Session, agent_id: str) -> bool:
        """Delete custom agent and cascade execution logs."""
        agent = CustomAgentService.get_custom_agent(db, agent_id)
        if not agent:
            return False

        db.delete(agent)
        db.commit()
        return True

    @staticmethod
    async def execute_custom_agent(
        db: Session,
        agent_id: str,
        input_payload: Dict[str, Any],
        trigger_event: str = "manual",
        llm: Any = None,
    ) -> Dict[str, Any]:
        """Instantiate CustomAgentRuntime, run execution, and persist execution audit log."""
        agent = CustomAgentService.get_custom_agent(db, agent_id)
        if not agent:
            raise ValueError(f"Custom agent '{agent_id}' not found.")

        # Create runtime instance
        runtime = CustomAgentRuntime(
            agent_id=str(agent.id),
            name=agent.name,
            system_prompt=agent.system_prompt,
            tools_enabled=agent.tools_enabled or [],
            llm=llm,
            temperature=agent.temperature,
        )

        exec_res = await runtime.execute(
            {
                "input_payload": input_payload,
                "db": db,
            }
        )

        # Record execution in DB
        execution = CustomAgentExecution(
            id=uuid.uuid4(),
            agent_id=agent.id,
            status=exec_res.get("status", "success"),
            trigger_event=trigger_event,
            input_payload=input_payload,
            output_payload=exec_res.get("output", {}),
            thought_trace=exec_res.get("thought_trace", []),
            tool_calls=exec_res.get("tool_calls", []),
            duration_ms=exec_res.get("duration_ms", 0),
            tokens_used=exec_res.get("tokens_used", 0),
        )
        db.add(execution)

        # Increment execution stats
        agent.execution_count = (agent.execution_count or 0) + 1
        agent.last_run_at = datetime.utcnow()
        db.commit()
        db.refresh(execution)

        exec_res["execution_id"] = str(execution.id)
        return exec_res

    @staticmethod
    def list_executions(
        db: Session,
        agent_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[CustomAgentExecution]:
        """Fetch recent execution history."""
        query = db.query(CustomAgentExecution)
        if agent_id:
            try:
                val_uuid = uuid.UUID(agent_id)
                query = query.filter(CustomAgentExecution.agent_id == val_uuid)
            except (ValueError, TypeError):
                return []
        return query.order_by(CustomAgentExecution.created_at.desc()).limit(limit).all()
