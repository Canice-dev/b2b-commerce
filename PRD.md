# Distributor Direct Ordering — Pilot PRD

## Product

**Working name:** Distributor Direct Ordering.

A Nigeria-only B2B ordering platform for one manufacturer/company and its distributor network. Retailers and wholesalers place orders directly from a mobile app; the correct distributor receives and fulfils the order through a web dashboard. The product reduces reliance on manual sales-representative order collection.

## Users

| User | Need | Primary capabilities |
| --- | --- | --- |
| Customer (retailer/wholesaler) | Order stock reliably from their allocated distributor | Register, set business/location profile, browse catalogue, order, pay, track delivery, view history/proof |
| Distributor owner | Fulfil local demand without manual order capture | Maintain catalogue/stock/minimum order, track orders, dispatch, partially fulfil or mark unable to fulfil, capture delivery signature |
| Company admin | Operate one company's distribution network | Maintain territories and distributor assignments; view customers, distributors, orders, payments/refunds, stock and fulfilment reporting |

## Problem and outcome

Customers currently depend heavily on sales representatives to submit orders. That is slow, costly, and makes ordering and fulfilment status hard to see. The pilot succeeds if a real distributor can receive and fulfil self-service customer orders: **50 registered customers, 30 completed orders in the first month, reduced manual order calls, and at least 95% delivery completion.**

## Pilot scope

The production pilot covers **one distributor and one market**. It is public-app-store distributed, English-only, Nigeria-only, and uses Nigerian naira (NGN/₦).

### In scope

- iOS and Android customer app.
- Google and Apple customer sign-in; phone is collected but not SMS-verified.
- Required customer business profile: business/shop name, contact person, phone number, business type (wholesaler or retailer), state, LGA/city, market, one editable default address, and GPS pin.
- Company-admin-managed `State → City/LGA → Market → Distributor` territory mapping.
- Distributor-owned product catalogue: name, image, unit size/variant, price per unit, available quantity, and one distributor-level minimum order value.
- Catalogue browsing, cart, stock-aware checkout, immutable order-price/address snapshot, order history and detail.
- Free ASAP delivery by the distributor.
- Payment choice: cash/transfer on delivery, or Paystack card/bank transfer before delivery.
- Paystack subaccounts/split settlement to distributors; secure webhook-driven payment and refund updates.
- Immediate confirmation and inventory reservation for pay-on-delivery orders. Prepaid orders are created/reserved only after verified successful payment.
- Fulfilment: `Confirmed → Out for delivery → Delivered`; distributor-only `Unable to fulfil` with a required reason; partial fulfilment with automatic stock adjustment and refund for prepaid unavailable quantities.
- Mandatory drawn recipient signature image to complete delivery.
- Durable in-app notification inbox plus push notifications.
- Distributor web dashboard: email/password sign-in and password reset; one owner login per distributor.
- One company-admin account with network management and dashboard reporting.
- Staging and production environments; Paystack test credentials in staging.

### Explicitly out of scope for v1

- In-app distributor/customer chat (v2).
- Sales-representative workflows.
- Multiple distributor staff accounts or staff roles.
- Multiple company-admin roles.
- Delivery-driver management, route optimization, live tracking, or third-party logistics integration.
- Customer-specific prices, price tiers, credit terms, loyalty, promotions, returns, subscriptions, accounting/ERP integration, and an existing company API.
- Delivery fees, delivery scheduling, multiple saved delivery addresses, SMS/WhatsApp notifications, and phone-number verification.

## Core flows

### Customer onboarding and routing

1. Customer opens the mobile app, signs in with Google or Apple, and accepts the required terms/privacy and location-permission messaging.
2. They complete their business profile and select State, LGA/city, and market; they enter one address and set a GPS pin.
3. The platform routes them to the exclusive distributor assigned to that market and loads that distributor's catalogue.
4. If the market is unserved, the app presents only company-admin-approved neighbouring distributors. The customer may order from one immediately; that distributor becomes the customer's assigned distributor after the first order.

### Order and delivery

1. Customer adds items; checkout blocks quantities above available stock and totals the goods subtotal in NGN.
2. Checkout blocks if subtotal is below the distributor's minimum order value.
3. Customer selects pay-on-delivery or prepaid card/bank transfer.
4. For pay-on-delivery, the order becomes `Confirmed` and stock is reserved atomically. For prepaid, it is not created/reserved until Paystack confirms payment.
5. Distributor sees the confirmed order and sets it to `Out for delivery` when dispatching.
6. If fulfilment cannot happen, distributor records `Unable to fulfil` with a reason; all stock is restored and any prepaid amount is refunded.
7. If only some items are available, distributor records actual quantities, the customer is notified, stock is reconciled, the pay-on-delivery total is reduced, and any prepaid difference is refunded automatically.
8. Distributor marks delivered only after collecting the recipient's drawn signature. Customer sees delivery proof.

### Payments and refunds

- Paystack handles card and gateway-generated bank-transfer payments. The server treats a verified webhook/transaction verification as the source of truth—not the mobile redirect/callback.
- Payments are split/settled to distributor subaccounts according to the agreed Paystack configuration.
- A refund is initiated automatically for paid unfulfilled amounts. Its lifecycle remains visible to the customer and admin.
- If Paystack reports `needs-attention`, the refund enters an admin-action-required queue and the customer sees that it is in progress.

## Admin dashboard requirements

- Create and edit territory hierarchy, distributors, exclusive market assignments, and approved neighbouring-service relationships.
- View customers, distributors, orders, payment/refund state, stock, and fulfilment performance.
- Report total orders/value, orders by distributor/market/status, active customers, payment/refund totals, stock levels, and delivery performance.

## Non-functional requirements

- Responsive distributor/admin dashboard for current Chrome and Edge, including tablets/phones; desktop-first.
- Strong authorization boundaries: customers only see their assigned distributor and own records; distributors only see their own catalogue/customers/orders; admin has global access.
- Purchase, stock reservation, payment webhook, and refund operations must be idempotent and auditable.
- Preserve price, address, item, and quantity snapshots for every order.
- Handle weak networks with retryable reads/submissions and clear pending/error states; never silently duplicate an order or payment.

