# 🏛️ Field Sales Mobile App — Architecture & Technical Specifications

This document outlines the technical design, data flows, offline synchronization model, dynamic custom fields engine, voice intelligence, and omnichannel outreach architecture for the **AI-Powered CRM Mobile Application**.

---

## 1. System Topology & Dynamic Backend Integration

```
                    ┌──────────────────────────────────────────────────┐
                    │               Expo Mobile Client                 │
                    │        (React Native 0.86 + Expo SDK 57)         │
                    └─────────┬──────────────────────────────┬─────────┘
                              │                              │
                              │ 1. Read (Memory Cache)       │ 2. Offline Fallback
                              ▼                              ▼
                    ┌──────────────────┐           ┌───────────────────┐
                    │   Zustand Store  │           │   AsyncStorage    │
                    │  (Client State)  │           │  (Local Offline)  │
                    └─────────┬────────┘           └─────────┬─────────┘
                              │                              │
                              │ 3. API Dispatch (JWT Header) │ 4. Offline Queue Sync
                              ▼                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │          FastAPI Application Server (:8000)      │
                    │      - JWT Auth & Token Refresh (/api/auth)      │
                    │      - Deals & Pipeline Radar (/api/deals)       │
                    │      - Leads & BANT Qualification (/api/leads)   │
                    │      - Customer 360 & Churn (/api/customers)     │
                    │      - Dynamic Custom Fields (/api/custom-fields)│
                    │      - Voice Intelligence (/api/voice-calls)     │
                    │      - Multi-Agent Workflows (/api/war-room)     │
                    │      - Compliance & Audit Logs (/api/audit-logs) │
                    └──────────────────────────────────────────────────┘
```

---

## 2. Tactical Command Mobile Design System

The mobile application strictly inherits the enterprise **Tactical Command Design System**:
- **Color Tokens**:
  - Void Black (`#0B0C10`): High-contrast tactical dark background.
  - Matte Black / Card (`#12141A`): Elevated surface card containers.
  - Steel Border (`#2A323D`): Crisp geometric separation lines.
  - Tactical Gold / Amber (`#FFB800`): Primary accent, call-to-action buttons, key financial numbers.
  - Emerald Green (`#00FF9D`): High AI health scores (75–100%) and success telemetry.
  - Alert Red (`#FF2A54`): Stalled deals, critical risk warnings, and audio recording in-progress indicators.
  - Cyan (`#00E5FF`): Autonomous agent identifiers and secondary metadata.
- **Zero Border Radius / Sharp Styling**:
  - Crisp geometric edges with 2px borders, uppercase telemetry labels, and high contrast.
- **Typography**:
  - Native monospaced font (`Courier New` on iOS / `monospace` on Android) applied to all financial values, timestamps, intent percentages, stage names, and IDs.
- **Haptic Tactility**:
  - Integrated with `expo-haptics` to provide subtle physical confirmation when starting/stopping voice recordings, advancing deal stages, qualifying leads, and dispatching cadences.

---

## 3. Screen Structure & Navigation Matrix

```
mobile/src/app/
├── (auth)/
│   └── login.tsx               # Tactical Command Login with Instant RBAC Presets
├── (tabs)/
│   ├── index.tsx               # Command Dashboard with KPI telemetry & Autonomous Hub
│   ├── deals.tsx               # Pipeline Radar with Stage Tabs & "+ NEW DEAL" Modal
│   ├── activities.tsx          # Audio Intelligence Debriefs, Playback & Action Checklist
│   ├── workflows.tsx           # Autonomous Multi-Agent Swarm Triggers (Full CRUD)
│   └── notifications.tsx       # Real-Time Alert Radar with Triage Tabs & Mark All Read
├── deals/
│   └── [id].tsx                # Deal 360, Health Breakdown & Dynamic Custom Fields Engine
├── leads/
│   └── index.tsx               # Leads & BANT Radar (+ NEW LEAD, AI Qualify, WhatsApp Cadence, Convert to Deal)
├── customers/
│   └── index.tsx               # Customer 360 Radar (Active ARR & 1-Tap AI Retention Playbook)
├── voice/
│   └── record.tsx              # Field Audio Recording Studio & Intent Waveform Visualizer
└── settings/
    └── profile.tsx             # User Profile, RBAC Matrix, Server Diagnostics & Offline Cache Manager
```

---

## 4. Dynamic Custom Fields Engine

The mobile application dynamically evaluates and renders custom fields defined in the CRM backend without requiring mobile app updates or redeployments:

1. **Definition Fetching**: Fetches field schema from `GET /api/custom-fields?entity_type=deal`.
2. **Type Mapping**:
   - `text` -> Native TextInput with uppercase labels and borders.
   - `number` / `currency` -> Monospaced numeric keypad input with currency symbols.
   - `select` -> Modal picker listing allowed options with checkmark selection.
   - `boolean` -> Native tactile Switch toggle.
   - `date` -> Formatted date input.
3. **Data Binding**: Field values are bound to the deal's `custom_fields` dictionary and updated via `PUT /api/custom-fields/values/{entity_type}/{entity_id}` or queued offline.

---

## 5. Voice Field Notes & AI Intelligence Pipeline

1. **Audio Recording**:
   - Recording timer with MM:SS formatted clock.
   - Dynamic waveform visualization responding during live speech.
   - Microphone permission management and tactile Start/Stop controls.
2. **AI Post-Processing**:
   - Analyzes audio transcript for prospect sentiment and buyer intent score (0–100%).
   - Generates a 2-sentence executive summary.
   - Extracts actionable next steps into an interactive checklist.
3. **CRM Association**:
   - Links the recorded debrief directly to the active Deal or Contact.
   - Queues audio metadata to the CRM background Task Queue.

---

## 6. Omnichannel Outreach & Autonomous SDR Cadences

1. **Leads Radar & BANT Intelligence**:
   - Real-time lead scoring and tier classifications (`TIER 1 • HIGH INTENT`, `TIER 2 • NURTURE`, `TIER 3`).
   - 1-Tap AI Qualification via `LeadQualificationAgent` (`POST /api/leads/{id}/qualify`).
2. **WhatsApp Multi-Agent Auto-Pilot**:
   - Template action sheet providing instant personalized copy (*Intro Briefing*, *Demo & Battle-Card*, *Executive Discovery*).
   - 1-Tap outbound dispatch directly to WhatsApp.
3. **1-Click Convert to Deal**:
   - Promotes qualified leads directly into active pipeline deals with prefilled values.

---

## 7. Customer 360 & Churn Radar

1. **Active ARR Aggregation**: Real-time aggregation of active monthly recurring revenue.
2. **AI Churn Radar**: Dynamic health score meters, churn risk probability badges, and license usage percentages.
3. **Autonomous Retention Playbook**: 1-Tap button to dispatch `CustomerSuccessAgent` retention workflows on at-risk accounts.

---

## 8. Offline-First Resilience & Sync Queue

- **Reads**: If the network is unavailable or slow (>15s timeout), the app transparently serves cached deals, leads, and notes from `AsyncStorage`.
- **Writes**: Any mutation (stage progression, deal creation, custom field edit, voice note creation) is stored into `OfflineStorage.enqueueOfflineAction()` with a unique ID and payload.
- **Auto-Sync**: `useOfflineSync()` runs every 30 seconds and processes pending actions sequentially upon network restoration.

---

## 9. Containerization & DevOps Deployment

1. **Multi-Stage Production Container (`mobile/Dockerfile`)**:
   - **Stage 1 (Builder)**: Uses `oven/bun:1-alpine` to install dependencies and compile the 20 Expo Router routes into static assets via `bunx expo export --platform web`.
   - **Stage 2 (Runner)**: Uses `nginx:alpine` to serve static assets with gzip compression, security headers, and reverse proxy routes for `/api/`, `/health`, `/metrics`, and `/ws`.
2. **Development Container (`mobile/Dockerfile.dev`)**:
   - Runs Metro Bundler and Expo Web development server with source bind-mounts.
3. **CI/CD Automation (`.github/workflows/ci.yml`)**:
   - Automated `mobile-qa` workflow running `expo-doctor`, strict TypeScript type-checking, and static bundle export on every PR and commit.

