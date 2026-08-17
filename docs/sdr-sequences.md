# 🚀 AI SDR Multi-Touch Outreach & Cadence Studio

The AI SDR Cadence module automates multi-channel outreach campaigns across Email, WhatsApp, and Voice AI briefings with dynamic database contact enrollment and real-time agent fleet execution.

---

## 🏗️ Architecture

```
CRM Contacts / Prospects
           ↓
   FastAPI Router (/api/sequences)
           ↓
   Outreach Sequence Engine
   • Step Scheduling (Day Delays)
   • Multi-Channel Support (Email, WhatsApp, Voice)
   • Dynamic Prompt Engineering for Copy Personalization
           ↓
   PostgreSQL Models (OutreachSequence & SequenceEnrollment)
           ↓
   Live Step Execution via Agent Fleet
   • EmailIntelligenceAgent
   • WhatsAppAgent
   • VoiceCallAgent
           ↓
   React Frontend (frontend/src/features/sequences/)
```

---

## 🗄️ Database Models

### `OutreachSequence` (`database/models.py`)
* `id` (UUID): Primary key.
* `name` (String): Sequence name.
* `status` (String): `active`, `paused`, `draft`.
* `channel` (String): `multichannel`, `email`, `whatsapp`, `voice`.
* `target_persona` (String): Persona targeted by cadence.
* `enrolled_count` (Integer): Total prospects enrolled.
* `replied_count` (Integer): Prospects who replied.
* `conversion_rate_pct` (Float): Conversion percentage.
* `steps` (JSONB): Array of steps with `step_number`, `channel`, `delay_days`, `subject`, `template`.
* `created_at`, `updated_at` (DateTime): Timestamps.

### `SequenceEnrollment` (`database/models.py`)
* `id` (UUID): Primary key.
* `sequence_id` (UUID, Foreign Key): Reference to parent sequence (`ondelete="CASCADE"`).
* `contact_id` (UUID, Foreign Key): Reference to target CRM contact (`ondelete="CASCADE"`).
* `status` (String): `active`, `completed`, `paused`.
* `current_step` (Integer): Current step in the sequence.
* `enrolled_at` (DateTime): Enrollment timestamp.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sequences` | List all SDR sequences and cadence performance analytics. |
| `GET` | `/api/sequences/prospects/available` | Fetch available CRM contacts from database for cadence enrollment. |
| `POST` | `/api/sequences` | Create a new multi-step outreach cadence in PostgreSQL. |
| `GET` | `/api/sequences/{id}` | Get sequence details and step configuration. |
| `PUT` | `/api/sequences/{id}` | Update sequence parameters or touchpoint steps. |
| `POST` | `/api/sequences/{id}/toggle` | Toggle sequence between `active` and `paused`. |
| `POST` | `/api/sequences/{id}/enroll` | Enroll contacts into the sequence, creating database enrollment records. |
| `POST` | `/api/sequences/{id}/generate-copy` | Generate high-converting AI personalized copy for a specific cadence step. |
| `POST` | `/api/sequences/{id}/execute-step` | Execute a cadence step live using `AgentOrchestrator` agent fleet. |
| `DELETE` | `/api/sequences/{id}` | Delete a sequence from PostgreSQL. |

---

## 💡 Frontend Features (`frontend/src/features/sequences/`)

* **Cadence Performance Cards**: Multi-channel overview with conversion metrics and step breakdown.
* **Dynamic Cadence Builder Modal** (`components/CreateSequenceModal.tsx`): Configure day delays, channel types, and template tokens.
* **Prospect Browser & Enrollment Modal** (`components/EnrollLeadsModal.tsx`): Search, select-all, and batch enroll contacts into active cadences.
* **Live Step Execution HUD**: Trigger live multi-agent execution with real-time feedback banner.
