# 💰 Sales Pipeline Agent

The Sales Pipeline Agent continuously monitors deal health across all pipeline stages, predicts close probabilities, identifies stalled or high-risk deals, and generates prescriptive next best actions for sales reps.

---

## 🏗️ Architecture

```
Deal Updated / Stage Transition / API Trigger
             ↓
    FastAPI Router (/api/deals or /api/agents/analyze-deal/{id})
             ↓
    SalesPipelineAgent (agents/sales_pipeline_agent.py)
             ↓
    • Velocity & Stage Duration Analysis
    • Win Probability Estimation (0–100%)
    • Deal Health Scoring (0–100)
    • Stalled Deal Flagging
    • Recommended Next Actions & Action Items
             ↓
    • If Stalled: Trigger Meeting Scheduler for Follow-up Agenda
             ↓
    PostgreSQL (Deal, Company, Contact Models)
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/deals/)
```

---

## 🤖 Capabilities

1. **Deal Health Scoring (0–100)**:
   - Evaluates days spent in current stage against historical conversion velocity.
   - Evaluates rep activity frequency, last interaction date, and decision-maker involvement.
2. **Win Probability Prediction**:
   - Calculates dynamic probability based on stage benchmarks, buyer signals, and deal size.
3. **Stalled Deal Detection**:
   - Flags deals exceeding stage velocity thresholds (e.g. >14 days in Proposal with no activity).
4. **Prescriptive Next Steps**:
   - Generates tactical recommendations (e.g. "Send technical comparison sheet", "Re-engage executive sponsor").

---

## 🌐 API Endpoints & Triggers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agents/analyze-deal/{deal_id}` | Trigger deal health analysis and next action generation |
| `GET` | `/api/deals` | List all pipeline deals |
| `GET` | `/api/deals/{id}` | Get deal details, health score, and recommendations |
| `PATCH` | `/api/deals/{id}/stage` | Transition deal stage and trigger pipeline audit |
| `POST` | `/api/deals` | Create a new pipeline opportunity |

---

## 🗄️ Database Interactions

* **`Deal`**:
  * `health_score` (Integer): 0–100 computed health index.
  * `win_probability` (Float): Estimated probability of closing.
  * `is_stalled` (Boolean): Stalled flag.
  * `days_in_stage` (Integer): Duration tracker.
  * `next_actions` (JSON): AI-recommended action steps.
  * `additional_metadata` (JSON): Risk factors, competitor notes, and forecasted close dates.

---

## 🎨 Frontend Features (`frontend/src/features/deals/`)

* **Kanban Pipeline Board**: Drag-and-drop deal cards between stages (Discovery, Qualified, Proposal, Negotiation, Closed Won, Closed Lost).
* **Deal Health Indicators**: Color-coded score tags (High Health, Medium, Risk).
* **Deal Detail Modal**: View probability breakdown, risk alerts, and AI next actions.
* **Batch Pipeline Audit**: Trigger full pipeline health re-computation.
