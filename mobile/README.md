# 📱 AI CRM Field Sales Command Mobile App (React Native & Expo)

A production-ready, high-density **Field Sales Mobile Intelligence Application** powered by modern Expo (SDK 57), React Native 0.86, TypeScript, Zustand, and offline-first AsyncStorage persistence.

Tightly integrated with the **AI-Powered CRM Autonomous Multi-Agent Swarm** backend.

---

## 🚀 Key Features

1. **Tactical Field Command Dashboard**:
   - Live telemetry status bar with online/offline indicators and background action queue counter.
   - Real-time KPI telemetry (Pipeline ARR, Active Pipeline, Stalled Risks, AI Health Average).
   - Autonomous Field Hub with 1-tap shortcuts to **Leads (BANT)**, **Customer 360**, **Workflows**, and **Voice Recording**.
   - 1-Tap header navigation to User Profile and Storage Diagnostics.
2. **Deal Health Intelligence Radar & Creation**:
   - Multi-agent AI Health score tracking (0–100%).
   - Interactive `+ NEW DEAL` creation modal connected to `/api/deals`.
   - Stalled deal detection (10+ days without buyer communication).
   - Identified risk factor chips and next recommended AI strategic actions.
   - 1-Tap stage progression pipeline selector (Discovery → Qualification → Proposal → Negotiation → Closed Won).
3. **Leads & BANT Radar** (`/leads`):
   - Real-time lead scoring and tier classifications (`TIER 1 • HIGH INTENT`, `TIER 2 • NURTURE`, `TIER 3`).
   - 1-Tap AI Qualification via `LeadQualificationAgent` (`POST /api/leads/{id}/qualify`).
   - WhatsApp Auto-Pilot template action sheet (*Intro Briefing*, *Demo & Battle-Card*, *Executive Discovery*).
   - 1-Click Convert to Deal into active pipeline.
   - Interactive `+ NEW PROSPECT` field creation modal.
4. **Customer 360 & Churn Radar** (`/customers`):
   - Account ARR/MRR metrics and seat license usage telemetry.
   - Real-time churn probability radar and 1-tap autonomous retention playbooks.
5. **Voice Field Notes Studio & Activity Debriefs** (`/activities`, `/voice/record`):
   - Dedicated field audio debrief recorder with live waveform visualization and timer.
   - Entity association (link recorded audio directly to a Deal, Contact, or Customer).
   - Simulated audio playback bar with duration timer.
   - Automated AI speech transcript synthesis, buyer intent score calculation, and interactive action item checklists.
6. **Dynamic Custom Fields Engine**:
   - Live synchronization with `/api/custom-fields` and `CustomFieldDefinition` models.
   - Dynamic input controls for `text`, `number`, `select`, `boolean`, `date`, and `currency`.
   - In-app bulk editing and offline queued saving.
7. **Mobile Workflow Trigger Studio** (`/workflows`):
   - Real-time status of autonomous multi-agent triggers (`WhatsAppAgent`, `CustomerSuccessAgent`, `VoiceCallAgent`).
   - Full CRUD capabilities: Create trigger modal, view specs, toggle active/paused, and delete.
   - 1-Click "TEST TRIGGER" execution with simulated consensus telemetry modal.
8. **Real-Time Notification Center** (`/notifications`):
   - Alert triage across `ALL ALERTS`, `UNREAD`, `DEAL RISKS`, `LEAD ALERTS`, and `SWARM EVENTS`.
   - 1-Tap "MARK ALL READ" and deep linking to relevant CRM entities.
9. **User Profile & Diagnostics Studio** (`/settings/profile`):
   - RBAC Level 1 telemetry and JWT bearer session details.
   - Backend API base URL and WebSocket connection diagnostics.
   - Local Offline Cache telemetry with 1-Tap **Force Resync** and **Purge Cache**.
   - Secure session termination and token scrubbing.
10. **Offline-First Resilience**:
    - Dual-layer storage (Memory + AsyncStorage + Background Queue).
    - Mutations performed offline are queued locally and automatically synchronized with the server upon reconnection every 30 seconds.

---

## 🏗️ Architecture & Directory Structure

```text
mobile/
├── src/
│   ├── app/                      # Expo Router File-Based Routing (20 Routes)
│   │   ├── (auth)/               # Authentication & Role Presets
│   │   │   └── login.tsx
│   │   ├── (tabs)/               # Bottom Tab Navigator
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Tactical Command Dashboard
│   │   │   ├── deals.tsx         # Deals & Pipeline Health Monitor (+ NEW DEAL)
│   │   │   ├── activities.tsx    # Voice Notes & Activity Logging (Playback & Checklists)
│   │   │   ├── workflows.tsx     # Workflow Trigger Studio (Full CRUD)
│   │   │   └── notifications.tsx # Real-Time Notification Center (Triage Tabs)
│   │   ├── deals/
│   │   │   └── [id].tsx          # Deal Details & Custom Fields
│   │   ├── leads/
│   │   │   └── index.tsx         # Leads & BANT Radar (Qualify, WhatsApp, Convert to Deal)
│   │   ├── customers/
│   │   │   └── index.tsx         # Customer 360 & Churn Prevention Radar
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
│   │   ├── leadsStore.ts
│   │   ├── customerStore.ts
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
bunx expo run:ios

# Run on Android Emulator
bunx expo run:android

# Run Web Preview
bunx expo start --web
```

---

## 🧪 Verification Commands

```bash
# Check Expo dependency health (21/21 passed)
bunx expo-doctor

# Strict TypeScript type check (0 errors)
npx tsc --noEmit

# Export static production bundle (20 routes compiled)
bunx expo export --platform web
```

---

## 🐳 Docker Containerization & Deployment

### 1. Build and Run Mobile Production Web Distribution (Nginx)
```bash
# Build mobile container image
docker build -t ai-crm-mobile:latest ./mobile

# Run standalone on port 8081
docker run -d -p 8081:80 --name crm_mobile ai-crm-mobile:latest
```

### 2. Run via Unified Docker Compose
```bash
# Production stack (includes backend, worker, db, redis, frontend, and mobile)
docker-compose up -d --build mobile

# Development stack with live hot reload
docker-compose -f docker-compose.dev.yml up --build mobile
```

