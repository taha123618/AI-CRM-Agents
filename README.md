# 🤖 AI-Powered CRM with Agentic Workflows

**Production-ready CRM system powered by a multi-agent AI architecture.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

An intelligent CRM system where six autonomous AI agents handle customer relationship workflows automatically. Each agent specialises in a specific domain and collaborates through an event-driven orchestration layer.

---

## 🏗️ Architecture

### 6 Autonomous AI Agents

| Agent | Responsibility | Endpoint |
|---|---|---|
| 🎯 **Lead Qualification** | Score, enrich, and route incoming leads | `POST /api/agents/qualify-lead` |
| 📧 **Email Intelligence** | Analyse sentiment, draft replies, prioritise inbox | `POST /api/agents/analyze-email` |
| 💰 **Sales Pipeline** | Monitor deal health, predict close probability | `POST /api/agents/analyze-deal/{id}` |
| 🎉 **Customer Success** | Track health scores, detect churn risk | `POST /api/agents/monitor-customer/{id}` |
| 📅 **Meeting Scheduler** | Smart calendar management and prep | `POST /api/agents/schedule-meeting` |
| 📊 **Analytics** | Real-time dashboards and forecasting | `POST /api/agents/generate-dashboard` |

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
     └── AnalyticsAgent
           │
           ▼
     PostgreSQL ◄──── Redis (caching + pub/sub events)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, Zustand, Recharts, Axios, Nginx |
| **API** | Python 3.9+, FastAPI, Uvicorn / Gunicorn |
| **Database** | PostgreSQL 14+, SQLAlchemy 2.0 ORM, Alembic |
| **Background Tasks** | FastAPI `BackgroundTasks` (in-process async) |
| **Caching / Events** | Redis 7 (pub/sub + response caching) |
| **Realtime Stream** | WebSockets (`/ws`), ConnectionManager |
| **AI / ML** | LangChain, OpenAI GPT-4 / Anthropic Claude |
| **Container** | Docker (multi-stage), Docker Compose |
| **Testing** | pytest, pytest-asyncio |
| **Code Quality** | Black, Flake8, Mypy, ESLint, TypeScript |

---

## 📁 Project Structure

```
ai-crm-agents/
├── agents/                        # 6 AI Agents
│   ├── base_agent.py              #   Shared BaseAgent class
│   ├── lead_qualification_agent.py
│   ├── email_intelligence_agent.py
│   ├── sales_pipeline_agent.py
│   ├── customer_success_agent.py
│   ├── meeting_scheduler_agent.py
│   └── analytics_agent.py
│
├── api/                           # FastAPI routers
│   ├── leads.py
│   ├── deals.py
│   ├── customers.py
│   ├── emails.py
│   ├── meetings.py
│   └── analytics.py
│
├── database/                      # Database layer
│   ├── models.py                  #   SQLAlchemy ORM models
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
│   ├── test_main.py
│   └── test_lead_agent.py
│
├── frontend/                      # Production React + TypeScript SPA
│   ├── src/                       #   Components, views, hooks, stores
│   ├── Dockerfile                 #   Multi-stage build (Node + Nginx)
│   ├── nginx.conf                 #   Nginx reverse proxy config
│   ├── package.json               #   Frontend dependencies
│   └── vite.config.ts             #   Vite build tooling & API proxies
│
├── .agents/                       # AI assistant configuration
│   ├── AGENTS.md                  #   Single source of truth for AI rules
│   ├── skills/                    #   6 modular skill files
│   └── scripts/sync_rules.py     #   Syncs rules to all AI tools
│
├── main.py                        # FastAPI application entry point
├── run.py                         # Development server script
├── Dockerfile                     # Multi-stage production image
├── docker-compose.yml             # Production stack (fully standalone)
├── docker-compose.dev.yml         # Development stack (fully standalone, hot-reload)
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

#6. Run frontend server
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
| `project-architecture` | Agent collaboration and workflow design |
| `backend-development` | FastAPI endpoints and Pydantic schemas |
| `agent-development` | Creating and extending CRM agents |
| `database-development` | SQLAlchemy models and Alembic migrations |
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
| `feature/` | New functionality |
| `bugfix/` | Bug fixes |
| `chore/` | Maintenance tasks |

Commit messages follow the imperative style:
```
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

## 📚 References

- **Frontend Web Application**: http://localhost:3000
- **API Docs** (interactive): http://localhost:8000/docs
- **Frontend Architecture & Docs**: [`frontend/README.md`](frontend/README.md)
- **Database Schema**: [`database/schema.sql`](database/schema.sql)
- **Agent Code**: [`agents/*.py`](agents/)
- **QUICKSTART Guide**: [`QUICKSTART.md`](QUICKSTART.md)

---

**Built with ❤️ for modern sales teams**

**License:** MIT | **Status:** 🚧 In Development | **Last Updated:** 2026-08-12
