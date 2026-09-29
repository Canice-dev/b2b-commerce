CREATE TYPE "auth_provider" AS ENUM('email', 'google', 'apple');--> statement-breakpoint
CREATE TYPE "business_type" AS ENUM('retailer', 'wholesaler');--> statement-breakpoint
CREATE TYPE "fulfilment_status" AS ENUM('confirmed', 'out_for_delivery', 'partially_fulfilled', 'unable_to_fulfil', 'delivered');--> statement-breakpoint
CREATE TYPE "inventory_movement_reason" AS ENUM('initial', 'manual_adjustment', 'reservation', 'release', 'partial_fulfilment');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('order_confirmed', 'order_updated', 'payment_updated', 'refund_updated', 'system');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('pay_on_delivery', 'card', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('not_required', 'pending', 'verified', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "refund_status" AS ENUM('requested', 'pending', 'processing', 'processed', 'needs_attention', 'failed');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('customer', 'distributor', 'admin');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('active', 'suspended', 'disabled');--> statement-breakpoint
CREATE TABLE "admin_profiles" (
	"user_id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"correlation_id" uuid,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_subject" text NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"user_id" uuid PRIMARY KEY,
	"business_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"phone" text NOT NULL,
	"business_type" "business_type" NOT NULL,
	"market_id" uuid NOT NULL,
	"assigned_distributor_id" uuid NOT NULL,
	"default_address" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"signer_name" text,
	"captured_by_user_id" uuid NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distributor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_user_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"contact_phone" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distributor_settings" (
	"distributor_id" uuid PRIMARY KEY,
	"minimum_order_amount_kobo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "distributor_settings_minimum_order_nonnegative" CHECK ("minimum_order_amount_kobo" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"order_id" uuid,
	"quantity_delta" integer NOT NULL,
	"reason" "inventory_movement_reason" NOT NULL,
	"note" text,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_government_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"state_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_distributor_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"market_id" uuid NOT NULL,
	"distributor_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"local_government_area_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neighbour_service_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"market_id" uuid NOT NULL,
	"distributor_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"approved_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"payload" jsonb NOT NULL,
	"deep_link" text,
	"read_at" timestamp with time zone,
	"push_attempts" integer DEFAULT 0 NOT NULL,
	"last_push_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_push_attempts_nonnegative" CHECK ("push_attempts" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"product_name_snapshot" text NOT NULL,
	"variant_snapshot" text,
	"unit_snapshot" text NOT NULL,
	"unit_price_kobo" integer NOT NULL,
	"ordered_quantity" integer NOT NULL,
	"fulfilled_quantity" integer DEFAULT 0 NOT NULL,
	"unavailable_quantity" integer DEFAULT 0 NOT NULL,
	"ordered_line_total_kobo" integer NOT NULL,
	"fulfilled_line_total_kobo" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_price_nonnegative" CHECK ("unit_price_kobo" >= 0),
	CONSTRAINT "order_items_quantities_nonnegative" CHECK ("ordered_quantity" > 0 and "fulfilled_quantity" >= 0 and "unavailable_quantity" >= 0),
	CONSTRAINT "order_items_quantities_reconciled" CHECK ("fulfilled_quantity" + "unavailable_quantity" <= "ordered_quantity"),
	CONSTRAINT "order_items_totals_nonnegative" CHECK ("ordered_line_total_kobo" >= 0 and ("fulfilled_line_total_kobo" is null or "fulfilled_line_total_kobo" >= 0))
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"customer_id" uuid NOT NULL,
	"distributor_id" uuid NOT NULL,
	"market_id" uuid NOT NULL,
	"customer_business_name_snapshot" text NOT NULL,
	"customer_contact_name_snapshot" text NOT NULL,
	"customer_phone_snapshot" text NOT NULL,
	"delivery_address_snapshot" text NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'not_required'::"payment_status" NOT NULL,
	"fulfilment_status" "fulfilment_status" DEFAULT 'confirmed'::"fulfilment_status" NOT NULL,
	"ordered_total_kobo" integer NOT NULL,
	"fulfilled_total_kobo" integer,
	"unable_to_fulfil_reason" text,
	"confirmed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"dispatched_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_ordered_total_nonnegative" CHECK ("ordered_total_kobo" >= 0),
	CONSTRAINT "orders_fulfilled_total_nonnegative" CHECK ("fulfilled_total_kobo" is null or "fulfilled_total_kobo" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"provider_reference" text NOT NULL,
	"amount_kobo" integer NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" "payment_status" NOT NULL,
	"provider_payload" jsonb,
	"split_context" jsonb,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_nonnegative" CHECK ("amount_kobo" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"distributor_id" uuid NOT NULL,
	"name" text NOT NULL,
	"variant" text,
	"unit" text NOT NULL,
	"unit_price_kobo" integer NOT NULL,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"image_storage_key" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_nonnegative" CHECK ("unit_price_kobo" >= 0),
	CONSTRAINT "products_quantity_nonnegative" CHECK ("available_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"payment_id" uuid NOT NULL,
	"amount_kobo" integer NOT NULL,
	"provider_reference" text,
	"status" "refund_status" DEFAULT 'requested'::"refund_status" NOT NULL,
	"failure_reason" text,
	"provider_payload" jsonb,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refunds_amount_nonnegative" CHECK ("amount_kobo" > 0)
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid,
	"role" "user_role",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_pkey" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text,
	"display_name" text,
	"status" "user_status" DEFAULT 'active'::"user_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "audit_events_idempotency_key_unique" ON "audit_events" ("idempotency_key") WHERE "idempotency_key" is not null;--> statement-breakpoint
CREATE INDEX "audit_events_resource_index" ON "audit_events" ("resource_type","resource_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_subject_unique" ON "auth_identities" ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "auth_identities_user_id_index" ON "auth_identities" ("user_id");--> statement-breakpoint
CREATE INDEX "customer_profiles_distributor_index" ON "customer_profiles" ("assigned_distributor_id");--> statement-breakpoint
CREATE INDEX "customer_profiles_market_index" ON "customer_profiles" ("market_id");--> statement-breakpoint
CREATE UNIQUE INDEX "delivery_proofs_order_unique" ON "delivery_proofs" ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "distributor_profiles_owner_unique" ON "distributor_profiles" ("owner_user_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_product_created_index" ON "inventory_movements" ("product_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lgas_state_name_unique" ON "local_government_areas" ("state_id","name");--> statement-breakpoint
CREATE INDEX "lgas_state_id_index" ON "local_government_areas" ("state_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_primary_distributor_per_market" ON "market_distributor_assignments" ("market_id") WHERE "is_active";--> statement-breakpoint
CREATE INDEX "market_assignments_distributor_active_index" ON "market_distributor_assignments" ("distributor_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "markets_lga_name_unique" ON "markets" ("local_government_area_id","name");--> statement-breakpoint
CREATE INDEX "markets_lga_id_index" ON "markets" ("local_government_area_id");--> statement-breakpoint
CREATE UNIQUE INDEX "active_neighbour_service_assignment_unique" ON "neighbour_service_assignments" ("market_id","distributor_id") WHERE "is_active";--> statement-breakpoint
CREATE INDEX "notifications_user_read_created_index" ON "notifications" ("user_id","read_at","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_id_index" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX "orders_distributor_status_created_index" ON "orders" ("distributor_id","fulfilment_status","created_at");--> statement-breakpoint
CREATE INDEX "orders_customer_created_index" ON "orders" ("customer_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_reference_unique" ON "payments" ("provider_reference");--> statement-breakpoint
CREATE INDEX "payments_order_id_index" ON "payments" ("order_id");--> statement-breakpoint
CREATE INDEX "products_distributor_active_index" ON "products" ("distributor_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_provider_reference_unique" ON "refunds" ("provider_reference") WHERE "provider_reference" is not null;--> statement-breakpoint
CREATE INDEX "refunds_payment_status_index" ON "refunds" ("payment_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "states_code_unique" ON "states" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email") WHERE "email" is not null;--> statement-breakpoint
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_LsYl8PL1sN6P_fkey" FOREIGN KEY ("assigned_distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_captured_by_user_id_users_id_fkey" FOREIGN KEY ("captured_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_profiles" ADD CONSTRAINT "distributor_profiles_owner_user_id_users_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_settings" ADD CONSTRAINT "distributor_settings_m17bQbx3Th5u_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "local_government_areas" ADD CONSTRAINT "local_government_areas_state_id_states_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "market_distributor_assignments" ADD CONSTRAINT "market_distributor_assignments_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "market_distributor_assignments" ADD CONSTRAINT "market_distributor_assignments_z3sd9JbO5OgW_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "markets" ADD CONSTRAINT "markets_local_government_area_id_local_government_areas_id_fkey" FOREIGN KEY ("local_government_area_id") REFERENCES "local_government_areas"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "neighbour_service_assignments" ADD CONSTRAINT "neighbour_service_assignments_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "neighbour_service_assignments" ADD CONSTRAINT "neighbour_service_assignments_PgmhP8hUleUj_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "neighbour_service_assignments" ADD CONSTRAINT "neighbour_service_assignments_approved_by_user_id_users_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customer_profiles_user_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("user_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_distributor_id_distributor_profiles_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_market_id_markets_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_distributor_id_distributor_profiles_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;