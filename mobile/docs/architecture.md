# 🏛️ Field Sales Mobile App — Architecture & Technical Specifications

This document outlines the technical design, data flows, offline synchronization model, dynamic custom fields engine, and audio intelligence architecture for the **AI-Powered CRM Mobile App**.

---

## 1. System Topology & Data Synchronization

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
                    │      - Deals & Health Radar (/api/deals)         │
                    │      - Dynamic Custom Fields (/api/custom-fields)│
                    │      - Voice Call Intelligence (/api/voice-calls)│
                    │      - Multi-Agent Workflows (/api/workflows)    │
                    └──────────────────────────────────────────────────┘
```

---

## 2. Tactical Command Mobile Design System

The mobile application strictly inherits the enterprise **Tactical Command Design System**:
- **Palette**:
  - Void Black (`#0B0C10`): High-contrast dark background.
  - Matte Black / Card (`#12141A`): Elevated surface card containers.
  - Steel Border (`#2A323D`): Crisp geometric separation lines.
  - Tactical Gold / Amber (`#FFB800`): Primary accent, call-to-action buttons, key financial numbers.
  - Emerald Green (`#00FF9D`): High AI health scores (75–100%) and success telemetry.
  - Alert Red (`#FF2A54`): Stalled deals, critical risk warnings, and audio recording in-progress indicators.
  - Cyan (`#00E5FF`): Autonomous agent identifiers and secondary metadata.
- **Typography**:
  - Native monospaced font (`Courier New` on iOS / `monospace` on Android) applied to all financial values, timestamps, intent percentages, stage names, and IDs.
- **Haptic Tactility**:
  - Integrated with `expo-haptics` to provide subtle physical confirmation when starting/stopping voice recordings, advancing deal stages, and tapping primary buttons.

---

## 3. Dynamic Custom Fields Engine

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

## 4. Voice Field Notes & AI Intelligence Pipeline

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

## 5. Offline-First Resilience & Sync Queue

- **Reads**: If the network is unavailable or slow (>15s timeout), the app transparently serves cached deals and notes from `AsyncStorage`.
- **Writes**: Any mutation (stage progression, custom field edit, voice note creation) is stored into `OfflineStorage.enqueueOfflineAction()` with a unique ID and payload.
- **Auto-Sync**: `useOfflineSync()` runs every 30 seconds and processes pending actions sequentially upon network restoration.
