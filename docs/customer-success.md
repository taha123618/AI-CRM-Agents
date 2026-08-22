# 🎉 Customer Success Agent

The Customer Success Agent continuously calculates customer health scores, detects early indicators of churn risk, suggests proactive retention workflows, and identifies expansion/upsell opportunities.

---

## 🏗️ Architecture

```
Telemetry Ingestion / Support Ticket / API Trigger
             ↓
    FastAPI Router (/api/customers or /api/agents/monitor-customer/{id})
             ↓
    CustomerSuccessAgent (agents/customer_success_agent.py)
             ↓
    • Account Health Scoring (0–100)
    • Churn Risk Level (low, medium, high, critical)
    • Churn Probability Estimation (0.0 to 1.0)
    • Upsell / Cross-sell Opportunity Flagging
    • Retention Playbook Generation
             ↓
    • If High/Critical Risk: Dispatch Immediate Slack / CS Team Alert
             ↓
    PostgreSQL (Customer, Company, ActivityLog Models)
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/customers/)
```

---

## 🤖 Capabilities

1. **Multi-Factor Health Scoring**:
   - **Product Usage & Activity (40%)**: Login frequency, feature adoption, telemetry events.
   - **Support & Sentiment History (30%)**: Open tickets, resolution times, email sentiment history.
   - **Billing & Contract Lifecycle (30%)**: Renewal proximity, payment status, contract terms.
2. **Churn Risk Detection**:
   - Classifies risk into `low`, `medium`, `high`, and `critical`.
   - Generates explicit risk factors (e.g. "Usage dropped by 45% in last 30 days").
3. **Retention & Expansion Playbooks**:
   - Recommends actionable retention tactics (e.g. "Schedule quarterly business review", "Offer free training session").
4. **Fleet Health Audit (`customer_id == "all"`)**:
   - Evaluates the entire customer base in a single batch pass.

---

## 🌐 API Endpoints & Triggers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agents/monitor-customer/{customer_id}` | Trigger health assessment for single customer or `"all"` |
| `GET` | `/api/customers` | List all accounts with health metrics |
| `GET` | `/api/customers/{id}` | Get account details, health score, and risk breakdown |
| `GET` | `/api/customers/{id}/health` | Retrieve historical health score trajectory |

---

## 🗄️ Database Interactions

* **`Customer`**:
  * `health_score` (Integer): 0–100 computed account score.
  * `churn_risk` (String): `low`, `medium`, `high`, `critical`.
  * `churn_probability` (Float): 0.0 to 1.0 probability.
  * `mrr` (Float): Monthly recurring revenue.
  * `additional_metadata` (JSON): Retention playbook, risk factors, and upsell suggestions.

---

## 🎨 Frontend Features (`frontend/src/features/customers/`)

* **Customer Health Table**: Health score progress bars, churn risk badges, and MRR metrics.
* **Health Distribution Chart**: Visual breakdown of account health tiers across the customer base.
* **Account Health Modal**: Detailed risk factor analysis, historical usage trends, and AI retention playbook.
* **Batch Fleet Audit**: Trigger fleet-wide health recalculation.
