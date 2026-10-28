# Billing & Payments

- **Now (pre-release):** billing and payment records are manual or placeholder data stored per tenant (plan, price, dates, status, payment reference, notes). No payment provider is integrated.
- **At release:** choose a payment provider (for example Razorpay for India or Stripe) and add subscription, trial, renewal, cancellation, refund and expiry rules.
- Rules once a provider is added:
  - Use test credentials in development and staging; live keys only in production.
  - Keep payment keys on the server only, never in GitHub or in the frontend.
  - Change a tenant's access only through **verified server-side payment events** (signed webhooks). Handle duplicate and delayed webhooks idempotently.
  - Billing data shown to the `Platform Owner` is read from the same records the provider updates.
- Related tests: `docs/testing.md`'s "Payments and subscriptions" section.
