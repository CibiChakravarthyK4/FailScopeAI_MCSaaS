# Testing Strategy & CI

Map every requirement (F-series features and C01-C08 controls) to at least one test. Define the critical end-to-end journeys and the release checks **before** implementation. Every test covers positive, negative, boundary and failure scenarios where relevant.

## Feature testing during development

| Layer | What to test | Tooling |
|---|---|---|
| Unit | JUnit XML parser, credential redaction (C03), failure taxonomy mapping, hashing, artifact scanners, confidence logic | `pytest` |
| API | Every FastAPI endpoint: valid input, invalid input, missing auth, wrong role, wrong tenant, pagination, error format | `pytest` + FastAPI `TestClient` |
| Database | Alembic migrations apply cleanly (up and down) on an empty and a populated database; constraints, indexes, `tenant_id` on every tenant-scoped table | `pytest` + Postgres container |
| Background jobs (C04) | Status transitions `queued` -> `processing` -> `completed` / `failed`, idempotent retry limits, worker crash and restart, duplicate job submission | `pytest` |
| Frontend | Component and page behaviour, loading, empty, validation, access-denied and failure states, role-specific views | `Vitest` + React Testing Library |
| Negative and boundary | Invalid or malformed XML, empty file, oversized file, unsupported file type, huge stack traces, unicode, duplicate imports, missing screenshots or logs | `pytest` |
| Jira export | Idempotent export (no duplicate defects on retry), Jira API failure and timeout handling, correct field mapping | `pytest` + mocked Jira |

## Role, tenant and access testing (C01, C02)

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

## AI behaviour testing (C03, C08, Pilot Gate)

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

## End-to-end (E2E) testing

- Tool: `Playwright`, running against the full Docker Compose stack (`docker-compose.yml` + `docker-compose.e2e.yml`, see root `CLAUDE.md`), not a dev server.
- Critical journeys that must stay automated and green (`e2e/tests/01` through `07`):
  1. Sign in (JWT and Google OAuth) -> select tenant.
  2. Import a failed run (JUnit XML + logs + screenshot) -> job completes.
  3. View evidence and AI diagnosis with citations.
  4. Reviewer accepts, rejects or corrects a category (audit entry created).
  5. Export a defect to Jira -> exported once only (idempotent).
  6. Access-denied journey for a role or tenant without permission.
  7. Public site: every page renders, every nav/footer link resolves, Contact/Demo forms submit, FAQ accordion, 404 page.

## Non-functional testing

- **Security**: dependency scanning, secret scanning, authentication and authorization checks, file-upload validation (type, size, content), injection and XSS checks, encryption in transit and at rest verification (C03).
- **Performance**: measure against set targets (for example import time for large runs, API latency, concurrent jobs); run in staging, not on a laptop.
- **Accessibility**: keyboard navigation, contrast, labels and focus states on all screens, consistent with the two-colour design rules (`docs/design-system.md`).
- **UI design compliance**: automated check that no gradient (`linear-gradient`, `radial-gradient`, `conic-gradient`) and no colour outside the token table appears in the frontend source or built CSS; visual regression snapshots of key screens.
- **Branding check**: automated search that the old names ("FailScope", "Scope Ring", `--fs-`) do not appear in user-facing UI text, docs or marketing pages (the legacy technical names in root `CLAUDE.md` are the only allowed exception until the planned rename).
- **Browser and device**: latest Chrome, Edge, Firefox and Safari; responsive checks on mobile and tablet widths.
- **Operational readiness (C07)**: health-check routes, error logging and alerts, cost ceilings, and backup and restore (see `docs/environments.md`).
- **Audit (C05)**: verify audit records exist with actor ID and timestamp for imports, model and prompt versions, reviewer actions, Jira exports and Platform Owner access.

## Defect retesting and regression

- After every fix: verify the original issue, test the affected areas, and run the critical automated E2E journeys.
- Add a **regression test** whenever it meaningfully prevents the defect from returning.
- Record the root cause for each production-impacting defect (blameless post-mortem).

## Payments and subscriptions (future, after pilot validation)

Not in current scope. When subscriptions are added, test: successful and failed payments, renewal, cancellation, expiry, refunds, and duplicate or delayed webhooks. Access must change only through **verified server-side payment events**, using test payment credentials in dev and staging. Until then, billing data is manual or placeholder (`docs/billing.md`) and is covered by the billing report tests above.

## Build and Deployment Checks (CI)

`.github/workflows/ci.yml` runs these on every pull request, and a release can only be promoted when all pass. These are the exact, verified commands (not proposals):

```bash
# Backend (from backend/)
ruff check app
mypy app --ignore-missing-imports
pytest --cov=app --cov-fail-under=80

# Frontend (from frontend/)
npm run lint
npm run type-check
npm test -- --run

# E2E (from repo root, then e2e/)
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d --build
cd e2e && npx playwright test
```

Also in CI: dependency and secret scanning (`pip-audit`, `npm audit`, `gitleaks`), Docker image builds, and the UI design-compliance/branding `grep` checks described above.

## Release Flow

1. **Develop incrementally**: small, complete features. For each change, inspect the existing implementation first, make focused changes, and run the relevant checks.
2. **Review**: inspect code changes, permissions, database migrations, dependencies and test results; verify the evidence behind any completion report.
3. **Commit and push** meaningful changes regularly; use small commits and reviewed pull requests; keep docs and tests aligned with the code.
4. **Deploy the release candidate to Staging** with controlled database migrations; validate the exact version intended for release.
5. **Release testing in Staging**: functional regression, critical E2E journeys, role and tenant isolation checks, relevant security assessments, performance tests against targets, AI evaluation on the holdout set.
6. **UAT and pilot**: representative users complete real journeys (onboarding, usability, usefulness, support readiness); resolve release-blocking findings.
7. **Release-readiness review**: critical tests pass, secrets protected, restore tested, monitoring configured, pricing, privacy information, terms and support channels ready.
8. **Release to Production**: promote the approved build, apply planned migrations, keep a recovery option; production data and credentials stay separate from staging.
9. **Production smoke checks**: verify login, essential journeys, permissions and integration health using controlled accounts; check errors and monitoring immediately after deploy.
10. **Monitor and improve**: track failures, performance, AI quality and cost, and customer feedback; periodically review access, dependencies and backup restoration.

## Definition of Done (per feature)

A change is done only when:
- [ ] Requirement and acceptance criteria are linked to tests.
- [ ] Positive, negative, boundary and failure tests exist and pass.
- [ ] C01 (tenant isolation) and C02 (RBAC) are enforced server-side and tested with direct API calls.
- [ ] Secrets are redacted (C03) and no credentials are committed.
- [ ] Audit entries are written where required (C05).
- [ ] Alembic migration reviewed and tested up and down.
- [ ] UI follows the design system (two colours, flat, no gradients) and has loading, empty, error and access-denied states.
- [ ] No old product name appears in user-facing text.
- [ ] CI checks above pass.
- [ ] Documentation (root `CLAUDE.md`, relevant `docs/` file, README, requirements) is updated.
