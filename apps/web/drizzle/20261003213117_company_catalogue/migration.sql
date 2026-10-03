ALTER TABLE "products" DROP CONSTRAINT "products_distributor_id_distributor_profiles_id_fkey";--> statement-breakpoint
DROP INDEX "products_distributor_active_index";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "distributor_id";--> statement-breakpoint
CREATE INDEX "products_active_index" ON "products" ("is_active");