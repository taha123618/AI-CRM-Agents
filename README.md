# 🤖 Next-Gen Autonomous AI-Powered CRM & Revenue Intelligence

<div align="center">

**Production-ready enterprise CRM powered by a 9-agent autonomous collaborative swarm, Voice AI Call Intelligence, WhatsApp Business Hub, Monte Carlo Stochastic Forecasting, Dynamic I18n, and No-Code Custom Agent Builder.**

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Tests](https://img.shields.io/badge/Tests-142%20Passing%20(100%25)-success?style=for-the-badge&logo=pytest&logoColor=white)](tests/)
[![Design](https://img.shields.io/badge/Design-Tactical%20Command-FFB800?style=for-the-badge)](design.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[📖 Documentation](docs/) • [🚀 Quickstart](QUICKSTART.md) • [✨ Features Checklist](Features.md) • [🏗️ Architecture](docs/ai-architecture.md) • [🔒 Security](docs/security.md) • [🎨 Design System](design.md)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Swarm Coordination](#-architecture--swarm-coordination)
  - [9 Autonomous AI Agents](#9-autonomous-ai-agents)
  - [System Architecture Diagram](#system-architecture-diagram)
- [Feature Suite](#-feature-suite)
  - [Core CRM Engine](#core-crm-engine)
  - [AI & Agentic Workflows](#ai--agentic-workflows)
  - [Voice AI Call Intelligence Studio](#voice-ai-call-intelligence-studio)
  - [WhatsApp Business Multi-Agent Hub](#whatsapp-business-multi-agent-hub)
  - [Advanced Monte Carlo Revenue Forecasting](#advanced-monte-carlo-revenue-forecasting)
  - [Dynamic Multi-Language Support (I18n)](#dynamic-multi-language-support-i18n)
  - [No-Code Custom Agent Builder](#no-code-custom-agent-builder)
  - [AI Deal War Room & Strategy Studio](#ai-deal-war-room--strategy-studio)
  - [Customer Journey & Churn Prevention Studio](#customer-journey--churn-prevention-studio)
  - [AI SDR Multi-Touch Outreach Cadences](#ai-sdr-multi-touch-outreach-cadences)
- [UI Components & Feature Modules](#-ui-components--feature-modules)
- [Key Metrics & Performance KPIs](#-key-metrics--performance-kpis)
- [Technology Stack](#-technology-stack)
- [Project Directory Layout](#-project-directory-layout)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A — Docker Quick Start (Recommended)](#option-a--docker-quick-start-recommended)
  - [Option B — Local Native Setup](#option-b--local-native-setup)
- [Environment Configuration](#-environment-configuration)
- [Developer CLI & Makefile](#-developer-cli--makefile)
- [Database Migrations](#-database-migrations)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Enterprise Security & Compliance](#-enterprise-security--compliance)
- [Centralized AI Assistant Rules](#-centralized-ai-assistant-rules)
- [Documentation Index](#-documentation-index)

---

## 📖 Overview

The **AI-Powered CRM** is an enterprise-grade autonomous customer relationship management platform where **9 specialized AI agents** orchestrate revenue operations end-to-end. Rather than relying on static CRM forms and manual data entry, the system autonomously:

* **Qualifies and enriches inbound leads** with real-time intent scoring and automated routing.
* **Analyzes sales calls in real-time** with buyer intent tracking, objection battle-cards, and post-call CRM action item synthesis.
* **Executes 24/7 omnichannel WhatsApp auto-pilot** conversations, qualification flows, and broadcast campaigns.
* **Simulates ARR revenue trajectories** using 1,000+ iteration stochastic Monte Carlo models (P10, P50, P90 confidence bounds).
* **Guards against account churn** with real-time lifecycle telemetry, revenue-at-risk radars, and 1-click autonomous retention playbooks.
* **Builds and executes multi-touch outreach cadences** across Email, WhatsApp, and Voice AI channels with dynamic step copy generation.
* **Enables no-code AI creation** with visual agent builder tooling, custom toolkits, and live prompt testing playgrounds.

---

## 🏗️ Architecture & Swarm Coordination

### 9 Autonomous AI Agents

```mermaid
graph TD
    Client[Web & WebSocket Clients] --> Gateway[FastAPI Gateway /ws]
    Gateway --> Orchestrator[Agent Orchestrator & Event Bus]
    
    Orchestrator --> A1[1. Lead Qualification Agent 🎯]
    Orchestrator --> A2[2. Email Intelligence Agent 📧]
    Orchestrator --> A3[3. Sales Pipeline Agent 💰]
    Orchestrator --> A4[4. Customer Success Agent 🎉]
    Orchestrator --> A5[5. Meeting Scheduler Agent 📅]
    Orchestrator --> A6[6. Analytics Agent 📊]
    Orchestrator --> A7[7. Voice Call Intelligence Agent 🎙️]
    Orchestrator --> A8[8. WhatsApp Business Agent 💬]
    Orchestrator --> A9[9. Custom Agent Builder 🔧]
    
    A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8 & A9 --> Storage[(PostgreSQL 14 + Redis Pub/Sub)]
    A1 & A2 & A3 & A4 & A5 & A6 & A7 & A8 & A9 --> AuditLogs[(Immutable Audit Logging)]
```

1. **Lead Qualification Agent** 🎯
   - Scores incoming leads automatically (0–100 ICP fit).
   - Routes high-value prospects to designated sales representatives.
   - Enriches contact profiles from public and corporate data sources.
   - Identifies high-velocity buying signals and intent spikes.

2. **Email Intelligence Agent** 📧
   - Generates hyper-personalized response drafts with contextual awareness.
   - Conducts multi-dimensional sentiment analysis on customer communications.
   - Auto-categorizes inbound emails and prioritizes urgent executive inquiries.
   - Recommends smart follow-up triggers based on conversation sentiment.

3. **Sales Pipeline Agent** 💰
   - Monitors deal progression across custom pipeline stages.
   - Predicts deal win and close probabilities with machine learning heuristics.
   - Identifies stalled opportunities and friction bottlenecks.
   - Recommends tactical win actions for account executives.

4. **Customer Success Agent** 🎉
   - Tracks real-time account health scores and decay telemetry.
   - Detects churn risks before contract renewal windows expire.
   - Triggers automated retention rescue workflows and intervention playbooks.
   - Uncovers expansion, upsell, and cross-sell opportunities.

5. **Meeting Scheduler Agent** 📅
   - Orchestrates context-aware calendar coordination.
   - Generates automated executive pre-meeting briefing dossiers.
   - Formulates post-meeting follow-up action items and task assignments.
   - Synchronizes agendas across calendar and CRM contact records.

6. **Analytics Agent** 📊
   - Powers real-time KPI dashboards and executive reports.
   - Delivers predictive revenue analytics and conversion insights.
   - Computes pipeline velocity, stage hazard rates, and rep performance.
   - Surfaces proactive business intelligence alerts.

7. **Voice Call Intelligence Agent** 🎙️
   - Performs real-time speech turn analysis and conversational dynamics scoring.
   - Calculates buyer intent scores (0–100) and sentiment trends.
   - Surfaces dynamic objection battle-cards and live rep coaching cues.
   - Extracts structured CRM action items and summaries post-call.

8. **WhatsApp Business Agent** 💬
   - Provides 24/7 autonomous AI auto-pilot customer interactions.
   - Classifies buyer intent and tags conversations automatically.
   - Manages personalized broadcast template messaging campaigns.
   - Handles seamless human agent handoffs and conversation archiving.

9. **Custom Agent Builder** 🔧
   - Offers a visual, no-code creator interface for specialized agents.
   - Configures custom system prompts, automation triggers, and toolkits.
   - Provides an interactive execution and prompt-engineering playground.
   - Manages agent lifecycle states (active, inactive, draft).

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      React 19 + TypeScript SPA                          │
│     (Feature-Sliced Design, TanStack Query v5, Zustand, Tailwind CSS)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / WebSocket (/ws)
┌────────────────────────────────────▼────────────────────────────────────┐
│                       FastAPI Application Gateway                       │
│    (Modular Routers, Pydantic V2 Validation, Audit Log Middleware)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    Agent Orchestrator & Event Bus                       │
│   (TraceMixin LLM Tracing, Live OpenAI/Anthropic + SmartFallbackLLM)    │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                           │
┌──────────────▼──────────────┐             ┌──────────────▼──────────────┐
│       PostgreSQL 14+        │             │           Redis 7           │
│   SQLAlchemy 2.0 ORM Models │             │   Pub/Sub Agent Event Bus   │
│   Alembic Schema Migrations │             │   Real-Time Response Cache  │
└─────────────────────────────┘             └─────────────────────────────┘
```

---

## 🚀 Feature Suite

### Core CRM Engine
- **Full Contact & Account Management**: Comprehensive profiles, company hierarchies, and activity history.
- **Visual Deal Pipeline**: Drag-and-drop Kanban and tabular views with real-time deal health scoring.
- **Task & Activity Tracking**: Automated logging of calls, emails, meetings, and system notes.
- **Audit Logging Subsystem**: Immutable compliance audit trail tracking all create, update, delete, and stage transition actions.

### AI & Agentic Workflows
- **Autonomous Lead Nurturing**: Intelligent lead scoring, qualification badges, and automated sales handoffs.
- **Intelligent Email Copilot**: Sentiment extraction, prioritized inbox views, and automated reply generation.
- **Autonomous Event Coordination**: Real-time event publishing and subscriber dispatch across agent swarms.
- **Smart Fallback Architecture**: Seamless offline operation with `SmartFallbackLLM` when API keys are not supplied.

### Voice AI Call Intelligence Studio
- **Real-Time Speech Turn Analysis**: Analyzes caller vs. agent dialogue with buyer intent scoring.
- **Dynamic Objection Battle-Cards**: Live competitive displacement cards and counter-arguments.
- **Interactive Transcript Viewer**: Full speaker-separated call playback with sentiment highlights.
- **Automated CRM Synthesis**: Instant extraction of next steps, commitments, and summary bullets.

### WhatsApp Business Multi-Agent Hub
- **24/7 AI Auto-Pilot**: Autonomous customer support and lead qualification over WhatsApp.
- **Broadcast Campaigns**: Template message broadcasting with audience filtering and delivery tracking.
- **Conversation Management**: Omnichannel search, intent tagging, unread badges, and conversation archiving.
- **Live Auto-Pilot Toggles**: Per-conversation manual takeover with single-click AI toggling.

### Advanced Monte Carlo Revenue Forecasting
- **Stochastic Simulations**: 1,000+ iteration Monte Carlo simulations with P10, P50, and P90 confidence bounds.
- **ARR Progression Tracking**: Monthly target vs. projected ARR growth with delta tracking.
- **Pipeline Stage Velocity**: Stage duration analytics and hazard conversion matrix.
- **Scenario Comparison**: Side-by-side executive scenario comparison tables and grouped visual charts.

### Dynamic Multi-Language Support (I18n)
- **Bidirectional RTL/LTR Sync**: Native support for RTL languages (Urdu, Arabic) and LTR languages (English, Spanish, etc.).
- **Translation Management**: Single-key inline editing, bulk translation updates, and JSON import/export.
- **Live Locale Switching**: Instant UI localization without page refreshes.

### No-Code Custom Agent Builder
- **Visual Creator Interface**: Build custom AI agents with drag-and-drop tool assignment.
- **Custom Toolkits & Triggers**: Bind database queries, email dispatchers, and webhooks to agent prompts.
- **Interactive Playground**: Test agent execution in real-time with custom test payload inputs.

### AI Deal War Room & Strategy Studio
- **Multi-Agent Consensus**: Cross-agent alignment verdicts combining pipeline, lead, voice, and support signals.
- **Account SWOT Matrix**: Dynamic Strengths, Weaknesses, Opportunities, and Threats quadrant mapping.
- **Competitor Battle-Cards**: Live objection handlers and kill-shot displacement strategies.
- **1-Click Smart Proposal Studio**: Automated enterprise proposal builder with tiered pricing, SLA terms, and e-signature links.
- **Workflow Automations**: Full CRUD multi-agent trigger rules with live orchestration execution.

### Customer Journey & Churn Prevention Studio
- **5-Stage Lifecycle Pipeline**: Telemetry across `Onboarding`, `Adoption`, `Expansion`, `Renewal`, and `At-Risk`.
- **Revenue-at-Risk Radar**: Real-time health decay monitoring and churn probability visualization.
- **1-Click Retention Interventions**: Autonomous playbooks (Executive Sponsor Check-in, Feature Coaching, NPS Survey) powered by `CustomerSuccessAgent`.

### AI SDR Multi-Touch Outreach Cadences
- **Omnichannel Cadence Builder**: Multi-step outreach sequences combining Email, WhatsApp, and Voice AI briefing steps.
- **Cohort Lead Enrollment**: 1-click database contact search and bulk cadence enrollment.
- **Dynamic Step Copy Generator**: AI prompt-engineered personalization targeting prospect pain points and value drivers.

### Enterprise Authentication, RBAC & Email Infrastructure
- **Enterprise Security Suite**: JWT rotation, HTTP-only cookie sessions, brute-force lockouts, social SSO (Google & Microsoft).
- **Fine-Grained Role-Based Access Control**: Pre-defined role permissions (`admin`, `sales`, `support`, `auditor`) and custom user permission override matrix.
- **Super Admin Protection & Governance**: Public registration restrictions (only sales/support/auditor allowed) with seeded default super admin (`admin@gmail.com`) and full user management CRUD in `/settings`.
- **Gmail SMTP & Background Delivery Queue**: Asynchronous, non-blocking transactional email delivery on port 587 with STARTTLS, RFC-5321 envelope sender parsing, responsive dark-mode HTML templates, and exponential backoff retry daemon (`worker.py`).
- **Zero-Enumeration Password Recovery**: Single-use DB-hashed recovery tokens with clean expiration tracking and non-revealing endpoints.

---

## 🎨 UI Components & Feature Modules

| Module | Route / Feature | Primary Functionality |
|---|---|---|
| 🔐 **Authentication** | `features/auth` | Login, registration, password recovery, SSO callbacks, and PermissionGuard |
| 📊 **Dashboard** | `features/dashboard` | Real-time ARR metrics, agent activity stream, and pipeline overview |
| 👥 **Contacts** | `features/contacts` | Contact directory, lead scores, profile enrichment, and activity history |
| 💼 **Deals** | `features/deals` | Visual deal pipeline, health scores, close probability, and stage transitions |
| ⚔️ **War Room** | `features/war-room` | Strategy studio, multi-agent consensus, SWOT matrix, proposal builder |
| 🚀 **Sequences** | `features/sequences` | AI SDR outreach cadences, cohort enrollment, and AI copy generation |
| 🧭 **Customer Journey** | `features/journey` | 5-stage lifecycle pipeline, ARR radar, churn prediction, retention rescue |
| 📥 **Inbox** | `features/inbox` | AI-prioritized email inbox, sentiment badges, and smart reply drafts |
| 📅 **Calendar** | `features/calendar` | Smart meeting scheduling, agenda prep, and follow-up tracking |
| 📈 **Analytics** | `features/analytics` | Deep performance insights, conversion funnels, and system telemetry |
| 🎙️ **Voice AI** | `features/voice-ai` | Call intelligence studio, transcript viewer, and objection battle-cards |
| 💬 **WhatsApp** | `features/whatsapp` | Omnichannel chat hub, broadcast campaigns, and 24/7 AI auto-pilot |
| 🔮 **Forecasting** | `features/forecasting` | Monte Carlo ARR simulations (P10/P50/P90) and stage velocity matrix |
| 🔧 **Custom Agents** | `features/custom-agents` | No-code agent builder, trigger configuration, and live testing sandbox |
| 🌐 **Multi-Language** | `features/multi-language` | Translation key manager, RTL/LTR layout synchronization |
| ⚙️ **Settings & Users** | `features/settings` | Super Admin user management CRUD, role presets, LLM provider settings |

---

## 📊 Key Metrics & Performance KPIs

- **Lead Conversion Rate**: Percentage of inbound leads successfully converted to pipeline deals.
- **Average Sales Cycle Velocity**: Time elapsed from lead qualification to closed-won milestone.
- **Customer Lifetime Value (LTV)**: Projected aggregate revenue per account.
- **Churn Prediction Accuracy**: Predictive precision of `CustomerSuccessAgent` retention alerts.
- **Voice AI Buyer Intent Score**: 0–100 score quantifying buyer commitment and purchase readiness.
- **WhatsApp Auto-Pilot Resolution Rate**: Percentage of customer inquiries resolved without human intervention.
- **Monte Carlo Forecast Confidence**: P10 (conservative), P50 (expected), and P90 (optimistic) ARR bands.
- **Operational DB Latency**: Live millisecond telemetry across database read/write queries.

---

## 🛠️ Technology Stack

```
Frontend:          React 19 • TypeScript • Vite • Tailwind CSS • TanStack React Query v5 • Zustand • Recharts • Lucide Icons
Backend:           Python 3.9+ • FastAPI • Uvicorn / Gunicorn • Pydantic V2 • LangChain
Database:          PostgreSQL 14+ • SQLAlchemy 2.0 ORM • Alembic Migrations
Messaging & Queue: Redis 7 (Pub/Sub Event Bus & Task State) • WebSockets (/ws) • Async Worker Daemon (worker.py)
Email Delivery:    Gmail SMTP (STARTTLS 587) • Multi-part MIME HTML Templates • Exponential Backoff Retries
AI Integration:    Live OpenAI (GPT-4o) • Live Anthropic (Claude 3.5 Sonnet) • SmartFallbackLLM
DevOps & Tooling:  Docker (Multi-Stage) • Docker Compose • GitHub Actions CI/CD • Trivy Security Scanner • Nginx
Quality Gates:     pytest • pytest-asyncio • Vitest • Black • Flake8 • Mypy • TypeScript
```

---

## 📁 Project Directory Layout

```
ai-crm-agents/
├── agents/                       # 9 Autonomous AI Agents (Inheriting BaseAgent + TraceMixin)
│   ├── base_agent.py             #   Shared BaseAgent class with transparent LLM tracing
│   ├── lead_qualification_agent.py
│   ├── email_intelligence_agent.py
│   ├── sales_pipeline_agent.py
│   ├── customer_success_agent.py
│   ├── meeting_scheduler_agent.py
│   ├── analytics_agent.py
│   ├── voice_call_agent.py       #   Speech turn analysis, intent scoring, objection coaching
│   ├── whatsapp_agent.py         #   24/7 WhatsApp AI auto-pilot & broadcast agent
│   └── custom_agent_builder.py   #   Dynamic no-code agent execution engine
│
├── api/                          # FastAPI REST & WebSocket Routers
│   ├── leads.py                  #   Leads CRUD, qualification, and audit logging
│   ├── deals.py                  #   Deals CRUD, pipeline stages, health scoring
│   ├── customers.py              #   Customer accounts, MRR, churn health
│   ├── emails.py                 #   Email intelligence, sentiment analysis, drafts
│   ├── meetings.py               #   Meeting coordination & automated briefing dossiers
│   ├── analytics.py              #   Dashboard metrics, pipeline funnels, system telemetry
│   ├── audit_logs.py             #   Compliance audit trail REST queries & statistics
│   ├── voice_calls.py            #   Voice AI call intelligence, transcripts, coaching
│   ├── whatsapp.py               #   WhatsApp chat, broadcast templates, auto-pilot toggle
│   ├── forecasting.py            #   Monte Carlo ARR simulations & velocity matrix
│   ├── custom_agents.py          #   Custom agent CRUD, execution sandbox, toolkits
│   ├── war_room.py               #   Deal strategy studio, SWOT matrices, proposals, rules
│   ├── journey.py                #   Customer lifecycle stages & retention interventions
│   ├── sequences.py              #   AI SDR multi-touch cadences & step generation
│   └── i18n.py                   #   Dynamic translation keys & language settings
│
├── services/                     # Core Business Logic Layer
│   ├── audit_service.py          #   Central audit logging helper
│   ├── forecasting_service.py    #   Stochastic Monte Carlo simulation engine
│   └── i18n_service.py           #   Translation management & RTL/LTR detection
│
├── database/                     # PostgreSQL Database Layer
│   ├── models.py                 #   SQLAlchemy 2.0 ORM models (17 tables)
│   ├── connection.py             #   Engine setup, session factories, get_db dependency
│   └── schema.sql                #   Raw SQL schema definitions
│
├── workflows/                    # Agent Swarm Coordination
│   └── orchestrator.py           #   Central AgentOrchestrator & Redis event bus
│
├── frontend/                     # Production React 19 + TypeScript Application
│   ├── src/
│   │   ├── features/             #   15 feature domains (war-room, journey, sequences, etc.)
│   │   ├── components/           #   Reusable UI elements, cards, modals, layout
│   │   ├── hooks/                #   TanStack React Query hooks
│   │   ├── stores/               #   Zustand client state stores
│   │   └── types/                #   TypeScript domain interfaces
│   ├── Dockerfile                #   Multi-stage production build (Node + Nginx)
│   ├── nginx.conf                #   Production reverse proxy config
│   └── vite.config.ts            #   Vite build tooling and test configuration
│
├── .agents/                      # AI Coding Assistant Knowledge & Skills
│   ├── AGENTS.md                 #   Single source of truth for architectural guidelines
│   ├── skills/                   #   8 specialized skill definitions
│   └── scripts/sync_rules.py     #   Tool rule synchronization utility
│
├── .github/workflows/            # CI/CD Workflows
│   ├── ci.yml                    #   Lint, Pytest, Vitest, Type-check, Docker build
│   └── docker-build.yml          #   Trivy container security vulnerability scanner
│
├── docs/                         # Comprehensive Documentation Hub
├── main.py                       # FastAPI application entry point
├── run.py                        # Local development runner
├── Makefile                      # Developer command-line interface
├── Dockerfile                    # Backend multi-stage production container
├── docker-compose.yml            # Production container stack
├── docker-compose.dev.yml        # Development container stack (hot-reload)
├── requirements.txt              # Python production dependencies
└── alembic.ini                   # Database migration configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker Option**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24.0+
- **Local Native Option**: Python 3.9+, Node.js 20+, PostgreSQL 14+, Redis 7+

---

### Option A — Docker Quick Start (Recommended)

Start the entire production or development stack with a single command:

```bash
# 1. Clone repository
git clone https://github.com/your-org/ai-crm-agents.git
cd ai-crm-agents

# 2. Configure environment
cp .env.example .env

# 3. Launch development stack with hot-reload
docker-compose -f docker-compose.dev.yml up --build

# OR launch production optimized stack
docker-compose up -d --build
```

#### Application Endpoints:
- 🖥️ **React Web Application**: `http://localhost:3000` (Dev) / `http://localhost:80` (Prod)
- ⚡ **FastAPI Backend API**: `http://localhost:8000`
- 📚 **Interactive Swagger API Docs**: `http://localhost:8000/docs`
- 📖 **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### Option B — Local Native Setup

```bash
# 1. Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis connection strings

# 4. Apply database migrations
alembic upgrade head

# 5. Start FastAPI backend server
python run.py

# 6. In a separate terminal, start frontend application
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and adjust the variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://crm_user:crm_password@localhost:5432/ai_crm` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | OpenAI API key (optional if using Anthropic) | — |
| `OPENAI_MODEL` | OpenAI LLM model identifier | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional if using OpenAI) | — |
| `ANTHROPIC_MODEL` | Anthropic LLM model identifier | `claude-3-5-sonnet-20241022` |
| `SECRET_KEY` | JWT authentication signing secret | `your-super-secret-key-change-in-production` |
| `DEBUG` | Enable FastAPI debug mode | `True` |
| `GUNICORN_WORKERS` | Number of Gunicorn worker processes | `4` |
| `LOG_LEVEL` | Application logging verbosity | `INFO` |

> 💡 **Smart Fallback Note**: When no `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is provided, the platform automatically engages `SmartFallbackLLM`. All 9 agents, proposal engines, and forecast models remain 100% operational with contextually accurate responses.

---

## ⚡ Developer CLI & Makefile

We provide a streamlined developer interface via `Makefile`:

```bash
# 🐳 Docker Workflows
make dev-build       # Build and start development containers with hot-reload
make dev-logs        # Follow container logs
make dev-shell       # Open bash shell inside backend container
make prod-build      # Build and launch production detached containers
make prod-logs       # Follow production logs

# 🗄️ Database Management
make migrate         # Apply pending Alembic migrations
make migrate-create msg="add audit table"  # Create new autogenerated migration
make db-seed         # Seed database with realistic enterprise CRM demo data
make db-backup       # Create automated PostgreSQL timestamped dump

# 🧪 Testing & Quality Gates
make test            # Run backend Pytest suite
make quality         # Run Black formatting, Flake8 linting, and Mypy type-checking
make ci-qa           # Full local CI quality gate (Lint + Pytest + Frontend Typecheck + Vitest)
```

---

## 🗄️ Database Migrations

Database schema changes are tracked using **Alembic**:

```bash
# Create a new migration after updating database/models.py
alembic revision --autogenerate -m "Add new column to deals"

# Apply all migrations to the latest revision
alembic upgrade head

# View current database revision
alembic current

# Roll back the latest migration
alembic downgrade -1
```

---

## 🧪 Testing & Quality Assurance

The repository maintains strict **100% passing automated test coverage** across both backend and frontend layers:

```bash
# 1. Run all Backend Pytest Suites (96 tests)
PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v

# 2. Run all Frontend Vitest Suites (33 tests)
cd frontend && npm run test

# 3. Run Frontend TypeScript Type Check
cd frontend && npm run type-check

# 4. Build Production Frontend Bundle
cd frontend && npm run build
```

**Quality Status:** **129 / 129 Automated Tests Passing (100%)**

---

## 🔐 Enterprise Security & Compliance

- **Authentication & RBAC**: Standard JWT token authentication with role-based permission gates.
- **Input Sanitization**: Pydantic V2 validation preventing SQL injection and XSS payloads across all endpoints.
- **Audit Logging Subsystem**: Automated, immutable logging for all CRM mutations in [`services/audit_service.py`](services/audit_service.py).
- **Container Vulnerability Scanning**: Scheduled GitHub Actions Trivy container image scanning.
- **Data Privacy**: Built with GDPR and data retention compliance standards in mind.

---

## 🤖 Centralized AI Assistant Rules

This project uses a unified single source of truth for all AI development tools:

* **Central Rules**: [`.agents/AGENTS.md`](.agents/AGENTS.md)
* **Modular Skills**: [`.agents/skills/`](.agents/skills/) (Project Architecture, Backend, Frontend, Agents, Database, Testing, DevOps, Git)

To synchronize updates across Cursor, Claude Code, GitHub Copilot, Cline/Roo Code, and Windsurf:

```bash
python3 .agents/scripts/sync_rules.py
```

---

## 📚 Documentation Index

### 🏛️ Core Architecture & Operations
- 📋 [**Feature Checklist & Roadmap**](Features.md)
- 🏛️ [**System Architecture Overview**](docs/architecture/overview.md)
- 🤖 [**AI Multi-Agent Swarm Architecture**](docs/ai-architecture.md)
- 🗄️ [**Database Models & Schema**](docs/database.md)
- 📡 [**REST & WebSocket API Reference**](docs/api.md)
- 🚀 [**Production Deployment Guide**](docs/deployment.md)
- 🔒 [**Security & Threat Model**](docs/security.md)
- 🩺 [**Troubleshooting & FAQ**](docs/troubleshooting.md)
- 🤝 [**Contributing Guidelines**](CONTRIBUTING.md)
- 🔐 [**Security Policy**](SECURITY.md)

### 🤖 Agent & Feature Deep-Dives
- 🎯 [**Lead Qualification Agent**](docs/lead-qualification.md)
- 📧 [**Email Intelligence Agent**](docs/email-intelligence.md)
- 💰 [**Sales Pipeline Agent**](docs/sales-pipeline.md)
- 🎉 [**Customer Success Agent**](docs/customer-success.md)
- 📅 [**Meeting Scheduler Agent**](docs/meeting-scheduler.md)
- 📊 [**Analytics Agent**](docs/analytics.md)
- 🎙️ [**Voice AI Call Intelligence**](docs/voice-ai.md)
- 💬 [**WhatsApp Business Hub**](docs/whatsapp.md)
- 📈 [**Monte Carlo Revenue Forecasting**](docs/forecasting.md)
- 🔧 [**No-Code Custom Agent Builder**](docs/custom-agents.md)
- 🌐 [**Multi-Language (I18n) Engine**](docs/i18n/overview.md)
- ⚔️ [**AI Deal War Room & Strategy Studio**](docs/war-room.md)
- 🧭 [**Customer Journey & Churn Prevention**](docs/customer-journey.md)
- 🚀 [**AI SDR Multi-Touch Outreach Cadences**](docs/sdr-sequences.md)

---

<div align="center">

**Built with ❤️ for modern revenue and sales engineering teams.**

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) • **Status:** Production Ready • **Version:** 2.0.0

</div>
