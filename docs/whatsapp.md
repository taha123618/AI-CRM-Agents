# 💬 WhatsApp Business Multi-Agent Hub

The WhatsApp Business module enables omnichannel conversational customer engagement with 24/7 AI Auto-Pilot qualification, automated support, and broadcast campaign management.

---

## 🏗️ Architecture

```
Inbound Webhook / Outbound Message
             ↓
    FastAPI Router (/api/whatsapp)
             ↓
    WhatsAppAgent (agents/whatsapp_agent.py)
             ↓
    • Intent Classification
    • AI Auto-Pilot Contextual Reply
    • Lead Qualification Signals
    • Human Handoff Routing
             ↓
    PostgreSQL (WhatsAppConversation & WhatsAppMessage)
             ↓
    Redis Event Bus & WebSocket Broadcast (/ws)
             ↓
    React Frontend (frontend/src/features/whatsapp/)
```

---

## 🗄️ Database Models

### `WhatsAppConversation`
* `id` (UUID): Primary key.
* `phone_number` (String, Indexed): Contact phone number.
* `contact_name` (String): Contact name.
* `status` (String): `active`, `archived`, `handed-off`.
* `unread_count` (Integer): Number of unread messages.
* `ai_auto_pilot` (Boolean): 24/7 AI auto-reply toggle.
* `tags` (JSON): Custom labels (e.g., `VIP`, `Enterprise`, `Lead`).
* `last_message_at` (DateTime): Timestamp of the most recent message.
* `created_at` (DateTime): Creation timestamp.

### `WhatsAppMessage`
* `id` (UUID): Primary key.
* `conversation_id` (UUID, Foreign Key): Reference to parent `WhatsAppConversation`.
* `sender_type` (String): `agent`, `bot`, `prospect`.
* `text` (Text): Message content.
* `media_url` (String, Optional): Attached media URL.
* `status` (String): `sent`, `delivered`, `read`, `failed`.
* `intent` (String, Optional): Detected buyer/support intent.
* `created_at` (DateTime): Message timestamp.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/whatsapp/stats` | Active chats, bot rate, average response time, unread counts |
| `GET` | `/api/whatsapp/conversations` | List conversations with status filtering |
| `GET` | `/api/whatsapp/conversations/search` | Search conversations by name or phone |
| `POST` | `/api/whatsapp/send` | Send outbound agent/bot message |
| `POST` | `/api/whatsapp/broadcast` | Bulk broadcast template message to phone numbers |
| `POST` | `/api/whatsapp/webhook/simulate` | Inbound customer message webhook simulation |
| `GET` | `/api/whatsapp/conversations/{id}/messages` | Retrieve conversation message history |
| `PUT` | `/api/whatsapp/conversations/{id}/auto-pilot` | Toggle 24/7 AI Auto-Pilot on/off |
| `PUT` | `/api/whatsapp/conversations/{id}/tags` | Update conversation tags |
| `PUT` | `/api/whatsapp/conversations/{id}/archive` | Archive/unarchive a conversation |

---

## 🎨 Frontend Features (`frontend/src/features/whatsapp/`)

* **Stats KPI Strip**: Active conversations, bot auto-reply rate %, average response time, and total unread count.
* **Conversation Management**: Live sidebar search, unread count badges, and filter tabs.
* **Chat Timeline**: Interactive chat feed with message statuses (sent, delivered, read) and bot intent labels.
* **AI Auto-Pilot**: Toggleable switch per conversation to hand off between human rep and AI agent.
* **Modals**:
  * `NewConversationModal`: Initiate outbound messages to new prospects.
  * `BroadcastModal`: Select campaign templates and send bulk broadcasts.
* **Tags Editor**: Add/remove custom tags dynamically with instant persistence.
