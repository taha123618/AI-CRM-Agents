# 📱 AI CRM Field Sales Command Mobile App (React Native & Expo)

A production-ready, high-density **Field Sales Mobile Intelligence Application** powered by modern Expo (SDK 57), React Native 0.86, TypeScript, Zustand, and offline-first AsyncStorage persistence.

Tightly integrated with the **AI-Powered CRM Autonomous Multi-Agent Swarm** backend.

---

## 🚀 Key Features

1. **Tactical Field Command Dashboard**:
   - Live telemetry status bar with online/offline indicators and background action queue counter.
   - Real-time KPI telemetry (Pipeline ARR, Active Pipeline, Stalled Risks, AI Health Average).
   - Priority attention deals and 1-tap quick action shortcuts.
   - 1-Tap header navigation to User Profile and Storage Diagnostics.
2. **Deal Health Intelligence Radar**:
   - Multi-agent AI Health score tracking (0–100%).
   - Stalled deal detection (10+ days without buyer communication).
   - Identified risk factor chips and next recommended AI strategic actions.
   - 1-Tap stage progression pipeline selector (Discovery → Qualification → Proposal → Negotiation → Closed Won).
3. **Voice Field Notes Studio**:
   - Dedicated field audio debrief recorder with live waveform visualization and timer.
   - Entity association (link recorded audio directly to a Deal, Contact, or Customer).
   - Automated AI speech transcript synthesis, buyer intent score calculation, and action item checklist extraction.
4. **Dynamic Custom Fields Engine**:
   - Live synchronization with `/api/custom-fields` and `CustomFieldDefinition` models.
   - Dynamic input controls for `text`, `number`, `select`, `boolean`, `date`, and `currency`.
   - In-app bulk editing and offline queued saving.
5. **Mobile Workflow Trigger Studio**:
   - Real-time status of autonomous multi-agent triggers (`WhatsAppAgent`, `CustomerSuccessAgent`, `VoiceCallAgent`).
   - Full CRUD capabilities: Create trigger modal, view specs, toggle active/paused, and delete.
   - 1-Click "TEST TRIGGER" execution with simulated consensus telemetry modal.
6. **Real-Time Notification Center**:
   - Alert triage across Lead Qualification alerts, Deal Risk warnings, and autonomous agent executions.
   - Direct integration with `/api/audit-logs` compliance trail.
   - Unread badge counters and deep linking to relevant CRM entities.
7. **User Profile & Diagnostics Studio** (`/settings/profile`):
   - RBAC Level 1 telemetry and JWT bearer session details.
   - Backend API base URL and WebSocket connection diagnostics.
   - Local Offline Cache telemetry with 1-Tap **Force Resync** and **Purge Cache**.
   - Secure session termination and token scrubbing.
8. **Offline-First Resilience**:
   - Dual-layer storage (Memory + AsyncStorage + Background Queue).
   - Mutations performed offline are queued locally and automatically synchronized with the server upon reconnection every 30 seconds.

---

## 🏗️ Architecture & Directory Structure

```text
mobile/
├── src/
│   ├── app/                      # Expo Router File-Based Routing (18 Routes)
│   │   ├── (auth)/               # Authentication & Role Presets
│   │   │   └── login.tsx
│   │   ├── (tabs)/               # Bottom Tab Navigator
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Tactical Command Dashboard
│   │   │   ├── deals.tsx         # Deals & Pipeline Health Monitor
│   │   │   ├── activities.tsx    # Voice Notes & Activity Logging
│   │   │   ├── workflows.tsx     # Workflow Trigger Studio (CRUD)
│   │   │   └── notifications.tsx # Real-Time Notification Center
│   │   ├── deals/
│   │   │   └── [id].tsx          # Deal Details & Custom Fields
│   │   ├── voice/
│   │   │   └── record.tsx        # Voice Audio Intelligence Studio
│   │   ├── settings/
│   │   │   └── profile.tsx       # Profile, Server Telemetry & Cache Manager
│   │   └── _layout.tsx           # Root Theme & Animated Splash Layout
│   ├── components/               # Reusable Tactical UI Components
│   │   ├── ui/
│   │   │   ├── Button.tsx        # Tactile Button with Haptics
│   │   │   ├── Card.tsx          # Tactical Card (highlight/danger)
│   │   │   ├── Badge.tsx         # Stage, Risk, and Health Badges
│   │   │   ├── Input.tsx         # Themed Form Input
│   │   │   ├── StatCard.tsx      # Field KPI Metric Telemetry Card
│   │   │   └── HealthIndicator.tsx# AI Health Progress Radar
│   │   ├── animated-icon.tsx     # Tactical Command Splash & Icon
│   │   └── dynamic-fields/       # Dynamic Custom Fields Engine
│   │       ├── DynamicFieldInput.tsx
│   │       └── DynamicFieldRenderer.tsx
│   ├── services/                 # Centralized Networking & Persistence
│   │   ├── api.ts                # Axios Client with JWT interceptors & Live Endpoints
│   │   └── offlineStorage.ts     # Local AsyncStorage & Action Queue Manager
│   ├── stores/                   # Zustand State Management
│   │   ├── authStore.ts
│   │   ├── dealsStore.ts
│   │   ├── voiceNotesStore.ts
│   │   ├── notificationStore.ts
│   │   └── workflowStore.ts
│   ├── constants/                # Tactical Tokens & Endpoints
│   │   ├── theme.ts              # Void Black (#0B0C10) & Tactical Gold (#FFB800)
│   │   └── config.ts             # Environment Variables & Storage Namespaces
│   ├── hooks/                    # Custom Utility Hooks
│   │   ├── useTheme.ts
│   │   └── useOfflineSync.ts
│   └── types/                    # Shared Domain TypeScript Types
└── .agents/
    └── skills/                   # Mobile Development Agent Skills
```

---

## 🛠️ Environment Configuration & Setup

### 1. Configure Environment Variables
Copy the template and configure your backend endpoint:
```bash
cd mobile
cp .env.example .env
```

Contents of `.env`:
```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000/ws
EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Start the Development Server
```bash
# Start Metro bundler with Expo CLI
bunx expo start

# Run on iOS Simulator (macOS)
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer bunx expo run:ios

# Run on Android Emulator
bunx expo run:android

# Run Web Preview
bunx expo start --web
```

---

## 🧪 Verification Commands

```bash
# Check Expo dependency health
bunx expo-doctor

# Strict TypeScript type check
npx tsc --noEmit

# Export static production bundle
bunx expo export --platform web
```
