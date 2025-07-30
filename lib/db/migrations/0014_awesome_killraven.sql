ALTER TYPE "public"."proposal_status" ADD VALUE 'awaiting_payment';--> statement-breakpoint
ALTER TYPE "public"."proposal_status" ADD VALUE 'active_travel';--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "payment_due_at" timestamp;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "activated_at" timestamp;