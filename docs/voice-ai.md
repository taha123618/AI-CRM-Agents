# 🎙️ Voice AI Call Intelligence Studio

The Voice AI module provides real-time speech processing, buyer intent scoring, dynamic objection battle-cards, and post-call CRM action extraction.

---

## 🏗️ Architecture

```
Incoming Speech / Simulated Turn
             ↓
    FastAPI Router (/api/voice-calls)
             ↓
    VoiceCallAgent (agents/voice_call_agent.py)
             ↓
    • Buyer Intent Scoring (0-100)
    • Objection Detection
    • Dynamic Rep Battle-Cards
    • Sentiment Analysis
             ↓
    PostgreSQL (VoiceCall & VoiceCallTranscript Models)
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/voice-ai/)
```

---

## 🗄️ Database Models

### `VoiceCall`
* `id` (UUID): Primary key.
* `contact_name` (String): Contact / prospect name.
* `phone_number` (String): Caller or recipient phone number.
* `direction` (String): `inbound` or `outbound`.
* `status` (String): `in-progress`, `completed`, `failed`.
* `duration_seconds` (Integer): Call duration in seconds.
* `sentiment` (String): `positive`, `neutral`, `negative`.
* `buyer_intent_score` (Integer): Intent score (0–100).
* `summary` (Text): AI generated summary.
* `recording_url` (String): Audio recording location.
* `action_items` (JSON): Extracted follow-up tasks.
* `objections_handled` (JSON): Objections detected.
* `created_at` (DateTime): Record creation timestamp.

### `VoiceCallTranscript`
* `id` (UUID): Primary key.
* `call_id` (UUID, Foreign Key): Reference to parent `VoiceCall`.
* `speaker` (String): `rep` or `prospect`.
* `text` (Text): Spoken statement.
* `timestamp` (DateTime): Turn timestamp.
* `sentiment` (String): Sentiment of the turn.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/voice-calls` | List voice calls with search and filter parameters |
| `POST` | `/api/voice-calls` | Create a new call record |
| `GET` | `/api/voice-calls/stats` | Aggregated call metrics and objection counts |
| `GET` | `/api/voice-calls/{id}` | Get call details by ID |
| `DELETE` | `/api/voice-calls/{id}` | Delete a call record |
| `POST` | `/api/voice-calls/analyze-turn` | Real-time speech turn analysis & battle-card suggestions |
| `POST` | `/api/voice-calls/{id}/transcripts` | Add transcript turn |
| `GET` | `/api/voice-calls/{id}/transcripts` | Retrieve transcript dialogue |

---

## 🎨 Frontend Features (`frontend/src/features/voice-ai/`)

* **Stats KPI Strip**: Total calls, average intent score, positive sentiment %, and average call duration.
* **Call Records & Search**: Filter calls by direction and sentiment with live name/phone search.
* **Live Simulator**: Interactive speech turn simulator with buyer intent score bar and real-time coaching suggestions.
* **Analytics Tab**: Recharts objection frequency bar chart, sentiment distribution pie, and call direction breakdown.
* **Transcript Viewer Modal**: Complete speaker-bubbled dialogue with sentiment tags and coaching highlights.
