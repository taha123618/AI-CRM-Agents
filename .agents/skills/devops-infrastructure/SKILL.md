---
name: devops-infrastructure
description: Standards, workflows, and best practices for Docker, CI/CD, PostgreSQL migrations, Redis pub/sub, production deployment, and observability.
---

# DevOps, Infrastructure & Deployment Guidelines

This skill defines the operational, containerization, CI/CD, and infrastructure standards for the AI-Powered CRM platform.

---

## 🏗️ Architecture & Deployment Stack

- **Containerization**: Multi-stage Docker builds (`Dockerfile` for FastAPI, `frontend/Dockerfile` for Vite + Nginx)
- **Local / Dev Compose**: `docker-compose.dev.yml` (hot-reloading, volume binds)
- **Production Compose**: `docker-compose.yml` (hardened, non-root users, healthchecks)
- **CI/CD Automation**: GitHub Actions (`.github/workflows/ci.yml`, `.github/workflows/docker-build.yml`)
- **Database**: PostgreSQL 14+ with Alembic migrations (`alembic upgrade head`)
- **Message Broker & Cache**: Redis 7 Alpine (Pub/Sub for agent telemetry + `/ws` broadcasting)
- **Process Manager**: Gunicorn with Uvicorn worker threads (`uvicorn.workers.UvicornWorker`)

---

## 🛠️ Essential Operational Commands

### 1. Production Docker Commands
```bash
# Build and launch production stack in background
docker-compose up -d --build

# View real-time container logs
docker-compose logs -f web
docker-compose logs -f frontend

# Verify container health status
docker-compose ps

# Execute database migrations inside running container
docker-compose exec web alembic upgrade head

# Seed initial CRM dataset inside container
docker-compose exec web python3 database/seed.py

# Tear down stack (preserve volumes)
docker-compose down

# Tear down and wipe all persistent volumes
docker-compose down -v
```

### 2. Development Mode with Hot-Reloading
```bash
# Start dev containers with source code bind-mounts
docker-compose -f docker-compose.dev.yml up --build
```

---

## 🗄️ Database Management & Migrations

- **Never modify database schema manually** in production.
- Always generate migrations via Alembic:
  ```bash
  alembic revision --autogenerate -m "Add new column or table"
  alembic upgrade head
  ```
- **Disaster Recovery & Backups**:
  ```bash
  # Take compressed PostgreSQL dump
  docker-compose exec db pg_dump -U crm_user -d ai_crm | gzip > backups/crm_backup_$(date +%Y%m%d_%H%M%S).sql.gz

  # Restore from backup dump
  gunzip < backups/crm_backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U crm_user -d ai_crm
  ```

---

## 🔒 Container Security & Hardening Rules

1. **Non-Root Execution**: Backend containers must execute under `appuser` (UID 1001), not `root`.
2. **Minimal Base Images**: Use `python:3.10-slim` and `nginx:alpine` to minimize vulnerability surface.
3. **No Secrets in Images**: Do not bake `.env` or API credentials into Docker images. Use `env_file` or runtime secret managers.
4. **Health Check Probes**: All services must declare Docker `healthcheck` directives with sensible intervals and retries.
5. **JSON-File Log Rotation**: Configure `max-size: "10m"` and `max-file: "3"` in `docker-compose.yml` to prevent disk exhaustion.

---

## 🩺 Monitoring & Observability Runbook

- **Liveness Endpoint**: `GET /health` returns JSON containing server timestamp and database connection status.
- **WebSocket Health**: Verify handshake on `/ws` with message `ping`.
- **Redis Health**: `docker-compose exec redis redis-cli ping` returns `PONG`.
- **Database Readiness**: `docker-compose exec db pg_isready -U crm_user -d ai_crm`.
