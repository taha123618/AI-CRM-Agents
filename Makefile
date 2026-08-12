# =============================================================================
# Makefile — AI-Powered CRM
#
# Shortcut commands for development and production tasks.
# Run `make help` to see all available commands.
# =============================================================================

.PHONY: help \
        dev dev-build dev-down dev-logs dev-shell dev-reset \
        prod prod-build prod-down prod-logs prod-shell \
        migrate migrate-create migrate-status migrate-rollback \
        test lint format typecheck \
        setup clean

# Default: show help
.DEFAULT_GOAL := help

# ─────────────────────────────────────────────────────────────────────────────
# HELP
# ─────────────────────────────────────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "  AI-Powered CRM — Available Commands"
	@echo "  ──────────────────────────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─────────────────────────────────────────────────────────────────────────────
# DEVELOPMENT (docker-compose.dev.yml)
# ─────────────────────────────────────────────────────────────────────────────
dev: ## Start development stack (hot-reload, verbose logs)
	docker-compose -f docker-compose.dev.yml up

dev-build: ## Build and start development stack
	docker-compose -f docker-compose.dev.yml up --build

dev-down: ## Stop development stack (data preserved)
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## Stream development logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-shell: ## Open a shell inside the running dev web container
	docker-compose -f docker-compose.dev.yml exec web bash

dev-reset: ## Stop development stack and wipe all dev data volumes
	docker-compose -f docker-compose.dev.yml down -v
	@echo "Dev volumes wiped."

# ─────────────────────────────────────────────────────────────────────────────
# PRODUCTION (docker-compose.yml)
# ─────────────────────────────────────────────────────────────────────────────
prod: ## Start production stack in background
	docker-compose up -d

prod-build: ## Build and start production stack
	docker-compose up -d --build

prod-down: ## Stop production stack (data preserved)
	docker-compose down

prod-logs: ## Stream production logs
	docker-compose logs -f

prod-shell: ## Open a shell inside the running production web container
	docker-compose exec web bash

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE MIGRATIONS
# ─────────────────────────────────────────────────────────────────────────────
migrate: ## Apply all pending migrations (alembic upgrade head)
	alembic upgrade head

migrate-create: ## Create a new migration — usage: make migrate-create msg="your description"
	alembic revision --autogenerate -m "$(msg)"

migrate-status: ## Show current migration revision
	alembic current

migrate-rollback: ## Roll back one migration step
	alembic downgrade -1

migrate-history: ## Show full migration history
	alembic history

PYTHON := $(shell if [ -f .venv/bin/python3 ]; then echo .venv/bin/python3; else echo python3; fi)

# ─────────────────────────────────────────────────────────────────────────────
# TESTING & CODE QUALITY
# ─────────────────────────────────────────────────────────────────────────────
test: ## Run all tests
	$(PYTHON) -m pytest -v

test-cov: ## Run tests with coverage report
	$(PYTHON) -m pytest --cov=. --cov-report=term-missing --cov-report=html -v

lint: ## Run flake8 linter
	$(PYTHON) -m flake8 .

format: ## Format code with black
	$(PYTHON) -m black .

format-check: ## Check formatting without making changes
	$(PYTHON) -m black --check .

typecheck: ## Run mypy static type checker
	$(PYTHON) -m mypy . --ignore-missing-imports

quality: format lint typecheck ## Run all code quality checks (format + lint + types)

# ─────────────────────────────────────────────────────────────────────────────
# LOCAL (NON-DOCKER) SETUP
# ─────────────────────────────────────────────────────────────────────────────
setup: ## Run local non-Docker setup (creates .venv, DB, runs migrations)
	chmod +x setup.sh && ./setup.sh

run: ## Start local dev server without Docker (requires .venv activated)
	python run.py

# ─────────────────────────────────────────────────────────────────────────────
# AI TOOLING
# ─────────────────────────────────────────────────────────────────────────────
sync-rules: ## Sync AGENTS.md rules to all AI assistant config files
	python3 .agents/scripts/sync_rules.py

# ─────────────────────────────────────────────────────────────────────────────
# CLEANUP
# ─────────────────────────────────────────────────────────────────────────────
clean: ## Remove Python cache files and test artifacts
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find . -type f -name "*.pyc" -delete 2>/dev/null; true
	find . -type f -name "*.pyo" -delete 2>/dev/null; true
	rm -rf .pytest_cache htmlcov .coverage coverage.xml
	@echo "Cache and test artifacts removed."
