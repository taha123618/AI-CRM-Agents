---
name: frontend-development
description: Guide for developing React 19 + TypeScript frontend features, components, queries, state, and Tactical Command design system.
---

# Frontend Development Skill

Use this skill when developing, refactoring, or extending the React 19 + TypeScript frontend application.

## 🎨 Tactical Command Design System

The frontend strictly adheres to the **Tactical Command** design system:

### 1. Color Palette & Tokens
* **Void Black (`#0B0C10`)**: Deep black background for main canvas, input fields, terminal displays, and active chips (`hsl(220 22% 5%)`).
* **Matte Black (`#121212`)**: High-contrast dark gray surface for cards, modal dialogs, drawer panels, and secondary containers (`hsl(214 24% 16%)`).
* **Steel Border (`#3A4552`)**: Clean tactical border for frames, dividers, and container outlines (`hsl(215 19% 28%)`).
* **Tactical Amber / Gold Accent (`#FFB800`)**: High-visibility primary accent for primary buttons (`bg-[#FFB800] text-[#0B0C10] font-bold`), active tab indicators, focus rings, hover outlines, and key telemetry indicators (`hsl(43 100% 50%)`).
* **Signal Semantic Colors**:
  - **Destructive / Churn Warning (`#FF2A54`)**: Kill-shot highlights, revenue at risk, churn alerts (`hsl(348 100% 58%)`).
  - **Cyan (`#00E5FF`)**: Opportunities, expansion ARR, secondary channels.
  - **Purple (`#A855F7`)**: Multi-agent orchestration, autonomous fleets.

### 2. Geometry & Animations
* **Zero Border Radius**: Global `rounded-none`, `--radius: 0rem;`, `* { border-radius: 0 !important; }`. Never use rounded corners (`rounded-md`, `rounded-full`, etc.).
* **Monospace Typography**: `font-mono` applied to telemetry, tables, timestamps, IDs, financial metrics, currency notations, and charts.
* **Instant State Transitions**: Zero easing delay (`transition-none`, `transition-duration: 0ms !important;`).

---

## 🏗️ Architectural Standards (Feature-Sliced Design)

The frontend organizes code into feature domains across 18 specialized modules:

```
frontend/src/
├── app/
│   ├── providers/               # AppProviders, QueryProvider, ToastProvider
│   └── router/                  # React Router v6 setup & layout route guards
├── components/                  # Cross-feature shared UI primitives
│   ├── ui/                      # Button, Card, Badge, Modal, Input, Table, Tabs, Select, Skeleton, Toast
│   ├── common/                  # ErrorBoundary, EmptyState, LoadingSpinner, StatCard, StatusIndicator, GlobalSearchModal
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
│   ├── sequences/               # SequencesFeature (AI SDR cadences, dynamic lead enrollment, step copy, visual canvas)
│   ├── emails/                  # EmailsFeature (Smart inbox, emotion badges, recipient resolution, editable drafts, SMTP queue)
│   ├── meetings/                # MeetingsFeature (Agenda builder, auto-prep materials, attendees)
│   ├── analytics/               # AnalyticsFeature & ReportsFeature (Predictive forecasting & JSON export)
│   ├── agents/                  # AgentsFeature (Fleet control center, live WebSocket terminal stream)
│   ├── voice-ai/                # VoiceAIFeature (Call intelligence studio, Web Audio spectrum, transcript modal, live gateway)
│   ├── whatsapp/                # WhatsAppFeature (Omnichannel chat hub, AI auto-pilot, broadcast campaigns)
│   ├── forecasting/             # ForecastingFeature (Monte Carlo simulation, ARR trend, pipeline velocity)
│   ├── custom-agents/           # CustomAgentsFeature (No-code visual agent builder & testing playground)
│   ├── multi-language/          # MultiLanguageFeature (I18n, RTL/LTR layout sync, Translation manager)
│   ├── war-room/                # WarRoomFeature (Strategy Studio, SWOT battle-cards, Proposal generator, Automations)
│   ├── auth/                    # AuthLayout, PermissionGuard, useAuth, useAuthStore, SocialSSOButtons
│   └── settings/                # SettingsFeature (User Management CRUD, Webhooks, Task Queue, Observability, Audit Trail, Import/Export, Organizations, Custom Fields)
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
     // In mutation onSuccess:
     queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
     ```

4. **Real-time Telemetry (WebSocket + Event Bus)**:
   - Live events from the backend (`/ws`) stream directly into `useAgentStore`.
   - Visual tags (`NEW AI GENERATED`, `NEW AI DATA`, `NEW AI QUALIFIED`, `NEW AI ANALYZED`) clearly indicate newly computed AI data.

5. **Type Safety & Build Verification**:
   - Always run `npm run type-check`, `npm run test`, and `npm run build` after editing frontend components to ensure 0 TypeScript or bundler errors.

