Proposta de Adequação do Relacionamento entre Entidades do Sistema SaaS
📊 Visão Geral
Este documento propõe uma reestruturação do relacionamento entre as entidades Clientes, Propostas, Reservas e Funis de Venda no sistema de gestão para agências de viagem, com base nos documentos RELACIONAMENTO-ENTIDADES.md e FLUXOGRAMA-SISTEMA.md. A proposta considera que todo cliente cadastrado representa um "deal" implícito e é configurado no processo geral chamado Jornada Geral, que não é um funil. Clientes não são associados a nenhum funil em sales_funnels; eles seguem apenas o processo da Jornada Geral, representado por um campo ENUM com cinco etapas fixas: "Em Qualificação", "Em Negociação", "Reserva Ativa", "Lead Dormente" e "Inativo". Propostas devem ser associadas a funis específicos existentes em sales_funnels, e reservas herdam o funil da proposta. As etapas da proposta (status) são distintas das etapas do funil (funnelStageId), permitindo iterações internas (ex: proposta rejeitada/reenviada) sem avançar no funil.
Instruções Claras para Implantação:

A Jornada Geral é um processo geral de configuração para todos os clientes, não um registro em sales_funnels. Ela é implementada como um campo ENUM (jornadaStage) diretamente na tabela clients_new, eliminando a necessidade de funnelId e funnelStageId para clientes.
Remova qualquer referência a funis para clientes nas tabelas e no código. Clientes seguem apenas a Jornada Geral.
Propostas e reservas continuam usando funis de sales_funnels.
A etapa da Jornada Geral é atualizada automaticamente com base em marcos das propostas (ex: criação de proposta → "Em Negociação"; active_booking → "Reserva Ativa").
Para migração: Adicione o campo jornadaStage a clients_new, atualize clientes existentes com base no estado atual de propostas, e remova funnelId/funnelStageId de clients_new.

🎯 Objetivos da Adequação

Configurar todo cliente no processo Jornada Geral, com etapas fixas, refletindo o ciclo de vida geral do relacionamento.
Exigir que propostas sejam associadas a um funil existente em sales_funnels (ex: "Rio Quente", "B2B"), escolhido pelo agente, com etapas específicas.
Garantir que reservas herdem o funil e a etapa da proposta, avançando para uma etapa relevante (ex: "Pós-Venda").
Separar claramente o status da proposta (ciclo interno, ex: draft, rejected) do funnelStageId (jornada macro, ex: "Envio da Proposta").
Sincronizar a Jornada Geral do cliente com ações em propostas/reservas via automações.
Suportar múltiplas propostas por cliente, com clareza na UI e relatórios.
Preservar a arquitetura multi-tenant e permissões (ex: agentes só veem seus clientes).

🔄 Estrutura Proposta
1. Jornada Geral (Processo Geral para Clientes)

Conceito: A Jornada Geral não é um funil; é o processo geral de configuração para todo cliente cadastrado, representado por um campo ENUM (jornadaStage) em clients_new. Todo cliente segue esse processo, sem associação a funis em sales_funnels.
Etapas da Jornada Geral:
Em Qualificação: Lead novo, coletando dados (ex: cliente solicita cotação).
Em Negociação: Propostas criadas ou enviadas.
Reserva Ativa: Proposta aceita, pagamento confirmado, reserva em andamento.
Lead Dormente: Pós-venda concluído ou oportunidade pausada (ex: viagem finalizada, cliente qualificado mas sem ação imediata).
Inativo: Rejeição, perda de contato, ou exclusão (soft delete).


Transições:
Automáticas: Baseadas em ações em propostas (ex: criar proposta → "Em Negociação"; status: active_booking → "Reserva Ativa").
Manuais: Agente move para "Lead Dormente" ou "Inativo" após rejeição ou expiração de propostas.



2. Funis em Propostas (Oportunidades Específicas)

Conceito: Cada proposta é uma oportunidade comercial distinta, associada a um funil existente em sales_funnels (ex: "Rio Quente"), escolhido obrigatoriamente pelo agente. O campo status (draft, sent, rejected, etc.) gerencia o ciclo interno, enquanto funnelStageId reflete a jornada macro no funil.
Exemplo: Proposta no funil "Rio Quente", etapa "Envio da Proposta":
Pode passar por múltiplos status (ex: sent → rejected → draft → sent) sem mudar a etapa do funil.
Avança no funil (ex: para "Contrato Assinado") apenas em marcos como approved ou contract.


Sincronização: Mudanças no status da proposta (ex: active_booking) disparam avanços na Jornada Geral do cliente (ex: para "Reserva Ativa").

3. Reservas (Herança de Funil)

Conceito: Reservas herdam o funil e a etapa da proposta ao serem criadas (relação 1:1, via proposalId). Após criação, avançam para uma etapa específica (ex: "Pós-Venda" ou mantêm "Reserva Ativa").
Automação: Trigger automático na mudança de status da proposta para active_booking cria a reserva e copia funnelId/funnelStageId.

4. Clientes sem Propostas

Comportamento: Iniciam em "Em Qualificação" na Jornada Geral. Após inatividade prolongada (ex: 30 dias sem contato), automação sugere mover para "Inativo".

🗄️ Atualizações no Schema do Banco de Dados
1. clients_new
-- Mantém (de RELACIONAMENTO-ENTIDADES.md):
- id (UUID)
- agencyId (UUID) -> agencies.id
- userId (UUID) -> users.id (agente responsável)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- documentType (ENUM: 'cpf', 'cnpj')
- documentNumber (VARCHAR)
- birthDate (DATE)
- addressZipcode (VARCHAR)
- addressStreet (VARCHAR)
- addressCity (VARCHAR)
- addressState (VARCHAR)
- notes (TEXT)
- isActive (BOOLEAN)
-- Remove:
- funnelId (UUID)  -- Clientes não associados a funis
- funnelStageId (UUID)  -- Clientes não associados a funis
-- Adiciona:
- jornadaStage (ENUM: 'em_qualificacao', 'em_negociacao', 'reserva_ativa', 'lead_dormente', 'inativo')  -- Default: 'em_qualificacao'
- dealStatus (ENUM: 'active', 'dormant', 'inactive')  -- Derivado da jornadaStage para relatórios

2. proposals
-- Mantém (de RELACIONAMENTO-ENTIDADES.md):
- id (UUID)
- proposalNumber (VARCHAR)
- agencyId (UUID) -> agencies.id
- clientId (UUID) -> clients_new.id
- userId (UUID) -> users.id
- operatorId (UUID) -> operators.id
- status (ENUM: 'draft', 'sent', 'approved', 'contract', 'awaiting_payment', 'active_booking', 'rejected', 'expired', 'cancelled')
- subtotal (DECIMAL)
- discountAmount (DECIMAL)
- discountPercent (DECIMAL)
- totalAmount (DECIMAL)
- commissionAmount (DECIMAL)
- commissionPercent (DECIMAL)
- paymentMethod (VARCHAR)
- validUntil (DATE)
- contractData (JSONB)
- contractUrl (TEXT)
- approvalEvidence (TEXT)
-- Adiciona:
- funnelId (UUID) -> sales_funnels.id  -- Obrigatório, escolhido entre funis existentes
- funnelStageId (UUID) -> sales_funnel_stages.id  -- Inicia na primeira etapa do funil

3. bookings
-- Mantém (de RELACIONAMENTO-ENTIDADES.md):
- id (UUID)
- proposalId (UUID) -> proposals.id
- agencyId (UUID) -> agencies.id
- bookingNumber (VARCHAR)
- status (ENUM: 'pending_documents', 'under_analysis', 'approved', 'pending_installation', 'installed', 'active', 'cancelled', 'suspended')
- notes (TEXT)
- metadata (JSONB)
- createdBy (UUID) -> users.id
-- Adiciona:
- funnelId (UUID) -> sales_funnels.id  -- Herdado da proposta
- funnelStageId (UUID) -> sales_funnel_stages.id  -- Herdado ou avançado (ex: "Pós-Venda")

4. stage_transitions
-- Modifica (de RELACIONAMENTO-ENTIDADES.md):
- id (UUID)
- entityType (ENUM: 'proposal', 'booking')  -- Não inclui 'client', pois clientes não têm funil
- entityId (UUID)  -- ID da proposta ou reserva
- fromStageId (UUID) -> sales_funnel_stages.id
- toStageId (UUID) -> sales_funnel_stages.id
- userId (UUID) -> users.id
- reason (TEXT)

5. View para Relatórios (Opcional)
CREATE VIEW client_jornada AS
SELECT 
  c.id AS clientId,
  c.name AS clientName,
  c.jornadaStage AS jornadaStage,
  JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'funnelId', p.funnelId,
      'funnelStageId', p.funnelStageId,
      'proposalId', p.id,
      'proposalStatus', p.status
    )
  ) AS proposalFunnels
FROM clients_new c
LEFT JOIN proposals p ON c.id = p.clientId
GROUP BY c.id, c.name, c.jornadaStage;

🔗 Relacionamentos Atualizados

Cliente → Jornada Geral (1:1):
Todos os clientes seguem o processo Jornada Geral via jornadaStage (ENUM).
Não há associação com funis em sales_funnels.


Cliente → Propostas (1:N):
Um cliente pode ter múltiplas propostas, cada uma com seu próprio funil (funnelId escolhido de sales_funnels) e status interno.
Mudanças no status da proposta (ex: rejected → draft) não afetam a Jornada Geral imediatamente, mas marcos (ex: approved) avançam a Jornada Geral.


Proposta → Reserva (1:1):
Proposta com status active_booking gera reserva automaticamente.
Reserva herda funnelId e funnelStageId da proposta.


Agência → Todas as Entidades:
Mantém multi-tenancy via agencyId.



📈 Fluxo do Processo de Vendas

Cliente Cadastrado:
Configurado no processo Jornada Geral, etapa "Em Qualificação".
Exemplo: Cliente solicita cotação.


Interações Iniciais:
Agente qualifica lead (interações em client_interactions).
Cria proposta → cliente avança para "Em Negociação" na Jornada Geral.


Proposta Criada:
Agente escolhe um funil de sales_funnels (ex: "Rio Quente"), etapa inicial (ex: "Envio da Proposta").
Proposta passa por múltiplos status (ex: sent → rejected → draft → sent) sem mudar a etapa do funil.
Cliente permanece em "Em Negociação".


Proposta Aceita/Paga:
status para active_booking → cria reserva automaticamente.
Reserva herda funil da proposta; cliente avança para "Reserva Ativa" na Jornada Geral.


Pós-Venda:
Viagem concluída → cliente para "Lead Dormente" na Jornada Geral.


Rejeição/Perda:
Proposta com status rejected ou expired → agente avalia e move cliente para "Lead Dormente" (potencial futuro) ou "Inativo" (sem potencial).



Exemplo Prático

Cliente: João Silva.
Jornada Geral: Etapa "Em Negociação".
Proposta #001: Funil "Rio Quente", etapa "Envio da Proposta".
Ciclo interno: sent → rejected → draft → sent.
Jornada Geral permanece "Em Negociação" até marco.


Proposta Aprovada: status para active_booking → cria reserva, herda funil "Rio Quente", cliente para "Reserva Ativa" na Jornada Geral.
Rejeição Múltipla: Se todas propostas rejeitadas, agente move cliente para "Lead Dormente" ou "Inativo".

🛡️ Regras de Negócio

Integridade:
Todos os clientes têm jornadaStage definido (default: 'em_qualificacao').
Proposta não pode ser criada sem funnelId.
Reserva não pode ser criada sem proposta.


Validações:
funnelId obrigatório em propostas.
status da proposta independente de funnelStageId.
Unicidade de proposalNumber e bookingNumber por agência.


Permissões (como nos docs):
AGENT: Só vê/altera seus clientes e propostas.
ADMIN/MASTER: Acesso total à agência.


Automações:
Criação de cliente: Atribui etapa inicial da Jornada Geral.
Criação de proposta: Avança cliente para "Em Negociação" na Jornada Geral.
Proposta para active_booking: Cria reserva, avança cliente para "Reserva Ativa".
Inatividade prolongada: Sugere mover cliente para "Inativo".



🚀 Impactos no Código
1. Clients (h:\Programação\saas-starter\app(dashboard)\clients, h:\Programação\saas-starter\components\clients)

Forms: Adicione select para jornadaStage (ENUM, default: 'em_qualificacao').
UI: Mostre etapa da Jornada Geral e propostas (com status e funnelStageId) via client_jornada view.
API:// h:\Programação\saas-starter\app\(dashboard)\clients\route.js
async function createClient(data) {
  data.jornadaStage = 'em_qualificacao';
  data.dealStatus = 'active';
  return await db.insert('clients_new', data);
}



2. Proposals (h:\Programação\saas-starter\app(dashboard)\proposals, h:\Programação\saas-starter\components\proposals)

Forms: Select obrigatório para funnelId, funnelStageId (default: primeira etapa).
Triggers:// h:\Programação\saas-starter\app\(dashboard)\proposals\route.js
async function createProposal(data) {
  if (!data.funnelId) {
    throw new Error('Escolha um funil válido');
  }
  data.funnelStageId = data.funnelStageId || await getFirstStage(data.funnelId);
  const proposal = await db.insert('proposals', data);
  await db.update('clients_new', 
    { jornadaStage: 'em_negociacao' }, 
    { id: data.clientId }
  );
  return proposal;
}
async function updateProposalStatus(proposalId, newStatus) {
  const proposal = await db.update('proposals', { status: newStatus }, { id: proposalId });
  if (newStatus === 'active_booking') {
    await createBooking(proposal);
    await db.update('clients_new', 
      { jornadaStage: 'reserva_ativa' }, 
      { id: proposal.clientId }
    );
  }
  return proposal;
}



3. Bookings (h:\Programação\saas-starter\app(dashboard)\bookings, h:\Programação\saas-starter\components\bookings)

Criação:// h:\Programação\saas-starter\app\(dashboard)\bookings\route.js
async function createBooking(proposal) {
  const booking = {
    proposalId: proposal.id,
    agencyId: proposal.agencyId,
    funnelId: proposal.funnelId,
    funnelStageId: await getPostSaleStage(proposal.funnelId),
    bookingNumber: generateBookingNumber(),
    status: 'pending_documents',
    metadata: {
      proposalNumber: proposal.proposalNumber,
      clientName: await getClientName(proposal.clientId),
      totalAmount: proposal.totalAmount
    }
  };
  return await db.insert('bookings', booking);
}



4. Funnels (h:\Programação\saas-starter\app(dashboard)\funnels, h:\Programação\saas-starter\components\funnels)

Dashboard: Mostre Jornada Geral para clientes (via ENUM) e funis para propostas/reservas.// h:\Programação\saas-starter\app\(dashboard)\funnels\route.js
async function getFunnelData(funnelId) {
  return await db.query(`
    SELECT 'proposal' AS entityType, p.id, p.proposalNumber, p.funnelStageId, p.status
    FROM proposals p
    WHERE p.funnelId = $1
    UNION
    SELECT 'booking' AS entityType, b.id, b.bookingNumber, b.funnelStageId
    FROM bookings b
    WHERE b.funnelId = $1
  `, [funnelId]);
}



📊 Índices e Performance

Índices:
clients_jornada_idx: Em clients_new (jornadaStage, agencyId, userId).
proposals_funnel_status_idx: Em proposals (funnelId, funnelStageId, status, clientId).
bookings_funnel_idx: Em bookings (funnelId, funnelStageId, proposalId).


Otimizações:
Use dealStatus para filtros rápidos.
Cache client_jornada view em relatórios.
Soft deletes para auditoria.



🚀 Pontos de Integração

API Endpoints: Atualize /api/clients para incluir jornadaStage; /api/proposals, /api/bookings para funnelId/funnelStageId e status.
Webhooks:
Mudança de status da proposta: Log em stage_transitions (se afeta funil).
Proposta para active_booking: Cria reserva, atualiza cliente.


Integrações Externas: Mantidas (Stripe, email, SMS, PDFs).

📝 Considerações Finais
A proposta estabelece a Jornada Geral como um processo geral de configuração para todos os clientes, sem associação a funis, implementado via ENUM em clients_new. Propostas e reservas usam funis específicos. A separação entre status da proposta e funnelStageId suporta iterações internas sem impactar o processo, garantindo clareza. A sincronização via automações reduz trabalho manual, e a arquitetura multi-tenant e permissões são preservadas.