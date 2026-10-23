# RootTrace Ivory — Project Context & Engineering Rules

## 1. Project Overview & Objective  *(changed: new product name)*
RootTrace Ivory (Test Failure Investigator) is a multi-tenant SaaS application designed to ingest test failure reports (JUnit XML, error logs, and screenshots), normalize evidence, analyze root causes using AI, enable human-in-the-loop triage, and export clean, idempotent defect reports to Jira.

**Product name:** RootTrace Ivory (formerly FailScope AI; the old name must not be used anywhere in the UI, docs or marketing). **Brand:** Ivory (see Section 14).

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

- **C01 — Tenant Isolation**: Database access and object storage must be explicitly scoped by `tenant_id`. Server-side validation must reject cross-tenant access. **Single exception:** the `Platform Owner` role may read client account, plan, usage and billing data across tenants (Section 15). By default it must never read a tenant's artifacts, logs, screenshots, diagnoses or AI context (see client data protection in Section 15).
- **C02 — Roles & RBAC**: Enforce **5 roles**: `Platform Owner`, `Admin`, `Analyst/Operator`, `Reviewer`, `Viewer`. `Platform Owner` sits above `Admin`, belongs to no tenant, and is limited to the product owner's account. Server-side authorization checks are mandatory on all API endpoints.
- **C03 — Data Protection & Redaction**: Encrypt traffic and stored artifacts. Redact credentials/secrets (tokens, passwords, API keys) via regex before sending log data to LLM adapters.
- **C04 — Reliable Background Jobs**: Run file parsing and AI analysis jobs asynchronously with explicit status tracking (`queued`, `processing`, `completed`, `failed`) and idempotent retry limits.
- **C05 — Audit & Version History**: Record an explicit audit log for imports, model/prompt versions, reviewer actions (accept/reject/correct), Jira exports, **and every Platform Owner access to client or billing data**, with actor ID and timestamp.
- **C06 — Usage & Quotas**: Track job runs, storage volume, and token usage per tenant; enforce quota limits.
- **C07 — Operational Readiness**: Health check routes, error logging/alerts, cost ceilings, and backup/restore capabilities.
- **C08 — Model Transparency**: Store provider/model details and prompt versions; display confidence levels alongside supporting and conflicting evidence.

---

## 4. UI/UX Styling Rules  *(changed: Ivory design system, token prefix and mark renamed)*
Strictly adhere to the NVIDIA-inspired design guidelines, applied through the Ivory design system below. The look is clean, bright and professional, in the spirit of Google's own web products: generous white space, a calm blue accent, crisp type, and nothing decorative. It must be unique and instantly recognisable while using only two colours.

### 4.1 Two-colour rule
- **Colour 1: Blue.** The only accent colour. Flat shades and tints of this one blue are allowed.
- **Colour 2: White.** Pure white `#FFFFFF` and clean backgrounds `#F8FAFD`.
- **Neutrals** (near-black text and light cool greys for borders and secondary text) are allowed and do not count as colours.
- **NO RED. NO GREEN.** No other hues at all (also no amber, orange, purple, yellow). Errors, success, warnings and failures are communicated by **icon, label and shape**, never by red or green.
- **NO GRADIENTS**: Zero gradients anywhere (backgrounds, buttons, charts, hero sections, loaders). Use flat solid fills, crisp borders and subtle flat overlays.

### 4.2 Colour tokens (single source in `frontend/src/theme/`)
| Token | Value | Use |
|---|---|---|
| `--iv-blue` | `#1A73E8` | Primary accent: primary buttons, links, active tab, focus ring |
| `--iv-blue-hover` | `#1765CC` | Hover and pressed |
| `--iv-blue-deep` | `#174EA6` | Strong emphasis, headings that need accent, selected text |
| `--iv-blue-100` | `#D2E3FC` | Selected state, active chips (flat tint) |
| `--iv-blue-50` | `#E8F0FE` | Row hover, panels, info banners (flat tint) |
| `--iv-white` | `#FFFFFF` | Cards, surfaces, inputs |
| `--iv-bg` | `#F8FAFD` | Page background |
| `--iv-text` | `#202124` | Primary text (neutral) |
| `--iv-text-2` | `#5F6368` | Secondary text (neutral) |
| `--iv-border` | `#DADCE0` | 1px borders and dividers (neutral) |

Tokens are defined once; components must reference tokens, never raw hex values. (`--iv-` = Ivory prefix; it replaces the old `--fs-` prefix.)

### 4.3 Unique signature (what makes it RootTrace Ivory)
- **Evidence Rail**: a persistent right-hand panel on every failure that lists source citations. Clicking one scrolls to and highlights the exact line in the evidence viewer.
- **Confidence Meter**: a segmented bar made of 10 flat blocks (filled blue vs outlined) with the percentage as text. Never a gradient bar.
- **Trace Ring**: the brand mark is a flat blue ring with a notch and a single trace line leaving it (root cause traced back to its source); reused as the loading indicator (rotating flat ring) and the empty-state illustration.
- **Case-file layout**: each failure opens as a "case file" with a bold title, a status strip, then tabs (Evidence, Diagnosis, History, Export).
- **Taxonomy chips**: the 6 categories are shown as flat chips distinguished by icon and label (filled vs outlined vs dashed border), not by colour.
- **Search-first header**: a wide, prominent search bar at the top of the app (find a run, test or failure signature), in the clean Google-style manner.

### 4.4 Typography, layout and components
- Typography: **Inter** (or Roboto) for the interface and a monospace for logs and stack traces. Bold headings, 4 clear sizes, strong hierarchy.
- Layout: lots of white space, light top bar, left navigation, content on white cards over the `--iv-bg` background.
- High-density data tables with sticky headers; row hover is a flat `--iv-blue-50` tint.
- Shape: pill-shaped (fully rounded) primary buttons, 8px radius on inputs and cards, 1px `--iv-border` borders, very light flat shadows only (no glow, no gradient shadow).
- Explicit status badges, always **icon plus text**, no red or green:
  - `queued`: outlined badge, clock icon.
  - `processing`: blue-tint badge, spinning ring icon.
  - `completed`: filled blue badge, check icon.
  - `failed`: white badge with deep-blue border, cross icon and the word "Failed".
  - Warnings and errors in forms: deep-blue text with an alert icon and a left border bar.
- Motion (Framer Motion): short (150 to 250 ms), purposeful transitions only (panel slide, row expand). Respect `prefers-reduced-motion`.
- States: every screen has loading, empty, error and access-denied states in the same two-colour style.
- Accessibility: text/background contrast at least WCAG AA, visible focus rings (2px `--iv-blue`), full keyboard navigation, never rely on colour alone.
- Responsive: desktop-first, usable on tablet and mobile widths.

### 4.5 App layout rules (logged-in app)
- **Shell**: every logged-in route renders inside `<AppLayout>` (`frontend/src/components/app/AppLayout.tsx`): a left `Sidebar` (240px, collapsing to a 64px icon rail below `lg:`) plus a sticky `TopBar` (search, notifications, avatar menu) above the page content. No page renders its own nav, top bar, or sidebar.
- **Container**: every page's content sits inside exactly one `<PageContainer>` (`frontend/src/components/app/PageContainer.tsx`, `mx-auto max-w-[1280px] px-6 py-8`), used as the direct child of `<AppLayout>`. No page may set its own top-level width or offset (no competing `max-w-*`/`mx-auto` wrapping or replacing it) - this is what keeps every page's content starting at the same left edge, and is checked automatically by `frontend/src/pages/pageLayout.test.ts`. A page needing a narrower reading width (Settings, Profile, export forms) nests an inner `<div className="max-w-2xl">` *inside* the full-width `PageContainer`, never passed in via a `className` prop (conflicting Tailwind width utilities resolve by order in the compiled stylesheet, not by prop order, so a `className="max-w-2xl"` on `PageContainer` can silently lose to its own hardcoded `max-w-[1280px]`).
- **Page header**: every page's title uses the shared `<PageHeader>` (`frontend/src/components/app/PageHeader.tsx`) - optional breadcrumbs, an `<h1>` title, optional description, optional right-aligned action - instead of a hand-rolled `<h1>`.
- **Spacing**: stick to the 8px scale (`gap-2`, `gap-4`, `gap-6`, `px-6`, `py-8`, …) already used by `PageContainer`/`PageHeader`/`Card`; don't introduce one-off spacing values.
- **Empty states**: use the shared `<EmptyState>` (`frontend/src/components/app/EmptyState.tsx`) - Trace Ring + message + optional action - instead of ad hoc "no data" text.
- **Wizard pattern**: a multi-step flow (for example Import run) uses the shared `<Stepper>` (`frontend/src/components/app/Stepper.tsx`) inside a centred `max-w-[880px]` column within `PageContainer`, with step labels hidden below `sm:` (icon-only circles) to avoid horizontal overflow on narrow screens.
- **Verification**: after changing any app-shell page, screenshot it at 1440/1024/390px and check `document.documentElement.scrollWidth === clientWidth` at each width (no horizontal overflow) before considering the change done.

---

## 5. Technology Stack
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy ORM, Alembic, Pydantic v2
- **Frontend**: React, TypeScript, Vite, Tailwind CSS / Chakra UI, Framer Motion
- **Database**: PostgreSQL 15+
- **Auth**: JWT + Google OAuth (MFA required for Platform Owner)
- **AI Adapter**: OpenAI API with structured JSON output enforcement
- **DevOps**: Docker Compose (Localhost), GitHub Actions (CI/CD)

---

## 6. Project Directory Layout  *(changed: root folder renamed)*

```text
roottrace-ivory/
├── .github/
│   └── workflows/          # CI/CD pipelines (GitHub Actions)
├── backend/
│   ├── alembic/            # Database migration scripts
│   ├── app/
│   │   ├── api/            # FastAPI routers (v1 endpoints)
│   │   │   └── owner/      # Platform Owner endpoints (clients, billing report)
│   │   ├── core/           # Configuration, security, database session
│   │   ├── models/         # Tenant-scoped SQLAlchemy ORM models (+ plans, billing records)
│   │   │                   # plus the non-tenant-scoped public-form tables (contact_messages,
│   │   │                   # demo_requests, help_article_feedback) and legal_acceptances (Section 17.4)
│   │   ├── schemas/        # Pydantic request/response models (+ schemas/public.py)
│   │   ├── services/       # Core business logic (Parser, LLM adapter, Jira exporter, billing)
│   │   │                   # plus public-site services (contact/demo/help-feedback,
│   │   │                   # public_submission_service, mail_service, legal_acceptance_service)
│   │   ├── storage/        # Local artifact storage
│   │   └── utils/          # Credential redaction, hashing, artifact scanners
│   ├── tests/              # Backend unit and integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/         # Static assets and icons
│   │   ├── components/     # Reusable UI components
│   │   │   └── marketing/  # Public site shell (Container, MarketingHeader/Footer,
│   │   │                   # PublicPageHeader, LegalLayout) - Section 17.2
│   │   ├── config/         # company.ts (Section 17.3), pricing.ts - single source of truth
│   │   │                   # for facts shown on the public site, no invented values
│   │   ├── content/
│   │   │   └── help/       # Help Center articles (Markdown with front matter)
│   │   ├── layouts/        # Dashboard layout shells
│   │   ├── pages/          # Application view screens
│   │   │   └── owner/      # Platform Owner dashboard and billing report pages
│   │   ├── services/       # API client bindings (Axios)
│   │   └── theme/          # Blue & White color tokens (--iv-*) & global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml      # Localhost multi-container stack
├── CLAUDE.md               # Project rules and context for Claude Code
└── README.md
```

---

## 7. Local Development URLs  *(changed: product name and legacy-names note)*

Ports are shifted off the usual defaults (5432/8000/5173) because another unrelated
project on this machine already holds those. RootTrace Ivory runs under its own compose
project name (`failscope-ai`) on:

| Service | URL |
|---|---|
| Frontend (app) | http://localhost:5180 |
| Backend (API) | http://localhost:8010 |
| Backend interactive docs | http://localhost:8010/docs |
| Postgres | localhost:5433 (db `failscope`, user/pass `failscope`) |
| Redis | localhost:6380 |

> **Legacy technical names:** the compose project name (`failscope-ai`) and the Postgres database/user (`failscope`) come from the old product name. They are kept unchanged for now so the running stack, volumes and backups keep working. Renaming them to `roottrace-ivory` / `roottrace` is a planned, separate task: back up first (Section 8), rename, restore, and verify. Do not rename them as part of ordinary feature work.

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

RootTrace Ivory uses separate environments. Databases, object storage, credentials, OpenAI keys and Jira connections are never shared between them.

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
- Cover all five roles: `Platform Owner`, `Admin`, `Analyst/Operator`, `Reviewer`, `Viewer`, against every endpoint (permission matrix: view, create, edit, delete, approve, export, administer).
- Cross-tenant tests: tenant A must not be able to read, modify, export or search tenant B's runs, test results, artifacts (files), diagnoses, defects, audit logs or AI context. Server-side validation must reject these with the correct status code.
- Object storage paths and download URLs must be tenant-scoped and must not be guessable or reusable across tenants.
- **Platform Owner tests:**
  - Every owner endpoint returns 403 for `Admin`, `Analyst/Operator`, `Reviewer` and `Viewer`, both through the UI and direct API calls.
  - Owner menu and pages are not visible to any other role.
  - MFA is enforced; a Platform Owner session without MFA is rejected.
  - Every Platform Owner access to client or billing data creates an audit entry (C05).
  - Platform Owner cannot read any tenant's artifacts, logs, screenshots, diagnoses or AI context (C01 exception stays narrow).
  - Platform Owner cannot be created through public signup or by any tenant Admin.

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
  7. Platform Owner signs in with MFA -> opens client list -> opens billing report -> audit entries exist.

### 10.5 Non-functional testing
- **Security**: dependency scanning, secret scanning, authentication and authorization checks, file-upload validation (type, size, content), injection and XSS checks, encryption in transit and at rest verification (C03).
- **Performance**: measure against set targets (for example import time for large runs, API latency, concurrent jobs); run in staging, not on a laptop.
- **Accessibility**: keyboard navigation, contrast, labels and focus states on all screens, consistent with the two-colour design rules in Section 4.
- **UI design compliance**: automated check that no gradient (`linear-gradient`, `radial-gradient`, `conic-gradient`) and no colour outside the Section 4.2 tokens (in particular no red or green) appears in the frontend source or built CSS; visual regression snapshots of key screens.
- **Branding check (new)**: automated search that the old names ("FailScope", "Scope Ring", `--fs-`) do not appear in user-facing UI text, docs or marketing pages (the legacy technical names in Section 7 are the only allowed exception until the planned rename).
- **Browser and device**: latest Chrome, Edge, Firefox and Safari; responsive checks on mobile and tablet widths.
- **Operational readiness (C07)**: health-check routes, error logging and alerts, cost ceilings, and **backup and restore** (verified 2026-10-12; repeat after infrastructure changes and periodically).
- **Audit (C05)**: verify audit records exist with actor ID and timestamp for imports, model and prompt versions, reviewer actions, Jira exports and Platform Owner access.

### 10.6 Defect retesting and regression
- After every fix: verify the original issue, test the affected areas, and run the critical automated E2E journeys.
- Add a **regression test** whenever it meaningfully prevents the defect from returning.
- Record the root cause for each production-impacting defect (blameless post-mortem).

### 10.7 Payments and subscriptions (future, after pilot validation)
Not in the current scope. When subscriptions are added, test: successful and failed payments, renewal, cancellation, expiry, refunds, and duplicate or delayed webhooks. Access must change only through **verified server-side payment events**, using test payment credentials in dev and staging. Until then, billing data is manual or placeholder (Section 16) and is covered by the billing report tests in Section 15.

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
- [ ] UI follows Section 4 (two colours, flat, no gradients) and has loading, empty, error and access-denied states.
- [ ] No old product name appears in user-facing text (Section 10.5 branding check).
- [ ] CI checks in Section 11 pass.
- [ ] Documentation (this file, README, requirements) is updated.

---

## 14. Company & Brand  *(changed: Ivory brand, RootTrace Ivory product)*

| Item | Value |
|---|---|
| Product name | **RootTrace Ivory** (formerly FailScope AI) |
| Brand / company name | **Ivory** (current brand; legal company name to be finalised later) |
| Unique brand word | **Ivory**, used in every product name |
| Naming pattern | `<ProductName> Ivory` (for example "RootTrace Ivory") |
| Website / domain | TBD (to be created on Hostinger after the name is cleared) |
| Source repository | https://github.com/CibiChakravarthyK4/RootTrace_Ivory |
| Product family (proposed) | RootTrace Ivory (test failure investigator), AgentTrace Ivory (agent and MCP test lab), StayTrace Ivory (hotel booking and billing reconciliation) |

Rules:
- Every product and website name carries the brand word "Ivory".
- The name "AI" is not part of any product name.
- The legal company name, once decided, must be added here and used in the UI footer, legal pages and documentation.
- Brand colours are Blue and White (Section 4.1) only, with neutrals for text and borders.
- Name clearance is still open: domains on Hostinger, Indian and WIPO trademark search, and a web search for "RootTrace" and "Ivory" with "testing" or "QA".

---

## 15. Platform Owner Role & Dashboard

The `Platform Owner` is the product owner's own account. It sits above `Admin`, belongs to no tenant, and exists only for the owner.

### Access
- Same application and same login page. The owner menu and routes appear only when the signed-in user has the `Platform Owner` role.
- Created only through a controlled setup process (seed script or protected CLI). Never through public signup, and never by a tenant `Admin`.
- **MFA is mandatory.** All permissions are checked server-side on every `/api/v1/owner/*` endpoint.

### What the Platform Owner can see
- All client (tenant) accounts: name, status, created date, admins.
- Plan, price, purchase date, renewal or expiry date, and subscription status for each client.
- Usage per client: job runs, storage volume, token usage and quota status (C06).
- Payment and billing details and a **billing report** (revenue, outstanding, renewals due, expiries, usage by client), with export to CSV.

### What the Platform Owner cannot see
- Any tenant's test artifacts, logs, screenshots, diagnoses, AI context or defect content (the C01 exception is limited to account, plan, usage and billing data).

### Client data protection (decision recorded)
How much client data the Platform Owner can reach was decided as follows:

| Option | Platform Owner sees | Status |
|---|---|---|
| **A. Account and billing data only** | Client name, plan, price, dates, status, usage counts, billing report. No test artifacts, logs, screenshots, diagnoses or AI context. | **Chosen default** |
| B. Account data plus aggregated, anonymised usage statistics | Option A plus totals such as failure counts per category, with no content | Allowed later, add to this section if approved |
| C. Support access with consent ("break-glass") | Temporary, read-only view of one tenant's data | Not enabled. Only with explicit approval from that tenant's Admin, time-limited, scoped to that tenant and fully audited (C05) |

Everything beyond option A needs the tenant Admin's consent and a documented change to this file first.

### Controls
- Every access to client or billing data is written to the audit log with actor ID and timestamp (C05).
- Owner endpoints are rate limited and covered by the tests in Section 10.2 and E2E journey 7 in Section 10.4.
- Owner UI follows the same two-colour design system (Section 4).

---

## 16. Billing & Payments

- **Now (pre-release):** billing and payment records are manual or placeholder data stored per tenant (plan, price, dates, status, payment reference, notes). No payment provider is integrated.
- **At release:** choose a payment provider (for example Razorpay for India or Stripe) and add subscription, trial, renewal, cancellation, refund and expiry rules.
- Rules once a provider is added:
  - Use test credentials in development and staging; live keys only in production.
  - Keep payment keys on the server only, never in GitHub or in the frontend.
  - Change a tenant's access only through **verified server-side payment events** (signed webhooks). Handle duplicate and delayed webhooks idempotently.
  - Billing data shown to the `Platform Owner` is read from the same records the provider updates.
- Related tests: Section 10.7.

---

## 17. Public and Legal Pages

RootTrace Ivory's public site (everything reachable without signing in) follows the same brand and design rules as the rest of the product (Section 4), plus the rules below.

### 17.1 Routes (Phase 1 built; later phases add more)
`/` (landing), `/company`, `/contact`, `/privacy`, `/terms`, `/pricing`, `/security`, `/demo`, `/help` (and `/help/<slug>`). Phase 2/3 routes (`/faq`, `/integrations`, `/tour`, `/subprocessors`, `/cookies`, `/acceptable-use`, `/changelog`, `/blog`, `/accessibility`, `/dpa`) are added to the header/footer only once each page actually exists - a nav entry must never link to a route that isn't built yet.

### 17.2 Shared public layout
- Every public page renders inside `MarketingHeader` + `MarketingFooter` (`frontend/src/components/marketing/`), with all content inside the shared `<Container>` (1200px). No section may set its own max-width.
- Every page: `<PublicPageHeader>` (small label, one `<h1>`, one-line subtitle) or, for the two legal pages, `<LegalLayout>` (760px reading column, sticky table of contents from 1024px up, version/effective-date line, "Draft for legal review" banner).
- Every page calls the `useSeo(title, description, path)` hook (hand-rolled, not a dependency) to set `<title>`, meta description, canonical URL and `og:*` tags. Checked automatically by `frontend/src/pages/publicPageLayout.test.ts`, which also asserts every public page uses both `MarketingHeader` and `MarketingFooter`.

### 17.3 Company facts: one config file, no invented facts
- `frontend/src/config/company.ts` is the single source for every company fact shown on a page: legal name, addresses, emails, phone, Grievance Officer, legal document versions/effective dates. Every value starts as an explicit `[placeholder]` string - replace them before launch, never invent a real-looking value (no address, phone number, team member, customer, logo, award, statistic, certification or testimonial that isn't true and confirmed).
- The backend cannot import a frontend `.ts` file, so it has its own small set of settings for anything it needs at runtime: notification recipient addresses (`SUPPORT_EMAIL`, `SALES_EMAIL`, `HIRING_EMAIL` in `app/config.py`) and the authoritative legal document versions (`PRIVACY_POLICY_VERSION`, `TERMS_VERSION` - see 17.4). These must be kept in sync by hand with `company.ts`'s display copy of the same values.
- The word "AI" does not appear in headlines or marketing copy anywhere on the public site. The legal and security pages may say "automated analysis, including third-party language models" - that disclosure matters more than the house style rule.

### 17.4 Legal document versioning and acceptance (C05)
- The backend is the source of truth for "what version is current" (`PRIVACY_POLICY_VERSION` / `TERMS_VERSION` in `app/config.py`), not the frontend - this is what gets recorded against a user's acceptance, so it can't be client-supplied.
- `legal_acceptances` (`app/models/legal_acceptance.py`) stores one row per `(user, document, version)`, never updated in place, so "who accepted what, when" stays a complete history.
- Registration requires a checked "I agree to the Terms and Conditions and Privacy Policy" box (`accepted_terms`, validated server-side too) and records acceptance of both documents. `GET /auth/me` reports `needs_legal_acceptance`; any signed-in user who owes acceptance (most often a Google OAuth sign-in, which has no form step, or an existing user after a version bump) is redirected to `/accept-terms` by `ProtectedRoute` before they can reach any other page. `POST /auth/accept-legal` records it and writes an audit log entry.
- Bumping a document's version (because the wording changed materially) automatically makes every existing user owe re-acceptance on their next request - no separate "ask again" flag needed.

### 17.5 Public form protections
Every anonymous public form (Contact, Request a Demo) shares the same protections, in `app/services/public_submission_service.py` plus each form's own service:
- **Honeypot**: a field real users never see (hidden off-screen, not `type="hidden"`, so JS-driven bots that fill every visible-ish field still get caught) - a filled honeypot returns success but silently drops the submission, giving a bot no signal to retry a different way.
- **Rate limiting**: `rate_limit_by_ip`, same mechanism as auth endpoints, tuned per form (5/hour for Contact/Demo, 20/hour for the much lower-stakes help-article feedback).
- **No raw IP or message content in logs**: only a one-way hash of the IP is stored (`public_submission_service.hash_ip`); the only place message content goes is the notification email itself (the intended recipient), never a log line.
- **CAPTCHA hook**: `public_submission_service.verify_captcha()` exists and is called nowhere yet meaningfully - it always passes while `CAPTCHA_ENABLED` (default `False`) is off, and fails closed if turned on before a real provider replaces it. Wire a real provider in before relying on this.
- **Notification email**: `app/services/mail_service.py` is dev-mode only (console or file backend) - no real SMTP/provider is integrated yet (consistent with Section 16's "no third-party payment/notification services pre-release").
- These tables (`contact_messages`, `demo_requests`, `help_article_feedback`) are explicitly **not** tenant-scoped - there is no tenant_id to scope by, since the submitter has no account yet.

> There is no "Join our Team" / careers page - the product isn't hiring. A career-application flow (resume upload with magic-byte validation, owner-only review) was built and then fully removed; if hiring ever starts, rebuild it rather than looking for leftover code - none remains.

### 17.6 What still needs a human before launch
Every `[placeholder]` in `company.ts`, every `[LEGAL REVIEW]`-tagged assumption in `PrivacyPolicyPage.tsx`/`TermsPage.tsx` (retention periods, international-transfer specifics, liability cap, jurisdiction city), real plan pricing (`frontend/src/config/pricing.ts` - currently "Contact us for pricing" everywhere, by design), and a real Open Graph share image (`/og-image.png` doesn't exist - this tooling can't generate a raster image).