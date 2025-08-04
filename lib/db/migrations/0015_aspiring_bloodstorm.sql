CREATE TYPE "public"."booking_status" AS ENUM('pending_documents', 'under_analysis', 'approved', 'pending_installation', 'installed', 'active', 'cancelled', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."timeline_event" AS ENUM('created', 'status_changed', 'document_uploaded', 'document_removed', 'note_added', 'client_contacted', 'installation_scheduled', 'other');--> statement-breakpoint
CREATE TABLE "booking_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_size" varchar(50),
	"mime_type" varchar(100),
	"metadata" jsonb,
	"uploaded_by" uuid NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"previous_status" "booking_status" NOT NULL,
	"new_status" "booking_status" NOT NULL,
	"reason" text NOT NULL,
	"metadata" jsonb,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"event_type" timeline_event NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"booking_number" varchar(50) NOT NULL,
	"status" "booking_status" DEFAULT 'pending_documents' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
