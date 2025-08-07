CREATE TYPE "public"."booking_document_type" AS ENUM('rg_cpf', 'proof_of_residence', 'proof_of_income', 'signed_contract', 'other');--> statement-breakpoint
ALTER TABLE "proposal_items" ALTER COLUMN "operator_product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "proposal_items" ALTER COLUMN "base_item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_documents" ALTER COLUMN "document_type" SET DATA TYPE "public"."booking_document_type" USING "document_type"::text::"public"."booking_document_type";--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "deleted_at" timestamp;