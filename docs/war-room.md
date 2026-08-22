# ⚔️ AI Deal War Room & Strategy Studio

The AI Deal War Room module provides deep multi-agent deal strategy consensus, competitive battle-cards, SWOT analysis, dynamic 1-click proposal generation, and multi-agent workflow trigger automations.

---

## 🏗️ Architecture

```
Deal Evaluation Request
           ↓
   FastAPI Router (/api/war-room)
           ↓
   Multi-Agent Consortium
   • SalesPipelineAgent (Health & Slippage Risk)
   • CustomerSuccessAgent (Churn & SLA Alignment)
   • LeadQualificationAgent (Buying Committee Signals)
           ↓
   Consensus Strategy Matrix
   • Multi-Agent Verdict (Advance, Renegotiate, Hold)
   • Competitor Battle-Cards
   • SWOT Quadrant Analysis
   • Stakeholder Alignment Map
           ↓
   Smart Proposal Studio (1-Click Generation & E-Sign)
   Workflow Automations Engine (Agent Fleet Triggers)
           ↓
   React Frontend (frontend/src/features/war-room/)
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/war-room/deals` | List all deals with executive strategy health overview and risk indicators. |
| `GET` | `/api/war-room/deals/{deal_id}/strategy` | Fetch deep multi-agent SWOT, competitor battle-cards, and consensus verdict. |
| `POST` | `/api/war-room/deals/{deal_id}/proposal` | Generate a customized executive proposal with tiered pricing, SLA terms, and e-signature URL. |
| `GET` | `/api/war-room/automations` | List all multi-agent workflow automation triggers. |
| `POST` | `/api/war-room/automations` | Create a new multi-agent trigger rule. |
| `PUT` | `/api/war-room/automations/{rule_id}` | Update existing trigger criteria or target action. |
| `POST` | `/api/war-room/automations/{rule_id}/toggle` | Toggle automation status between `active` and `paused`. |
| `POST` | `/api/war-room/automations/{rule_id}/execute` | Execute an automation trigger live using the AI orchestrator agent fleet. |
| `DELETE` | `/api/war-room/automations/{rule_id}` | Delete an automation rule. |

---

## 💡 Frontend Features (`frontend/src/features/war-room/`)

* **Deal Strategy HUD**: Visual SWOT quadrants, win probability gauges, and stakeholder alignment radar.
* **Smart Proposal Studio Modal** (`components/ProposalStudioModal.tsx`): 1-click customized proposal generation with e-signature link dispatch.
* **Automation Rules Manager Modal** (`components/AutomationRulesModal.tsx`): Multi-agent triggers with live execution testing.
