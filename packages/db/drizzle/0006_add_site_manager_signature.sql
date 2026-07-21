ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "site_manager_signature" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "site_manager_signed_by" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "site_manager_signer_role" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "site_manager_signed_at" timestamp with time zone;
