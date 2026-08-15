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

2. **Implementing Task Execution**:
   - Define the main entrypoint: `async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]`.
   - The execute method should check `task.get("action")` if the agent supports multiple actions.

3. **Interacting with LLMs**:
   - Use `await self.think(prompt)` to invoke the LLM. Keep prompt templates clear and structured.
   - Parse numeric scores, lists, or JSON from raw LLM text using regex helper methods (e.g. `_extract_score`, `_extract_number`).

4. **Activity Logs and Events**:
   - Always log agent milestones: `await self.log_activity("event_name", details_dict)`.
   - Publish events to coordinate with other agents: `await self.publish_event("event_type", payload)`.

5. **Bulk Operations & Standardized Return Objects**:
   - Agent workflows should support bulk execution targets (e.g. `customer_id == "all"`, `deal_id == "all"`) for batch fleet audits.
   - Return objects should include nested updated entities (e.g. `updated_customer`, `updated_lead`) so frontend client hooks can perform instant state unwrapping and table row refetches.

## 📋 Example Agent Implementation

```python
from typing import Dict, Any
from .base_agent import BaseAgent

class CustomAgent(BaseAgent):
    def __init__(self, llm, tools=None, memory=None, redis_client=None):
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
