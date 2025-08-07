ALTER TYPE "public"."proposal_status" ADD VALUE 'awaiting_payment';--> statement-breakpoint
ALTER TYPE "public"."proposal_status" ADD VALUE 'ACTIVE_BOOKING';--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "payment_due_at" timestamp;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "activated_at" timestamp;