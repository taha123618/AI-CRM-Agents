# 📡 API Reference & Architecture

The AI-Powered CRM backend exposes a high-performance REST and WebSocket API built with **FastAPI** and **Pydantic V2**.

---

## 🌐 Base URLs & Interactive Documentation

- **Development API Base**: `http://localhost:8000`
- **Swagger Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc API Specification**: `http://localhost:8000/redoc`
- **OpenAPI Schema JSON**: `http://localhost:8000/openapi.json`
- **WebSocket Gateway**: `ws://localhost:8000/ws`

---

## 🛣️ API Routers Index

| Router Prefix | Domain | Key Endpoints | Description |
|---|---|---|---|
| `/api/leads` | Leads | `GET`, `POST`, `PUT`, `DELETE`, `/{id}/qualify` | BANT scoring and lead lifecycle |
| `/api/deals` | Deals | `GET`, `POST`, `PUT`, `DELETE`, `/{id}/health` | Pipeline stage transitions and deal health |
| `/api/customers` | Customers | `GET`, `POST`, `PUT`, `DELETE` | Customer 360, ARR, and churn risk |
| `/api/meetings` | Meetings | `GET`, `POST`, `PUT`, `DELETE`, `/{id}/prep` | Pre-meeting intelligence briefings |
| `/api/emails` | Emails | `GET`, `POST`, `PUT`, `DELETE`, `/{id}/draft` | Sentiment scoring and AI draft generation |
| `/api/analytics` | Analytics | `GET /dashboard`, `GET /pipeline`, `GET /insights` | Executive KPIs and stage distributions |
| `/api/voice-calls` | Voice AI | `GET`, `POST`, `GET /{id}`, `POST /turn/analyze` | Real-time speech analysis and battle-cards |
| `/api/whatsapp` | WhatsApp | `GET /conversations`, `POST /send`, `POST /webhook` | Omnichannel chat and 24/7 AI Auto-Pilot |
| `/api/forecasting` | Forecasting | `POST /monte-carlo`, `GET /velocity`, `POST /save` | Stochastic Monte Carlo ARR simulations |
| `/api/custom-agents` | Custom Agents | `GET`, `POST`, `PUT`, `DELETE`, `/{id}/execute` | Dynamic prompt interpolation & tool invocation |
| `/api/war-room` | War Room | `GET /deals`, `GET /deals/{id}/strategy`, `POST /proposals/generate`, `CRUD /automations` | Consensus verdicts, SWOT, battle-cards, triggers |
| `/api/journey` | Journey | `GET /stages`, `GET /customers/{id}`, `POST /interventions/trigger`, `POST /interventions/{id}/resolve` | Lifecycle pipeline, churn radar, play dispatch |
| `/api/sequences` | SDR Sequences | `GET`, `POST`, `PUT`, `DELETE`, `/enroll`, `/generate-copy`, `/execute-step` | Multi-touch cadences, copy generation, execution |
| `/api/i18n` | Localization | `GET /languages`, `GET /translations/{code}`, `POST /translate/auto`, `GET/POST /preferences` | Translation catalog and RTL/LTR layout sync |

---

## ⚡ WebSocket Real-Time Event Stream (`/ws`)

Connect to the WebSocket endpoint for continuous live telemetry:

```typescript
const socket = new WebSocket('ws://localhost:8000/ws');

socket.onopen = () => {
  console.log('Connected to AI CRM Live Event Bus');
};

socket.onmessage = (event) => {
  const telemetry = JSON.parse(event.data);
  console.log('Agent Telemetry Event:', telemetry);
  // Expected types: "think", "tool_call", "agent_event", "status", "complete"
};
```

### Telemetry Event Payload Format
```json
{
  "event_type": "think",
  "agent": "LeadQualificationAgent",
  "data": {
    "thought": "Evaluating BANT criteria against annual revenue of $25M...",
    "timestamp": "2026-08-17T19:00:00Z"
  }
}
```

---

## 🔒 Standard Error Responses

All endpoints adhere to RFC 7807 problem details formatting:

```json
{
  "detail": "Customer with ID 00000000-0000-0000-0000-000000000000 not found"
}
```

Validation errors return structured 422 Unprocessable Entity payloads:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```
