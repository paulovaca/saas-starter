CREATE TABLE "stage_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_stage_id" uuid,
	"to_stage_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales_funnel_stages" DROP CONSTRAINT "sales_funnel_stages_funnel_id_sales_funnels_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_funnels" DROP CONSTRAINT "sales_funnels_agency_id_agencies_id_fk";
--> statement-breakpoint
ALTER TABLE "sales_funnel_stages" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "sales_funnel_stages" ADD COLUMN "color" varchar(50) DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_funnel_stages" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_funnels" ADD COLUMN "description" text;--> statement-breakpoint
-- Primeiro adiciona a coluna como nullable
ALTER TABLE "sales_funnels" ADD COLUMN "created_by" uuid;--> statement-breakpoint
-- Atualiza registros existentes com o primeiro usuário Master da agência
UPDATE "sales_funnels" 
SET "created_by" = (
  SELECT u.id 
  FROM "users" u 
  WHERE u.agency_id = "sales_funnels".agency_id 
    AND u.role = 'MASTER' 
  LIMIT 1
)
WHERE "created_by" IS NULL;--> statement-breakpoint
-- Agora torna a coluna NOT NULL
ALTER TABLE "sales_funnels" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stage_transitions" ADD CONSTRAINT "stage_transitions_from_stage_id_sales_funnel_stages_id_fk" FOREIGN KEY ("from_stage_id") REFERENCES "public"."sales_funnel_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_transitions" ADD CONSTRAINT "stage_transitions_to_stage_id_sales_funnel_stages_id_fk" FOREIGN KEY ("to_stage_id") REFERENCES "public"."sales_funnel_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_transitions" ADD CONSTRAINT "stage_transitions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_funnel_stages" ADD CONSTRAINT "sales_funnel_stages_funnel_id_sales_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."sales_funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_funnels" ADD CONSTRAINT "sales_funnels_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_funnels" ADD CONSTRAINT "sales_funnels_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_funnel_stages" DROP COLUMN "instructions";