---
name: frontend-development
description: Guide for developing React 19 + TypeScript frontend features, components, queries, and state.
---

# Frontend Development Skill

Use this skill when developing, refactoring, or extending the React + TypeScript frontend application.

## 🎨 Cyberpunk Stealth Luxury Design System

The frontend implements a dark-mode **"Cyberpunk Stealth Luxury"** design system engineered for maximum data density, instant interaction feedback, and sharp industrial aesthetics.

### 1. Color Palette & Semantic Tokens
- **Void Black (`#0D0D0D`)**: Matte obsidian background (`--background: 0 0% 5%`).
- **Dark Slate (`#1A1F26`)**: High-contrast card and panel fill (`--card: 215 19% 13%`).
- **Neon Crimson (`#FF2A54`)**: High-visibility primary brand and interactive accent (`--primary: 348 100% 58%`).
- **Muted Architectural Borders (`#252b36`)**: Ultra-thin, low-contrast 1px divisions (`--border: 215 14% 19%`).
- **Focus Glows**: Primary interactive elements trigger an outer glowing drop shadow (`shadow-[0_0_15px_rgba(255,42,84,0.4)]` / `.glow-primary`).

### 2. Geometry & Border Radius
- **Strict Right Angles**: No rounded pill shapes or soft corners (`rounded-none`, `--radius: 0rem`).
- Enforced globally across all components via Tailwind configuration and CSS resets (`* { border-radius: 0 !important; }`).

### 3. Typography & Data Density
- **Monospaced Data**: Monospaced font family (`JetBrains Mono`, `font-mono`) for all financial figures (ARR, MRR, deal values), pipeline win-rates, lead scoring numbers, telemetry timestamps, and chart tooltips.
- **Body & Headings**: `Inter` for clean structural readability.

### 4. Zero-Latency Interaction Model
- **Instant Toggles (`transition-none`)**: Disabled slow animations and soft transitions on interactive controls (`button, input, select, textarea, a { transition: none !important; }`).
- **Sharp Industrial Scrollbars**: 4px rectangular scrollbar tracks with instant `#FF2A54` thumb state.

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
│   ├── emails/                  # EmailsFeature (Smart inbox, emotion badges, recipient resolution, editable AI drafts, and direct SMTP queue delivery)
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
     // In mutation onSuccess:
     queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
     ```

4. **Real-time Telemetry (WebSocket + Event Bus)**:
   - Live events from the backend (`/ws`) stream directly into `useAgentStore`.
   - Visual tags (`NEW AI GENERATED`, `NEW AI DATA`, `NEW AI QUALIFIED`, `NEW AI ANALYZED`) clearly indicate newly computed AI data.

5. **Type Safety & Build Verification**:
   - Always run `npm run type-check` and `npm run test` after editing frontend components to ensure 0 TypeScript or bundler errors.

