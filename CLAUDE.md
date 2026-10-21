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
The backend container runs `alembic upgrade head` automatically on start - fresh
deploys self-migrate with zero manual steps. The `/app/storage` volume mount
point is created with `appuser` ownership in the image *before* `useradd`'s
chown, so a fresh volume inherits the right permissions on first attach
(Docker only copies the image's ownership into a brand-new volume once, at
creation) - otherwise every upload fails with a `PermissionError`.

---

## 8. Backup & Restore (C07)

`scripts/backup.sh` dumps the Postgres database (`pg_dump -Fc`) and the artifact
storage volume (tarball) to `backups/<name>_<timestamp>.{dump,tar.gz}`.
`scripts/restore.sh <timestamp>` reverses it - `pg_restore --clean` against the
db container plus extracting the tarball back into the storage volume.

Both scripts set `MSYS_NO_PATHCONV=1` and stream through stdin/stdout rather than
a second bind mount, to avoid a Git-Bash-on-Windows path-mangling gotcha where a
POSIX-looking argument meant for *inside* the container gets rewritten as a
Windows host path.

Verified end-to-end (2026-10-12): imported a run, backed up, wiped both volumes
with `docker compose down -v`, restored, and confirmed both the database row and
the actual artifact file on disk survived intact.

```bash
bash scripts/backup.sh                  # writes backups/db_<ts>.dump + artifacts_<ts>.tar.gz
bash scripts/restore.sh <ts>             # restores that pair, replacing current data
```

---

## 9. Environments

FailScope AI uses separate environments. Databases, object storage, credentials, OpenAI keys and Jira connections are never shared between them.

| Environment | Purpose | Data | Where it runs |
|---|---|---|---|
| **Development** | Build and debug features | Local test data | Local Docker Compose (see Section 7 for ports) |
| **Staging / QA** | Validate release candidates, run release testing, UAT and pilot dry-runs | Test data and test integrations only (Jira sandbox project, test OpenAI key) | TBD (hosting and URL to be confirmed) |
| **Production / Live** | Serve real customers | Real customer data | TBD (hosting and URL to be confirmed) |
| **Demo (optional)** | Stable demonstration | Synthetic data only | TBD |

### Environment rules
- Keep **separate** databases, storage volumes/buckets, secrets, OpenAI API keys and Jira connections per environment. Production data must never be copied into dev, staging or demo without redaction.
- A public demo must **not** be used as the everyday testing environment.
- Select the environment with an `APP_ENV` setting (`development`, `staging`, `production`, `demo`). Never hard-code environment-specific URLs, keys or ports.
- Secrets stay on the server and outside GitHub. `.env` files and credentials are excluded through `.gitignore`. Commit only `.env.example` with placeholder values.
- Use test payment credentials in development and staging once subscriptions are added (C06 follow-up after pilot validation).
- Production is **not** a code backup. Recover code from GitHub; keep versioned releases and a recovery option for every production deploy.
- Backups of the database and uploaded artifacts are taken in every environment that holds data worth keeping, and restore must be tested (see Section 8).

---

## 10. Testing Strategy

Map every requirement (F-series features and C01 - C08 controls) to at least one test. Define the critical end-to-end journeys and the release checks **before** implementation. Every test covers positive, negative, boundary and failure scenarios where relevant.

### 10.1 Feature testing during development
| Layer | What to test | Suggested tooling (proposed) |
|---|---|---|
| Unit | JUnit XML parser, credential redaction (C03), failure taxonomy mapping, hashing, artifact scanners, confidence logic | `pytest` |
| API | Every FastAPI endpoint: valid input, invalid input, missing auth, wrong role, wrong tenant, pagination, error format | `pytest` + FastAPI `TestClient` |
| Database | Alembic migrations apply cleanly (up and down) on an empty and a populated database; constraints, indexes, `tenant_id` on every tenant-scoped table | `pytest` + Postgres container |
| Background jobs (C04) | Status transitions `queued` -> `processing` -> `completed` / `failed`, idempotent retry limits, worker crash and restart, duplicate job submission | `pytest` |
| Frontend | Component and page behaviour, loading, empty, validation, access-denied and failure states, role-specific views | `Vitest` + React Testing Library |
| Negative and boundary | Invalid or malformed XML, empty file, oversized file, unsupported file type, huge stack traces, unicode, duplicate imports, missing screenshots or logs | `pytest` |
| Jira export | Idempotent export (no duplicate defects on retry), Jira API failure and timeout handling, correct field mapping | `pytest` + mocked Jira |

### 10.2 Role, tenant and access testing (C01, C02)
- Test both the **visible UI permissions** and **direct backend requests** (API called without going through the UI).
- Cover all four roles: `Admin`, `Analyst/Operator`, `Reviewer`, `Viewer`, against every endpoint (permission matrix: view, create, edit, delete, approve, export, administer).
- Cross-tenant tests: tenant A must not be able to read, modify, export or search tenant B's runs, test results, artifacts (files), diagnoses, defects, audit logs or AI context. Server-side validation must reject these with the correct status code.
- Object storage paths and download URLs must be tenant-scoped and must not be guessable or reusable across tenants.

### 10.3 AI behaviour testing (C03, C08, Pilot Gate)
Use a repeatable evaluation dataset, never ad-hoc prompts.
- **Benchmark**: a labeled set of representative failures (target: 100 where feasible), split **by incident** into a tuning set and an independent **holdout** set. Never tune on the holdout.
- **Precision**: at least 80% on high-confidence categories on the holdout set; report per category (the 6 taxonomy classes) and per customer environment.
- **Abstention**: the model must return `Unknown` when evidence is insufficient; test inconclusive cases.
- **Citation integrity**: every displayed citation must resolve to a real source artifact; any unresolved citation fails the test.
- **Prompt injection**: logs, stack traces and screenshots that contain instructions (for example "ignore previous instructions") must not change classification, leak data or trigger actions.
- **Data leakage and redaction**: seeded secrets (tokens, passwords, API keys) in logs must be redacted before reaching the LLM adapter; verify the exact payload sent.
- **Structured output**: invalid or incomplete JSON from the model is rejected, retried within limits, and handled safely.
- **Reliability**: provider timeouts, rate limits, retries and fallback behaviour.
- **Cost and usage (C06)**: token and cost ceilings per job and per tenant; quota enforcement when limits are reached.
- **Model transparency (C08)**: provider, model and prompt version are stored; confidence, supporting and conflicting evidence are displayed. Re-run the evaluation whenever the model or prompt version changes.

### 10.4 End-to-end (E2E) testing
- Tool: `Playwright` (proposed).
- Critical journeys that must stay automated and green:
  1. Sign in (JWT and Google OAuth) -> select tenant.
  2. Import a failed run (JUnit XML + logs + screenshot) -> job completes.
  3. View evidence and AI diagnosis with citations.
  4. Reviewer accepts, rejects or corrects a category (audit entry created).
  5. Export a defect to Jira -> exported once only (idempotent).
  6. Access-denied journey for a role or tenant without permission.

### 10.5 Non-functional testing
- **Security**: dependency scanning, secret scanning, authentication and authorization checks, file-upload validation (type, size, content), injection and XSS checks, encryption in transit and at rest verification (C03).
- **Performance**: measure against set targets (for example import time for large runs, API latency, concurrent jobs); run in staging, not on a laptop.
- **Accessibility**: keyboard navigation, contrast, labels and focus states on all screens, consistent with the blue and white design rules in Section 4.
- **Browser and device**: latest Chrome, Edge, Firefox and Safari; responsive checks on mobile and tablet widths.
- **Operational readiness (C07)**: health-check routes, error logging and alerts, cost ceilings, and **backup and restore** (verified 2026-10-12; repeat after infrastructure changes and periodically).
- **Audit (C05)**: verify audit records exist with actor ID and timestamp for imports, model and prompt versions, reviewer actions and Jira exports.

### 10.6 Defect retesting and regression
- After every fix: verify the original issue, test the affected areas, and run the critical automated E2E journeys.
- Add a **regression test** whenever it meaningfully prevents the defect from returning.
- Record the root cause for each production-impacting defect (blameless post-mortem).

### 10.7 Payments and subscriptions (future, after pilot validation)
Not in the current scope. When subscriptions are added, test: successful and failed payments, renewal, cancellation, expiry, refunds, and duplicate or delayed webhooks. Access must change only through **verified server-side payment events**, using test payment credentials in dev and staging.

---

## 11. Build and Deployment Checks (CI)

GitHub Actions must run these on every pull request, and a release can only be promoted when all pass:
- Formatting and linting (backend `ruff`, frontend `eslint` / `prettier`).
- Type checks (backend `mypy`, frontend `tsc --noEmit`).
- Backend tests (`pytest`) and frontend tests (`vitest`).
- Alembic migration check on a clean database.
- Frontend and backend Docker image builds.
- Dependency and secret scanning.
- E2E smoke suite against the Docker Compose stack.

Test commands (proposed; confirm against the repo before relying on them):
```bash
# Backend (from backend/)
pytest -q

# Frontend (from frontend/)
npm run lint && npm run typecheck && npm run test

# E2E (from repo root, with the stack running)
npx playwright test
```

---

## 12. Release Flow

1. **Develop incrementally**: small, complete features. For each change, inspect the existing implementation first, make focused changes, and run the relevant checks.
2. **Review**: inspect code changes, permissions, database migrations, dependencies and test results; verify the evidence behind any completion report.
3. **Commit and push** meaningful changes regularly; use small commits and reviewed pull requests; keep docs and tests aligned with the code.
4. **Deploy the release candidate to Staging** with controlled database migrations; validate the exact version intended for release.
5. **Release testing in Staging**: functional regression, critical E2E journeys, role and tenant isolation checks, relevant security assessments, performance tests against targets, AI evaluation on the holdout set.
6. **UAT and pilot**: representative users complete real journeys (onboarding, usability, usefulness, support readiness); resolve release-blocking findings. Pilot gate targets are in Section 1.
7. **Release-readiness review**: critical tests pass, secrets protected, restore tested, monitoring configured, pricing, privacy information, terms and support channels ready.
8. **Release to Production**: promote the approved build, apply planned migrations, keep a recovery option; production data and credentials stay separate from staging.
9. **Production smoke checks**: verify login, essential journeys, permissions and integration health using controlled accounts; check errors and monitoring immediately after deploy.
10. **Monitor and improve**: track failures, performance, AI quality and cost, and customer feedback; periodically review access, dependencies and backup restoration.

---

## 13. Definition of Done (per feature)

A change is done only when:
- [ ] Requirement and acceptance criteria are linked to tests.
- [ ] Positive, negative, boundary and failure tests exist and pass.
- [ ] C01 (tenant isolation) and C02 (RBAC) are enforced server-side and tested with direct API calls.
- [ ] Secrets are redacted (C03) and no credentials are committed.
- [ ] Audit entries are written where required (C05).
- [ ] Alembic migration reviewed and tested up and down.
- [ ] UI follows Section 4 (blue and white only, no gradients) and has loading, empty, error and access-denied states.
- [ ] CI checks in Section 11 pass.
- [ ] Documentation (this file, README, requirements) is updated.
