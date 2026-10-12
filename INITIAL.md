# INITIAL.md - Define Your Product

> Fill this out, then run `/generate-prp INITIAL.md`

---

## PRODUCT

**Name:** FailScope AI (AI Test Failure Investigator)

**Description:** QA teams upload failed test evidence (JUnit XML + logs + screenshots). The system normalizes the evidence, uses AI to investigate and categorize the root cause (Application Bug / Script Issue / Data Issue / Environment / Integration / Unknown) with a confidence score and cited evidence, lets a human reviewer accept/reject/correct the diagnosis, and exports a clean defect summary. Buyer is a QA lead or testing agency with existing automation (BrowserStack/Katalon users). Multi-tenant SaaS; local-only for now.

**Type:** SaaS (multi-tenant)

---

## TECH STACK

| Layer | Choice |
|-------|--------|
| Backend | FastAPI + Python 3.11+ |
| Frontend | React + TypeScript + Vite |
| Database | PostgreSQL + SQLAlchemy |
| Queue/Jobs | Redis + background worker (import & investigation jobs) |
| Object Storage | Local disk, tenant-scoped paths (swap for S3-compatible later) |
| Auth | JWT + Google OAuth, role-based (admin/analyst/reviewer/viewer) |
| UI | Tailwind + Framer Motion — blue & white only, no gradients, NVIDIA-style clean/professional look |
| AI Provider | OpenAI (key already available), behind an adapter — store provider/model/prompt_version with every call |
| Payments | None (add after pilot validation) |

---

## MODULES

### Module 1: Authentication & Tenancy (Built-in, extended)

**Models:** Tenant, User (role ENUM: admin/analyst/reviewer/viewer, tenant_id FK), RefreshToken

**Endpoints:**
- POST /auth/register, /auth/login, /auth/refresh
- GET /auth/me
- GET /auth/google/login     - redirect to Google OAuth consent screen
- GET /auth/google/callback  - exchange code, create/link user + tenant, issue JWT
- Every other endpoint requires tenant-scoped session + role check (server-side, not just UI hiding)

**Pages:**
```
/login     - Email/password form + "Sign in with Google" button
/register  - Email/password form + "Sign in with Google" button
/profile
```
First-time Google sign-in with no existing invite auto-creates a new tenant and makes that user its admin (self-serve signup). If the email matches a pending invite, they join that tenant with the invited role instead.

**Acceptance:** cross-tenant requests return 403/404, never leak existence of other tenants' data.

---

### Module 2: Run Import & Evidence

**Description:** Ingest a failed test run (JUnit XML + attached logs/screenshots), validate it, store artifacts tenant-scoped, and correlate every artifact to its exact test case + timestamp.

**Models:**
```
Run:
  - id, tenant_id (FK), external_run_id, build_id, environment
  - source_type (junit), status (pending/processing/completed/failed/partial)
  - imported_by (FK User), created_at
  - UNIQUE(tenant_id, external_run_id)

TestCase:
  - id, run_id (FK), name, classname
  - status (failed/error/skipped), duration_ms, stack_trace, started_at

Artifact:
  - id, tenant_id (FK), run_id (FK), test_case_id (FK, nullable)
  - type (log/screenshot/trace), storage_path, checksum_sha256
  - redacted (bool), created_at
  - UNIQUE(tenant_id, checksum_sha256)

Job:
  - id, tenant_id (FK), type (import/investigate/export)
  - status (queued/processing/completed/failed/partial)
  - attempts, max_attempts, idempotency_key (UNIQUE), payload (jsonb), error (jsonb)
```

**Endpoints:**
```
POST   /api/runs/import          - Upload JUnit XML + attachments, enqueue import job
GET    /api/runs                 - List runs (tenant-scoped)
GET    /api/runs/{id}             - Run detail + test cases
GET    /api/runs/{id}/tests/{tid}/evidence  - Correlated artifacts timeline
GET    /api/jobs/{id}             - Job status (queued/processing/failed/partial)
```

**Pages:**
```
/runs                 - List + import button
/runs/new             - Upload JUnit XML + logs + screenshots
/runs/{id}            - Test case list, status
/runs/{id}/tests/{id} - Evidence timeline viewer
```

---

### Module 3: AI Diagnosis & Grouping

**Description:** Redact secrets from artifacts, send structured evidence to the AI adapter, get back a category + confidence + cited evidence (or abstain), cluster recurring failure signatures.

**Models:**
```
Diagnosis:
  - id, test_case_id (FK)
  - category (application_bug/script_issue/data_issue/environment/integration/unknown)
  - confidence_score (float), evidence (jsonb)
  - model_provider, model_name, prompt_version
  - status (pending/reviewed), created_at

FailureGroup:
  - id, tenant_id (FK), signature_hash, title, created_at

FailureGroupMember:
  - group_id (FK), test_case_id (FK), added_by (FK User), removed_at (nullable)
```

**Endpoints:**
```
POST /api/diagnoses/{test_case_id}/run   - Trigger/retry investigation (idempotent)
GET  /api/diagnoses/{id}                 - Diagnosis with evidence + confidence
GET  /api/failure-groups                 - List groups
POST /api/failure-groups/{id}/merge      - Merge groups (keep history)
POST /api/failure-groups/{id}/split      - Split group (keep history)
```

**Pages:**
```
/diagnoses/{id}        - Category, confidence, cited evidence
/groups                - Recurring failure groups, merge/split UI
```

---

### Module 4: Reviewer Workflow & Defect Export

**Description:** Reviewer accepts/rejects/corrects a diagnosis with full audit history, then exports a reviewed defect draft; publish is explicit and idempotent (sandbox Jira for now).

**Models:**
```
Review:
  - id, diagnosis_id (FK), reviewer_id (FK User)
  - action (accept/reject/correct), corrected_category (nullable), reason
  - created_at

DefectExport:
  - id, tenant_id (FK), failure_group_id (FK, nullable), test_case_id (FK, nullable)
  - title, steps, expected_result, actual_result, evidence_refs (jsonb)
  - jira_issue_key (nullable), idempotency_key (UNIQUE)
  - status (draft/published), created_at

AuditLog:
  - id, tenant_id (FK), actor_id (FK User, nullable), action
  - entity_type, entity_id, metadata (jsonb), created_at
```

**Endpoints:**
```
POST /api/diagnoses/{id}/review     - accept/reject/correct
POST /api/exports                   - Create defect draft
POST /api/exports/{id}/publish      - Idempotent publish (sandbox Jira)
GET  /api/audit-logs                - Admin-only audit trail
```

**Pages:**
```
/review-queue          - Pending diagnoses to review
/exports/{id}           - Draft defect, edit before publish
```

---

### Module 5: Dashboard & Usage

**Description:** Filter unresolved groups by severity/owner/age; separate AI hypotheses from reviewer-confirmed defects; track investigation time saved against a recorded baseline; track usage for quotas.

**Models:**
```
UsageRecord:
  - id, tenant_id (FK), period, jobs_count, storage_bytes
  - model_tokens_in, model_tokens_out, cost_estimate_usd, created_at
```

**Endpoints:**
```
GET /api/dashboard/groups     - Filterable unresolved groups
GET /api/dashboard/metrics    - Investigation time saved, holdout accuracy
GET /api/usage                - Current period usage vs. tenant quota
```

**Pages:** /dashboard, /settings

---

## MVP SCOPE

Must Have (MVP release):
- [x] User registration/login + Google OAuth
- [ ] Tenant isolation + RBAC enforced server-side on every operation (C01, C02)
- [ ] JUnit XML + log + screenshot import with validation and dedupe (F01)
- [ ] Evidence correlation to exact test + timestamp (F02)
- [ ] AI categorization into 6 categories with reviewer correction + history (F03)
- [ ] Confidence score + evidence + abstention (F04)
- [ ] Recurring failure grouping with merge/split history (F05)
- [ ] Redaction of secrets before any model call; audit every model call (F12, C08)
- [ ] Reviewer accept/reject/correct workflow with audit trail (F10)
- [ ] Reviewed defect draft export, idempotent publish (F08)
- [ ] Dashboard: unresolved groups filter, AI hypothesis vs. confirmed, investigation time metric (F11)
- [ ] Queued/retryable/idempotent background jobs for import + investigation (C04)
- [ ] Audit log for imports, reviews, exports, privileged changes (C05)

Explicitly NOT in MVP (Next phase):
- Flaky vs. regression detection (F06)
- External CI/log connectors (F07)
- AI fix proposal + rerun verification (F09)
- Subscriptions/billing (C06) — after pilot validation
- Full ops hardening: alerting, backup/restore drills (C07) — light version only for pilot

---

## ACCEPTANCE CRITERIA

- [ ] Users can register/login (JWT + Google OAuth) and are scoped to their tenant
- [ ] Cross-tenant data access attempts are denied (automated test required)
- [ ] Users can import a JUnit XML run and see correlated evidence per failed test
- [ ] AI diagnosis shows category, confidence, and cited evidence; abstains when evidence is insufficient
- [ ] Reviewer can accept/reject/correct a diagnosis; action is recorded with actor + timestamp
- [ ] Defect export is idempotent (re-publish with same key does not duplicate)
- [ ] Secrets in uploaded artifacts are redacted before any model call
- [ ] 80%+ test coverage on backend services
- [ ] Docker builds successfully (localhost run via docker-compose)
- [ ] Pilot gate instrumented: precision vs. labeled holdout, median investigation time vs. baseline

---

## RUN

```bash
/generate-prp INITIAL.md
/execute-prp PRPs/failscope-ai-prp.md
```
