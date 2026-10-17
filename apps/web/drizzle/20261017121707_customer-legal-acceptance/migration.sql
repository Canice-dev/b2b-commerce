CREATE TABLE "customer_legal_acceptances" (
	"user_id" uuid PRIMARY KEY,
	"terms_version" text NOT NULL,
	"privacy_policy_version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_legal_acceptances" ADD CONSTRAINT "customer_legal_acceptances_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;