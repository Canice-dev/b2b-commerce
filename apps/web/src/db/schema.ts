import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const userStatus = pgEnum("user_status", [
  "active",
  "suspended",
  "disabled",
]);
export const userRole = pgEnum("user_role", [
  "customer",
  "distributor",
  "admin",
]);
export const authProvider = pgEnum("auth_provider", [
  "email",
  "google",
  "apple",
]);
export const businessType = pgEnum("business_type", ["retailer", "wholesaler"]);
export const paymentMethod = pgEnum("payment_method", [
  "pay_on_delivery",
  "card",
  "bank_transfer",
]);
export const paymentStatus = pgEnum("payment_status", [
  "not_required",
  "pending",
  "verified",
  "failed",
  "refunded",
  "partially_refunded",
]);
export const fulfilmentStatus = pgEnum("fulfilment_status", [
  "confirmed",
  "out_for_delivery",
  "partially_fulfilled",
  "unable_to_fulfil",
  "delivered",
]);
export const inventoryMovementReason = pgEnum("inventory_movement_reason", [
  "initial",
  "manual_adjustment",
  "reservation",
  "release",
  "partial_fulfilment",
]);
export const refundStatus = pgEnum("refund_status", [
  "requested",
  "pending",
  "processing",
  "processed",
  "needs_attention",
  "failed",
]);
export const notificationType = pgEnum("notification_type", [
  "order_confirmed",
  "order_updated",
  "payment_updated",
  "refund_updated",
  "system",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email"),
    name: text("display_name"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    status: userStatus("status").default("active").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("users_email_unique")
      .on(table.email)
      .where(sql`${table.email} is not null`),
  ],
);

// Better Auth owns credential and session lifecycle. Business roles remain in
// user_roles and the profile tables below.
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("accounts_user_id_index").on(table.userId),
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("sessions_token_unique").on(table.token),
    index("sessions_user_id_index").on(table.userId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("verifications_identifier_index").on(table.identifier),
  ],
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRole("role").notNull(),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.role] })],
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: authProvider("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    passwordHash: text("password_hash"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("auth_identities_provider_subject_unique").on(
      table.provider,
      table.providerSubject,
    ),
    index("auth_identities_user_id_index").on(table.userId),
  ],
);

export const states = pgTable(
  "states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("states_code_unique").on(table.code)],
);

export const localGovernmentAreas = pgTable(
  "local_government_areas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stateId: uuid("state_id")
      .notNull()
      .references(() => states.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("lgas_state_name_unique").on(table.stateId, table.name),
    index("lgas_state_id_index").on(table.stateId),
  ],
);

export const markets = pgTable(
  "markets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    localGovernmentAreaId: uuid("local_government_area_id")
      .notNull()
      .references(() => localGovernmentAreas.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("markets_lga_name_unique").on(
      table.localGovernmentAreaId,
      table.name,
    ),
    index("markets_lga_id_index").on(table.localGovernmentAreaId),
  ],
);

export const distributorProfiles = pgTable(
  "distributor_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    businessName: text("business_name").notNull(),
    contactPhone: text("contact_phone").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("distributor_profiles_owner_unique").on(table.ownerUserId),
  ],
);

export const adminProfiles = pgTable("admin_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const distributorSettings = pgTable(
  "distributor_settings",
  {
    distributorId: uuid("distributor_id")
      .primaryKey()
      .references(() => distributorProfiles.id, { onDelete: "cascade" }),
    minimumOrderAmountKobo: integer("minimum_order_amount_kobo")
      .default(0)
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      "distributor_settings_minimum_order_nonnegative",
      sql`${table.minimumOrderAmountKobo} >= 0`,
    ),
  ],
);

export const marketDistributorAssignments = pgTable(
  "market_distributor_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "restrict" }),
    distributorId: uuid("distributor_id")
      .notNull()
      .references(() => distributorProfiles.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").default(true).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("one_active_primary_distributor_per_market")
      .on(table.marketId)
      .where(sql`${table.isActive}`),
    index("market_assignments_distributor_active_index").on(
      table.distributorId,
      table.isActive,
    ),
  ],
);

export const neighbourServiceAssignments = pgTable(
  "neighbour_service_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "restrict" }),
    distributorId: uuid("distributor_id")
      .notNull()
      .references(() => distributorProfiles.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").default(true).notNull(),
    approvedByUserId: uuid("approved_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("active_neighbour_service_assignment_unique")
      .on(table.marketId, table.distributorId)
      .where(sql`${table.isActive}`),
  ],
);

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    contactName: text("contact_name").notNull(),
    phone: text("phone").notNull(),
    businessType: businessType("business_type").notNull(),
    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "restrict" }),
    assignedDistributorId: uuid("assigned_distributor_id")
      .notNull()
      .references(() => distributorProfiles.id, { onDelete: "restrict" }),
    defaultAddress: text("default_address").notNull(),
    latitude: text("latitude"),
    longitude: text("longitude"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("customer_profiles_distributor_index").on(
      table.assignedDistributorId,
    ),
    index("customer_profiles_market_index").on(table.marketId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    variant: text("variant"),
    unit: text("unit").notNull(),
    unitPriceKobo: integer("unit_price_kobo").notNull(),
    availableQuantity: integer("available_quantity").default(0).notNull(),
    imageStorageKey: text("image_storage_key"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check("products_price_nonnegative", sql`${table.unitPriceKobo} >= 0`),
    check(
      "products_quantity_nonnegative",
      sql`${table.availableQuantity} >= 0`,
    ),
    index("products_active_index").on(table.isActive),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customerProfiles.userId, { onDelete: "restrict" }),
    distributorId: uuid("distributor_id")
      .notNull()
      .references(() => distributorProfiles.id, { onDelete: "restrict" }),
    marketId: uuid("market_id")
      .notNull()
      .references(() => markets.id, { onDelete: "restrict" }),
    customerBusinessNameSnapshot: text(
      "customer_business_name_snapshot",
    ).notNull(),
    customerContactNameSnapshot: text(
      "customer_contact_name_snapshot",
    ).notNull(),
    customerPhoneSnapshot: text("customer_phone_snapshot").notNull(),
    deliveryAddressSnapshot: text("delivery_address_snapshot").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status")
      .default("not_required")
      .notNull(),
    fulfilmentStatus: fulfilmentStatus("fulfilment_status")
      .default("confirmed")
      .notNull(),
    orderedTotalKobo: integer("ordered_total_kobo").notNull(),
    fulfilledTotalKobo: integer("fulfilled_total_kobo"),
    unableToFulfilReason: text("unable_to_fulfil_reason"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check(
      "orders_ordered_total_nonnegative",
      sql`${table.orderedTotalKobo} >= 0`,
    ),
    check(
      "orders_fulfilled_total_nonnegative",
      sql`${table.fulfilledTotalKobo} is null or ${table.fulfilledTotalKobo} >= 0`,
    ),
    index("orders_distributor_status_created_index").on(
      table.distributorId,
      table.fulfilmentStatus,
      table.createdAt,
    ),
    index("orders_customer_created_index").on(
      table.customerId,
      table.createdAt,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    variantSnapshot: text("variant_snapshot"),
    unitSnapshot: text("unit_snapshot").notNull(),
    unitPriceKobo: integer("unit_price_kobo").notNull(),
    orderedQuantity: integer("ordered_quantity").notNull(),
    fulfilledQuantity: integer("fulfilled_quantity").default(0).notNull(),
    unavailableQuantity: integer("unavailable_quantity").default(0).notNull(),
    orderedLineTotalKobo: integer("ordered_line_total_kobo").notNull(),
    fulfilledLineTotalKobo: integer("fulfilled_line_total_kobo"),
    createdAt: createdAt(),
  },
  (table) => [
    check("order_items_price_nonnegative", sql`${table.unitPriceKobo} >= 0`),
    check(
      "order_items_quantities_nonnegative",
      sql`${table.orderedQuantity} > 0 and ${table.fulfilledQuantity} >= 0 and ${table.unavailableQuantity} >= 0`,
    ),
    check(
      "order_items_quantities_reconciled",
      sql`${table.fulfilledQuantity} + ${table.unavailableQuantity} <= ${table.orderedQuantity}`,
    ),
    check(
      "order_items_totals_nonnegative",
      sql`${table.orderedLineTotalKobo} >= 0 and (${table.fulfilledLineTotalKobo} is null or ${table.fulfilledLineTotalKobo} >= 0)`,
    ),
    index("order_items_order_id_index").on(table.orderId),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "restrict",
    }),
    quantityDelta: integer("quantity_delta").notNull(),
    reason: inventoryMovementReason("reason").notNull(),
    note: text("note"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "restrict",
    }),
    createdAt: createdAt(),
  },
  (table) => [
    index("inventory_movements_product_created_index").on(
      table.productId,
      table.createdAt,
    ),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    providerReference: text("provider_reference").notNull(),
    amountKobo: integer("amount_kobo").notNull(),
    currency: text("currency").default("NGN").notNull(),
    status: paymentStatus("status").notNull(),
    providerPayload: jsonb("provider_payload").$type<Record<string, unknown>>(),
    splitContext: jsonb("split_context").$type<Record<string, unknown>>(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check("payments_amount_nonnegative", sql`${table.amountKobo} >= 0`),
    uniqueIndex("payments_provider_reference_unique").on(
      table.providerReference,
    ),
    index("payments_order_id_index").on(table.orderId),
  ],
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    amountKobo: integer("amount_kobo").notNull(),
    providerReference: text("provider_reference"),
    status: refundStatus("status").default("requested").notNull(),
    failureReason: text("failure_reason"),
    providerPayload: jsonb("provider_payload").$type<Record<string, unknown>>(),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    check("refunds_amount_nonnegative", sql`${table.amountKobo} > 0`),
    uniqueIndex("refunds_provider_reference_unique")
      .on(table.providerReference)
      .where(sql`${table.providerReference} is not null`),
    index("refunds_payment_status_index").on(table.paymentId, table.status),
  ],
);

export const deliveryProofs = pgTable(
  "delivery_proofs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    storageKey: text("storage_key").notNull(),
    signerName: text("signer_name"),
    capturedByUserId: uuid("captured_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("delivery_proofs_order_unique").on(table.orderId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    deepLink: text("deep_link"),
    readAt: timestamp("read_at", { withTimezone: true }),
    pushAttempts: integer("push_attempts").default(0).notNull(),
    lastPushAttemptAt: timestamp("last_push_attempt_at", {
      withTimezone: true,
    }),
    createdAt: createdAt(),
  },
  (table) => [
    check(
      "notifications_push_attempts_nonnegative",
      sql`${table.pushAttempts} >= 0`,
    ),
    index("notifications_user_read_created_index").on(
      table.userId,
      table.readAt,
      table.createdAt,
    ),
  ],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    beforeData: jsonb("before_data").$type<Record<string, unknown>>(),
    afterData: jsonb("after_data").$type<Record<string, unknown>>(),
    correlationId: uuid("correlation_id"),
    idempotencyKey: text("idempotency_key"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("audit_events_idempotency_key_unique")
      .on(table.idempotencyKey)
      .where(sql`${table.idempotencyKey} is not null`),
    index("audit_events_resource_index").on(
      table.resourceType,
      table.resourceId,
      table.createdAt,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type DistributorProfile = typeof distributorProfiles.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
