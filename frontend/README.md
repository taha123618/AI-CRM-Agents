# AI-Powered CRM — Modern React + TypeScript Frontend

This directory contains the production-ready React + TypeScript frontend application for the AI-Powered CRM system.

## 🚀 Tech Stack & Features

* **Core Framework**: React 18 + TypeScript + Vite
* **Styling**: Tailwind CSS + Glassmorphism design system
* **State Management**:
  * **TanStack React Query v5**: Server-state caching, automatic refetching & mutation management
  * **Zustand**: Client-side UI state (navigation, sidebar collapse, theme, search queries, modals)
* **Real-time Telemetry**: Custom WebSocket stream client with automatic exponential backoff reconnection
* **Data Visualization**: Recharts (Pipeline distribution bar chart, Customer health donut chart)
* **Forms & Validation**: React Hook Form + Zod
* **HTTP Client**: Axios with typed request/response interceptors
* **Icons**: Lucide React

---

## 🛠️ Local Development

### 1. Standalone Development (Vite Dev Server)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:3000` with API proxying to `http://localhost:8000`.

### 2. TypeScript & Build Commands

```bash
npm run type-check   # Run strict TypeScript type check
npm run build        # Build optimized production bundle to dist/
npm run preview      # Preview production build locally
```

---

## 🐳 Docker Deployment

The frontend includes a multi-stage `Dockerfile` and production `nginx.conf`:

```bash
# Build and run using Docker Compose
docker-compose up -d --build
```

Access the UI at `http://localhost:3000`.
