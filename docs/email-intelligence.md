# 📧 Email Intelligence Agent

The Email Intelligence Agent provides automated sentiment analysis, emotion detection, inbox auto-categorization, smart follow-up suggestions, and context-aware draft responses.

---

## 🏗️ Architecture

```
Incoming Customer Email / API Trigger
             ↓
    FastAPI Router (/api/emails or /api/agents/analyze-email)
             ↓
    EmailIntelligenceAgent (agents/email_intelligence_agent.py)
             ↓
    • Sentiment Analysis (positive, neutral, negative, urgent)
    • Intent Categorization (pricing, technical_issue, renewal, demo)
    • Key Themes & Action Extraction
    • AI Reply Drafting (customizable tone & style)
             ↓
    • If Negative/Urgent Sentiment: Alert Customer Success Agent
             ↓
    PostgreSQL (Email & Contact Models)
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/emails/)
```

---

## 🤖 Capabilities

1. **Sentiment & Emotion Scoring**:
   - Classifies customer email tone into `positive`, `neutral`, `negative`, and `urgent`.
   - Generates confidence score and emotional valence analysis.
2. **Context-Aware Reply Generation**:
   - Analyzes prior email thread history, company context, and deal stages.
   - Generates production-ready email responses matching sales or support tone.
3. **Smart Inbox Prioritization**:
   - Automatically prioritizes urgent customer requests and high-value prospect inquiries.
4. **Autonomous Cross-Agent Collaboration**:
   - If an incoming email expresses strong dissatisfaction or cancellation intent, triggers an automated churn risk update via the `CustomerSuccessAgent`.

---

## 🌐 API Endpoints & Triggers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agents/analyze-email` | Analyze email content for sentiment, intent, and draft response |
| `GET` | `/api/emails` | List inbox messages with sentiment filters |
| `GET` | `/api/emails/{id}` | Get email detail with sentiment analysis and AI draft |
| `POST` | `/api/emails` | Create or ingest incoming email record |

---

## 🗄️ Database Interactions

* **`Email`**:
  * `sentiment` (String): `positive`, `neutral`, `negative`, `urgent`.
  * `sentiment_score` (Float): Confidence metric (0.0 to 1.0).
  * `category` (String): `sales`, `support`, `billing`, `general`.
  * `draft_response` (Text): AI generated suggested response.
  * `analysis_metadata` (JSON): Extracted key points and intent tags.

---

## 🎨 Frontend Features (`frontend/src/features/emails/`)

* **Smart Inbox**: Multi-tab inbox view (All, Positive, Needs Attention, Urgent).
* **Sentiment Badges**: Color-coded sentiment badges with emotion tooltips.
* **AI Reply Drawer**: Review, edit, and send AI-suggested responses directly from the interface.
* **Batch Analysis**: Re-analyze inbox emails with a single click.
