# PRP: FailScope AI (AI Test Failure Investigator)

> Implementation blueprint for parallel agent execution

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | FailScope AI |
| **Type** | SaaS (multi-tenant) |
| **Version** | 1.0 |
| **Created** | 2026-10-11 |
| **Complexity** | High (multi-tenancy, RBAC, job queue, AI adapter, audit trail) |

---

## PRODUCT OVERVIEW

**Description:** QA teams upload failed test evidence (JUnit XML + logs + screenshots). The system normalizes the evidence, uses AI to investigate and categorize the root cause with a confidence score and cited evidence, lets a human reviewer accept/reject/correct the diagnosis, and exports a clean defect summary.

**Value Proposition:** Cuts QA investigation time on recurring/flaky failures; reviewer stays in control of every categorization and export (no silent automation of defect filing).

**MVP Scope:**
- [ ] Tenant-isolated auth (JWT + Google OAuth, RBAC: admin/analyst/reviewer/viewer)
- [ ] JUnit XML + log/screenshot import with validation, dedupe, async job processing
- [ ] Evidence correlation to exact test + timestamp
- [ ] AI categorization (6 categories) + confidence + cited evidence + abstention
- [ ] Recurring failure grouping with merge/split history
- [ ] Reviewer accept/reject/correct workflow with audit trail
- [ ] Reviewed defect draft export, idempotent publish
- [ ] Dashboard: unresolved groups, AI hypothesis vs. confirmed, investigation-time metric
- [ ] Secret redaction before every model call; full audit log

**Explicitly deferred (Next):** flaky-vs-regression detection, external CI/log connectors, AI fix proposal + rerun, billing/subscriptions, full ops hardening.

---

## TECH STACK

| Layer | Technology | Skill Reference |
|-------|------------|-----------------|
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md |
| Frontend | React + TypeScript + Vite | skills/FRONTEND.md |
| Database | PostgreSQL + SQLAlchemy | skills/DATABASE.md |
| Queue/Jobs | Redis + background worker | skills/BACKEND.md |
| Object Storage | Local disk, tenant-scoped paths | skills/BACKEND.md |
| Auth | JWT + bcrypt + Google OAuth | skills/BACKEND.md |
| UI | Tailwind + Framer Motion (blue & white, no gradients) | skills/FRONTEND.md |
| AI Provider | OpenAI, behind an adapter interface | skills/BACKEND.md |
| Testing | pytest + Vitest/RTL | skills/TESTING.md |
| Deployment | Docker + GitHub Actions | skills/DEPLOYMENT.md |

---

## DATABASE MODELS

### Tenant
- id, name, slug (unique), plan, created_at

### User
- id, tenant_id (FK), email (unique per tenant), hashed_password (nullable for OAuth-only), full_name
- role ENUM(admin, analyst, reviewer, viewer), google_sub (nullable, unique), is_active, created_at

### RefreshToken
- id, user_id (FK), token_hash, expires_at, revoked, created_at

### Run
- id, tenant_id (FK), external_run_id, build_id, environment, source_type(junit)
- status ENUM(pending, processing, completed, failed, partial), imported_by (FK User), created_at
- UNIQUE(tenant_id, external_run_id)

### TestCase
- id, run_id (FK), name, classname, status ENUM(failed, error, skipped), duration_ms, stack_trace, started_at

### Artifact
- id, tenant_id (FK), run_id (FK), test_case_id (FK, nullable), type ENUM(log, screenshot, trace)
- storage_path, checksum_sha256, redacted (bool), created_at
- UNIQUE(tenant_id, checksum_sha256)

### Job
- id, tenant_id (FK), type ENUM(import, investigate, export)
- status ENUM(queued, processing, completed, failed, partial), attempts, max_attempts
- idempotency_key (unique), payload (jsonb), error (jsonb), created_at, updated_at

### Diagnosis
- id, test_case_id (FK), category ENUM(application_bug, script_issue, data_issue, environment, integration, unknown)
- confidence_score (float), evidence (jsonb), model_provider, model_name, prompt_version
- status ENUM(pending, reviewed), created_at

### FailureGroup
- id, tenant_id (FK), signature_hash, title, created_at

### FailureGroupMember
- group_id (FK), test_case_id (FK), added_by (FK User), removed_at (nullable), created_at

### Review
- id, diagnosis_id (FK), reviewer_id (FK User), action ENUM(accept, reject, correct)
- corrected_category (nullable), reason, created_at

### DefectExport
- id, tenant_id (FK), failure_group_id (FK, nullable), test_case_id (FK, nullable)
- title, steps, expected_result, actual_result, evidence_refs (jsonb)
- jira_issue_key (nullable), idempotency_key (unique), status ENUM(draft, published), created_at

### AuditLog
- id, tenant_id (FK), actor_id (FK User, nullable), action, entity_type, entity_id, metadata (jsonb), created_at

### UsageRecord
- id, tenant_id (FK), period, jobs_count, storage_bytes, model_tokens_in, model_tokens_out, cost_estimate_usd, created_at

**Cross-cutting rule for every table above with a `tenant_id`:** all queries go through a tenant-scoped session dependency; no router/service may query by raw ID without a tenant filter. This is the one invariant every agent must respect.

---

## MODULES

### Module 1: Authentication & Tenancy
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account + tenant |
| POST | /auth/login | Email/password → JWT |
| POST | /auth/refresh | Refresh token |
| GET | /auth/me | Current user + tenant + role |
| GET | /auth/google/login | Redirect to Google OAuth consent |
| GET | /auth/google/callback | Exchange code; auto-create tenant+admin if no invite, else join invited tenant |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /login | LoginPage | LoginForm, GoogleSignInButton |
| /register | RegisterPage | RegisterForm, GoogleSignInButton |
| /profile | ProfilePage | ProfileForm |

---

### Module 2: Run Import & Evidence
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/runs/import | Upload JUnit XML + attachments, enqueue import job |
| GET | /api/runs | List runs (tenant-scoped) |
| GET | /api/runs/{id} | Run detail + test cases |
| GET | /api/runs/{id}/tests/{tid}/evidence | Correlated artifact timeline |
| GET | /api/jobs/{id} | Job status |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /runs | RunListPage | RunTable, ImportButton |
| /runs/new | RunImportPage | UploadForm |
| /runs/{id} | RunDetailPage | TestCaseTable |
| /runs/{id}/tests/{id} | EvidencePage | EvidenceTimeline |

---

### Module 3: AI Diagnosis & Grouping
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/diagnoses/{test_case_id}/run | Trigger/retry investigation (idempotent) |
| GET | /api/diagnoses/{id} | Diagnosis + evidence + confidence |
| GET | /api/failure-groups | List groups |
| POST | /api/failure-groups/{id}/merge | Merge groups, keep history |
| POST | /api/failure-groups/{id}/split | Split group, keep history |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /diagnoses/{id} | DiagnosisPage | CategoryBadge, ConfidenceMeter, EvidenceList |
| /groups | GroupsPage | GroupList, MergeSplitControls |

---

### Module 4: Reviewer Workflow & Defect Export
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/diagnoses/{id}/review | accept/reject/correct |
| POST | /api/exports | Create defect draft |
| POST | /api/exports/{id}/publish | Idempotent publish (sandbox Jira) |
| GET | /api/audit-logs | Admin-only audit trail |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /review-queue | ReviewQueuePage | ReviewCard, ActionButtons |
| /exports/{id} | ExportDraftPage | DefectForm, PublishButton |

---

### Module 5: Dashboard & Usage
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/groups | Filterable unresolved groups |
| GET | /api/dashboard/metrics | Investigation time saved, holdout accuracy |
| GET | /api/usage | Current period usage vs. tenant quota |

**Frontend Pages:**
| Route | Page | Components |
|-------|------|------------|
| /dashboard | DashboardPage | GroupFilterBar, MetricsCards |
| /settings | SettingsPage | UsagePanel |

---

## PHASE EXECUTION PLAN

**Phase 1: Foundation (parallel)**
- DATABASE-AGENT: all models above, Alembic migrations, tenant-scoped session helper
- BACKEND-AGENT: main.py, config.py, project structure, RBAC/tenant dependency, Redis queue wiring
- FRONTEND-AGENT: Vite setup, folder structure, theme tokens (blue/white, no gradients), base components
- DEVOPS-AGENT: docker-compose (postgres, redis, backend, worker, frontend), env files

**Validation Gate 1:** `alembic upgrade head`, `npm install`, `docker-compose config`

**Phase 2: Modules (backend + frontend per module, in order — each depends on Module 1)**
- Module 1: Auth + Google OAuth endpoints and pages
- Module 2: Import pipeline, worker job for parsing, evidence viewer
- Module 3: Redaction + AI adapter + investigation service + grouping
- Module 4: Reviewer workflow + export
- Module 5: Dashboard + usage

**Validation Gate 2:** `ruff check backend/`, `npm run lint && npm run type-check`

**Phase 3: Quality (parallel)**
- TEST-AGENT: pytest (incl. cross-tenant denial tests, idempotent-export tests) + Vitest, 80%+ coverage
- REVIEW-AGENT: security audit (redaction, RBAC enforcement, secret handling), performance review

**Final Validation:** full test suite, `docker-compose up -d`, `curl localhost:8000/health`

---

## VALIDATION GATES

| Gate | Commands |
|------|----------|
| 1 | `alembic upgrade head`, `npm install`, `docker-compose config` |
| 2 | `ruff check backend/`, `npm run type-check` |
| 3 | `pytest --cov --cov-fail-under=80`, `npm test` |
| Final | `docker-compose up -d`, `curl localhost:8000/health` |

---

## ENVIRONMENT VARIABLES

```env
DATABASE_URL=postgresql://user:password@localhost:5432/failscope
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
OPENAI_API_KEY=your-openai-key
VITE_API_URL=http://localhost:8000
```

---

## NEXT STEP

Execute with parallel agents:
/execute-prp PRPs/failscope-ai-prp.md
