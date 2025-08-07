-- Primeiro converter para text para poder fazer as conversões
ALTER TABLE "proposal_status_history" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "proposal_status_history" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "proposals" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "proposals" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint

-- Atualizar os valores existentes de 'accepted' para 'approved' e 'ACTIVE_BOOKING' para 'active_booking'
UPDATE "proposals" SET "status" = 'approved' WHERE "status" = 'accepted';--> statement-breakpoint
UPDATE "proposals" SET "status" = 'active_booking' WHERE "status" = 'ACTIVE_BOOKING';--> statement-breakpoint
UPDATE "proposal_status_history" SET "from_status" = 'approved' WHERE "from_status" = 'accepted';--> statement-breakpoint
UPDATE "proposal_status_history" SET "to_status" = 'approved' WHERE "to_status" = 'accepted';--> statement-breakpoint
UPDATE "proposal_status_history" SET "from_status" = 'active_booking' WHERE "from_status" = 'ACTIVE_BOOKING';--> statement-breakpoint
UPDATE "proposal_status_history" SET "to_status" = 'active_booking' WHERE "to_status" = 'ACTIVE_BOOKING';--> statement-breakpoint

-- Agora recriar o enum com os novos valores
DROP TYPE "public"."proposal_status";--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'approved', 'contract', 'rejected', 'expired', 'awaiting_payment', 'active_booking', 'cancelled');--> statement-breakpoint

-- Converter de volta para o enum
ALTER TABLE "proposal_status_history" ALTER COLUMN "from_status" SET DATA TYPE "public"."proposal_status" USING "from_status"::"public"."proposal_status";--> statement-breakpoint
ALTER TABLE "proposal_status_history" ALTER COLUMN "to_status" SET DATA TYPE "public"."proposal_status" USING "to_status"::"public"."proposal_status";--> statement-breakpoint
ALTER TABLE "proposals" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."proposal_status";--> statement-breakpoint
ALTER TABLE "proposals" ALTER COLUMN "status" SET DATA TYPE "public"."proposal_status" USING "status"::"public"."proposal_status";--> statement-breakpoint

-- Adicionar as novas colunas
ALTER TABLE "proposals" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "contract_at" timestamp;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "contract_data" jsonb;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "contract_url" text;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "approval_evidence" text;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "rejection_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "cancellation_reason" varchar(255);