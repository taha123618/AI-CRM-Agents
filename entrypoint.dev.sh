#!/bin/sh
# =============================================================================
# entrypoint.dev.sh — Development container startup script
#
# Purpose-built for local development:
#   - Runs database migrations on every start
#   - Starts Uvicorn with --reload (live code reload on file save)
#   - Source code is mounted via docker-compose volume, not baked in
#
# DB readiness is guaranteed by Docker's healthcheck + depends_on condition.
# =============================================================================
set -e

echo "================================================"
echo "  AI-Powered CRM — DEVELOPMENT MODE"
echo "================================================"

# ── Run database migrations ───────────────────────────────────────────────────
echo "[1/2] Running database migrations..."
alembic upgrade head
echo "      Done."

# ── Start Uvicorn with hot-reload ─────────────────────────────────────────────
echo "[2/2] Starting Uvicorn with hot-reload on port ${PORT:-8000}..."
echo "      Edit any .py file — changes reload instantly."
echo "      API docs: http://localhost:${PORT:-8000}/docs"
echo "================================================"

exec uvicorn main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --reload \
    --log-level debug
