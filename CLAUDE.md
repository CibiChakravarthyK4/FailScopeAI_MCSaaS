# RootTrace Ivory — Project Context & Engineering Rules

## 1. Overview

RootTrace Ivory (Test Failure Investigator) is a multi-tenant SaaS application that ingests test failure reports (JUnit XML, error logs, screenshots), normalizes evidence, analyzes root causes with AI, enables human-in-the-loop triage, and exports clean, idempotent defect reports to Jira.

**Product name:** RootTrace Ivory (formerly FailScope AI; the old name must not be used anywhere in the UI, docs or marketing). **Brand:** Ivory.

**Pilot gate targets:** >= 80% precision on high-confidence categories (independent labeled holdout); >= 25% reduction in median investigation time in paired pilots; every displayed evidence citation maps to a real source artifact.

**Failure taxonomy** (strict, 6 categories): `Application Bug`, `Script Issue`, `Data Issue`, `Environment`, `Integration`, `Unknown` (abstain when evidence is insufficient).

**Stack**: FastAPI (Python 3.11+) + SQLAlchemy + Alembic + Pydantic v2 backend; React + TypeScript + Vite + Tailwind CSS + Framer Motion frontend; PostgreSQL 15+; JWT + Google OAuth (MFA required for Platform Owner); OpenAI behind an adapter; Docker Compose + GitHub Actions.

## 2. Working Process

Work is driven by numbered prompts (Prompt 1, Prompt 2, ...) from the user - one at a time, never starting the next until told to. Every feature or fix includes tests written/updated by Claude (positive, negative, boundary, failure), then lint, typecheck, `pytest` and `vitest` actually run; UI changes also get a screenshot check at 1440/1024/390px confirming no horizontal overflow. Real results are shown, never just "tests pass." Nothing is marked finished unless its tests actually ran and passed - a skipped or failing check is stated plainly, not glossed over. Every response ends with a task update in the FINISHED / PENDING / BLOCKED-NEEDS-A-HUMAN format. Full detail and the exact template: `docs/working-process.md`.

## 3. Local development

Ports are shifted off the usual defaults (another project on this machine holds 5432/8000/5173). Compose project name: `failscope-ai` (legacy name, kept - see "Never do" below).

| Service | URL |
|---|---|
| Frontend (native dev) | http://localhost:5180 |
| Frontend (full Docker stack) | http://localhost:8081 |
| Backend (API) | http://localhost:8010 (interactive docs at `/docs`) |
| Postgres | localhost:5433 (db/user/pass `failscope`) |
| Redis | localhost:6380 |

```bash
# Fast loop: Postgres + Redis only in Docker, everything else native
docker compose -f docker-compose.dev.yml up -d
cd backend && alembic upgrade head && uvicorn app.main:app --port 8010   # one terminal
cd backend && python -m app.workers.run_worker                          # another terminal
cd frontend && npm run dev                                              # another terminal

# Full stack (matches CI's e2e job): backend+worker+frontend all containerized
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d --build
```

**Exact lint/type/test commands** (verified against `.github/workflows/ci.yml`, not proposals):

```bash
# Backend (from backend/)
ruff check app
mypy app --ignore-missing-imports
pytest --cov=app --cov-fail-under=80

# Frontend (from frontend/)
npm run lint
npm run type-check
npm test -- --run

# E2E (from e2e/, with the full stack above already running)
npx playwright test
```

## 4. Never do

- No red, no green, no gradients anywhere in the UI (see `docs/design-system.md` for the full two-colour rule).
- No invented facts, statistics, customers, awards, certifications or testimonials - anywhere, ever.
- Never remove or weaken a tenant-isolation check (C01).
- Never rename the legacy `failscope`/`failscope-ai` technical names (Docker Compose project name, Postgres db/user) during ordinary feature work - that rename is a planned, separate task (back up, rename, restore, verify).
- No old product name ("FailScope AI", "Scope Ring", `--fs-`) anywhere user-facing.
- Never skip server-side RBAC/tenant checks because the UI already hides something (C02).
- Never commit secrets, real `.env` files, or `.env` values other than placeholders.

## 5. Design system

Two colours only: **Blue** (`--iv-blue` family) as the sole accent, **White**/neutral greys for everything else. No red, no green, no gradients - ever (see "Never do"). Full token table, component patterns, app-shell rules, and landing-page visual rules (one nav border, one link colour token, >=14px body text at WCAG AA, one spacing scale, one container width) are in `docs/design-system.md`.

## 6. Core SaaS & Compliance Controls (C01-C08)

Every feature must independently enforce these, server-side:

- **C01 — Tenant Isolation**: every DB/storage access scoped by `tenant_id`; Platform Owner is the single, narrow exception (account/plan/usage/billing data only - see `docs/platform-owner.md`).
- **C02 — Roles & RBAC**: 5 roles (`Platform Owner`, `Admin`, `Analyst/Operator`, `Reviewer`, `Viewer`); every endpoint checks server-side, never relies on UI hiding.
- **C03 — Data Protection & Redaction**: encrypt in transit and at rest; redact credentials/secrets via regex before any LLM call.
- **C04 — Reliable Background Jobs**: async import/AI jobs with explicit status tracking and idempotent retry limits.
- **C05 — Audit & Version History**: audit log (actor + timestamp) for imports, model/prompt versions, reviewer actions, Jira exports, and every Platform Owner access to client/billing data.
- **C06 — Usage & Quotas**: track job runs, storage, token usage per tenant; enforce quotas.
- **C07 — Operational Readiness**: health checks, error logging/alerts, cost ceilings, tested backup/restore (`docs/environments.md`).
- **C08 — Model Transparency**: store provider/model/prompt version with every call; display confidence + supporting/conflicting evidence.

## 7. Marketing-claim rule

Every claim made on the public site must map to a control that is actually enforced in code and covered by a passing test - never aspirational copy. Examples:

| Public claim | Enforced by | Tested by |
|---|---|---|
| "Secrets are redacted before reaching the model" | C03 (`app/services/redaction_service.py`) | `tests/test_prompt_injection.py` and redaction unit tests |
| "Every diagnosis cites real evidence" | Citation-integrity requirement (Section 1 pilot gate) | Citation-integrity test, `docs/testing.md` |
| "Reviewer actions are fully audited" | C05 (`app/services/audit_service.py`) | Audit-log assertions in `tests/test_reviews_and_groups.py` |

If a new marketing sentence can't be mapped to an existing or new control + test, don't ship the sentence.

## 8. Project layout

```text
backend/app/{routers,models,schemas,services,storage,utils,workers}/
frontend/src/{components,pages,services,theme,config,content}/
docs/{design-system,testing,platform-owner,billing,public-legal-pages,environments,working-process}.md
docs/ui/        # reference screenshots
PRPs/, agents/, skills/, scripts/
```

## 9. Current status (as of 2026-10-28)

**Done**: all 5 MVP modules (auth/tenancy, run import/evidence, AI diagnosis/grouping, reviewer workflow/export, dashboard/usage) built and passing - 128/128 backend tests, 30/30 Playwright E2E tests. Full public marketing site (landing, company, contact, pricing, security, demo, help center, FAQ, integrations, tour, legal pages, 404) and Platform Owner dashboard built. Google OAuth, JWT auth, redaction, grouping, idempotent export all working end-to-end against the local Docker stack. Landing-page visual fixes applied (confidence meter rounding, connector overhang, badge shapes, stats strip hierarchy).

**In progress**: two unresolved landing-page visual reports (a colour strip above the nav, a doubled border under it) pending a screenshot from the user - not reproducible from source alone.

**Blocked on human decisions**: every `[placeholder]` in `frontend/src/config/company.ts` (legal name, address, phone, grievance officer, legal doc effective dates) and `frontend/src/config/pricing.ts` ("Contact us for pricing" by design) - see `docs/public-legal-pages.md`. Payment provider integration deferred to post-pilot (`docs/billing.md`). Brand/domain name clearance not yet done.

**Explicitly out of MVP** (not started): flaky-vs-regression detection (F06), external CI/log connectors (F07), AI fix-proposal + rerun verification (F09).

## 10. Further detail

@docs/design-system.md
@docs/testing.md
@docs/platform-owner.md
@docs/billing.md
@docs/public-legal-pages.md
@docs/environments.md
@docs/working-process.md
