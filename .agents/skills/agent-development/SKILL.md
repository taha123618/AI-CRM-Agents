---
name: agent-development
description: Guide for creating, modifying, and orchestrating CRM agents that inherit from BaseAgent.
---

# Agent Development Skill

Use this skill when creating new AI agents, modifying existing agent intelligence/scoring rules, adding agent tools, or integrating agent communication.

## 🚀 Guidelines

1. **Subclassing BaseAgent**:
   - Every agent must inherit from `BaseAgent` from `agents.base_agent`.
   - Call `super().__init__(name="AgentName", llm=llm, ...)` in `__init__`.
   - Agents automatically benefit from `TraceMixin` transparent LLM tracing.

2. **Specialized Agent Fleet**:
   - `LeadQualificationAgent` (`agents/lead_qualification_agent.py`): Lead scoring, qualification, enrichment.
   - `EmailIntelligenceAgent` (`agents/email_intelligence_agent.py`): Sentiment analysis, emotion detection, AI reply drafting, and centralized outbound email delivery delegation via `services/email_service.py` and `services/task_queue_service.py` (zero duplicate SMTP logic).
   - `SalesPipelineAgent` (`agents/sales_pipeline_agent.py`): Deal health scoring, close probability.
   - `CustomerSuccessAgent` (`agents/customer_success_agent.py`): Churn risk prediction, health monitoring.
   - `MeetingSchedulerAgent` (`agents/meeting_scheduler_agent.py`): Agenda building, meeting prep notes.
   - `AnalyticsAgent` (`agents/analytics_agent.py`): Executive dashboard synthesis, predictive insights.
   - `VoiceCallAgent` (`agents/voice_call_agent.py`): Real-time speech turn analysis, battle-cards, intent scoring.
   - `WhatsAppAgent` (`agents/whatsapp_agent.py`): Conversational intent detection, 24/7 auto-pilot replies.
   - `CustomAgentBuilder` (`agents/custom_agent_builder.py`): Dynamic instantiation of user-defined no-code agents.

3. **Implementing Task Execution**:
   - Define the main entrypoint: `async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]`.
   - The execute method should check `task.get("action")` if the agent supports multiple actions.

4. **Interacting with LLMs**:
   - Use `await self.think(prompt)` to invoke the LLM. Keep prompt templates clear and structured.
   - Parse numeric scores, lists, or JSON from raw LLM text using regex helper methods (e.g. `_extract_score`, `_extract_number`).

5. **Activity Logs and Events**:
   - Always log agent milestones: `await self.log_activity("event_name", details_dict)`.
   - Publish events to coordinate with other agents: `await self.publish_event("event_type", payload)`.

6. **Centralized Email Transmission Delegation**:
   - Never implement standalone SMTP logic inside agent classes.
   - Dispatch emails via `task_queue.enqueue_email(...)` or dedicated helper methods:
     - `LeadQualificationAgent.dispatch_lead_email(recipient_email, subject, body, lead_id: Optional[str] = None)`
     - `SalesPipelineAgent.dispatch_deal_email(recipient_email, subject, body, deal_id: Optional[str] = None)`
     - `CustomerSuccessAgent.dispatch_retention_email(recipient_email, subject, body, customer_id: Optional[str] = None)`
     - `MeetingSchedulerAgent.dispatch_meeting_invite_email(to_email, meeting_title, scheduled_time, duration_minutes, location, ...)`

7. **Static Type Safety & Timezone Standards**:
   - Use `Optional[T] = None` for parameters with default `None`.
   - String-coerce dictionary lookup results when passing to typed dictionary `.get()` calls (e.g. `stage_thresholds.get(str(stage) if stage else "", 30)`).
   - Use `datetime.now(timezone.utc)` for all agent event timestamps.
   - For async streaming, guard iteration with `isinstance(stream_obj, AsyncIterable)` from `collections.abc`.

## 📋 Example Agent Implementation

```python
from typing import Dict, Any
from .base_agent import BaseAgent

class CustomAgent(BaseAgent):
    def __init__(self, llm=None, tools=None, memory=None, redis_client=None):
        super().__init__(
            name="CustomAgent",
            llm=llm,
            tools=tools,
            memory=memory,
            redis_client=redis_client
        )

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        action = task.get("action", "run")
        await self.log_activity("task_started", {"action": action})
        
        prompt = f"Analyze this request: {task.get('input')}"
        response = await self.think(prompt)
        
        result = {"response": response, "status": "completed"}
        await self.log_activity("task_completed", result)
        return result
```
