# 🚀 AI-Powered CRM — Quick Start Guide

This guide gets the project running locally in under 5 minutes using Docker.
For full documentation, see [README.md](README.md).

---

## ✅ Prerequisites

| Method | Requirements |
|---|---|
| **Docker** (recommended) | Docker Desktop 24.0+ |
| **Local / no Docker** | Python 3.9+, PostgreSQL 14+, Redis 7+ |

---

## 🐳 Option A — Docker Quick Start (Recommended)

> **One command gets everything running.** No need to install PostgreSQL or Redis locally.

### 1. Clone and configure

```bash
git clone <your-repo-url> ai-crm-agents
cd ai-crm-agents

# Copy environment file
cp .env.example .env
```

### 2. Add your LLM API key

Open `.env` and set at least one of:

```bash
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> **Note**: Without an API key, the system automatically uses `SmartFallbackLLM` — all endpoints work seamlessly with realistic CRM agendas, email drafts, lead scores, and health risk analyses.

### 3. Start the stack

**Development** (hot-reload — code changes reflect immediately):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Production** (Gunicorn + Uvicorn workers, optimised):

```bash
docker-compose up -d --build
```

### 4. Access the Application

- 🖥️ **React Frontend Application**: http://localhost:3000
- ⚡ **FastAPI Backend API**: http://localhost:8000
- 🌐 **Interactive OpenAPI Docs**: http://localhost:8000/docs
- 🔌 **WebSocket Real-time Stream**: ws://localhost:8000/ws

### 5. Verify Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"api": "healthy", "database": "connected", "agents": {...}, "redis": "connected"}
```

---

## 💻 Option B — Local Setup (Non-Docker)

### 1. Clone and create virtual environment

```bash
git clone <your-repo-url> ai-crm-agents
cd ai-crm-agents

python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start PostgreSQL and Redis

Ensure both services are running locally, then:

```bash
# Create the database
createdb ai_crm

# Create the database user
psql -c "CREATE USER crm_user WITH PASSWORD 'crm_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_crm TO crm_user;"
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, REDIS_URL, and LLM API key
```

### 4. Apply migrations and start

```bash
alembic upgrade head
python run.py
```

---

## 🎯 Try the API

### Qualify a Lead

```bash
curl -X POST http://localhost:8000/api/agents/qualify-lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "first_name": "John",
    "last_name": "Doe",
    "job_title": "VP of Engineering",
    "company_name": "Acme Corp"
  }'
```

### Analyse an Email

```bash
curl -X POST http://localhost:8000/api/agents/analyze-email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "customer@example.com",
    "subject": "Product issue",
    "body": "I am frustrated with the recent update. It broke our workflow."
  }'
```

### Get Analytics Dashboard

```bash
curl http://localhost:8000/api/analytics/dashboard
```

---

## 🏗️ Project Structure

```
ai-crm-agents/
├── agents/                    # 6 AI Agents (BaseAgent subclasses)
├── api/                       # FastAPI routers (leads, deals, customers…)
├── database/                  # SQLAlchemy models, connection, schema.sql
├── workflows/orchestrator.py  # Central agent coordinator
├── alembic/                   # Database migration scripts
├── tests/                     # Unit & integration tests
├── .agents/                   # AI assistant configuration
│   ├── AGENTS.md              #   Central rules (single source of truth)
│   ├── skills/                #   6 modular skill files
│   └── scripts/sync_rules.py #   Generates tool-specific configs
├── main.py                    # FastAPI application
├── run.py                     # Development server launcher
├── Dockerfile                 # Multi-stage production image
├── docker-compose.yml         # Production stack (fully standalone)
├── docker-compose.dev.yml     # Development stack (fully standalone, hot-reload)
├── entrypoint.sh              # Container startup script
└── .env.example               # Environment variable template
```

---

## 🤖 Available Agents & Endpoints

| Agent | Trigger Endpoint |
|---|---|
| 🎯 Lead Qualification | `POST /api/agents/qualify-lead` |
| 📧 Email Intelligence | `POST /api/agents/analyze-email` |
| 💰 Sales Pipeline | `POST /api/agents/analyze-deal/{deal_id}` |
| 🎉 Customer Success | `POST /api/agents/monitor-customer/{customer_id}` |
| 📅 Meeting Scheduler | `POST /api/agents/schedule-meeting` |
| 📊 Analytics | `POST /api/agents/generate-dashboard` |

---

## 🔗 Core API Endpoints

| Resource | Methods |
|---|---|
| `GET/POST /api/leads` | List and create leads |
| `GET /api/leads/{id}` | Get lead detail |
| `GET/POST /api/deals` | List and create deals |
| `PATCH /api/deals/{id}/stage` | Update deal stage |
| `GET /api/customers` | List customers |
| `GET /api/customers/{id}/health` | Customer health metrics |
| `GET /api/analytics/dashboard` | Main dashboard |
| `GET /api/analytics/pipeline` | Pipeline metrics |

---

## ⚙️ Configuration

### LLM Selection

Update `workflows/orchestrator.py` → `_init_llm()`:

```python
# OpenAI
from langchain.llms import OpenAI
return OpenAI(temperature=0.7, model="gpt-4")

# Anthropic Claude
from langchain.chat_models import ChatAnthropic
return ChatAnthropic(model="claude-3-opus-20240229")
```

### Database

The default credentials in `.env.example` are:
```
postgresql://crm_user:crm_password@localhost:5432/ai_crm
```

Inside Docker, this is automatically set to:
```
postgresql://crm_user:crm_password@db:5432/ai_crm
```

---

## 🗄️ Database Migrations

### Development — after changing models in `database/models.py`

```bash
# Generate migration script from model changes
alembic revision --autogenerate -m "your description"

# Review generated file in alembic/versions/, then apply:
alembic upgrade head
```

### Production — apply committed migrations

```bash
# Apply without autogenerate — migrations must be committed to Git first
alembic upgrade head

# Via Docker:
docker-compose exec web alembic upgrade head
```

### Other useful commands

```bash
alembic current        # Show active revision
alembic history        # Migration history
alembic downgrade -1   # Roll back one step
```

---

## 🧪 Development

### Run Tests

```bash
# Run the full test suite (uses mocks — no live DB or LLM required)
python3 -m pytest

# Verbose output
python3 -m pytest -v

# Specific file
python3 -m pytest tests/test_lead_agent.py
```

### Format & Lint

```bash
black .          # Format code
black --check .  # Check without changing
flake8 .         # Lint
```

### Sync AI Assistant Rules

After editing `.agents/AGENTS.md` or any skill file:

```bash
python3 .agents/scripts/sync_rules.py
```

This regenerates `.cursorrules`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.clinerules`, and `.windsurfrules`.

---

## 🐳 Docker Reference

```bash
# ── Development (hot-reload) ──────────────────────────────────────────
docker-compose -f docker-compose.dev.yml up --build

# ── Production ────────────────────────────────────────────────────────
docker-compose up -d --build

# View all service status
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f web     # API only

# Open a shell in the running container
docker-compose exec web bash

# Run a migration inside Docker
docker-compose exec web alembic upgrade head

# Restart the API
docker-compose restart web

# Stop all services
docker-compose down

# Full reset (delete all volumes/data)
docker-compose down -v
```

---

## 🚀 Production Deployment

### Docker Compose (Recommended)

```bash
# Set production values in .env:
#   DEBUG=False
#   SECRET_KEY=<strong-random-key>
#   ALLOWED_HOSTS=yourdomain.com
#   DATABASE_URL=postgresql://user:pass@your-db-host:5432/dbname

docker-compose up -d --build
```

Migrations run automatically on startup.

### Manual Deployment (no Docker)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Apply migrations
alembic upgrade head

# 3. Start with Gunicorn
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

---

## 🆘 Troubleshooting

### Port already in use
```bash
lsof -i :8000    # Find what's using port 8000
lsof -i :5432    # Find what's using port 5432
```

### Docker database not ready
```bash
docker-compose ps          # Check db service health
docker-compose logs db     # View PostgreSQL logs
```

### Alembic: No config file found
Run `alembic` commands from the project root where `alembic.ini` lives:
```bash
cd /path/to/ai-crm-agents
alembic upgrade head
```

### API returns 500 errors
```bash
docker-compose logs web    # Check application logs
curl http://localhost:8000/health
```

### Agents returning mock responses
Set a real `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env` and update `_init_llm()` in `workflows/orchestrator.py`.

---

**API Docs**: http://localhost:8000/docs | **Health**: http://localhost:8000/health
