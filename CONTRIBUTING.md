# 🤝 Contributing to AI-Powered CRM

Thank you for your interest in contributing to the **AI-Powered CRM Autonomous Multi-Agent Swarm**! We welcome contributions from developers, AI researchers, and designers worldwide.

---

## 📜 Table of Contents
1. [Code of Conduct](#-code-of-conduct)
2. [Getting Started & Local Setup](#-getting-started--local-setup)
   - [Option A — Docker (Fastest)](#option-a--docker-fastest)
   - [Option B — Local Native Setup](#option-b--local-native-setup)
3. [Architecture & Coding Standards](#-architecture--coding-standards)
   - [Backend Standards (FastAPI & SQLAlchemy)](#backend-standards-fastapi--sqlalchemy)
   - [Frontend Standards (React 19, TypeScript & Tailwind)](#frontend-standards-react-19-typescript--tailwind)
   - [Agent Development Standards](#agent-development-standards)
4. [Testing & Quality Assurance](#-testing--quality-assurance)
5. [Git Workflow & PR Guidelines](#-git-workflow--pr-guidelines)

---

## 🛡️ Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [support@aicrm.dev](mailto:support@aicrm.dev).

---

## 🛠️ Getting Started & Local Setup

### Option A — Docker (Fastest)

```bash
# Clone the repository
git clone https://github.com/taha123618/AI-CRM-Agents.git
cd AI-CRM-Agents

# Start dev cluster (web, worker, db, redis, frontend)
docker compose -f docker-compose.dev.yml up --build -d

# Seed the database
docker compose -f docker-compose.dev.yml exec web python3 database/seed.py
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

### Option B — Local Native Setup

#### Prerequisites
- **Python**: 3.9+ (3.10 or 3.11 recommended)
- **Node.js**: 18+ and `npm`
- **PostgreSQL**: 14+ (or local SQLite fallback)
- **Redis**: 6+

#### 1. Backend Setup
```bash
# Create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run database migrations and seed default data
alembic upgrade head
python3 database/seed.py

# Start FastAPI server with live reload
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📐 Architecture & Coding Standards

### Backend Standards (FastAPI & SQLAlchemy)
- **Formatting & Linting**: Follow PEP 8. Format with `black` and lint with `flake8`. Run `make quality`.
- **Static Typing**: Use static type hints (`Optional[T]`, `Dict[str, Any]`, `List[T]`) for all arguments and return values.
- **Pydantic V2**: Use Pydantic models for request validation and `response_model` definitions.
- **Timezone Awareness**: Always use `datetime.now(timezone.utc)` instead of deprecated `datetime.utcnow()`.
- **Async I/O**: Use `async`/`await` for all I/O-bound operations (FastAPI endpoints, network calls, agent execution).

### Frontend Standards (React 19, TypeScript & Tailwind)
- **Tactical Command Design System**: Strict adherence to `design.md`:
  - **Zero Border Radius**: Global `rounded-none`, `--radius: 0rem;`, `* { border-radius: 0 !important; }`. Never use rounded pill or card corners.
  - **Color Palette**: Void Black (`#0B0C10`), Matte Black (`#121212`), Steel Border (`#3A4552`), Tactical Gold Accent (`#FFB800`), Destructive (`#FF2A54`).
  - **Typography**: Monospace `font-mono` on telemetry, metrics, timestamps, and data tables.
  - **Theme-Adaptive Scrollbars**: 6px squared scrollbars driven by CSS variables (`--scrollbar-thumb`).
- **Feature-Sliced Architecture**: Organize domain logic inside `frontend/src/features/<feature-name>/`.
- **Type Safety**: Strictly typed with zero `any` allocations. Verify with `npm run type-check`.

### Agent Development Standards
- All agents must inherit from `BaseAgent` in `agents/base_agent.py` with `TraceMixin`.
- Implement `execute(self, task)` and use `await self.think(prompt)` for LLM reasoning.
- Transparently log activities via `await self.log_activity("type", payload)`.

---

## 🧪 Testing & Quality Assurance

All PRs must pass the complete **276 automated test suite**:

```bash
# 1. Run backend tests (190 tests across 27 suites)
PYTHONPATH=. .venv/bin/python3 -m pytest tests/ -v

# 2. Run frontend component & integration tests (86 tests across 24 suites)
cd frontend && npm run test

# 3. Verify TypeScript static analysis
cd frontend && npm run type-check

# 4. Verify frontend production build
cd frontend && npm run build
```

---

## 🌿 Git Workflow & PR Guidelines

1. **Branch Naming**:
   - `feature/<name>` (e.g. `feature/voice-ai-transcription`)
   - `bugfix/<name>` (e.g. `bugfix/rate-limiter-redis`)
   - `chore/<name>` (e.g. `chore/update-dependencies`)
2. **Commit Messages**: Imperative, descriptive style (e.g. `feat: Add Monte Carlo stage velocity matrix`).
3. **Rule Synchronization**: If you modify `.agents/AGENTS.md` or `.agents/skills/*`, run:
   ```bash
   python3 .agents/scripts/sync_rules.py
   ```
4. **Pull Requests**: Fill out the [PR Template](.github/PULL_REQUEST_TEMPLATE.md) completely with test results.
