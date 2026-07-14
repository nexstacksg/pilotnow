DO $$ BEGIN
 CREATE TYPE "public"."officer_status" AS ENUM('NEW', 'ACTIVE', 'INACTIVE', 'BLOCKED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "job_code" text;--> statement-breakpoint
WITH numbered_jobs AS (
  SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS row_index
  FROM "jobs"
  WHERE "job_code" IS NULL
)
UPDATE "jobs"
SET "job_code" = 'PN-' || (2041 + numbered_jobs.row_index)::text
FROM numbered_jobs
WHERE "jobs"."id" = numbered_jobs."id";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "job_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "invoice_number" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "billed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "officers" ADD COLUMN IF NOT EXISTS "status" "officer_status" DEFAULT 'NEW' NOT NULL;--> statement-breakpoint
ALTER TABLE "officers" ADD COLUMN IF NOT EXISTS "default_hourly_rate" numeric(10, 2) DEFAULT '14.00' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_job_code_idx" ON "jobs" USING btree ("job_code");
