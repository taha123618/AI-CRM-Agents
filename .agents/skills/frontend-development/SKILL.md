---
name: frontend-development
description: Guide for developing React 19 + TypeScript frontend features, components, queries, and state.
---

# Frontend Development Skill

Use this skill when developing, refactoring, or extending the React + TypeScript frontend application.

## 🏗️ Architectural Standards (Feature-Sliced Design)

The frontend uses a modern, scalable, feature-sliced architecture:

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
├── features/                    # Feature modules containing all business logic, queries, and views
│   ├── dashboard/               # DashboardFeature (KPI metrics, agent activity feed, trigger banner)
│   ├── leads/                   # LeadsFeature (Qualification table, live scores, edit modals)
│   ├── deals/                   # DealsFeature (Drag-and-drop Kanban board, deal health score, probability)
│   ├── customers/               # CustomersFeature (Churn probability gauge, health monitoring, telemetry)
│   ├── emails/                  # EmailsFeature (Smart inbox, emotion badges, editable AI reply drafts)
│   ├── meetings/                # MeetingsFeature (Agenda builder, auto-prep materials, attendees)
│   ├── analytics/               # AnalyticsFeature & ReportsFeature (Predictive forecasting & JSON export)
│   ├── agents/                  # AgentsFeature (Fleet control center, live WebSocket terminal stream)
│   └── multi-language/          # MultiLanguageFeature (I18n, RTL/LTR layout sync, Language & Translation Manager)
├── hooks/                       # Reusable TanStack Query & mutation hooks (use-leads, use-deals, etc.)
├── lib/                         # API client (Axios), WebSocket stream client, Query configuration, Utilities
├── stores/                      # Zustand global UI (useUIStore) and Agent event stores (useAgentStore)
├── types/                       # TypeScript interfaces matching backend models & endpoints (crm.types.ts)
└── pages/                       # Lightweight page composition files that render feature modules
```

---

## 📐 Core Conventions & Rules

1. **Pages are Lightweight Composition**:
   - `src/pages/*.tsx` components should never hold inline complex business logic, query calls, or long JSX.
   - They strictly render their corresponding feature module from `src/features/*`.

2. **Feature Encapsulation**:
   - Features encapsulate domain logic, local modals, interactive elements, and state.
   - Barrel index files (`src/features/*/index.ts`) export both `XYZFeature` and `XYZView` for seamless import flexibility.

3. **Data Fetching with TanStack Query**:
   - All server queries and mutations reside in `src/hooks/use-*.ts`.
   - On mutations, always invalidate or refetch queries:
     ```typescript
     const queryClient = useQueryClient();
     // In mutation onSuccess:
     queryClient.invalidateQueries({ queryKey: ['leads'] });
     ```

4. **Real-time Telemetry (WebSocket + Event Bus)**:
   - Live events from the backend (`/ws`) stream directly into `useAgentStore`.
   - Visual tags (`NEW AI GENERATED`, `NEW AI DATA`, `NEW AI QUALIFIED`, `NEW AI ANALYZED`) clearly indicate newly computed AI data.

5. **Type Safety & Build Verification**:
   - Always run `npm run type-check` and `npm run build` after editing frontend components to ensure 0 TypeScript or bundler errors.
