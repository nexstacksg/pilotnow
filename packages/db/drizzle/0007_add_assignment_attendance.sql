ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_in_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_in_latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_in_longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_in_location" text;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_out_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_out_latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_out_longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "job_assignments" ADD COLUMN IF NOT EXISTS "check_out_location" text;
