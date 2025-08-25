CREATE TYPE "public"."entity_type" AS ENUM('proposal', 'booking');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('active', 'dormant', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."jornada_stage" AS ENUM('em_qualificacao', 'em_negociacao', 'reserva_ativa', 'lead_dormente', 'inativo');--> statement-breakpoint
DROP INDEX "clients_funnel_stage_idx";--> statement-breakpoint
ALTER TABLE "stage_transitions" ADD COLUMN "entity_type" "entity_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "stage_transitions" ADD COLUMN "entity_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clients_new" ADD COLUMN "jornada_stage" "jornada_stage" DEFAULT 'em_qualificacao' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients_new" ADD COLUMN "deal_status" "deal_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "funnel_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "funnel_stage_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "funnel_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "funnel_stage_id" uuid;--> statement-breakpoint
CREATE INDEX "clients_jornada_stage_idx" ON "clients_new" USING btree ("jornada_stage","agency_id","user_id");--> statement-breakpoint
CREATE INDEX "proposals_funnel_status_idx" ON "proposals" USING btree ("funnel_id","funnel_stage_id","status","client_id");--> statement-breakpoint
CREATE INDEX "bookings_funnel_idx" ON "bookings" USING btree ("funnel_id","funnel_stage_id","proposal_id");--> statement-breakpoint
ALTER TABLE "stage_transitions" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE "clients_new" DROP COLUMN "funnel_id";--> statement-breakpoint
ALTER TABLE "clients_new" DROP COLUMN "funnel_stage_id";--> statement-breakpoint
CREATE VIEW "public"."client_jornada" AS (select "clients_new"."id", "clients_new"."name", "clients_new"."jornada_stage", "clients_new"."deal_status", "clients_new"."agency_id", "clients_new"."user_id", JSONB_AGG(
      CASE 
        WHEN "proposals"."id" IS NOT NULL THEN
          JSONB_BUILD_OBJECT(
            'funnelId', "proposals"."funnel_id",
            'funnelStageId', "proposals"."funnel_stage_id",
            'proposalId', "proposals"."id",
            'proposalStatus', "proposals"."status"
          )
        ELSE NULL
      END
    ) FILTER (WHERE "proposals"."id" IS NOT NULL) as "proposal_funnels" from "clients_new" left join "proposals" on "clients_new"."id" = "proposals"."client_id" group by "clients_new"."id", "clients_new"."name", "clients_new"."jornada_stage", "clients_new"."deal_status", "clients_new"."agency_id", "clients_new"."user_id");