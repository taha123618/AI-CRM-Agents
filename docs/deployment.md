# 🚀 Production Deployment & Infrastructure Guide

This guide describes containerization, production deployment patterns, environment configurations, and reverse proxy topology for the AI-Powered CRM system.

---

## 🐳 Docker Architecture & Multi-Stage Builds

The platform includes production-ready multi-stage Docker builds:
- **Backend Service**: Python 3.11-slim, non-root user execution, Uvicorn ASGI workers.
- **Frontend Service**: Multi-stage Node 20 build producing static assets served via Nginx 1.25 Alpine.
- **Database**: PostgreSQL 14 Alpine with health check probe.
- **Cache & Message Broker**: Redis 7 Alpine.

---

## 🚢 Quick Deployment with Docker Compose

### 1. Configure Environment Variables
Copy and customize the production environment file:
```bash
cp .env.example .env
```
Ensure strong passwords and production API keys are set:
```ini
POSTGRES_USER=crm_admin
POSTGRES_PASSWORD=your_super_secure_postgres_password
POSTGRES_DB=ai_crm_db
REDIS_URL=redis://redis:6379/0
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ENVIRONMENT=production
```

### 2. Launch Production Stack
```bash
docker-compose up -d --build
```

### 3. Verify Container Health
```bash
docker-compose ps
```

Expected output:
```
NAME                    IMAGE               COMMAND                  SERVICE             STATUS              PORTS
ai-crm-postgres         postgres:14-alpine  "docker-entrypoint.s…"   postgres            healthy             0.0.0.0:5432->5432/tcp
ai-crm-redis            redis:7-alpine      "docker-entrypoint.s…"   redis               healthy             0.0.0.0:6379->6379/tcp
ai-crm-backend          ai-crm-backend      "/app/entrypoint.sh"     backend             healthy             0.0.0.0:8000->8000/tcp
ai-crm-frontend         ai-crm-frontend     "/docker-entrypoint…"    frontend            running             0.0.0.0:80->80/tcp
```

---

## 🌐 Nginx Routing & Reverse Proxy

In production, Nginx routes incoming HTTP traffic and WebSocket upgrades:

```nginx
server {
    listen 80;
    server_name _;

    # Frontend Single Page Application
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket Real-Time Gateway
    location /ws {
        proxy_pass http://backend:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_read_timeout 86400;
    }
}
```

---

## 🩺 Health Check Probes

- **Backend Liveness**: `GET /health` returns `{"status": "healthy", "timestamp": "...", "database": "connected"}`
- **Database Readiness**: `pg_isready -U postgres`
- **Redis Ping**: `redis-cli ping`
