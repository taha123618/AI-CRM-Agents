#!/bin/bash
# =============================================================================
# setup.sh — Local (Non-Docker) Development Setup
#
# Automates the one-time setup of the Python virtual environment,
# dependencies, PostgreSQL database, and .env file.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# Prerequisites: Python 3.9+, PostgreSQL 14+, Redis 7+ installed and running.
# =============================================================================
set -e

VENV_DIR=".venv"
ENV_FILE=".env"
DB_NAME="ai_crm"
DB_USER="crm_user"
DB_PASS="crm_password"

echo "============================================"
echo "  AI-Powered CRM — Local Dev Setup"
echo "============================================"
echo ""

# ── Virtual Environment ───────────────────────────────────────────────────────
echo "[1/5] Creating Python virtual environment in ${VENV_DIR}/ ..."
python3 -m venv "${VENV_DIR}"
# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"
echo "      Done."

# ── Python Dependencies ───────────────────────────────────────────────────────
echo "[2/5] Installing Python dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo "      Done."

# ── Environment File ──────────────────────────────────────────────────────────
echo "[3/5] Setting up .env file..."
if [ -f "${ENV_FILE}" ]; then
    echo "      .env already exists — skipping (edit it manually if needed)."
else
    cp .env.example "${ENV_FILE}"
    echo "      Created ${ENV_FILE} from .env.example"
    echo "      ⚠️  Edit .env and add your OPENAI_API_KEY or ANTHROPIC_API_KEY"
fi

# ── PostgreSQL Database ───────────────────────────────────────────────────────
echo "[4/5] Setting up PostgreSQL database..."
echo "      Checking if database '${DB_NAME}' exists..."

if psql -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo "      Database '${DB_NAME}' already exists — skipping creation."
else
    echo "      Creating user '${DB_USER}' and database '${DB_NAME}'..."
    psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';" 2>/dev/null || echo "      User '${DB_USER}' already exists."
    psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
    psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
    echo "      Done."
fi

# ── Alembic Migrations ────────────────────────────────────────────────────────
echo "[5/5] Running database migrations..."
alembic upgrade head
echo "      Done."

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  ✅ Setup Complete!"
echo "============================================"
echo ""
echo "  Next steps:"
echo "    1. Edit .env — add your OPENAI_API_KEY or ANTHROPIC_API_KEY"
echo "    2. Start Redis: redis-server"
echo "    3. Activate venv: source ${VENV_DIR}/bin/activate"
echo "    4. Start dev server: python run.py"
echo ""
echo "  API:    http://localhost:8000"
echo "  Docs:   http://localhost:8000/docs"
echo "  Health: http://localhost:8000/health"
echo ""
