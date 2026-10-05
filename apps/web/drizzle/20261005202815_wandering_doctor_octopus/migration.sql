CREATE TABLE "admin_distributor_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"distributor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_distributor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"sender_user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_distributor_conversations_distributor_unique" ON "admin_distributor_conversations" ("distributor_id");--> statement-breakpoint
CREATE INDEX "admin_distributor_messages_conversation_created_index" ON "admin_distributor_messages" ("conversation_id","created_at");--> statement-breakpoint
ALTER TABLE "admin_distributor_conversations" ADD CONSTRAINT "admin_distributor_conversations_DbJBjfedeTz7_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "admin_distributor_messages" ADD CONSTRAINT "admin_distributor_messages_NYZGl5mPxMfn_fkey" FOREIGN KEY ("conversation_id") REFERENCES "admin_distributor_conversations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "admin_distributor_messages" ADD CONSTRAINT "admin_distributor_messages_sender_user_id_users_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;