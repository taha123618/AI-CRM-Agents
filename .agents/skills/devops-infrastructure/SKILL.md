---
name: devops-infrastructure
description: Standards, workflows, and best practices for Docker, CI/CD, PostgreSQL migrations, Redis pub/sub, production deployment, and observability.
---

# DevOps, Infrastructure & Production Operations Skill

This skill serves as the comprehensive operational runbook and architectural guideline for containerization, CI/CD, database management, Redis message queues, security hardening, disaster recovery, and observability.

---

## 🏗️ Architecture & Deployment Topology

```
             ┌─────────────────────────────────────────────────────────┐
             │                     INTERNET CLIENTS                    │
             └───────────────────────────┬─────────────────────────────┘
                                         │ HTTPS (Port 443 / 80)
                                         ▼
             ┌─────────────────────────────────────────────────────────┐
             │            Nginx Edge Reverse Proxy (Frontend)          │
             │       - Static SPA Assets Cache (Cache-Control 1y)      │
             │       - Security Headers (nosniff, SAMEORIGIN, XSS)     │
             │       - Reverse Proxy Routes (/api, /ws, /health, /metrics)│
             └───────┬───────────────────────────────┬─────────────────┘
                     │ Proxy Pass (:8000)            │ Proxy Pass WebSocket
                     ▼                               ▼
             ┌─────────────────────────────────────────────────────────┐
             │              FastAPI Application Server (Web)           │
             │       - Gunicorn + Uvicorn Async Workers                │
             │       - JWT Auth & Role-Based Access Control            │
             │       - Rate Limiting Middleware (Sliding Window)       │
             └───────┬───────────────────────────────┬─────────────────┘
                     │ SQL Connections               │ Pub/Sub & Task Queue
                     ▼                               ▼
             ┌───────────────────┐           ┌───────────────────┐
             │   PostgreSQL 14   │           │      Redis 7      │
             │  (Persistent DB)  │           │  (Broker & Cache) │
             └───────────────────┘           └─────────┬─────────┘
                                                       │ Async Job Consumer
                                                       ▼
                                             ┌───────────────────┐
                                             │ Task Worker Daemon│
                                             │   (`worker.py`)   │
                                             └───────────────────┘
```

---

## 🛠️ Production Runbooks & Essential Commands

### 1. Production Deployment & Lifecycle
```bash
# Build and start all production services in the background
docker-compose up -d --build

# Verify health status of all running containers
docker-compose ps

# Stream logs with log-driver rotation
docker-compose logs -f web
docker-compose logs -f worker
docker-compose logs -f frontend

# Scale worker instances for high throughput email/task processing
docker-compose up -d --scale worker=3

# Execute database migrations inside running container
docker-compose exec web alembic upgrade head

# Seed initial CRM dataset and default admin/role users inside container
docker-compose exec web python3 database/seed.py

# Stop production stack (data preserved in named volumes)
docker-compose down

# Stop and wipe all persistent database and cache volumes (Destructive!)
docker-compose down -v
```

### 2. Local Development with Hot-Reloading
```bash
# Launch development stack with source bind-mounts and hot-reloading
docker-compose -f docker-compose.dev.yml up --build

# View dev logs
docker-compose -f docker-compose.dev.yml logs -f

# Open interactive bash terminal inside dev web container
docker-compose -f docker-compose.dev.yml exec web bash
```

---

## 🗄️ Database Management, Migrations & Disaster Recovery

### Database Migration Policy
1. **Never modify PostgreSQL tables manually** in production.
2. Always generate version-controlled Alembic migrations:
   ```bash
   # Generate migration script from models.py changes
   alembic revision --autogenerate -m "Add custom_field_definitions table"

   # Apply migrations to head
   alembic upgrade head

   # Check current migration revision
   alembic current

   # Rollback one migration revision
   alembic downgrade -1
   ```

### Disaster Recovery & Backup Procedures
- **Recovery Point Objective (RPO)**: < 1 hour (Automated hourly snapshots / continuous WAL archiving).
- **Recovery Time Objective (RTO)**: < 15 minutes.

```bash
# 1. Create a compressed PostgreSQL backup
mkdir -p backups
docker-compose exec db pg_dump -U crm_user -d ai_crm | gzip > backups/crm_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 2. Restore database from backup archive
gunzip < backups/crm_backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U crm_user -d ai_crm

# 3. Verify database integrity after restore
docker-compose exec web python3 -c "from database.connection import SessionLocal; from database.models import User, Deal; db=SessionLocal(); print(f'Users: {db.query(User).count()}, Deals: {db.query(Deal).count()}'); db.close()"
```

---

## 🔒 Security Hardening & DevSecOps Standards

1. **Non-Root Execution**: Backend and worker containers run as `appuser` (UID 1001), never as root.
2. **Minimal Base Images**: Multi-stage Docker builds based on `python:3.10-slim` and `nginx:alpine` to eliminate build compilers and reduce attack surfaces.
3. **No Secrets in Images**: All credentials (`SECRET_KEY`, `DATABASE_URL`, `OPENAI_API_KEY`, `EMAIL_PASSWORD`) are passed at runtime via `.env` or container environment variables.
4. **Health Check Probes**: All containers define active health checks with 10s intervals and 3–5 retries.
5. **SSRF Defense**: All outbound webhooks validated through `is_safe_webhook_url()` blocking loopback, cloud metadata (`169.254.169.254`), and private RFC 1918 subnets.
6. **CSV Formula Injection**: All outbound CSV exports sanitize dangerous calculation triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) via `sanitize_csv_cell()`.

---

## 📈 Observability, Metrics & Health Monitoring

### Health Check Endpoints
- `GET /health` or `GET /ready`: Returns `{ "status": "healthy", "service": "ai-crm", "database": "connected" }`.
- `GET /metrics`: Standard Prometheus text exposition format exposing request counters, agent execution latencies, token consumption, task queue status, and active WebSocket connections.

### Prometheus Alerting Thresholds
| Metric | Threshold | Severity | Recommended Action |
|---|---|---|---|
| `crm_request_duration_seconds{quantile="0.95"}` | > 2.0s for 5m | Warning | Check database connection pool and slow query logs. |
| `crm_task_queue_depth` | > 500 for 10m | High | Scale worker instances (`docker-compose up -d --scale worker=3`). |
| `crm_agent_errors_total` | Rate > 5/min | High | Inspect LLM fallback chain and external provider API quotas. |
| `crm_database_connectivity` | == 0 for 1m | Critical | Check PostgreSQL container health and disk space. |

---

## 🚀 CI/CD Automation Pipeline

Automated via GitHub Actions in `.github/workflows/ci.yml`:
1. **Backend QA**: PostgreSQL 14 + Redis 7 service containers, pip dependency caching, `flake8` & `black` linting, and Pytest coverage suite (**195 tests** across 32 suites).
2. **Frontend QA**: Node 20 runtime, npm caching, TypeScript type-check (`tsc --noEmit`), Vitest suite (**86 tests** across 24 suites), and production SPA bundle build.
3. **Mobile QA**: Bun runtime, `expo-doctor` (21/21 checks), strict TypeScript compilation (`tsc --noEmit`), and Expo Router static bundle export (**20 routes**).
4. **Container Build**: Docker Buildx verification with GitHub Actions layer caching.
