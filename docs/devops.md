# 🚀 DevOps, Containerization & Production Infrastructure Architecture

This document provides a comprehensive operational blueprint for the **AI-Powered CRM Multi-Agent Operating System**, covering container topology, high-availability scaling, CI/CD pipelines, security hardening, database operations, and disaster recovery.

---

## 🏛️ 1. Infrastructure Topology & Architecture

The production platform is architected as a decoupled microservices/service-oriented container stack:

```
                              ┌───────────────────────────┐
                              │  Internet / SSL Gateway   │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │    Nginx Reverse Proxy    │
                              │     (Frontend Container)  │
                              └───────┬───────────┬───────┘
                                      │           │
                     Static Assets &  │           │ Proxy Pass
                     SPA HTML5 Router │           │ (/api, /ws, /health, /metrics)
                                      ▼           ▼
                      ┌──────────────────┐    ┌───────────────────────────┐
                      │ Browser Clients  │    │ FastAPI Application Server│
                      └──────────────────┘    │      (Web Container)      │
                                              └───────┬───────────┬───────┘
                                                      │           │
                                       SQL Queries &  │           │ Pub/Sub & Task Queue
                                       Transactions   ▼           ▼
                                      ┌──────────────────┐    ┌───────────────────┐
                                      │  PostgreSQL 14+  │    │      Redis 7      │
                                      │  (crm_db_prod)   │    │  (crm_redis_prod) │
                                      └──────────────────┘    └─────────┬─────────┘
                                                                        │ Async Tasks
                                                                        ▼
                                                              ┌───────────────────┐
                                                              │  Worker Daemon    │
                                                              │ (crm_worker_prod) │
                                                              └───────────────────┘
```

---

## 📦 2. Containerization Strategy

### Backend Web & Task Worker (`Dockerfile`)
- **Multi-Stage Build**:
  - `builder`: Installs Python dependencies with build tools (`build-essential`, `libpq-dev`).
  - `runtime`: Lean `python:3.10-slim` runtime image containing only compiled packages and runtime libraries (`libpq5`, `curl`).
- **Security Hardening**: Runs as non-root user `appuser:appuser` (UID 1001).
- **Graceful Shutdown & Signal Handling**: Handled via `uvicorn` and Python signal traps.

### Frontend SPA Web Server (`frontend/Dockerfile` & `frontend/nginx.conf`)
- **Multi-Stage Build**:
  - `builder`: Compiles React 19 + TypeScript SPA bundle with Vite.
  - `runner`: Uses `nginx:alpine` to serve optimized static assets with gzip compression.
- **Reverse Proxy Routing**:
  - `/` -> SPA HTML5 fallback (`try_files $uri $uri/ /index.html`).
  - `/assets/` -> Immutable 1-year browser cache.
  - `/api/` -> Proxied to `http://web:8000/api/`.
  - `/ws` -> Proxied WebSocket connection with `Upgrade` and `Connection` headers.
  - `/metrics` -> Proxied Prometheus endpoint.
  - `/health` -> Proxied health check probe.

---

## 🔄 3. CI/CD Continuous Integration Pipeline

Configured in `.github/workflows/ci.yml`:
1. **Backend Quality Gate**:
   - Spawns isolated PostgreSQL 14 and Redis 7 service containers with active healthchecks.
   - Verifies code formatting with `black --check .` and linting with `flake8`.
   - Runs full **190 backend tests** with code coverage.
2. **Frontend Quality Gate**:
   - Executes static type check (`tsc --noEmit`).
   - Runs **86 component and integration tests** via Vitest.
   - Validates production bundle compilation (`npm run build`).
3. **Container Build Verification**:
   - Executes multi-stage Docker Buildx image builds for backend and frontend with GitHub Actions cache.

---

## 🗄️ 4. Database Operations & Disaster Recovery

### Backup & Restore Runbook
- **RPO (Recovery Point Objective)**: < 1 Hour.
- **RTO (Recovery Time Objective)**: < 15 Minutes.

```bash
# Backup creation
mkdir -p backups
docker-compose exec db pg_dump -U crm_user -d ai_crm | gzip > backups/crm_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup restoration
gunzip < backups/crm_backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U crm_user -d ai_crm
```

### Database Migration Standard
All schema updates must be committed as versioned Alembic revisions:
```bash
alembic revision --autogenerate -m "Add descriptive name"
alembic upgrade head
```

---

## 📊 5. Observability, Logging & Alerting

- **Application Logs**: Level-based structured logging via `loguru`.
- **Log Rotation**: Docker `json-file` logging driver configured with `max-size: "10m"` and `max-file: "3"` to prevent disk exhaustion.
- **Prometheus Metrics**: Scraped at `/metrics` tracking request latency histograms, error rates, agent execution timings, and queue depth.
- **Health Checks**: Container health verified via `GET /health` with automatic container restart upon failure.
