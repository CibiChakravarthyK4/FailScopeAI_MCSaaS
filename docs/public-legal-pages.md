# Public and Legal Pages

RootTrace Ivory's public site (everything reachable without signing in) follows the same brand and design rules as the rest of the product (`docs/design-system.md`), plus the rules below.

## Brand & naming

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
- Brand colours are Blue and White only (`docs/design-system.md`), with neutrals for text and borders.
- Name clearance is still open: domains on Hostinger, Indian and WIPO trademark search, and a web search for "RootTrace" and "Ivory" with "testing" or "QA".

## Routes (Phase 1 built; later phases add more)

`/` (landing), `/company`, `/contact`, `/privacy`, `/terms`, `/pricing`, `/security`, `/demo`, `/help` (and `/help/<slug>`). Phase 2/3 routes (`/faq`, `/integrations`, `/tour`, `/subprocessors`, `/cookies`, `/acceptable-use`, `/changelog`, `/blog`, `/accessibility`, `/dpa`) are added to the header/footer only once each page actually exists - a nav entry must never link to a route that isn't built yet.

## Shared public layout

- Every public page renders inside `MarketingHeader` + `MarketingFooter` (`frontend/src/components/marketing/`), with all content inside the shared `<Container>` (1200px). No section may set its own max-width.
- Every page: `<PublicPageHeader>` (small label, one `<h1>`, one-line subtitle) or, for the two legal pages, `<LegalLayout>` (760px reading column, sticky table of contents from 1024px up, version/effective-date line, "Draft for legal review" banner).
- Every page calls the `useSeo(title, description, path)` hook (hand-rolled, not a dependency) to set `<title>`, meta description, canonical URL and `og:*` tags. Checked automatically by `frontend/src/pages/publicPageLayout.test.ts`, which also asserts every public page uses both `MarketingHeader` and `MarketingFooter`.

## Company facts: one config file, no invented facts

- `frontend/src/config/company.ts` is the single source for every company fact shown on a page: legal name, addresses, emails, phone, Grievance Officer, legal document versions/effective dates. Every value starts as an explicit `[placeholder]` string - replace them before launch, never invent a real-looking value (no address, phone number, team member, customer, logo, award, statistic, certification or testimonial that isn't true and confirmed).
- The backend cannot import a frontend `.ts` file, so it has its own small set of settings for anything it needs at runtime: notification recipient addresses (`SUPPORT_EMAIL`, `SALES_EMAIL`, `HIRING_EMAIL` in `app/config.py`) and the authoritative legal document versions (`PRIVACY_POLICY_VERSION`, `TERMS_VERSION` - see Legal document versioning below). These must be kept in sync by hand with `company.ts`'s display copy of the same values.
- The word "AI" does not appear in headlines or marketing copy anywhere on the public site. The legal and security pages may say "automated analysis, including third-party language models" - that disclosure matters more than the house style rule.

## Legal document versioning and acceptance (C05)

- The backend is the source of truth for "what version is current" (`PRIVACY_POLICY_VERSION` / `TERMS_VERSION` in `app/config.py`), not the frontend - this is what gets recorded against a user's acceptance, so it can't be client-supplied.
- `legal_acceptances` (`app/models/legal_acceptance.py`) stores one row per `(user, document, version)`, never updated in place, so "who accepted what, when" stays a complete history.
- Registration requires a checked "I agree to the Terms and Conditions and Privacy Policy" box (`accepted_terms`, validated server-side too) and records acceptance of both documents. `GET /auth/me` reports `needs_legal_acceptance`; any signed-in user who owes acceptance (most often a Google OAuth sign-in, which has no form step, or an existing user after a version bump) is redirected to `/accept-terms` by `ProtectedRoute` before they can reach any other page. `POST /auth/accept-legal` records it and writes an audit log entry.
- Bumping a document's version (because the wording changed materially) automatically makes every existing user owe re-acceptance on their next request - no separate "ask again" flag needed.

## Public form protections

Every anonymous public form (Contact, Request a Demo) shares the same protections, in `app/services/public_submission_service.py` plus each form's own service:

- **Honeypot**: a field real users never see (hidden off-screen, not `type="hidden"`, so JS-driven bots that fill every visible-ish field still get caught) - a filled honeypot returns success but silently drops the submission, giving a bot no signal to retry a different way.
- **Rate limiting**: `rate_limit_by_ip`, same mechanism as auth endpoints, tuned per form (5/hour for Contact/Demo, 20/hour for the much lower-stakes help-article feedback).
- **No raw IP or message content in logs**: only a one-way hash of the IP is stored (`public_submission_service.hash_ip`); the only place message content goes is the notification email itself (the intended recipient), never a log line.
- **CAPTCHA hook**: `public_submission_service.verify_captcha()` is already wired into each public form's submit path, but currently always returns success while `CAPTCHA_ENABLED` (default `False`) is off - no real provider is plugged in yet. If `CAPTCHA_ENABLED` is flipped on before a real provider replaces the hook, it fails **closed** (rejects every submission) rather than silently passing. Wire a real provider in before turning that flag on.
- **Notification email**: `app/services/mail_service.py` is dev-mode only (console or file backend) - no real SMTP/provider is integrated yet, consistent with billing's "no third-party payment/notification services pre-release" (`docs/billing.md`).
- These tables (`contact_messages`, `demo_requests`, `help_article_feedback`) are explicitly **not** tenant-scoped - there is no tenant_id to scope by, since the submitter has no account yet.

> There is no "Join our Team" / careers page - the product isn't hiring. A career-application flow (resume upload with magic-byte validation, owner-only review) was built and then fully removed; if hiring ever starts, rebuild it rather than looking for leftover code - none remains.

## What still needs a human before launch

Every `[placeholder]` in `company.ts`, every `[LEGAL REVIEW]`-tagged assumption in `PrivacyPolicyPage.tsx`/`TermsPage.tsx` (retention periods, international-transfer specifics, liability cap, jurisdiction city), real plan pricing (`frontend/src/config/pricing.ts` - currently "Contact us for pricing" everywhere, by design), and a real Open Graph share image (`/og-image.png` doesn't exist - this tooling can't generate a raster image).
