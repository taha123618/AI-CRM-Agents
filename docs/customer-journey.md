# 🧭 AI Autonomous Customer Journey & Churn Prevention Studio

The Customer Journey & Churn Prevention module provides automated account lifecycle tracking, dynamic churn probability radar, and 1-click autonomous retention intervention playbooks with real-time PostgreSQL database persistence.

---

## 🏗️ Architecture

```
PostgreSQL Customer Telemetry
(Health Scores, License Usage, Tickets, Logins)
              ↓
     FastAPI Router (/api/journey)
              ↓
     Lifecycle Stage Classification Engine
     • Onboarding & Setup
     • Product Adoption
     • Value Expansion
     • Renewal Optimization
     • At-Risk / Retention Radar
              ↓
     Autonomous Retention Playbooks
     (CustomerSuccessAgent + Email/WhatsApp Fleet)
              ↓
     Database Persistence (CustomerIntervention Model)
     Dynamic Customer Health Score Mutation (db.commit())
              ↓
     React Frontend (frontend/src/features/journey/)
```

---

## 🗄️ Database Models

### `CustomerIntervention` (`database/models.py`)
* `id` (UUID): Primary key.
* `customer_id` (UUID, Foreign Key): Reference to parent `Customer` (`ondelete="CASCADE"`).
* `customer_name` (String): Associated company or account name.
* `intervention_type` (String): `executive_check_in`, `feature_adoption_nudge`, `nps_outreach`, `contract_rescue`.
* `status` (String): `active`, `completed`, `cancelled`.
* `target_agent` (String): Agent executing the play (e.g. `customer_success_agent`, `whatsapp_agent`).
* `triggered_reason` (Text): Trigger context or churn rationale.
* `action_summary` (Text): Summary of automated actions taken.
* `ai_playbook` (Text): AI generated rescue plan and outreach copy.
* `created_at` (DateTime): Intervention launch timestamp.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/journey/stages` | Aggregates customer count and ARR across the 5 lifecycle stages dynamically from PostgreSQL. |
| `GET` | `/api/journey/customers/{customer_id}` | Detailed account lifecycle history, telemetry timeline, and recommended interventions. |
| `POST` | `/api/journey/interventions/trigger` | Dispatches retention intervention, executes AI playbook, saves intervention record, and boosts customer health score (+12) in database. |
| `GET` | `/api/journey/interventions` | List all active and completed customer interventions. |
| `POST` | `/api/journey/interventions/{id}/resolve` | Mark an active intervention resolved (`completed`). |

---

## 💡 Frontend Features (`frontend/src/features/journey/`)

* **Stage Progression Pipeline**: Dynamic stage navigation filter with live ARR counts and risk alerts.
* **Account Telemetry Browser**: Dynamic text search and ascending/descending health score sorting.
* **Autonomous Intervention Modal** (`components/InterventionModal.tsx`): 1-click rescue play launcher with AI-generated playbook briefing.
* **Timeline HUD**: Lifecycle progression milestones from onboarding to expansion lock-in.
