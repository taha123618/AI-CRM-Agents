# 📅 Meeting Scheduler Agent

The Meeting Scheduler Agent automates calendar coordination, generates context-aware meeting agendas, drafts executive briefing materials for sales reps, and creates follow-up action items.

---

## 🏗️ Architecture

```
Meeting Request / Contact Handoff / API Trigger
             ↓
    FastAPI Router (/api/meetings or /api/agents/schedule-meeting)
             ↓
    MeetingSchedulerAgent (agents/meeting_scheduler_agent.py)
             ↓
    • Smart Scheduling & Calendar Slot Match
    • Contextual Agenda Generation (topics, goals, time allocations)
    • Executive Briefing Pack & Prospect Background Notes
    • Pre-Meeting Questionnaires
    • Post-Meeting Follow-up Task Creation
             ↓
    PostgreSQL (Meeting, Contact, Deal Models)
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/meetings/)
```

---

## 🤖 Capabilities

1. **Context-Aware Briefing Generation**:
   - Synthesizes CRM history (deal stage, lead qualification notes, previous email sentiments) into a concise rep prep sheet.
2. **Automated Agenda Building**:
   - Creates structured, timed agendas tailored to meeting type (e.g. Discovery Call, Technical Demo, Negotiation Review).
3. **Follow-Up Automation**:
   - Extracts action items from meeting notes and assigns CRM tasks to team members.

---

## 🌐 API Endpoints & Triggers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agents/schedule-meeting` | Schedule meeting and generate prep materials |
| `GET` | `/api/meetings` | List upcoming and past calendar events |
| `GET` | `/api/meetings/{id}` | Get meeting details and briefing notes |
| `POST` | `/api/meetings` | Create a new calendar event |

---

## 🗄️ Database Interactions

* **`Meeting`**:
  * `title` (String): Meeting title.
  * `start_time` (DateTime): Start timestamp.
  * `end_time` (DateTime): End timestamp.
  * `status` (String): `scheduled`, `completed`, `cancelled`.
  * `prep_materials` (JSON): AI generated briefing pack and talking points.
  * `notes` (Text): Meeting summary and agenda items.
  * `attendees` (JSON): Attendee list and contact mappings.

---

## 🎨 Frontend Features (`frontend/src/features/meetings/`)

* **AI Calendar View**: Visual day/week schedule with meeting cards.
* **Meeting Prep Modal**: Detailed briefing sheet with prospect background, deal context, and proposed agenda.
* **Schedule Meeting Modal**: Quick scheduler with automatic prep generation.
