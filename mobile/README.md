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

60: ```text
61: mobile/
62: ├── src/
63: │   ├── app/                      # Expo Router File-Based Routing (43 Static Routes)
64: │   │   ├── (auth)/               # Authentication, Provisioning & Recovery Suite
65: │   │   │   ├── login.tsx         # Tactical Login & SSO Gateways
66: │   │   │   ├── register.tsx      # Operator Provisioning & RBAC Level Assignment
67: │   │   │   ├── forgot-password.tsx# Cryptographic Recovery Token Dispatch
68: │   │   │   ├── reset-password.tsx# SHA-256 Token Overwrite Form
69: │   │   │   └── verify-email.tsx  # Mailbox Verification & Token Validation
70: │   │   ├── (tabs)/               # Bottom Tab Navigator
71: │   │   │   ├── _layout.tsx
72: │   │   │   ├── index.tsx         # Tactical Command Dashboard & Studio Launchers
73: │   │   │   ├── deals.tsx         # Deals & Pipeline Health Monitor (+ NEW DEAL)
74: │   │   │   ├── activities.tsx    # Voice Notes & Activity Logging (Playback & Checklists)
75: │   │   │   ├── workflows.tsx     # Workflow Trigger Studio (Full CRUD)
76: │   │   │   └── notifications.tsx # Real-Time Notification Center (Triage Tabs)
77: │   │   ├── deals/
78: │   │   │   └── [id].tsx          # Deal Details & Dynamic Custom Fields
79: │   │   ├── leads/
80: │   │   │   └── index.tsx         # Leads & BANT Radar (Qualify, WhatsApp, Convert to Deal)
81: │   │   ├── customers/
82: │   │   │   └── index.tsx         # Customer 360 & Churn Prevention Radar
83: │   │   ├── war-room/
84: │   │   │   └── index.tsx         # Deal War Room & Strategy Studio (Consensus, SWOT, Proposals)
85: │   │   ├── forecasting/
86: │   │   │   └── index.tsx         # Stochastic Monte Carlo Revenue Forecasting (P10/P50/P90)
87: │   │   ├── journey/
88: │   │   │   └── index.tsx         # Customer Lifecycle Journey & Churn Retention Studio
89: │   │   ├── sequences/
90: │   │   │   └── index.tsx         # AI SDR Multi-Touch Outreach Cadences (Email/WhatsApp/Voice)
91: │   │   ├── voice-ai/
92: │   │   │   └── index.tsx         # Voice AI Call Intelligence & Objection Battlecards
93: │   │   ├── whatsapp/
94: │   │   │   └── index.tsx         # WhatsApp Business Multi-Agent Hub (24/7 AI Auto-Pilot)
95: │   │   ├── emails/
96: │   │   │   └── index.tsx         # Autonomous Email Intelligence & Task Queue Outbound
97: │   │   ├── analytics/
98: │   │   │   └── index.tsx         # Executive Analytics, Velocity & Rep Leaderboards
99: │   │   ├── agents/
100: │   │   │   └── index.tsx         # AI Agents Swarm Fleet Monitor & Swarm Pulse
101: │   │   ├── meetings/
102: │   │   │   └── index.tsx         # Meeting Scheduler & AI Participant Briefing Studio
103: │   │   ├── custom-agents/
104: │   │   │   └── index.tsx         # No-Code Custom Agent Builder & Playground
105: │   │   ├── multi-language/
106: │   │   │   └── index.tsx         # Multi-Language Localization & RTL/LTR Synchronization
107: │   │   ├── reports/
108: │   │   │   └── index.tsx         # Executive Reports & Formula-Sanitized CSV Exports
109: │   │   ├── settings/
110: │   │   │   ├── index.tsx         # Platform Governance, RBAC Users, Webhooks & Audits Hub
111: │   │   │   └── profile.tsx       # User Profile, Server Diagnostics & Cache Manager
112: │   │   ├── explore.tsx           # Interactive SaaS Showcase & ROI Calculator Explorer
113: │   │   ├── voice/
114: │   │   │   └── record.tsx        # Voice Audio Intelligence Studio
115: │   │   ├── unauthorized.tsx      # 403 Insufficient Privileges Tactical Screen
116: │   │   └── _layout.tsx           # Root Theme & Animated Splash Layout
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

