ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "job_code" text;

WITH numbered AS (
  SELECT id, 'PN-' || (2041 + row_number() OVER (ORDER BY created_at, id))::text AS generated_code
  FROM "jobs"
  WHERE "job_code" IS NULL
)
UPDATE "jobs"
SET "job_code" = numbered.generated_code
FROM numbered
WHERE "jobs"."id" = numbered.id;

ALTER TABLE "jobs" ALTER COLUMN "job_code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "jobs_job_code_idx" ON "jobs" USING btree ("job_code");
