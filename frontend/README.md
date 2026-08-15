# AI-Powered CRM — Modern React + TypeScript Frontend

This directory contains the production-ready React + TypeScript frontend application for the AI-Powered CRM system.

## 🚀 Tech Stack & Features

* **Core Framework**: React 19 + TypeScript + Vite
* **Routing**: React Router v6 layout routes & page navigation
* **Styling**: Tailwind CSS + Glassmorphism modern design system
* **State Management**:
  * **TanStack React Query v5**: Server-state caching, automatic refetching & mutation management
  * **Zustand**: Client-side UI state (navigation, sidebar collapse, theme, search queries, modals)
* **Real-time Telemetry**: Custom WebSocket stream client with automatic reconnection & cache invalidation
* **Data Visualization**: Recharts (Pipeline distribution chart, Revenue/MRR growth area chart, Customer health distribution chart)
* **Forms & Modals**: Reusable forms (LeadForm, DealForm, EmailAnalyzerForm, MeetingSchedulerForm)
* **Typed Data Tables**: Reusable DataTable with sorting, searching, and pagination
* **Icons**: Lucide React

---

## 📁 Architecture & Folder Layout

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   │   ├── providers/                 # QueryProvider, ToastProvider, AppProviders
│   │   └── router/                    # React Router v6 layout (AppRouter & AppLayout)
│   ├── components/
│   │   ├── ui/                        # Button, Card, Badge, Modal, Input, Table, Tabs, Select, Skeleton, Toast
│   │   ├── common/                    # ErrorBoundary, EmptyState, LoadingSpinner, StatCard, StatusIndicator
│   │   ├── forms/                     # LeadForm, DealForm, EmailAnalyzerForm, MeetingSchedulerForm, LeadModal, DealModal, EmailAnalyzerModal, MeetingSchedulerModal
│   │   ├── tables/                    # Typed DataTable with sorting, searching, pagination
│   │   ├── charts/                    # PipelineChart, RevenueChart, HealthDistributionChart (Recharts)
│   │   └── layout/                    # Header, Sidebar, Container, AgentStatusPanel, Footer
│   ├── features/
│   │   ├── dashboard/                 # Dashboard view, KPI metrics, Agent Activity Feed
│   │   ├── leads/                     # Leads management, AI Lead Qualification trigger
│   │   ├── deals/                     # Deal Pipeline Kanban board, Stage transition, Deal health
│   │   ├── customers/                 # Customer success view, Churn risk indicators, Health metrics
│   │   ├── emails/                    # Smart Inbox, Sentiment analysis badges, AI Draft responses
│   │   ├── meetings/                  # AI Calendar, Meeting scheduler trigger
│   │   ├── analytics/                 # Comprehensive CRM metrics & Pipeline breakdown
│   │   └── agents/                    # Agent Control Center, execution triggers, LLM event stream
│   ├── hooks/
│   │   ├── use-leads.ts               # TanStack Query hooks for leads API & mutations
│   │   ├── use-deals.ts               # TanStack Query hooks for deals API & stage patch
│   │   ├── use-customers.ts           # TanStack Query hooks for customers API & health
│   │   ├── use-emails.ts              # TanStack Query hooks for emails API & analysis
│   │   ├── use-meetings.ts            # TanStack Query hooks for meetings API & scheduler
│   │   ├── use-analytics.ts           # TanStack Query hooks for dashboard & pipeline metrics
│   │   └── use-agents.ts              # TanStack Query hooks for triggering all 6 agents
│   ├── lib/
│   │   ├── api/                       # Axios / fetch API client with typed request/response
│   │   ├── websocket/                 # WebSocket client with auto-reconnect & cache invalidation
│   │   ├── query/                     # QueryClient configuration (staleTime, retries)
│   │   └── utils.ts                   # Classnames merge, formatters (currency, score, status colors)
│   ├── stores/
│   │   ├── use-ui-store.ts            # Sidebar collapse, active tab, theme, modal states
│   │   └── use-agent-store.ts         # Real-time agent execution logs & event feed
│   ├── types/
│   │   └── crm.types.ts               # TypeScript interfaces matching backend models & endpoints
│   ├── pages/                         # Route components for all views
│   ├── App.tsx                        # Root app container with ErrorBoundary & AppProviders
│   └── main.tsx                       # Vite application entry point
├── Dockerfile                         # Multi-stage Nginx build
├── nginx.conf                         # Production Nginx reverse proxy configuration
├── package.json                       # Dependencies & Scripts
├── tsconfig.json                      # Strict TypeScript configuration
└── vite.config.ts                     # Vite build configuration with API proxy setup
```

---

## 🛠️ Local Development

### 1. Standalone Development (Vite Dev Server)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:3000` with API proxying to `http://localhost:8000`.

### 2. TypeScript & Build Commands

```bash
npm run type-check   # Run strict TypeScript type check
npm run build        # Build optimized production bundle to dist/
npm run preview      # Preview production build locally
```

---

## 🐳 Docker Deployment

The frontend includes a multi-stage `Dockerfile` and production `nginx.conf`:

```bash
# Build and run using Docker Compose
docker-compose up -d --build
```

Access the UI at `http://localhost:3000`.
