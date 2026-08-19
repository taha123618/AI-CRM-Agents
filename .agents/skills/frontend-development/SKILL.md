---
name: frontend-development
description: Guide for developing React 19 + TypeScript frontend features, components, queries, and state.
---

# Frontend Development Skill

Use this skill when developing, refactoring, or extending the React + TypeScript frontend application.

## 🎨 Premium Neutral & Monochromatic Design System

The application strictly follows an enterprise editorial design language:

### 1. Color Palette Architecture
* **Primary Brand (Obsidian)**: `#1A1917`, `#252421`, `#35332F`, `#111110`
* **Accent (Burnished Champagne Gold)**: `#C7A66A`, `#806638`, `#DEC28C` (used sparingly for AI insights, selected indicators, and key metric badges)
* **Warm Neutral Light Mode**:
  - Application Background: `#F6F5F2`
  - Cards & Surfaces: `#FFFFFF`
  - Nested Sections: `#FAF9F6`
  - Subtle Borders: `#E9E6E0`
  - Typography: `#1A1917` (primary), `#5F5C56` (secondary), `#85817A` (metadata)
* **Charcoal Dark Mode**:
  - Dark Background: `#141311`
  - Dark Surface: `#1D1B18`
  - Dark Surface Secondary: `#25231F`
  - Dark Surface Hover: `#302D28`
  - Dark Borders: `#35322E`
  - Dark Typography: `#F5F3EE` (primary), `#B9B5AD` (secondary), `#807C75` (muted)
* **Muted Semantic Statuses**:
  - Success (Won / Completed): `#64705B` / `#EEF0EA` (light), `#1E231C` (dark)
  - Warning (Negotiation / Medium): `#9A6B2F` / `#FAF1E4` (light), `#2B2113` (dark)
  - Error (Lost / Critical): `#A64B45` / `#FAECEA` (light), `#2C1817` (dark)
  - Info / Neutral / New: `#5F5C56` / `#F0EFEB` (light), `#25231F` (dark)

### 2. Design Constraints
* **No Saturated Neons / Rainbow Gradients**: Never use purple/blue glowing orb backgrounds or heavy saturated buttons.
* **Minimal Elevations**: Cards use `border: 1px solid var(--border-subtle)` and `border-radius: 14px` with subtle `box-shadow: 0 1px 2px rgba(26,25,23,0.04)`.
* **Sidebar**: Deep obsidian `#1A1917` (`#141311` in dark) with `#35322E` active states and a subtle 2px champagne left indicator (`border-left: 2px solid #C7A66A`).

---

## 🏗️ Architectural Standards (Feature-Sliced Design)

The frontend uses a modern, scalable, feature-sliced architecture with 16 domain features:

```
frontend/src/
├── app/
│   ├── providers/               # AppProviders, QueryProvider, ToastProvider
│   └── router/                  # React Router v6 setup & layout route guards
├── components/                  # Cross-feature shared UI primitives
│   ├── ui/                      # Button, Card, Badge, Modal, Input, Table, Tabs, Select, Skeleton, Toast
│   ├── common/                  # ErrorBoundary, EmptyState, LoadingSpinner, StatCard, StatusIndicator
│   ├── forms/                   # Reusable LeadForm, DealForm, EmailAnalyzerForm, MeetingSchedulerForm
│   ├── tables/                  # Typed DataTable with sorting, searching, pagination
│   ├── charts/                  # PipelineChart, RevenueChart, HealthDistributionChart (Recharts)
│   └── layout/                  # Header, Sidebar, Container, AgentStatusPanel, Footer
├── features/                    # Feature modules containing all domain logic, components, and views
│   ├── dashboard/               # DashboardFeature (KPI metrics, agent activity feed, trigger banner)
│   ├── leads/                   # LeadsFeature (Qualification table, live scores, edit modals)
│   ├── deals/                   # DealsFeature (Drag-and-drop Kanban board, deal health score, probability)
│   ├── customers/               # CustomersFeature (Churn probability gauge, health monitoring, telemetry)
│   ├── journey/                 # JourneyFeature (Customer lifecycle pipeline, ARR radar, rescue playbooks)
│   ├── sequences/               # SequencesFeature (AI SDR cadences, dynamic lead enrollment, step copy)
│   ├── emails/                  # EmailsFeature (Smart inbox, emotion badges, recipient resolution, direct SMTP queue)
│   ├── meetings/                # MeetingsFeature (Agenda builder, auto-prep materials, attendees)
│   ├── analytics/               # AnalyticsFeature & ReportsFeature (Predictive forecasting & JSON export)
│   ├── agents/                  # AgentsFeature (Fleet control center, live WebSocket terminal stream)
│   ├── voice-ai/                # VoiceAIFeature (Call intelligence studio, real-time coaching, transcript modal)
│   ├── whatsapp/                # WhatsAppFeature (Omnichannel chat hub, AI auto-pilot, broadcast campaigns)
│   ├── forecasting/             # ForecastingFeature (Monte Carlo simulation, ARR trend, pipeline velocity)
│   ├── custom-agents/           # CustomAgentsFeature (No-code visual agent builder & testing playground)
│   ├── multi-language/          # MultiLanguageFeature (I18n, RTL/LTR layout sync, Translation manager)
│   ├── war-room/                # WarRoomFeature (Strategy Studio, SWOT battle-cards, Proposal generator, Automations)
│   ├── auth/                    # AuthLayout, PermissionGuard, useAuth, useAuthStore, SocialSSOButtons
│   └── settings/                # SettingsFeature & UserManagementTab (RBAC CRUD, role presets, pagination)
├── hooks/                       # Reusable TanStack Query & mutation hooks
├── lib/                         # API client (Axios), WebSocket stream client, Query configuration, Utilities
├── stores/                      # Zustand global UI (useUIStore), Agent event (useAgentStore), and Auth (useAuthStore)
├── types/                       # TypeScript interfaces matching backend models & endpoints (crm.types.ts)
└── pages/                       # Lightweight page composition files (LoginPage, RegisterPage, ForgotPasswordPage, etc.)
```

---

## 📐 Core Conventions & Rules

1. **Pages are Lightweight Composition**:
   - `src/pages/*.tsx` components should never hold inline complex business logic, query calls, or long JSX.
   - They strictly render their corresponding feature module from `src/features/*`.

2. **Feature Encapsulation**:
   - Features encapsulate domain logic, local modals, interactive elements, and state.
   - Subdirectories inside features: `api/`, `components/`, `types/`, and the main `XYZFeature.tsx`.

3. **Data Fetching with TanStack Query**:
   - All server queries and mutations use `useQuery` and `useMutation`.
   - On mutations, always invalidate relevant query keys:
     ```typescript
     const queryClient = useQueryClient();
     queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
     ```

4. **Real-time Telemetry (WebSocket + Event Bus)**:
   - Live events from the backend (`/ws`) stream directly into `useAgentStore`.
   - Visual tags (`NEW AI GENERATED`, `NEW AI DATA`, `NEW AI QUALIFIED`, `NEW AI ANALYZED`) clearly indicate newly computed AI data.

5. **Type Safety & Build Verification**:
   - Always run `npm run type-check` and `npm run build` after editing frontend components to ensure 0 TypeScript or bundler errors.
