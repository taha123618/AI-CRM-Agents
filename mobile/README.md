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
│   ├── app/                      # Expo Router File-Based Routing (78 Static Routes)
│   │   ├── (auth)/               # Authentication, Provisioning & Recovery Suite
│   │   │   ├── login.tsx         # Tactical Login & SSO Gateways
│   │   │   ├── register.tsx      # Operator Provisioning & RBAC Level Assignment
│   │   │   ├── forgot-password.tsx# Cryptographic Recovery Token Dispatch
│   │   │   ├── reset-password.tsx# SHA-256 Token Overwrite Form
│   │   │   └── verify-email.tsx  # Mailbox Verification & Token Validation
│   │   ├── (tabs)/               # Bottom Tab Navigator (All 18 Features Integrated)
│   │   │   ├── _layout.tsx       # 5 Primary Bottom Bar Tabs + 13 In-Tab Feature Screens
│   │   │   ├── index.tsx         # Tactical Command Dashboard & Studio Launchers
│   │   │   ├── deals.tsx         # Deals & Pipeline Health Monitor (+ NEW DEAL)
│   │   │   ├── studios.tsx       # AI Command Studios & Feature Modules Hub
│   │   │   ├── activities.tsx    # Voice Notes & Activity Logging (Playback & Checklists)
│   │   │   ├── notifications.tsx # Real-Time Notification Center (Triage Tabs)
│   │   │   ├── leads.tsx         # In-Tab Leads & BANT Radar
│   │   │   ├── customers.tsx     # In-Tab Customer 360 & Churn Radar
│   │   │   ├── war-room.tsx      # In-Tab Deal War Room & Strategy Studio
│   │   │   ├── forecasting.tsx   # In-Tab Monte Carlo ARR Forecasting
│   │   │   ├── journey.tsx       # In-Tab Autonomous Customer Journey
│   │   │   ├── sequences.tsx     # In-Tab AI SDR Multi-Touch Sequences
│   │   │   ├── voice-ai.tsx      # In-Tab Voice AI Call Intelligence Studio
│   │   │   ├── whatsapp.tsx      # In-Tab WhatsApp Multi-Agent Hub
│   │   │   ├── emails.tsx        # In-Tab Autonomous Email Intelligence
│   │   │   ├── analytics.tsx     # In-Tab Executive Analytics & Velocity
│   │   │   ├── agents.tsx        # In-Tab AI Agents Swarm Fleet Monitor
│   │   │   ├── meetings.tsx      # In-Tab Meeting Scheduler & Dossiers
│   │   │   ├── custom-agents.tsx # In-Tab Custom Agent Builder
│   │   │   ├── workflows.tsx     # In-Tab Workflow Trigger Studio (Full CRUD)
│   │   │   ├── reports.tsx       # In-Tab Executive Reports & CSV Export
│   │   │   ├── multi-language.tsx# In-Tab Multi-Language Localization
│   │   │   ├── settings.tsx      # In-Tab Platform Governance & Security
│   │   │   └── explore.tsx       # In-Tab SaaS Showcase & ROI Calculator
│   │   ├── deals/
│   │   │   └── [id].tsx          # Deal Details & Dynamic Custom Fields
│   │   ├── leads/
│   │   │   └── index.tsx         # Standalone Leads & BANT Radar
│   │   ├── customers/
│   │   │   └── index.tsx         # Standalone Customer 360 & Churn Prevention Radar
│   │   ├── war-room/
│   │   │   └── index.tsx         # Standalone Deal War Room & Strategy Studio
│   │   ├── forecasting/
│   │   │   └── index.tsx         # Standalone Monte Carlo Revenue Forecasting
│   │   ├── journey/
│   │   │   └── index.tsx         # Standalone Customer Lifecycle Journey
│   │   ├── sequences/
│   │   │   └── index.tsx         # Standalone AI SDR Multi-Touch Outreach
│   │   ├── voice-ai/
│   │   │   └── index.tsx         # Standalone Voice AI Call Intelligence
│   │   ├── whatsapp/
│   │   │   └── index.tsx         # Standalone WhatsApp Business Multi-Agent Hub
│   │   ├── emails/
│   │   │   └── index.tsx         # Standalone Autonomous Email Intelligence
│   │   ├── analytics/
│   │   │   └── index.tsx         # Standalone Executive Analytics & Velocity
│   │   ├── agents/
│   │   │   └── index.tsx         # Standalone AI Agents Swarm Fleet Monitor
│   │   ├── meetings/
│   │   │   └── index.tsx         # Standalone Meeting Scheduler & Dossiers
│   │   ├── custom-agents/
│   │   │   └── index.tsx         # Standalone No-Code Custom Agent Builder
│   │   ├── multi-language/
│   │   │   └── index.tsx         # Standalone Multi-Language Localization
│   │   ├── reports/
│   │   │   └── index.tsx         # Standalone Executive Reports & CSV Exports
│   │   ├── settings/
│   │   │   ├── index.tsx         # Standalone Platform Governance & RBAC
│   │   │   └── profile.tsx       # Standalone User Profile & Cache Manager
│   │   ├── explore.tsx           # Standalone SaaS Showcase & ROI Calculator
│   │   ├── voice/
│   │   │   └── record.tsx        # Voice Audio Intelligence Studio
│   │   ├── unauthorized.tsx      # 403 Insufficient Privileges Tactical Screen
│   │   └── _layout.tsx           # Root Theme & Animated Splash Layout
115: │   ├── components/               # Reusable Tactical UI Components
116: │   │   ├── ui/
117: │   │   │   ├── Button.tsx        # Tactile Button with Haptics
118: │   │   │   ├── Card.tsx          # Tactical Card (highlight/danger)
119: │   │   │   ├── Badge.tsx         # Stage, Risk, and Health Badges
120: │   │   │   ├── Input.tsx         # Themed Form Input
121: │   │   │   ├── StatCard.tsx      # Field KPI Metric Telemetry Card
122: │   │   │   └── HealthIndicator.tsx# AI Health Progress Radar
123: │   │   ├── animated-icon.tsx     # Tactical Command Splash & Icon
124: │   │   └── dynamic-fields/       # Dynamic Custom Fields Engine
125: │   │       ├── DynamicFieldInput.tsx
126: │   │       └── DynamicFieldRenderer.tsx
127: │   ├── services/                 # Centralized Networking & Persistence
128: │   │   ├── api.ts                # Axios Client with JWT interceptors & Live Endpoints
129: │   │   └── offlineStorage.ts     # Local AsyncStorage & Action Queue Manager
130: │   ├── stores/                   # Zustand State Management
131: │   │   ├── authStore.ts
132: │   │   ├── dealsStore.ts
133: │   │   ├── leadsStore.ts
134: │   │   ├── customerStore.ts
135: │   │   ├── voiceNotesStore.ts
136: │   │   ├── notificationStore.ts
137: │   │   └── workflowStore.ts
138: │   ├── constants/                # Tactical Tokens & Endpoints
139: │   │   ├── theme.ts              # Void Black (#0B0C10) & Tactical Gold (#FFB800)
140: │   │   └── config.ts             # Environment Variables & Storage Namespaces
141: │   ├── hooks/                    # Custom Utility Hooks
142: │   │   ├── useTheme.ts
143: │   │   └── useOfflineSync.ts
144: │   └── types/                    # Shared Domain TypeScript Types
145: └── .agents/
146:     └── skills/                   # Mobile Development Agent Skills
147: ```
148: 
149: ---
150: 
151: ## 🛠️ Environment Configuration & Setup
152: 
153: ### 1. Configure Environment Variables
154: Copy the template and configure your backend endpoint:
155: ```bash
156: cd mobile
157: cp .env.example .env
158: ```
159: 
160: Contents of `.env`:
161: ```env
162: EXPO_PUBLIC_APP_ENV=development
163: EXPO_PUBLIC_API_URL=http://localhost:8000
164: EXPO_PUBLIC_WS_URL=ws://localhost:8000/ws
165: EXPO_PUBLIC_ENABLE_OFFLINE_MOCK=true
166: ```
167: 
168: ### 2. Install Dependencies
169: ```bash
170: bun install
171: ```
172: 
173: ### 3. Start the Development Server
174: ```bash
175: # Start Metro bundler with Expo CLI
176: bunx expo start
177: 
178: # Run on iOS Simulator (macOS)
179: bunx expo run:ios
180: 
181: # Run on Android Emulator
182: bunx expo run:android
183: 
184: # Run Web Preview
185: bunx expo start --web
186: ```
187: 
188: ---
189: 
190: ## 🧪 Verification Commands
191: 
192: ```bash
193: # Check Expo dependency health (21/21 passed)
194: bunx expo-doctor
195: 
196: # Strict TypeScript type check (0 errors)
197: npx tsc --noEmit
198: 
199: # Export static production bundle (42 routes compiled)
200: bunx expo export --platform web
201: ```

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

