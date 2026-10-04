CREATE TYPE "distributor_inventory_movement_reason" AS ENUM('restock_received', 'manual_adjustment');--> statement-breakpoint
CREATE TABLE "distributor_inventories" (
	"distributor_id" uuid,
	"product_id" uuid,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "distributor_inventories_pkey" PRIMARY KEY("distributor_id","product_id"),
	CONSTRAINT "distributor_inventories_quantity_nonnegative" CHECK ("available_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "distributor_inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"distributor_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"restock_order_id" uuid,
	"quantity_delta" integer NOT NULL,
	"reason" "distributor_inventory_movement_reason" NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "restock_orders" ADD COLUMN "received_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "distributor_inventory_movements_inventory_created_index" ON "distributor_inventory_movements" ("distributor_id","product_id","created_at");--> statement-breakpoint
ALTER TABLE "distributor_inventories" ADD CONSTRAINT "distributor_inventories_RdespVs9rDi9_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_inventories" ADD CONSTRAINT "distributor_inventories_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_inventory_movements" ADD CONSTRAINT "distributor_inventory_movements_EWF0o2RRiQYi_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_inventory_movements" ADD CONSTRAINT "distributor_inventory_movements_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_inventory_movements" ADD CONSTRAINT "distributor_inventory_movements_tvNKUQBmSoxa_fkey" FOREIGN KEY ("restock_order_id") REFERENCES "restock_orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "distributor_inventory_movements" ADD CONSTRAINT "distributor_inventory_movements_MuVPc6N12X1l_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;