# 🩺 Troubleshooting & Diagnostics Guide

This guide provides fast diagnostic steps and solutions for common local development, database, and container issues.

---

## 🛠️ Common Issues & Resolutions

### 1. Database Connection Refused (`connection to server at "localhost", port 5432 failed`)
* **Cause**: PostgreSQL is not running or listening on a different port.
* **Resolution**:
  - If running via Docker: Ensure container is started: `docker-compose up -d postgres`.
  - Check database URL in `.env`: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_crm_db`.
  - For local test runs without PostgreSQL: The backend automatically falls back to SQLite (`test.db`).

### 2. Frontend WebSocket Connection Fails (`WebSocket connection to 'ws://localhost:8000/ws' failed`)
* **Cause**: Backend server is not running on port 8000 or reverse proxy is not passing the `Upgrade` header.
* **Resolution**:
  - Verify backend is running: `curl http://localhost:8000/health`.
  - In Nginx, ensure `proxy_set_header Upgrade $http_upgrade;` and `proxy_set_header Connection "Upgrade";` are configured.

### 3. Port Conflicts (`Address already in use: 8000` or `5173`)
* **Cause**: A previous Uvicorn or Vite process is still running in the background.
* **Resolution**:
  ```bash
  # Find and kill process on port 8000
  lsof -i :8000
  kill -9 <PID>

  # Find and kill process on port 5173
  lsof -i :5173
  kill -9 <PID>
  ```

### 4. Missing LLM API Keys (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`)
* **Behavior**: `SmartFallbackLLM` will automatically catch missing or failed keys and fall back to the internal deterministic simulation engine, allowing full local UI testing without incurring API costs.
* **Resolution**: To enable live OpenAI/Anthropic responses, provide valid keys in `.env`:
  ```ini
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...
  ```

### 5. Frontend Build Type Errors
* **Command**: Run `npm run type-check` inside `frontend/`.
* **Resolution**: Ensure all API response models match the TypeScript definitions in `src/types/` and `src/features/*/types/`.

---

## 🔍 Diagnostic Commands

```bash
# Backend health check
curl -X GET http://localhost:8000/health

# Run backend test suite
PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v

# Run frontend test suite
cd frontend && npm run test

# Run frontend type-checker
cd frontend && npm run type-check

# Re-seed database
python3 database/seed.py
```
