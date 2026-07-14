ALTER TABLE "officers" ADD COLUMN IF NOT EXISTS "officer_code" text;

WITH numbered AS (
  SELECT id, 'OF-' || lpad(row_number() OVER (ORDER BY created_at, id)::text, 2, '0') AS generated_code
  FROM "officers"
  WHERE "officer_code" IS NULL
)
UPDATE "officers"
SET "officer_code" = numbered.generated_code
FROM numbered
WHERE "officers"."id" = numbered.id;

ALTER TABLE "officers" ALTER COLUMN "officer_code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "officers_officer_code_idx" ON "officers" USING btree ("officer_code");
