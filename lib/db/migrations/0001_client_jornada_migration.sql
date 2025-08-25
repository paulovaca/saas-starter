-- Migração para implementar o sistema de Jornada Geral
-- Etapa 1: Atualizações no Schema do Banco de Dados

-- 1. Atualizar Tabela clients_new
-- Adicionar colunas jornadaStage e dealStatus
ALTER TABLE clients_new
ADD COLUMN IF NOT EXISTS jornada_stage "jornada_stage" DEFAULT 'em_qualificacao',
ADD COLUMN IF NOT EXISTS deal_status "deal_status" DEFAULT 'active';

-- Remover colunas funnelId e funnelStageId (se existirem)
ALTER TABLE clients_new
DROP COLUMN IF EXISTS funnel_id,
DROP COLUMN IF EXISTS funnel_stage_id;

-- 2. Atualizar Tabela proposals
-- Adicionar funnelId (obrigatório) e funnelStageId
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES sales_funnels(id) NOT NULL DEFAULT (SELECT id FROM sales_funnels LIMIT 1),
ADD COLUMN IF NOT EXISTS funnel_stage_id UUID REFERENCES sales_funnel_stages(id);

-- 3. Atualizar Tabela bookings
-- Adicionar funnelId e funnelStageId, herdados da proposta
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES sales_funnels(id),
ADD COLUMN IF NOT EXISTS funnel_stage_id UUID REFERENCES sales_funnel_stages(id);

-- 4. Modificar Tabela stage_transitions
-- Adicionar entityType e entityId
ALTER TABLE stage_transitions
ADD COLUMN IF NOT EXISTS entity_type "entity_type" DEFAULT 'proposal',
ADD COLUMN IF NOT EXISTS entity_id UUID;

-- Remover clientId (se existir)
ALTER TABLE stage_transitions
DROP COLUMN IF EXISTS client_id;

-- 5. Adicionar Índices para Performance
CREATE INDEX IF NOT EXISTS clients_jornada_idx ON clients_new (jornada_stage, agency_id, user_id);
CREATE INDEX IF NOT EXISTS proposals_funnel_status_idx ON proposals (funnel_id, funnel_stage_id, status, client_id);
CREATE INDEX IF NOT EXISTS bookings_funnel_idx ON bookings (funnel_id, funnel_stage_id, proposal_id);

-- 6. Criar View para Relatórios
CREATE OR REPLACE VIEW client_jornada AS
SELECT 
  c.id AS client_id,
  c.name AS client_name,
  c.jornada_stage AS jornada_stage,
  c.deal_status AS deal_status,
  c.agency_id AS agency_id,
  c.user_id AS user_id,
  JSONB_AGG(
    CASE 
      WHEN p.id IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
          'funnelId', p.funnel_id,
          'funnelStageId', p.funnel_stage_id,
          'proposalId', p.id,
          'proposalStatus', p.status
        )
      ELSE NULL
    END
  ) FILTER (WHERE p.id IS NOT NULL) AS proposal_funnels
FROM clients_new c
LEFT JOIN proposals p ON c.id = p.client_id
GROUP BY c.id, c.name, c.jornada_stage, c.deal_status, c.agency_id, c.user_id;

-- 7. Migração de Dados Existentes
-- Atualizar jornadaStage e dealStatus para clientes existentes com base em propostas
UPDATE clients_new c
SET jornada_stage = CASE
  WHEN EXISTS (SELECT 1 FROM proposals p WHERE p.client_id = c.id AND p.status = 'active_booking') THEN 'reserva_ativa'
  WHEN EXISTS (SELECT 1 FROM proposals p WHERE p.client_id = c.id AND p.status IN ('draft', 'sent', 'approved', 'contract', 'awaiting_payment')) THEN 'em_negociacao'
  ELSE 'em_qualificacao'
END,
deal_status = CASE
  WHEN jornada_stage IN ('em_qualificacao', 'em_negociacao', 'reserva_ativa') THEN 'active'
  WHEN jornada_stage = 'lead_dormente' THEN 'dormant'
  ELSE 'inactive'
END;

-- 8. Atualizar funnelId nas propostas para usar o funil padrão da agência
UPDATE proposals p
SET funnel_id = COALESCE(
  (SELECT default_funnel_id FROM agency_settings WHERE agency_id = p.agency_id),
  (SELECT id FROM sales_funnels WHERE agency_id = p.agency_id ORDER BY is_default DESC, created_at ASC LIMIT 1)
)
WHERE funnel_id IS NULL;

-- 9. Atualizar funnelStageId nas propostas para usar a primeira etapa do funil
UPDATE proposals p
SET funnel_stage_id = (
  SELECT id FROM sales_funnel_stages 
  WHERE funnel_id = p.funnel_id 
  ORDER BY "order" ASC 
  LIMIT 1
)
WHERE funnel_stage_id IS NULL;

-- 10. Atualizar bookings para herdar funnelId e funnelStageId da proposta
UPDATE bookings b
SET 
  funnel_id = p.funnel_id,
  funnel_stage_id = COALESCE(
    (SELECT id FROM sales_funnel_stages 
     WHERE funnel_id = p.funnel_id 
     AND name ILIKE '%pós%venda%' 
     LIMIT 1),
    (SELECT id FROM sales_funnel_stages 
     WHERE funnel_id = p.funnel_id 
     ORDER BY "order" DESC 
     LIMIT 1)
  )
FROM proposals p
WHERE b.proposal_id = p.id
AND (b.funnel_id IS NULL OR b.funnel_stage_id IS NULL);

-- 11. Migrar dados existentes de stage_transitions
UPDATE stage_transitions st
SET 
  entity_type = 'proposal',
  entity_id = (
    SELECT p.id 
    FROM proposals p 
    WHERE p.client_id = st.client_id 
    ORDER BY p.created_at DESC 
    LIMIT 1
  )
WHERE entity_id IS NULL AND client_id IS NOT NULL;

-- Commit da migração
COMMIT;