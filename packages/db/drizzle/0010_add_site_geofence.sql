ALTER TABLE "sites"
ADD COLUMN IF NOT EXISTS "latitude" numeric(10, 7),
ADD COLUMN IF NOT EXISTS "longitude" numeric(10, 7),
ADD COLUMN IF NOT EXISTS "allowed_radius_metres" integer;

ALTER TABLE "job_assignments"
ADD COLUMN IF NOT EXISTS "check_in_accuracy_metres" numeric(8, 2),
ADD COLUMN IF NOT EXISTS "check_out_accuracy_metres" numeric(8, 2);
