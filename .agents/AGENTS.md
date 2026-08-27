# Central AI Rules & Guidelines for AI-Powered CRM

Welcome to the AI-Powered CRM project. This document serves as the **single source of truth** for all project standards, architecture, and development conventions. AI coding agents and human developers must adhere to these rules strictly.

---

## 🏗️ Project Architecture & Tech Stack

This project is a production-ready enterprise CRM system powered by a multi-agent AI architecture with specialized communication, forecasting, and field mobile modules.

* **Frontend Web Framework**: React 19 with TypeScript, Vite, Tailwind CSS, TanStack React Query v5, Zustand, Recharts, Lucide Icons, and Nginx
* **Field Sales Mobile Framework**: React Native 0.86 with Expo SDK 57, React 19, Expo Router (file-based routing across 78 static routes), `@shopify/flash-list` list virtualization, Universal Voice Playback Engine (Web Speech & Expo Speech), Zustand, Lucide Native, React Native Reanimated, and AsyncStorage
* **Backend Framework**: Python 3.9+ with FastAPI and Uvicorn
* **Database**: PostgreSQL 14+ with SQLAlchemy 2.0 ORM and Alembic migrations
* **AI Orchestration**: LangChain-based custom agent framework with `TraceMixin` transparent LLM tracing, live OpenAI/Anthropic support (`AsyncOpenAI`, `AsyncAnthropic`), and `SmartFallbackLLM`
* **Real-time Communication**: WebSockets (`/ws`) with `ConnectionManager` event stream & Redis pub/sub
* **Background Tasks & Email Delivery**: Asynchronous task queue (`services/task_queue_service.py`) with Redis persistence, exponential backoff retries, dedicated worker process (`worker.py`), and Gmail SMTP infrastructure (`services/email_service.py`)
* **Caching & Event Bus**: Redis (pub/sub for agent event communication and response caching)
* **Testing**: pytest and pytest-asyncio (backend), Vitest + React Testing Library (frontend web)
* **Code Formatting**: Black (code formatter), Flake8 (linter), and Mypy (static type checker)
* **Containerization**: Docker + Docker Compose (standalone `docker-compose.yml` for prod with `web`, `worker`, `db`, `redis`, `frontend` and `docker-compose.dev.yml` for dev)

### Directory Layout
* `/agents/`: Specialized AI agents extending `BaseAgent` (`base_agent.py`) with `TraceMixin` (Lead Qualification, Email Intelligence, Sales Pipeline, Customer Success, Meeting Scheduler, Analytics, Voice Call, WhatsApp, Custom Agent Builder).
* `/api/`: Modular FastAPI routers (leads, deals, customers, emails, meetings, analytics, voice calls, WhatsApp, forecasting, custom agents, i18n, war_room, journey, sequences, auth, audit_logs, tasks, WebSockets).
* `/database/`: DB models (`models.py`), schema definitions (`schema.sql`), connection setup (`connection.py`), and seeding (`seed.py`).
* `/services/`: Business services for forecasting (`forecasting_service.py`), translation (`i18n_service.py`), authentication & RBAC (`auth_service.py`), audit trail (`audit_service.py`), task queue (`task_queue_service.py`), and transactional email (`email_service.py`).
* `/frontend/`: Production React 19 + TypeScript SPA with Feature-Sliced Design (`src/features/*`), Vite, Tailwind CSS, TanStack Query, Zustand, and Nginx.
* `/mobile/`: Field Sales Mobile Application in Expo SDK 57 + React Native with Expo Router, `@shopify/flash-list` virtualization, Dynamic Custom Fields Engine, Universal Voice Playback Studio, and Offline Sync Queue.
* `/workflows/`: Central coordination logic (`orchestrator.py`) managing execution flow, events, and background tasks.

---

## 🚀 Specialized Platform Features

1. **Enterprise Authentication, Security & RBAC Suite** (`/api/auth`, `services/auth_service.py`, `frontend/src/features/auth`, `frontend/src/features/settings`, `mobile/src/app/(auth)`):
   - Secure JWT token rotation, HTTP-only cookie sessions, brute-force account lockouts, and social SSO (Google & Microsoft).
   - Fine-grained Role-Based Access Control matrix (`admin: ['*']`, `sales`, `support`, `auditor`) with client-side `PermissionGuard` and server-side `require_permission`.
   - Super Admin public registration protection with seeded account (`admin@gmail.com` / `admin123`) and full User Management CRUD in `/settings` (search, role filters, permission editor, pagination).
   - Asynchronous Gmail SMTP password recovery flow with zero user enumeration risk and single-use DB-hashed tokens.
2. **Enterprise Email Delivery & Task Queue Infrastructure** (`services/email_service.py`, `services/task_queue_service.py`, `agents/email_intelligence_agent.py`, `api/emails.py`, `frontend/src/features/emails`, `worker.py`):
   - Centralized single source of truth for email delivery (`services/email_service.py`) supporting Gmail SMTP on port 587 with STARTTLS, RFC-5321 envelope parsing, Google App Password authentication, and responsive dark-mode HTML templates.
   - Zero duplicate SMTP implementations: `EmailIntelligenceAgent` and `/api/emails` delegate all outbound transmissions to `email_service` via resilient background queueing (`task_queue.enqueue_email`).
   - Background task queue with exponential backoff retries (1s, 2s, 4s...) and Redis state caching (`crm:task:<id>`).
   - Standalone background worker daemon (`worker.py`) containerized in Docker.
3. **Voice AI Call Intelligence Studio & Universal Speech Playback** (`/api/voice-calls`, `/agents/voice_call_agent.py`, `frontend/src/features/voice-ai`, `mobile/src/app/voice`, `mobile/src/services/voicePlaybackService.ts`):
   - Real-time speech turn analysis, buyer intent scoring, and dynamic objection battle-cards with audio playback.
   - Post-call automated CRM synthesis, action item extraction, and live microphone speech recognition note capture.
   - Universal platform-split speech synthesis engine (`voicePlaybackService.web.ts` using Web Speech API and `voicePlaybackService.native.ts` bridging `expo-speech`).
4. **WhatsApp Business Multi-Agent Hub** (`/api/whatsapp`, `/agents/whatsapp_agent.py`, `frontend/src/features/whatsapp`):
   - Omnichannel WhatsApp chat with 24/7 AI Auto-Pilot lead qualification and customer support.
   - Broadcast template messaging campaigns, conversation tagging, search, and handoff archiving.
5. **Advanced Monte Carlo & ML Revenue Forecasting** (`/api/forecasting`, `/services/forecasting_service.py`, `frontend/src/features/forecasting`):
   - Stochastic Monte Carlo simulations (P10 conservative, P50 expected, P90 optimistic confidence bounds).
   - Monthly ARR progression charts vs targets, pipeline stage velocity & hazard conversion matrix.
   - Saved scenario comparison table and side-by-side executive review charts.
6. **Multi-Language Support (I18n)** (`/api/i18n`, `/services/i18n_service.py`, `frontend/src/features/multi-language`):
   - Dynamic translation management system with RTL/LTR layout synchronization (e.g. Urdu, Arabic).
7. **No-Code Custom Agent Builder** (`/api/custom-agents`, `/agents/custom_agent_builder.py`, `frontend/src/features/custom-agents`):
   - Visual creator for custom AI agents with customizable prompts, triggers, toolkits, and testing playground.
8. **AI Deal War Room, Strategy Studio & Automations** (`/api/war-room`, `workflows/orchestrator.py`, `frontend/src/features/war-room`, `mobile/src/app/(tabs)/workflows.tsx`):
   - Multi-agent consensus verdicts, SWOT quadrant matrices, live competitor battle-cards, and buying committee maps.
   - 1-Click Smart Proposal Studio with tier pricing, SLA terms, and e-signature URL workflows.
   - Multi-Agent Workflow Automation Triggers with full CRUD and live AI Orchestrator execution.
9. **AI Autonomous Customer Journey & Churn Prevention Studio** (`/api/journey`, `frontend/src/features/journey`):
   - Telemetry-guided lifecycle stage pipeline (`onboarding`, `adoption`, `expansion`, `renewal`, `at_risk`) and stage ARR aggregation.
   - Real-time churn probability radar and 1-click autonomous retention intervention playbooks via `CustomerSuccessAgent`.
10. **AI SDR Multi-Touch Outreach & Cadence Studio** (`/api/sequences`, `frontend/src/features/sequences`):
   - Omnichannel outreach sequences across Email, WhatsApp, and Voice AI briefings with configurable day delays.
   - 1-click lead cohort enrollment and live AI prompt-engineered step copy generation.
11. **Field Sales Mobile Intelligence Application & Offline Command** (`/mobile`, `mobile/src/app`, `mobile/src/components/dynamic-fields`):
   - React Native Expo SDK 57 mobile field sales suite mapped 1:1 with backend entities and Tactical Command design tokens.
   - Field Command Dashboard, Pipeline Radar with AI Health Breakdown, Audio Intelligence Voice Debrief Studio, `@shopify/flash-list` high performance list virtualization, and Dynamic Custom Fields Engine.
   - Offline-First dual persistence with automatic 30s background action retry queue.

---

## 📜 Development Standards & Rules

### 1. General Python Standards
* **Formatting**: Follow PEP 8 style. Use `black` for formatting and `flake8` for linting.
* **Typing**: Use static type hints (`Optional[T] = None`, `Dict[str, Any]`, `List[T]`) for all function arguments and return values.
* **Datetime & Timezones**: Always use timezone-aware `datetime.now(timezone.utc)` instead of deprecated `datetime.utcnow()`. Normalize DB naive timestamps using `_to_utc()` or `dt.replace(tzinfo=timezone.utc)` before comparisons.
* **Async Code**: Use `async`/`await` for I/O bound operations (FastAPI endpoints, network requests, DB queries when applicable).
* **Logging**: Use `loguru` or the project's standard logger for structured logging. Avoid naked `print()` statements in production code.

### 2. API Design & FastAPI Rules
* **Routers**: Organize endpoints inside modular routers in `/api/`. Include all routers in `/main.py`.
* **Request/Response Validation**: Always use Pydantic models (Pydantic V2) for validating incoming payloads and defining response schemas (`response_model`). Use `Annotated[List[T], Field(min_length=N)]` for list length constraints.
* **Dependency Injection**: Use `Depends(get_db)` to manage database sessions cleanly and ensure connection cleanup.
* **HTTP Exceptions**: Always raise standard `HTTPException` with meaningful detail strings instead of custom raw responses for client errors.

### 3. Database Conventions
* **ORM Usage**: Define all models in `database/models.py` inheriting from `Base`.
* **UUID Keys**: Use UUIDs as primary keys for all tables (e.g. `uuid.uuid4`).
* **Indexes**: Add index columns for high-query fields (e.g. `email` on contacts, `stage` on deals) to optimize lookup performance.
* **Relationships**: Specify explicit `relationship()` definitions and `back_populates` for related tables to enable clean joins.
* **Primitive Coercion**: When reading SQLAlchemy column values in Python expressions, loops, or dictionary keys, explicitly cast with `str()`, `int()`, or `float()` to prevent type checker mismatches.

### 4. Agent Development
* **BaseAgent Inheritance**: All new agents must inherit from `BaseAgent` in `agents/base_agent.py`.
* **Execution Flow**: Implement the `execute(self, task)` method to perform the agent's work.
* **LLM Calls**: Use the `think(self, prompt)` method to invoke the agent's LLM.
* **Activity Logs**: Log significant actions using `await self.log_activity("activity_type", details_dict)`.
* **Event Communication**: Use `publish_event` and `subscribe_event` to communicate asynchronously with other agents.

### 5. Frontend & Mobile Tactical Command Design System
* **Tactical Command Design Rules**: Strict adherence to `design.md`:
  - **Zero Border Radius**: Global `rounded-none`, `--radius: 0rem;`, `* { border-radius: 0 !important; }` in web and sharp corners in mobile.
  - **Color Palette**: Void Black (`#0B0C10`), Matte Black (`#121212`), Steel Border (`#3A4552`), Tactical Amber / Gold Primary (`#FFB800`), Destructive (`#FF2A54`), Cyan (`#00E5FF`), Emerald (`#00FF9D`).
  - **Primary Buttons**: `bg-[#FFB800] text-[#0B0C10] font-bold rounded-none uppercase`.
  - **Typography**: `font-mono` applied to telemetry, tables, timestamps, IDs, financial metrics, currency notations, and charts.
  - **Transitions**: `transition-none` with 0ms easing globally for instant tactical feedback in web, and smooth Reanimated keyframes in mobile.
  - **List Virtualization**: Memory-recycled `@shopify/flash-list` for all mobile collections.
  - **Theme Toggle**: Real-time dark/light mode switching with contrast inversion.
* **Feature-Sliced Web Design**: Organize feature domains in `frontend/src/features/<feature-name>/` across 19 specialized modules.
* **Mobile Architecture**: Organize screens in `mobile/src/app/`, shared components in `mobile/src/components/`, and state stores in `mobile/src/stores/`.
* **State Management**: Use TanStack Query v5 for web server state and Zustand for mobile client/server state.

### 6. Testing & Quality Guidelines
* **Backend Framework**: Write unit and integration tests using `pytest` and `pytest-asyncio` (195 tests across 27 suites).
* **Frontend Web Framework**: Write component and integration tests using `Vitest` and React Testing Library (86 tests across 24 suites).
* **Mobile Validation**: Run `bunx expo-doctor`, `npx tsc --noEmit`, and `bunx expo export --platform web` (78 static routes, 0 errors).
* **Mocks**: Mock external APIs and LLM generation (e.g., Anthropic/OpenAI) to avoid running costly live requests in tests.

### 7. Cybersecurity & Transport Hardening
* **HTTP Security Headers**: Enforce `SecurityHeadersMiddleware` on all responses (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`).
* **CSV Formula Injection Prevention**: Sanitize outgoing CSV data (`sanitize_csv_cell`) by prefixing dangerous calculation triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) with `'`.
* **SSRF Defense**: Validate all outbound webhook URLs using `is_safe_webhook_url(...)` to block loopback, link-local metadata (`169.254.169.254`), and private cloud IP ranges in production.
* **Secure Cookies**: Ensure authentication cookies enforce `Secure=True`, `HttpOnly=True`, and `SameSite=Lax` in production (`APP_ENV=production` or `COOKIE_SECURE=true`).

### 8. Git Workflow
* **Branches**: Create branches with prefixes: `feature/` for new functionality, `bugfix/` for bug fixes, and `chore/` for tasks.
* **Commit Messages**: Use clean, descriptive, and imperative commit messages (e.g., `feat: Add field sales mobile app intelligence`).

---

## 🛠️ Project-Specific Skills Index

We provide modular, project-specific AI skills inside `.agents/skills/`. Refer to them for deep guidelines:

1. [Project Architecture](file:///Users/taha/projects/ai-crm-agents/.agents/skills/project-architecture/SKILL.md) - Understanding agent collaboration, feature-sliced architecture, and workflow orchestration.
2. [Backend Development](file:///Users/taha/projects/ai-crm-agents/.agents/skills/backend-development/SKILL.md) - Developing FastAPI endpoints, services, dependencies, and schemas.
3. [Agent Development](file:///Users/taha/projects/ai-crm-agents/.agents/skills/agent-development/SKILL.md) - Creating, extending, and debugging CRM agents and custom agent builders.
4. [Frontend Development](file:///Users/taha/projects/ai-crm-agents/.agents/skills/frontend-development/SKILL.md) - Developing React 19 + TypeScript features, components, and TanStack Query state.
5. [Field Sales Mobile Development](file:///Users/taha/projects/ai-crm-agents/.agents/skills/field-sales-mobile/SKILL.md) - Developing React Native Expo SDK 57 field sales app, offline queue, dynamic custom fields, and voice recording studio.
6. [Database Development](file:///Users/taha/projects/ai-crm-agents/.agents/skills/database-development/SKILL.md) - Managing SQLAlchemy models, schemas, and migrations.
7. [Testing](file:///Users/taha/projects/ai-crm-agents/.agents/skills/testing/SKILL.md) - Writing and executing pytest, Vitest, and mobile validation checks.
8. [Git Workflow](file:///Users/taha/projects/ai-crm-agents/.agents/skills/git-workflow/SKILL.md) - Repository conventions and pull requests.
9. [DevOps & Infrastructure](file:///Users/taha/projects/ai-crm-agents/.agents/skills/devops-infrastructure/SKILL.md) - Standards for Docker, CI/CD, database migrations, backups, and observability.
10. [Cybersecurity](file:///Users/taha/projects/ai-crm-agents/.agents/skills/cybersecurity/SKILL.md) - Guidelines for secure headers, SSRF/XSS defense, formula sanitization, and session safety.

---

## 🔄 Rules Synchronization

To update configuration files for Cursor, Claude Code, Copilot, Cline/Roo Code, and Windsurf, update this file (`AGENTS.md`) or the skill files (`.agents/skills/*/SKILL.md`), and run:

```bash
python3 .agents/scripts/sync_rules.py
```

Do not edit the auto-generated tool-specific files directly in the root of the project.
