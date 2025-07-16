CREATE TYPE "public"."commission_type" AS ENUM('percentage', 'fixed', 'tiered');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('contract', 'price_table', 'marketing_material', 'other');--> statement-breakpoint
CREATE TABLE "commission_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_item_id" uuid NOT NULL,
	"rule_type" varchar(50) NOT NULL,
	"min_value" real,
	"max_value" real,
	"percentage" real,
	"fixed_value" real,
	"conditions" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"document_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operator_item_payment_methods" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "operator_item_payment_methods" CASCADE;--> statement-breakpoint
ALTER TABLE "base_items" DROP CONSTRAINT "base_items_agency_id_agencies_id_fk";
--> statement-breakpoint
ALTER TABLE "operator_items" DROP CONSTRAINT "operator_items_base_item_id_base_items_id_fk";
--> statement-breakpoint
ALTER TABLE "operator_items" ADD COLUMN "catalog_item_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "operator_items" ADD COLUMN "custom_name" varchar(255);--> statement-breakpoint
ALTER TABLE "operator_items" ADD COLUMN "custom_values" json;--> statement-breakpoint
ALTER TABLE "operator_items" ADD COLUMN "commission_type" "commission_type" DEFAULT 'percentage' NOT NULL;--> statement-breakpoint
ALTER TABLE "operator_items" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "cnpj" varchar(18);--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_operator_item_id_operator_items_id_fk" FOREIGN KEY ("operator_item_id") REFERENCES "public"."operator_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_documents" ADD CONSTRAINT "operator_documents_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_items" DROP COLUMN "base_item_id";--> statement-breakpoint
ALTER TABLE "operators" DROP COLUMN "website";