# 🤖 AI-Powered CRM with Agentic Workflows

**Production-ready enterprise CRM system powered by a multi-agent AI architecture with Voice AI, WhatsApp, Monte Carlo Forecasting, Multi-Language, and No-Code Custom Agent Builder.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

An intelligent CRM system where **9 autonomous AI agents** handle customer relationship workflows automatically. Each agent specialises in a specific domain and collaborates through an event-driven orchestration layer. The platform includes advanced modules for Voice AI call intelligence, WhatsApp business automation, Monte Carlo revenue forecasting, multi-language support, and a no-code custom agent builder.

---

## 🏗️ Architecture

### 9 Autonomous AI Agents

| Agent | Responsibility | Endpoint |
|---|---|---|
| 🎯 **Lead Qualification** | Score, enrich, and route incoming leads | `POST /api/agents/qualify-lead` |
| 📧 **Email Intelligence** | Analyse sentiment, draft replies, prioritise inbox | `POST /api/agents/analyze-email` |
| 💰 **Sales Pipeline** | Monitor deal health, predict close probability | `POST /api/agents/analyze-deal/{id}` |
| 🎉 **Customer Success** | Track health scores, detect churn risk | `POST /api/agents/monitor-customer/{id}` |
| 📅 **Meeting Scheduler** | Smart calendar management and prep | `POST /api/agents/schedule-meeting` |
| 📊 **Analytics** | Real-time dashboards and forecasting | `POST /api/agents/generate-dashboard` |
| 🎙️ **Voice Call Intelligence** | Speech analysis, buyer intent, objection coaching | `POST /api/voice-calls` |
| 💬 **WhatsApp Hub** | AI auto-pilot messaging, broadcast campaigns | `POST /api/whatsapp/send` |
| 🔧 **Custom Agent Builder** | No-code agent creation and testing | `POST /api/custom-agents` |

### System Design

```
HTTP Request
     │
     ▼
 FastAPI (main.py)
     │
     ▼
AgentOrchestrator  ──── BackgroundTasks (async, in-process)
     │
     ├── LeadQualificationAgent
     ├── EmailIntelligenceAgent
     ├── SalesPipelineAgent
     ├── CustomerSuccessAgent
     ├── MeetingSchedulerAgent
     ├── AnalyticsAgent
     ├── VoiceCallAgent
     ├── WhatsAppAgent
     └── CustomAgentBuilder
           │
           ▼
     PostgreSQL ◄──── Redis (caching + pub/sub events)
```

---

## 🚀 Specialized Platform Features

### 🎙️ Voice AI Call Intelligence Studio
- Real-time speech turn analysis with buyer intent scoring
- Dynamic objection battle-cards and rep coaching tips
- Post-call automated CRM synthesis, action item extraction
- Sentiment distribution analytics and call scoring breakdown
- Interactive transcript viewer with speaker bubbles

### 💬 WhatsApp Business Multi-Agent Hub
- Omnichannel WhatsApp chat with 24/7 AI Auto-Pilot
- Broadcast template messaging campaigns
- Conversation tagging, search, and handoff archiving
- Unread badges, intent labels, and read receipts
- New conversation and bulk send modals

### 📈 Advanced Monte Carlo Revenue Forecasting
- Stochastic Monte Carlo simulations (P10/P50/P90 confidence bounds)
- Monthly ARR progression charts vs targets with delta badges
- Pipeline stage velocity & hazard conversion matrix
- Saved scenario comparison table and grouped bar charts
- Per-stage probability editor with customizable win rates

### 🌐 Multi-Language Support (I18n)
- Dynamic translation management system
- RTL/LTR layout synchronization (Urdu, Arabic, etc.)
- Language creation with auto-detection of text direction
- Translation key management and bulk editing

### 🔧 No-Code Custom Agent Builder
- Visual creator for custom AI agents
- Configurable prompts, triggers, and toolkits
- Testing playground with live execution
- Agent status management (active/inactive/draft)

### ⚔️ AI Deal War Room, Strategy Studio & Smart Proposal Studio
- **Multi-Agent Consensus Verdicts**: Cross-agent alignment score (0-100%) and recommendations combining Pipeline, Lead Qualifier, Voice AI, and Customer Success insights.
- **Account SWOT Matrix**: Real-time account Strengths, Vulnerabilities, Opportunities, and Threats.
- **Dynamic Competitor Battle-Cards**: Instant counter-objections, displacement playbooks, and kill-shots against legacy CRM vendors.
- **Buying Committee Mapping**: Stakeholder influence hierarchy, stance tracking (Champions, Neutral, Gatekeepers), and action strategies.
- **1-Click Smart Proposal Studio**: Automated enterprise pitch deck with dynamic tier pricing, SLA terms, e-signature simulation, and markdown export.
- **Autonomous Workflow Triggers**: Full CRUD automation rules engine with live AI Orchestrator execution.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, Zustand, Recharts, Lucide Icons, Nginx |
| **API** | Python 3.9+, FastAPI, Uvicorn / Gunicorn |
| **Database** | PostgreSQL 14+, SQLAlchemy 2.0 ORM, Alembic |
| **Background Tasks** | FastAPI `BackgroundTasks` (in-process async) |
| **Caching / Events** | Redis 7 (pub/sub + response caching) |
| **Realtime Stream** | WebSockets (`/ws`), ConnectionManager |
| **AI / ML** | LangChain, OpenAI GPT-4 / Anthropic Claude, SmartFallbackLLM |
| **Container** | Docker (multi-stage), Docker Compose |
| **Testing** | pytest, pytest-asyncio |
| **Code Quality** | Black, Flake8, Mypy, ESLint, TypeScript |

---

## 📁 Project Structure

```
ai-crm-agents/
├── agents/                        # 9 AI Agents
│   ├── base_agent.py              #   Shared BaseAgent class with TraceMixin
│   ├── lead_qualification_agent.py
│   ├── email_intelligence_agent.py
│   ├── sales_pipeline_agent.py
│   ├── customer_success_agent.py
│   ├── meeting_scheduler_agent.py
│   ├── analytics_agent.py
│   ├── voice_call_agent.py        #   Voice AI speech analysis & coaching
│   ├── whatsapp_agent.py          #   WhatsApp conversational AI
│   └── custom_agent_builder.py    #   No-code dynamic agent instantiation
│
├── api/                           # FastAPI routers
│   ├── leads.py
│   ├── deals.py
│   ├── customers.py
│   ├── emails.py
│   ├── meetings.py
│   ├── analytics.py
│   ├── voice_calls.py             #   Voice AI endpoints (stats, search, transcripts)
│   ├── whatsapp.py                #   WhatsApp endpoints (send, broadcast, tags, archive)
│   ├── forecasting.py             #   Monte Carlo simulation & ARR trend endpoints
│   ├── custom_agents.py           #   No-code agent CRUD & test execution
│   └── i18n.py                    #   Multi-language translation management
│
├── services/                      # Business service layer
│   ├── forecasting_service.py     #   Monte Carlo simulation logic & ARR trends
│   └── i18n_service.py            #   Translation & language management
│
├── database/                      # Database layer
│   ├── models.py                  #   SQLAlchemy ORM models (16+ tables)
│   ├── connection.py              #   Engine & session factory
│   └── schema.sql                 #   Raw SQL schema reference
│
├── workflows/
│   └── orchestrator.py            # Central agent coordinator
│
├── alembic/                       # Database migrations
│   ├── versions/                  #   Migration scripts
│   └── env.py                     #   Alembic configuration
│
├── tests/                         # Unit & integration tests
│
├── frontend/                      # Production React 19 + TypeScript SPA
│   ├── src/
│   │   ├── features/              #   13 feature modules (voice-ai, whatsapp, forecasting, etc.)
│   │   ├── components/            #   Shared UI, forms, charts, layout
│   │   ├── hooks/                 #   TanStack Query hooks
│   │   ├── stores/                #   Zustand state stores
│   │   └── types/                 #   TypeScript interfaces
│   ├── Dockerfile                 #   Multi-stage build (Node + Nginx)
│   ├── nginx.conf                 #   Nginx reverse proxy config
│   └── vite.config.ts             #   Vite build tooling & API proxies
│
├── .agents/                       # AI assistant configuration
│   ├── AGENTS.md                  #   Single source of truth for AI rules
│   ├── skills/                    #   7 modular skill files
│   └── scripts/sync_rules.py     #   Syncs rules to all AI tools
│
├── docs/                          # Documentation
│   └── i18n/overview.md           #   Multi-language feature documentation
│
├── main.py                        # FastAPI application entry point
├── run.py                         # Development server script
├── Dockerfile                     # Multi-stage production image
├── docker-compose.yml             # Production stack (fully standalone)
├── docker-compose.dev.yml         # Development stack (hot-reload)
├── entrypoint.sh                  # Container startup (migrations + server)
├── requirements.txt               # Python dependencies
├── alembic.ini                    # Alembic configuration
├── .env.example                   # Environment variable template
└── .dockerignore                  # Docker build exclusions
```

---

## ✅ Prerequisites

### Docker Setup (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24.0+

### Local / Non-Docker Setup
- Python 3.9+
- PostgreSQL 14+
- Redis 7+
- Node.js 20+ (for frontend)

---

## ⚙️ Environment Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Key variables to configure:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://crm_user:crm_password@localhost:5432/ai_crm` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | OpenAI API key (optional if using Anthropic) | — |
| `OPENAI_MODEL` | OpenAI model identifier | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional if using OpenAI) | — |
| `ANTHROPIC_MODEL` | Anthropic model identifier | `claude-3-5-sonnet-20241022` |
| `SECRET_KEY` | JWT / session secret — **change this in production** | — |
| `DEBUG` | Enable debug mode | `True` |
| `GUNICORN_WORKERS` | Number of Gunicorn worker processes | `4` |
| `GUNICORN_TIMEOUT` | Worker timeout in seconds | `120` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |

> **Docker Note**: `DATABASE_URL` and `REDIS_URL` inside Docker are automatically overridden in `docker-compose.yml` to use service hostnames (`db`, `redis`). You do not need to change them for Docker use.

---

## ⚡ Quick Commands (Makefile)

```bash
# Development
make dev-build          # Build + start with hot-reload
make dev-logs           # Stream logs
make dev-shell          # Bash into container
make dev-reset          # Wipe dev volumes

# Production
make prod-build         # Build + start detached
make prod-logs          # Stream logs

# Database
make migrate            # Apply migrations
make migrate-create msg="add user table"  # New migration

# Code quality
make test               # Run pytest
make quality            # format + lint + typecheck
```

---

## 🐳 Docker Setup (Recommended)

### Development (with hot-reload)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add your LLM API key to .env
#    Edit .env and set OPENAI_API_KEY or ANTHROPIC_API_KEY

# 3. Start all services with hot-reload
docker-compose -f docker-compose.dev.yml up --build
```

The API starts at **http://localhost:8000** — any change to `.py` files is reflected immediately without restarting the container.

### Production

```bash
# Build and start all services in the background
docker-compose up -d --build
```

Migrations run automatically on container startup via `entrypoint.sh`.

### Useful Docker Commands

```bash
# View running services
docker-compose ps

# Stream logs from all services
docker-compose logs -f

# Stream logs from a specific service
docker-compose logs -f web

# Restart the API service
docker-compose restart web

# Stop all services
docker-compose down

# Stop and remove all data volumes (full reset)
docker-compose down -v

# Open a shell inside the running web container
docker-compose exec web bash

# Run a one-off command (e.g. check migration status)
docker-compose exec web alembic current

# Rebuild after dependency changes
docker-compose up -d --build web
```

---

## 💻 Non-Docker Setup

```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, REDIS_URL, and API keys

# 4. Apply database migrations
alembic upgrade head

# 5. Start development server
python run.py

# 6. Run frontend server
cd frontend
npm install
npm run dev
```

---

## 🗄️ Database Migrations

### Development — after modifying models

```bash
# Generate a new migration from model changes
alembic revision --autogenerate -m "describe your change"

# Review the generated file in alembic/versions/
# Then apply it:
alembic upgrade head
```

### Production — apply committed migrations only

```bash
# Never use --autogenerate in production.
# Apply the migrations that were committed during development:
alembic upgrade head

# Or inside Docker:
docker-compose exec web alembic upgrade head
```

### Other migration commands

```bash
alembic current          # Show current revision
alembic history          # Show full migration history
alembic downgrade -1     # Roll back one migration
```

---

## 🧪 Testing

```bash
# Run all tests
python3 -m pytest

# Run with verbose output
python3 -m pytest -v

# Run a specific test file
python3 -m pytest tests/test_lead_agent.py

# Frontend type check and build
cd frontend
npm run type-check
npm run build
```

---

## 🧹 Code Quality

```bash
# Format code
black .

# Check formatting without changing files
black --check .

# Lint
flake8 .

# Type check
mypy .
```

---

## 🤖 AI Assistant Configuration

This project includes a centralised system for configuring AI coding assistants.

| Tool | Config File |
|---|---|
| Cursor | `.cursorrules` |
| Claude Code | `CLAUDE.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cline / Roo Code | `.clinerules` |
| Windsurf | `.windsurfrules` |
| Antigravity (this tool) | `.agents/AGENTS.md` + `.agents/skills/` |

**Single source of truth**: [`.agents/AGENTS.md`](.agents/AGENTS.md)

After editing rules or skill files, regenerate all tool configs:

```bash
python3 .agents/scripts/sync_rules.py
```

### Skills

| Skill | Description |
|---|---|
| `project-architecture` | Agent collaboration, feature-sliced architecture, and workflow orchestration |
| `backend-development` | FastAPI endpoints, services, dependencies, and Pydantic schemas |
| `agent-development` | Creating, extending, and debugging CRM agents and custom agent builders |
| `frontend-development` | React 19 + TypeScript features, components, and TanStack Query state |
| `database-development` | SQLAlchemy models, schemas, and Alembic migrations |
| `testing` | pytest patterns and mock strategies |
| `git-workflow` | Branching, commits, and pull requests |

---

## 🔒 Security Considerations

- **Never commit `.env`** to version control — it is in `.gitignore`
- Set a strong random `SECRET_KEY` before deploying to production
- Set `DEBUG=False` in production
- Configure `ALLOWED_HOSTS` to your domain(s) in production
- Rotate LLM API keys regularly and restrict their scopes
- The `docker-compose.yml` database password (`crm_password`) is for local use — use a secrets manager in production

---

## 🤝 Git Workflow

| Branch prefix | Purpose |
|---|---|
| `features/` | New functionality |
| `bugfix/` | Bug fixes |
| `chore/` | Maintenance tasks |

Commit messages follow the imperative style:
```
feat: Add voice call intelligence analytics
feat: Add WhatsApp broadcast campaign endpoint
feat: Add lead scoring threshold configuration
fix: Correct email sentiment parser for unicode input
chore: Update dependencies to latest patch versions
```

---

## 🆘 Troubleshooting

### Docker: Port already in use
```bash
# Find what is using port 8000 or 5432
lsof -i :8000
# Then stop or kill that process
```

### Docker: Database connection refused
```bash
# Check that the db service is healthy
docker-compose ps
docker-compose logs db
```

### Alembic: No config file found
```bash
# Run alembic commands from the project root (where alembic.ini lives)
cd /path/to/ai-crm-agents
alembic upgrade head
```

### API returns 500 on startup
```bash
# Check that DATABASE_URL is correct and the database is running
curl http://localhost:8000/health
docker-compose logs web
```

### LLM Provider & Smart Fallback
Setting `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env` automatically connects all agents to live AI models (`gpt-4o-mini` or `claude-3-5-sonnet-20241022`). Without an API key, the system automatically runs with `SmartFallbackLLM`, producing realistic, context-aware CRM agendas, email drafts, lead score rationales, and customer health risk analyses.

---

## 📚 Documentation & References

### Agent & Feature Guides
- 🎯 **Lead Qualification**: [`docs/lead-qualification.md`](docs/lead-qualification.md)
- 📧 **Email Intelligence**: [`docs/email-intelligence.md`](docs/email-intelligence.md)
- 💰 **Sales Pipeline**: [`docs/sales-pipeline.md`](docs/sales-pipeline.md)
- 🎉 **Customer Success**: [`docs/customer-success.md`](docs/customer-success.md)
- 📅 **Meeting Scheduler**: [`docs/meeting-scheduler.md`](docs/meeting-scheduler.md)
- 📊 **Analytics**: [`docs/analytics.md`](docs/analytics.md)
- 🎙️ **Voice AI Call Intelligence**: [`docs/voice-ai.md`](docs/voice-ai.md)
- 💬 **WhatsApp Business Hub**: [`docs/whatsapp.md`](docs/whatsapp.md)
- 📈 **Monte Carlo Forecasting**: [`docs/forecasting.md`](docs/forecasting.md)
- 🔧 **Custom Agent Builder**: [`docs/custom-agents.md`](docs/custom-agents.md)
- 🌐 **Multi-Language (I18n)**: [`docs/i18n/overview.md`](docs/i18n/overview.md)
- 🏛️ **System Architecture**: [`docs/architecture/overview.md`](docs/architecture/overview.md)

### Technical Resources
- **Frontend Web Application**: http://localhost:3000
- **API Docs** (interactive): http://localhost:8000/docs
- **Frontend Architecture & Docs**: [`frontend/README.md`](frontend/README.md)
- **Database Schema**: [`database/schema.sql`](database/schema.sql)
- **Agent Code**: [`agents/*.py`](agents/)
- **QUICKSTART Guide**: [`QUICKSTART.md`](QUICKSTART.md)

---

**Built with ❤️ for modern sales teams**

**License:** MIT | **Status:** Production Ready | **Last Updated:** 2026-08-17
