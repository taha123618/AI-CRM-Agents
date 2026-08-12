# =============================================================================
# Dockerfile — PRODUCTION
#
# Multi-stage build:
#   Stage 1 (builder): Install all Python dependencies with build tools
#   Stage 2 (runtime): Copy only installed packages into a lean final image
#
# No source code is modified here — COPY . . brings in the app.
# Used exclusively by docker-compose.yml (production).
# =============================================================================

# ── Stage 1: builder ─────────────────────────────────────────────────────────
FROM python:3.10-slim AS builder

WORKDIR /app

# Build tools required for psycopg2, cryptography, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies into an isolated prefix for clean copying
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.10-slim AS runtime

# Sane Python defaults for containers
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000 \
    GUNICORN_WORKERS=4 \
    GUNICORN_TIMEOUT=120

WORKDIR /app

# Only runtime libraries (no compilers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source code (code is baked into the production image)
COPY . .

# Ensure the entrypoint is executable
RUN chmod +x entrypoint.sh

# Run as non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
