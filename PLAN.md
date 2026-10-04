# Pilot Delivery Plan

## Goal

Ship a production pilot in three weeks for one distributor and one market, proving that customers can self-order and the distributor can fulfil without manual sales-representative order collection.

## Delivery sequence

### Phase 0 — launch inputs (immediate)

- Confirm working name/package identifiers, production domain, legal copy, brand assets, and the pilot distributor/market.
- Obtain and verify Apple Developer, Google Play, Firebase, Paystack, Neon, hosting, and object-storage access.
- Configure Paystack test/live subaccount and split-settlement design with the pilot distributor. This is a launch blocker because settlement terms affect payment/refund behaviour.
- Prepare the pilot distributor's catalogue, image assets, opening stock, minimum order value, territory assignment and approved neighbouring-service records.

### Phase 1 — secure foundation

- Set up the monorepo with `apps/mobile` (Expo) and `apps/web` (Next.js); share TypeScript domain/API contracts where useful.
- Provision separate staging and production Neon databases, media storage, secrets and webhook URLs.
- Create schema/migrations, constraints, indexes, audit events, role/session model, email/password web auth, and Google/Apple mobile auth.
- Build company-admin territory/distributor management before customer catalogue access, because correct routing is a product invariant.

### Phase 2 — operational order path

- Build distributor catalogue, stock, price and minimum-order configuration.
- Build the distributor-to-company replenishment path: distributors request product quantities with unit-price visibility; company admins manually approve or reject requests; approved stock is dispatched and confirmed on receipt; both company and distributor inventory movements are retained for audit.
- Build customer onboarding, assigned catalogue, cart, stock/minimum validation, immutable snapshots and pay-on-delivery order transaction.
- Build distributor order queue, dispatch, unable-to-fulfil, partial fulfilment, signature capture and customer order history. Customer-level order details remain visible only to the assigned distributor; company admins receive aggregate performance reporting.
- Build durable inbox notifications, then push delivery/deep links.

### Phase 3 — payment and reporting

- Integrate Paystack card/bank transfer initialization, verified webhook receipt, subaccount split settlement, full/partial refunds, and admin `needs-attention` queue.
- Add company reporting: order/value, distributor/market/status, active customers, payments/refunds, stock and fulfilment/delivery performance.
- Exercise all payment flows in staging using Paystack test credentials before any live secret is enabled.

### Phase 4 — release readiness

- Test role isolation, concurrent-stock checkout, duplicate submissions/webhooks, payment outcomes, refund statuses, partial/full fulfilment, signature requirement, push denial/failure, slow/offline recovery, and empty/error states.
- Seed only the real pilot territory/distributor/catalogue after acceptance.
- Run a controlled pilot with distributor-owner training and a named operational owner for payment/refund exceptions.
- Submit/store-release builds early enough to account for Apple/Google review uncertainty; use a staged rollout where possible.

## Definition of done for the pilot

- A new customer can install the public app, sign in, complete onboarding, see only their assigned distributor catalogue, and place a valid pay-on-delivery or verified prepaid order.
- The distributor can manage pilot catalogue/stock, view orders, dispatch, partially fulfil or fail fulfilment correctly, and complete delivery only with a signature.
- A distributor can request stock from the company; a company admin manually approves or rejects the request; company dispatch and distributor receipt update their respective stock records with audit history.
- Inventory cannot oversell under concurrent checkouts; order snapshots/audit history are retained.
- Paystack webhooks and refunds are verified/idempotent; exceptions are visible to the company admin.
- Company admin can manage pilot territory relationships and see aggregate operational reports without access to individual customer order details.
- Staging test evidence covers the core and failure journeys; production monitoring and support ownership are active.

## Assumptions

- **ASSUMPTION:** The company will supply acceptable privacy-policy/terms copy and app-store listing assets before submission, although no formal compliance programme is currently defined.
- **ASSUMPTION:** The company is the Paystack primary merchant and has authority to create/manage distributor subaccounts and the agreed split settlement.
- **ASSUMPTION:** A hosted private object-storage provider and Next.js deployment host will be selected during implementation; neither was specified.
- **ASSUMPTION:** Product images and delivery signatures will be stored as private image files with controlled access.
- **ASSUMPTION:** Admin and distributor email/password accounts will be provisioned/managed by the company; customer Apple/Google identities meet app-store sign-in requirements.
- **ASSUMPTION:** Customer accounts can order immediately without phone verification; operational abuse controls therefore include rate limits and audit trails rather than onboarding approval.
- **ASSUMPTION:** The company accepts a three-week pilot scope, not a simultaneous rollout to all 230 distributors.

## Open risks / unknowns

1. **Paystack split/subaccount fit:** exact settlement, refund liability and whether each desired card/bank-transfer flow supports the selected split model must be verified in the company Paystack account before implementation.
2. **Refund timing:** Paystack notes that processed refunds can still take up to ten business days to reach a customer; `needs-attention` requires operational bank-detail follow-up ([official docs](https://paystack.com/docs/payments/refunds/)). Customer messaging must not promise instant repayment.
3. **Three-week app-store timing:** Apple/Google review, account verification, Paystack activation, push credentials and merchant onboarding can delay a production public launch outside engineering control.
4. **Pilot data quality:** territory mapping, starting stock, prices, product images and minimum order value must be correct before customer access. Bad data creates routing and payment disputes.
5. **Unverified phone numbers:** this speeds adoption but makes delivery contact quality, spam, account recovery and support harder.
6. **Automatic confirmation:** customer cancellation is intentionally unavailable. The distributor's `Unable to fulfil`/partial fulfilment path must be clear to avoid trust damage.
7. **Partial fulfilment consent:** distributors may adjust quantities without customer pre-approval. This is operationally fast but can create disputes; notification and clear revised totals are essential.
8. **Nearest-service policy:** immediate ordering by customers in unserved markets changes their assigned distributor after first order. Company operations must manage neighbour eligibility carefully to avoid territory conflict.
9. **Scale validation:** 500,000 is potential reach, not pilot activity. Load/performance targets beyond the initial ~1,000 orders/day estimate are not yet set.
10. **No existing company API:** the platform will need a later integration/migration decision if the company's internal system becomes authoritative.

