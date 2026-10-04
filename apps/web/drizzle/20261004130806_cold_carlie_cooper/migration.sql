CREATE TYPE "restock_order_status" AS ENUM('submitted', 'approved', 'partially_approved', 'rejected', 'dispatched', 'received', 'cancelled');--> statement-breakpoint
CREATE TABLE "restock_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"restock_order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"variant_snapshot" text,
	"unit_snapshot" text NOT NULL,
	"requested_quantity" integer NOT NULL,
	"approved_quantity" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restock_order_items_requested_positive" CHECK ("requested_quantity" > 0),
	CONSTRAINT "restock_order_items_approved_nonnegative" CHECK ("approved_quantity" is null or "approved_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "restock_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"distributor_id" uuid NOT NULL,
	"status" "restock_order_status" DEFAULT 'submitted'::"restock_order_status" NOT NULL,
	"note" text,
	"reviewed_by_user_id" uuid,
	"review_note" text,
	"reviewed_at" timestamp with time zone,
	"dispatched_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "restock_order_items_order_product_unique" ON "restock_order_items" ("restock_order_id","product_id");--> statement-breakpoint
CREATE INDEX "restock_order_items_order_id_index" ON "restock_order_items" ("restock_order_id");--> statement-breakpoint
CREATE INDEX "restock_orders_distributor_status_created_index" ON "restock_orders" ("distributor_id","status","created_at");--> statement-breakpoint
ALTER TABLE "restock_order_items" ADD CONSTRAINT "restock_order_items_restock_order_id_restock_orders_id_fkey" FOREIGN KEY ("restock_order_id") REFERENCES "restock_orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "restock_order_items" ADD CONSTRAINT "restock_order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "restock_orders" ADD CONSTRAINT "restock_orders_distributor_id_distributor_profiles_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "restock_orders" ADD CONSTRAINT "restock_orders_reviewed_by_user_id_users_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;