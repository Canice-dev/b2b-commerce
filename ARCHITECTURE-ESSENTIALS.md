# Architecture Essentials

## Chosen shape

```text
Expo React Native customer app (iOS/Android)
       │ HTTPS + authenticated API
       ▼
Next.js web app + Route Handlers
  ├─ distributor dashboard
  ├─ company-admin dashboard
  ├─ business API / authorization
  ├─ Paystack webhook endpoint
  └─ notification dispatcher
       │
       ├──────── Neon PostgreSQL (system of record)
       ├──────── object storage (catalogue photos, signature images)
       ├──────── Paystack (payments, transfers, refunds)
       └──────── Expo Push Service / FCM / APNs (push)
```

The repository will keep the mobile and web applications under one `apps/` directory. The mobile client is Expo/React Native; the dashboard and backend-for-frontend are Next.js App Router and Route Handlers. Neon PostgreSQL is the v1 system of record.

## Responsibilities

| Component | Responsibility | Must not do |
| --- | --- | --- |
| Expo mobile app | Customer UI, local session, catalogue/cart display, checkout initiation, inbox, notification/deep-link handling | Trust itself to confirm payment, reserve stock, or enforce authorization |
| Next.js dashboard | Distributor/admin operations and reports | Expose privileged database or payment secrets to browsers |
| Next.js Route Handlers | Authentication/session validation, role checks, transactions, order rules, payment integration, webhook handling, notification jobs | Let client-provided totals/statuses decide business state |
| Neon PostgreSQL | Transactional data, constraints, audit facts, reporting queries | Hold payment secrets or unprotected binary files |
| Object storage | Product image and delivery-signature binaries through controlled upload/access paths | Be publicly writable |
| Paystack | Prepaid card/bank-transfer collection, split/subaccount settlement, payment events and refunds | Be replaced by a mobile callback as payment authority |
| Expo/FCM/APNs | Best-effort remote push delivery | Be the sole record of a user-facing event |

## Essential domain model

### Identity and tenancy

- `users`: common account identity, status, timestamps.
- `customer_profiles`: user, business/contact data, business type, phone, default address/GPS, assigned distributor.
- `distributor_profiles`: owner user, company-admin-created account and operational settings.
- `admin_profiles`: the one company-admin user.
- `auth_identities`: Google/Apple customer identity or email/password web identity. Store provider subject IDs, never provider tokens.

### Territory and catalogue

- `states`, `local_government_areas`, `markets`: normalized location hierarchy.
- `market_distributor_assignments`: exactly one active primary distributor per market; enforce uniqueness for active assignment.
- `neighbour_service_assignments`: admin-approved distributor eligibility for an otherwise unserved market.
- `products`: belongs to one distributor; name, variant/unit, price in kobo, available quantity, image reference, active flag.
- `distributor_settings`: minimum order amount in kobo.

### Commerce and proof

- `orders`: customer/distributor/market links; immutable address and financial snapshots; payment method/status; fulfilment status; ordered/fulfilled totals; timestamps.
- `order_items`: immutable product name/variant/unit-price snapshots; ordered, fulfilled, and unavailable quantities; line totals.
- `inventory_movements`: append-only quantity changes linked to the product and reason (`initial`, `manual_adjustment`, `reservation`, `release`, `partial_fulfilment`).
- `payments`: Paystack reference, amount, currency, status, provider payload metadata and split/subaccount context.
- `refunds`: payment link, requested amount, Paystack reference/status, failure/needs-attention state.
- `delivery_proofs`: storage key, signer name if collected, time, captured-by distributor, and order link.
- `notifications`: durable per-user inbox record, type, payload/deep link, read time, and push-delivery attempts.
- `audit_events`: actor, action, resource, before/after-safe metadata, correlation/idempotency key, timestamp.

## Invariants

1. A customer has one active assigned distributor at a time.
2. A market has at most one active primary distributor.
3. An order belongs to exactly one customer and one distributor and retains its checkout snapshot permanently.
4. Monetary values are stored as integer kobo, never floating-point naira.
5. Stock cannot become negative. Checkout inventory checks and reservations happen in one database transaction with row locking/conditional update.
6. Only the server creates orders, changes fulfilment status, updates stock, processes Paystack events, and initiates refunds.
7. `Delivered` requires a stored signature proof.
8. Webhook and refund processing is idempotent; duplicate Paystack events must not create duplicate orders, stock changes, or refunds.

## State machines

```text
Pay on delivery: Confirmed → Out for delivery → Delivered
                         ├→ Partially fulfilled → Out for delivery → Delivered
                         └→ Unable to fulfil

Prepaid: payment pending (no order/reservation)
         → payment verified → Confirmed → same fulfilment path

Refund: requested → pending/processing → processed
                       ├→ needs attention (admin queue)
                       └→ failed (admin queue)
```

The wording shown to users can be simpler, but the database needs explicit states for partial fulfilment and the Paystack refund lifecycle.

## Security essentials

- Enforce role and ownership checks server-side on every endpoint and query.
- Use short-lived secure sessions/tokens; hash web passwords with a modern password-hashing algorithm; rate-limit login and reset attempts.
- Keep Paystack secret keys and webhook secrets in server-only environment variables.
- Validate the Paystack HMAC signature over the raw request body before processing a webhook, record event IDs/references, return acknowledgement promptly, and process safely/retryably.
- Use private object storage and signed upload/read URLs for signatures and images; validate MIME type and size.
- Encrypt transport, back up the database, log security-sensitive operations without writing secrets or payment card data.
- Ask for GPS and push permissions in context, allow denial, and keep a usable address/manual notification experience.

## Current platform facts to preserve during implementation

- Next.js Route Handlers belong in the App Router `app` directory and support standard HTTP methods ([official docs](https://nextjs.org/docs/app/getting-started/route-handlers)).
- Expo push work needs a development build for remote notifications; Expo Go is not sufficient for this path, and `expo-notifications` is currently documented at `~57.0.21` ([official docs](https://docs.expo.dev/versions/latest/sdk/notifications/)). Pin exact versions when the project is initialized.
- Paystack recommends webhooks for payment confirmation and requires signature validation; its refund API supports partial or full refunds ([webhooks](https://paystack.com/docs/payments/webhooks/), [refunds](https://paystack.com/docs/payments/refunds/)).
- Use Neon pooling and monitor indexes/working-set behaviour as the customer base grows ([official docs](https://neon.com/docs/manage/endpoints/)).

