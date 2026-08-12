#!/bin/sh
# =============================================================================
# entrypoint.sh — Production container startup script
#
# Used exclusively by the production Dockerfile.
# DB readiness is guaranteed by Docker healthcheck + depends_on condition.
# =============================================================================
set -e

echo "================================================"
echo "  AI-Powered CRM — PRODUCTION MODE"
echo "================================================"

# ── Run database migrations ───────────────────────────────────────────────────
echo "[1/2] Running database migrations..."
alembic upgrade head
echo "      Done."

# ── Start Gunicorn with Uvicorn workers ───────────────────────────────────────
echo "[2/2] Starting Gunicorn (workers=${GUNICORN_WORKERS:-4}, timeout=${GUNICORN_TIMEOUT:-120}s)..."
exec gunicorn main:app \
    --workers "${GUNICORN_WORKERS:-4}" \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:${PORT:-8000}" \
    --timeout "${GUNICORN_TIMEOUT:-120}" \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile -
