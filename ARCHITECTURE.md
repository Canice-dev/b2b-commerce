# Architecture

## Context and boundaries

The platform is the v1 system of record for customer profiles, territories, distributor catalogues/prices/stock, orders, payments/refunds, notifications, and reporting. No company database API exists today. A future integration must be additive and must not replace current ownership without an explicit migration decision.

The system supports one manufacturer/company, not a multi-company SaaS tenancy in the pilot. It must nevertheless keep distributor-owned data explicit so a future company API and more internal roles can be introduced without rewriting order ownership.

## Application topology

| Deployable | Technology | Audience | Notes |
| --- | --- | --- | --- |
| `apps/mobile` | Expo + React Native + TypeScript | Customers | One iOS/Android codebase; use development builds for push testing |
| `apps/web` | Next.js App Router + TypeScript | Distributor owner and company admin | Responsive, desktop-first dashboard |
| API | Next.js Route Handlers in `apps/web` | Mobile and web | The sole gateway to business rules and integrations |
| Database | Neon PostgreSQL | Server only | Transactions, constraints, indexes, reporting |
| Media | Managed object storage | Server-issued signed access | Product images and drawn signature proof |

The API may live with the Next.js dashboard for the pilot. Keep route handlers thin: validate request/authentication, call a domain service, commit a transaction, write audit/inbox events, then asynchronously deliver push notifications. This keeps a later extraction to a standalone service feasible if scale or background-work needs demand it.

## Authentication and authorization

| Actor | Authentication | Authorization boundary |
| --- | --- | --- |
| Customer | Google or Apple OAuth in the mobile app | Own profile, address, notifications and orders; assigned distributor's active catalogue only |
| Distributor owner | Email/password plus reset | Own distributor's catalogue, stock, customers, orders and delivery proof only |
| Company admin | Email/password plus reset | Global read/management for territories, distributors, customers, reports and refund-exception queue |

The server maps every authenticated identity to one role/profile. Role flags in a client request are never trusted. Future staff roles/chat are out of scope.

## API and transaction design

### Endpoint families

- Customer: profile/onboarding, assigned catalogue, cart validation, checkout/payment session, own orders, notifications.
- Distributor: product/media management, stock adjustments, settings, orders, fulfilment/partial fulfilment, signature upload/completion.
- Admin: territories, distributor accounts, neighbouring-service eligibility, reporting, refund exceptions.
- Integrations: Paystack payment initialization/verification, webhook receiver, refund action/status callbacks; push dispatch.

### Critical transactions

**Pay-on-delivery checkout:** validate customer assignment/catalogue/minimum value, atomically decrement/reserve each item (or fail with current availability), create immutable order and line snapshots, add inventory movements/audit/inbox events, commit.

**Prepaid checkout:** create an idempotent payment attempt but no order or reservation. On a verified Paystack success event, atomically create the order and reserve stock. If stock changed before confirmation, do not fulfil by assumption: create an operational exception/refund path and notify the user.

**Partial fulfilment:** lock order and relevant product rows, record fulfilled/unavailable quantities, reconcile inventory movements, calculate immutable revised total, initiate refund idempotently when prepaid, and notify customer. The deliverable value must match the final fulfilled quantities.

**Unable to fulfil:** require reason, release all reserved stock, transition order only from an allowed non-delivered state, create a full refund request for prepaid orders, and notify customer/admin where action is needed.

**Delivery:** require valid uploaded signature reference, set delivery time/status atomically, and create a customer inbox event.

## Async and integrations

| Work | Trigger | Reliability approach |
| --- | --- | --- |
| Payment confirmation | Paystack webhook; server verification fallback | Verify signature; deduplicate provider event/reference; transactional state change |
| Refund status | Paystack refund webhooks | Persist lifecycle; show `needs-attention`/failed queue to admin |
| Push delivery | Committed notification record | Outbox/worker pattern; retry push independently; inbox remains authoritative |
| Image/signature processing | Upload completion | Validate files; private storage; do not block core data on optional product image processing |
| Reports | Dashboard query initially | Indexed aggregates; move expensive aggregates to scheduled jobs/materialized reporting later if required |

The payment webhook returns quickly after durable receipt/validation. Any slow notification or reconciliation follows asynchronously. Paystack documents webhook retries after a missing acknowledgement; this makes deduplication mandatory ([official documentation](https://paystack.com/docs/payments/webhooks/)).

## Data access, performance and scale

The 500,000-customer figure is potential reach, while the pilot expects low active volume. Model and index for growth now without building distributed infrastructure:

- Index `customer_profiles(distributor_id)`, products by distributor/active status, orders by distributor/status/created time and customer/created time, active market assignment, payment reference, and notification recipient/read time.
- Use cursor pagination for catalogue, customers, orders and notifications; avoid unbounded dashboard tables.
- Read product availability from server-authoritative stock at checkout; mobile catalogue data may be cached briefly but checkout always revalidates.
- Use a Neon pooled connection string for deployed/serverless access and monitor query/index performance as usage grows.
- Store report values/amounts in NGN kobo; aggregate in SQL rather than loading full tables into application memory.

## Environments and operations

- **Local:** isolated local configuration, test identities and Paystack test mode.
- **Staging:** separate Neon/database/media namespace and Paystack test credentials; exercise Google/Apple, push development build, payment webhooks, partial/full refunds, signature flow and role access.
- **Production pilot:** separate secrets, URLs, webhook configuration and backups. Do not test with real payment data outside controlled test cases.

Production observability must include structured request/error logs, audit events, payment/refund webhook status, order state-change failures, inventory-reservation conflicts, push delivery failures, and daily pilot metrics. Alert on unprocessed payment/refund events, `needs-attention` refunds, webhook signature failures, sustained API errors, and stock reservation faults.

## Future extension seams

- Company API adapters sit behind interfaces for catalogue, stock, territory and order synchronization; no direct third-party calls from mobile clients.
- Add company/distributor staff roles through permission tables rather than special-casing owner IDs.
- Add chat as its own conversation/message service with explicit distributor/customer tenancy.
- Support additional company tenants only after defining company-scoped IDs and a payment-merchant model; it is not a pilot concern.

