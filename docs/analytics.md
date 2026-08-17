# 📊 Analytics Agent

The Analytics Agent aggregates CRM telemetry across leads, deals, emails, and accounts, synthesizes executive insights, computes forecasting trends, and detects pipeline anomalies.

---

## 🏗️ Architecture

```
CRM Telemetry Ingestion / API Trigger
             ↓
    FastAPI Router (/api/analytics or /api/agents/generate-dashboard)
             ↓
    AnalyticsAgent (agents/analytics_agent.py)
             ↓
    • Multi-Domain Metrics Aggregation
    • Conversion Funnel Analysis
    • Revenue Velocity & Bottleneck Detection
    • Executive Summary Generation
    • AI Recommendations for Sales Leadership
             ↓
    PostgreSQL (Read-only aggregation over all core models)
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/analytics/ & dashboard/)
```

---

## 🤖 Capabilities

1. **Executive KPI Synthesis**:
   - Aggregates ARR, MRR, win rates, average deal size, lead-to-opportunity velocity, and fleet health index.
2. **AI Narrative Insights**:
   - Generates natural-language summaries explaining revenue changes and pipeline risks.
3. **Bottleneck & Anomaly Detection**:
   - Detects abnormal slippage in specific pipeline stages or sudden spikes in negative email sentiments.
4. **Local Storage Report Persistence**:
   - Generated reports persist in client `localStorage` (`ai_crm_generated_reports`) for offline access.

---

## 🌐 API Endpoints & Triggers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agents/generate-dashboard` | Generate full executive AI analytics report |
| `GET` | `/api/analytics/dashboard` | Main CRM performance KPI metrics |
| `GET` | `/api/analytics/pipeline` | Pipeline breakdown, stage distribution, and velocity |

---

## 🎨 Frontend Features (`frontend/src/features/analytics/`)

* **Executive Dashboard**: Real-time KPI cards (MRR, Total Pipeline, Churn Rate, Lead Conversion).
* **Charts & Telemetry**: Recharts Pipeline distribution bar chart and ARR area trend.
* **AI Generated Reports**: Expandable executive summaries and recommendations.
* **JSON Export**: Export report datasets for external BI analysis.
