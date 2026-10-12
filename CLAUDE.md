# FailScope AI — Project Context & Engineering Rules

## 1. Project Overview & Objective
FailScope AI (AI Test Failure Investigator) is a multi-tenant SaaS application designed to ingest test failure reports (JUnit XML, error logs, and screenshots), normalize evidence, analyze root causes using AI, enable human-in-the-loop triage, and export clean, idempotent defect reports to Jira.

### Pilot Gate Targets
- **Precision**: $\ge$ 80% precision on high-confidence categories evaluated on an independent labeled holdout set.
- **Investigation Efficiency**: $\ge$ 25% reduction in median investigation time in paired customer pilots.
- **Citation Integrity**: All displayed evidence citations must map to real source artifacts.

---

## 2. Standard Failure Taxonomy
The LLM adapter and reviewer interface must strictly classify failures into one of these 6 categories:
1. `Application Bug`
2. `Script Issue`
3. `Data Issue`
4. `Environment`
5. `Integration`
6. `Unknown` (Abstain when evidence is insufficient or inconclusive)

---

## 3. Core SaaS & Compliance Controls (C01 – C08)
Every feature implementation must independently enforce these controls:

- **C01 — Tenant Isolation**: Database access and object storage must be explicitly scoped by `tenant_id`. Server-side validation must reject cross-tenant access.
- **C02 — Roles & RBAC**: Enforce 4 roles: `Admin`, `Analyst/Operator`, `Reviewer`, `Viewer`. Server-side authorization checks are mandatory on all API endpoints.
- **C03 — Data Protection & Redaction**: Encrypt traffic and stored artifacts. Redact credentials/secrets (tokens, passwords, API keys) via regex before sending log data to LLM adapters.
- **C04 — Reliable Background Jobs**: Run file parsing and AI analysis jobs asynchronously with explicit status tracking (`queued`, `processing`, `completed`, `failed`) and idempotent retry limits.
- **C05 — Audit & Version History**: Record an explicit audit log for imports, model/prompt versions, reviewer actions (accept/reject/correct), and Jira exports with actor ID and timestamp.
- **C06 — Usage & Quotas**: Track job runs, storage volume, and token usage per tenant; enforce quota limits.
- **C07 — Operational Readiness**: Health check routes, error logging/alerts, cost ceilings, and backup/restore capabilities.
- **C08 — Model Transparency**: Store provider/model details and prompt versions; display confidence levels alongside supporting and conflicting evidence.

---

## 4. UI/UX Styling Rules
Strictly adhere to the NVIDIA-inspired design guidelines:
- **Color Palette**: Restricted strictly to **Blue** (Corporate/Tech primary accent) and **White** (Pure white `#FFFFFF` / clean slate backgrounds `#F8FAFC`).
- **NO GRADIENTS**: Zero color gradients permitted anywhere in the UI. Use flat solid fills, crisp borders, and subtle overlays.
- **Typography & Layout**: High-density data tables, generous spacing, clear visual hierarchy, bold headings, and explicit status badges.

---

## 5. Technology Stack
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy ORM, Alembic, Pydantic v2
- **Frontend**: React, TypeScript, Vite, Tailwind CSS / Chakra UI, Framer Motion
- **Database**: PostgreSQL 15+
- **Auth**: JWT + Google OAuth
- **AI Adapter**: OpenAI API with structured JSON output enforcement
- **DevOps**: Docker Compose (Localhost), GitHub Actions (CI/CD)

---

## 6. Project Directory Layout

```text
failscope-ai/
├── .github/
│   └── workflows/          # CI/CD pipelines (GitHub Actions)
├── backend/
│   ├── alembic/            # Database migration scripts
│   ├── app/
│   │   ├── api/            # FastAPI routers (v1 endpoints)
│   │   ├── core/           # Configuration, security, database session
│   │   ├── models/         # Tenant-scoped SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response models
│   │   ├── services/       # Core business logic (Parser, LLM adapter, Jira exporter)
│   │   └── utils/          # Credential redaction, hashing, artifact scanners
│   ├── tests/              # Backend unit and integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/         # Static assets and icons
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Dashboard layout shells
│   │   ├── pages/          # Application view screens
│   │   ├── services/       # API client bindings (Axios)
│   │   └── theme/          # Blue & White color tokens & global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml      # Localhost multi-container stack
├── CLAUDE.md               # Project rules and context for Claude Code
└── README.md
```

---

## 7. Local Development URLs

Ports are shifted off the usual defaults (5432/8000/5173) because another unrelated
project on this machine already holds those. FailScope AI runs under its own compose
project name (`failscope-ai`) on:

| Service | URL |
|---|---|
| Frontend (app) | http://localhost:5180 |
| Backend (API) | http://localhost:8010 |
| Backend interactive docs | http://localhost:8010/docs |
| Postgres | localhost:5433 (db `failscope`, user/pass `failscope`) |
| Redis | localhost:6380 |

**Running it:**
```bash
# Backend (from backend/, with venv activated)
uvicorn app.main:app --port 8010

# Worker (from backend/, separate terminal)
python -m app.workers.run_worker

# Frontend (from frontend/)
npm run dev
```
Or via Docker: `docker compose up` from the repo root (builds db, redis, backend, worker, frontend).