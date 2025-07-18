CREATE TYPE "public"."client_document_type" AS ENUM('cpf', 'cnpj');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('call', 'email', 'whatsapp', 'meeting', 'note');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "client_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "interaction_type" NOT NULL,
	"description" text NOT NULL,
	"contact_date" timestamp NOT NULL,
	"duration_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"assigned_to" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" "task_priority" NOT NULL,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"transferred_by" uuid NOT NULL,
	"reason" text NOT NULL,
	"transferred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients_new" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"document_type" "client_document_type" NOT NULL,
	"document_number" varchar(18) NOT NULL,
	"birth_date" date,
	"address_zipcode" varchar(9),
	"address_street" varchar(255),
	"address_number" varchar(10),
	"address_complement" varchar(100),
	"address_neighborhood" varchar(100),
	"address_city" varchar(100),
	"address_state" varchar(2),
	"funnel_id" uuid NOT NULL,
	"funnel_stage_id" uuid NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "clients_agency_email_unique" UNIQUE("agency_id","email"),
	CONSTRAINT "clients_agency_document_unique" UNIQUE("agency_id","document_number")
);
--> statement-breakpoint
CREATE TABLE "proposal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"operator_product_id" uuid NOT NULL,
	"base_item_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"custom_fields" jsonb,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"from_status" "proposal_status",
	"to_status" "proposal_status" NOT NULL,
	"changed_by" uuid NOT NULL,
	"reason" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_number" varchar(20) NOT NULL,
	"agency_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"operator_id" uuid NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2),
	"discount_percent" numeric(5, 2),
	"total_amount" numeric(10, 2) NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"commission_percent" numeric(5, 2) NOT NULL,
	"payment_method" varchar(50),
	"valid_until" date NOT NULL,
	"notes" text,
	"internal_notes" text,
	"sent_at" timestamp,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "proposals_agency_number_unique" UNIQUE("agency_id","proposal_number")
);
--> statement-breakpoint
CREATE INDEX "client_interactions_client_contact_date_idx" ON "client_interactions" USING btree ("client_id","contact_date");--> statement-breakpoint
CREATE INDEX "client_interactions_user_idx" ON "client_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "client_interactions_type_idx" ON "client_interactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "client_tasks_client_status_idx" ON "client_tasks" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "client_tasks_assigned_status_due_date_idx" ON "client_tasks" USING btree ("assigned_to","status","due_date");--> statement-breakpoint
CREATE INDEX "client_tasks_due_date_idx" ON "client_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "client_tasks_priority_idx" ON "client_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "client_transfers_client_transferred_at_idx" ON "client_transfers" USING btree ("client_id","transferred_at");--> statement-breakpoint
CREATE INDEX "client_transfers_from_user_idx" ON "client_transfers" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "client_transfers_to_user_idx" ON "client_transfers" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "clients_agency_user_idx" ON "clients_new" USING btree ("agency_id","user_id");--> statement-breakpoint
CREATE INDEX "clients_funnel_stage_idx" ON "clients_new" USING btree ("funnel_stage_id");--> statement-breakpoint
CREATE INDEX "clients_created_at_idx" ON "clients_new" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "clients_name_idx" ON "clients_new" USING btree ("name");--> statement-breakpoint
CREATE INDEX "clients_document_idx" ON "clients_new" USING btree ("document_type","document_number");--> statement-breakpoint
CREATE INDEX "clients_active_idx" ON "clients_new" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "proposal_items_proposal_sort_order_idx" ON "proposal_items" USING btree ("proposal_id","sort_order");--> statement-breakpoint
CREATE INDEX "proposal_items_operator_product_idx" ON "proposal_items" USING btree ("operator_product_id");--> statement-breakpoint
CREATE INDEX "proposal_items_base_item_idx" ON "proposal_items" USING btree ("base_item_id");--> statement-breakpoint
CREATE INDEX "proposal_status_history_proposal_changed_at_idx" ON "proposal_status_history" USING btree ("proposal_id","changed_at");--> statement-breakpoint
CREATE INDEX "proposal_status_history_changed_by_idx" ON "proposal_status_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "proposal_views_proposal_viewed_at_idx" ON "proposal_views" USING btree ("proposal_id","viewed_at");--> statement-breakpoint
CREATE INDEX "proposals_client_status_idx" ON "proposals" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "proposals_user_status_idx" ON "proposals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "proposals_status_valid_until_idx" ON "proposals" USING btree ("status","valid_until");--> statement-breakpoint
CREATE INDEX "proposals_created_at_idx" ON "proposals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "proposals_agency_idx" ON "proposals" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "proposals_operator_idx" ON "proposals" USING btree ("operator_id");