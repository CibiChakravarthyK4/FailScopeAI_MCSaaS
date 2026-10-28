# Platform Owner Role & Dashboard

The `Platform Owner` is the product owner's own account. It sits above `Admin`, belongs to no tenant, and exists only for the owner.

## Access

- Same application and same login page. The owner menu and routes appear only when the signed-in user has the `Platform Owner` role.
- Created only through a controlled setup process (seed script or protected CLI). Never through public signup, and never by a tenant `Admin`.
- **MFA is mandatory.** All permissions are checked server-side on every `/api/v1/owner/*` endpoint.

## What the Platform Owner can see

- All client (tenant) accounts: name, status, created date, admins.
- Plan, price, purchase date, renewal or expiry date, and subscription status for each client.
- Usage per client: job runs, storage volume, token usage and quota status (C06).
- Payment and billing details and a **billing report** (revenue, outstanding, renewals due, expiries, usage by client), with export to CSV.

## What the Platform Owner cannot see

- Any tenant's test artifacts, logs, screenshots, diagnoses, AI context or defect content (the C01 exception is limited to account, plan, usage and billing data).

## Client data protection (decision recorded)

How much client data the Platform Owner can reach was decided as follows:

| Option | Platform Owner sees | Status |
|---|---|---|
| **A. Account and billing data only** | Client name, plan, price, dates, status, usage counts, billing report. No test artifacts, logs, screenshots, diagnoses or AI context. | **Chosen default** |
| B. Account data plus aggregated, anonymised usage statistics | Option A plus totals such as failure counts per category, with no content | Allowed later, add to this section if approved |
| C. Support access with consent ("break-glass") | Temporary, read-only view of one tenant's data | Not enabled. Only with explicit approval from that tenant's Admin, time-limited, scoped to that tenant and fully audited (C05) |

Everything beyond option A needs the tenant Admin's consent and a documented change to this file first.

## Controls

- Every access to client or billing data is written to the audit log with actor ID and timestamp (C05).
- Owner endpoints are rate limited and covered by the role/tenant tests and E2E journey 7 described in `docs/testing.md`.
- Owner UI follows the same two-colour design system (`docs/design-system.md`).
