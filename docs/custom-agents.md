# 🔧 No-Code Custom Agent Builder

The No-Code Custom Agent Builder enables users to design, configure, test, and deploy specialized AI agents without writing code.

---

## 🏗️ Architecture

```
Visual Creator UI (frontend/src/features/custom-agents/)
             ↓
    FastAPI Router (/api/custom-agents)
             ↓
    CustomAgentRuntime (agents/custom_agent_runtime.py)
             ↓
    • Dynamic System Prompt Compilation
    • Trigger Condition Evaluation (event-driven or scheduled)
    • Tool & Context Assignment (DB search, email draft, lead score)
    • LLM Model & Temperature Binding
             ↓
    PostgreSQL (CustomAgentModel)
             ↓
    Interactive Test Playground with Execution Telemetry
```

---

## 🤖 Capabilities

1. **Visual Agent Configuration**:
   - **System Prompt Editor**: Tailor domain expertise and agent personality.
   - **Trigger Rules**: Inbound lead created, deal stage changed, email received, or scheduled cron.
   - **Tool Assignment**: Select allowed tools (e.g. database query, CRM update, email sender).
   - **Model Hyperparameters**: Select LLM model (`gpt-4o`, `claude-3-5-sonnet`) and temperature (0.0 to 1.0).
2. **Interactive Testing Playground**:
   - Test custom prompts in real time with immediate simulated output and activity trace logs.
3. **Lifecycle Management**:
   - Set agent status (`active`, `inactive`, `draft`).
   - Monitor total execution count, success rates, and last run timestamps.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/custom-agents` | List all user-configured custom agents |
| `POST` | `/api/custom-agents` | Create a new custom agent configuration |
| `GET` | `/api/custom-agents/{id}` | Get custom agent details and execution statistics |
| `PUT` | `/api/custom-agents/{id}` | Update agent prompts, triggers, tools, or status |
| `DELETE` | `/api/custom-agents/{id}` | Delete a custom agent |
| `POST` | `/api/custom-agents/{id}/test` | Execute a live test run in the playground |

---

## 🗄️ Database Model: `CustomAgentModel`

* `id` (UUID): Primary key.
* `name` (String): Agent display name.
* `description` (Text): Short description of agent duties.
* `system_prompt` (Text): Customized prompt template.
* `model` (String): Selected LLM identifier.
* `temperature` (Float): Inference temperature (0.0–1.0).
* `triggers` (JSON): Configured execution triggers.
* `tools` (JSON): Enabled tool permissions.
* `status` (String): `active`, `inactive`, `draft`.
* `execution_count` (Integer): Total invocations.
* `last_run_at` (DateTime): Timestamp of most recent run.
* `created_at` (DateTime): Creation timestamp.

---

## 🎨 Frontend Features (`frontend/src/features/custom-agents/`)

* **Agent Studio Dashboard**: Grid of custom agents with status toggles and execution counters.
* **Agent Creator & Editor**: Multi-step configuration form for prompt, triggers, and tool selection.
* **Live Playground**: Real-time prompt test runner with LLM response display and latency metrics.
* **Activity Trace Viewer**: Inspect previous agent execution logs.
