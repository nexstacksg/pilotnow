ALTER TABLE "admin_users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "password_changed_at" timestamp with time zone;