# 🎯 Lead Qualification Agent

The Lead Qualification Agent automatically scores incoming inbound leads, enriches company and contact metadata, evaluates Ideal Customer Profile (ICP) fit, and triggers automated follow-up sequences.

---

## 🏗️ Architecture

```
New Lead Submission / API Trigger
             ↓
    FastAPI Router (/api/leads or /api/agents/qualify-lead)
             ↓
    LeadQualificationAgent (agents/lead_qualification_agent.py)
             ↓
    • Public Domain & Industry Data Enrichment
    • BANT / ICP Lead Scoring (0–100)
    • Buying Signal Detection
    • Status Routing (qualified, unqualified, nurture)
             ↓
    PostgreSQL (Contact & Company Models)
             ↓
    • If Score >= 70: Trigger Email Intelligence Agent
    • If Score >= 80: Trigger Meeting Scheduler Agent
             ↓
    WebSocket Telemetry Stream (/ws)
             ↓
    React Frontend (frontend/src/features/leads/)
```

---

## 🤖 Capabilities & Scoring Logic

1. **Lead Score Computation (0–100)**:
   - **Company Size & Revenue (30 pts)**: Enterprise (30), Mid-market (20), SMB (10).
   - **Job Title & Seniority (25 pts)**: C-Level/VP (25), Director (18), Manager (10), Individual (5).
   - **Industry Alignment (20 pts)**: High-fit verticals (Technology, Finance, Healthcare).
   - **Engagement & Budget Signals (25 pts)**: Stated timeline and budget match.
2. **Data Enrichment**:
   - Auto-extracts company domain, LinkedIn profiles, tech stack indicators, and employee count ranges.
3. **Automated Status Routing**:
   - `lead_score >= 70`: Marked as `qualified` and routed to account executives.
   - `lead_score 40–69`: Marked as `in-nurture` for automated drip campaigns.
   - `lead_score < 40`: Marked as `unqualified`.

---

## 🌐 API Endpoints & Triggers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agents/qualify-lead` | Trigger autonomous lead qualification on contact payload |
| `GET` | `/api/leads` | List contacts and leads with scoring filters |
| `GET` | `/api/leads/{id}` | Retrieve individual lead record with enriched metadata |
| `POST` | `/api/leads` | Create a new lead and automatically invoke qualification |

---

## 🗄️ Database Interactions

* **`Contact`**:
  * `lead_score` (Integer): 0–100 computed score.
  * `lead_status` (String): `new`, `qualified`, `unqualified`, `in-nurture`.
  * `enriched_data` (JSON): Company information, estimated revenue, social links.
  * `additional_metadata` (JSON): Qualification rationale and buying signals.
* **`Company`**:
  * `domain`, `industry`, `company_size`, `revenue_range`.

---

## 🎨 Frontend Features (`frontend/src/features/leads/`)

* **Leads Table**: Real-time scores, status badges, and search/filter controls.
* **Qualification Modal**: Inspect scoring breakdown, AI rationale, and enrichment attributes.
* **Batch Qualification Trigger**: Single-click button to re-score all pending leads.
* **Visual AI Badge**: Glowing `NEW AI QUALIFIED` indicator on newly evaluated prospects.
