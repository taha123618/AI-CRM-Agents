# 🤝 Contributing to AI-Powered CRM

Thank you for your interest in contributing to the AI-Powered CRM project! This document outlines our development workflow, coding standards, branch conventions, and testing requirements.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Python 3.9+ with `venv`
- Node.js 18+ and `npm`
- PostgreSQL 14+ or Docker (optional for local SQLite testing)
- Redis 6+ (optional for local mock testing)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/taha123618/AI-CRM-Agents.git
cd AI-CRM-Agents

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Seed the database
python3 database/seed.py

# Start development server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 Coding Conventions & Standards

### Backend (Python)
- **Formatting & Style**: Follow PEP 8. Format with `black` and lint with `flake8`.
- **Static Typing**: Use type hints on all functions and Pydantic V2 schemas for request/response payloads.
- **Async Operations**: Use `async`/`await` for I/O bound database and LLM calls.
- **ORM Conversions**: When reading SQLAlchemy column values into dictionaries or loops, explicitly cast with `str()`, `int()`, or `float()`.

### Frontend (React 19 + TypeScript)
- **Feature-Sliced Architecture**: Organize components, hooks, queries, and types in `frontend/src/features/<feature-name>/`.
- **Strict Typing**: No implicit `any`. Verify with `npm run type-check`.
- **State Management**: TanStack Query v5 for server state, Zustand for client UI state.

---

## 🧪 Testing Requirements

All pull requests must pass the complete automated test suites:

```bash
# Run backend pytest suite (94+ tests)
PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v

# Run frontend Vitest suite (33+ tests)
cd frontend && npm run test

# Run frontend type-check and production build
npm run type-check
npm run build
```

---

## 🌿 Git Branching & Commit Messages

- **Branch Naming**:
  - Features: `feature/<feature-name>` (e.g. `feature/voice-ai-analytics`)
  - Bug fixes: `bugfix/<issue-name>` (e.g. `bugfix/war-room-indexing`)
  - Chores/Docs: `chore/<description>` (e.g. `chore/update-readme`)
- **Commit Messages**: Use clear, imperative messages (e.g., `feat: Add dynamic objection battle-cards`).
