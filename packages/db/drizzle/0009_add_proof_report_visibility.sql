ALTER TABLE "proof_photos"
ADD COLUMN "hidden_from_report" boolean DEFAULT false NOT NULL;

ALTER TABLE "proof_photos"
ADD COLUMN "report_visibility_changed_at" timestamp with time zone;
