-- Adicionar coluna como nullable primeiro
ALTER TABLE "sales_funnel_stages" ADD COLUMN "created_by" uuid;

-- Atualizar registros existentes com o primeiro usuário disponível
UPDATE "sales_funnel_stages" 
SET "created_by" = (SELECT id FROM users LIMIT 1)
WHERE "created_by" IS NULL;

-- Tornar a coluna NOT NULL
ALTER TABLE "sales_funnel_stages" ALTER COLUMN "created_by" SET NOT NULL;

-- Adicionar constraint de foreign key
ALTER TABLE "sales_funnel_stages" ADD CONSTRAINT "sales_funnel_stages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;