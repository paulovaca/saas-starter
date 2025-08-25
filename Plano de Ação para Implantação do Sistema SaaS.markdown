# Plano de Ação para Implantação das Modificações no Sistema SaaS

Este documento apresenta um plano de ação completo para implantar a reestruturação do relacionamento entre as entidades **Clientes**, **Propostas**, **Reservas** e **Funis de Venda** no sistema de gestão para agências de viagem, conforme especificado na proposta de adequação. A abordagem garante que apenas **propostas** e **reservas** sejam associadas a funis de venda em `sales_funnels`, com mudanças de etapas (`funnelStageId`) realizadas **exclusivamente de forma manual**. Os **clientes** seguem o processo **Jornada Geral**, implementado via campo `jornadaStage` (ENUM) na tabela `clients_new`, com transições automáticas baseadas em marcos de propostas e reservas. O plano é projetado para ser executado por um agente de IA ou desenvolvedor, com passos claros e organizados.

## Pré-requisitos
- **Backup**: Backup completo do banco de dados e do código em `h:\Programação\saas-starter`.
- **Ambiente**: Ambiente de staging configurado para testes.
- **Ferramentas**: Banco de dados PostgreSQL (suporte a JSONB e ENUMs), ferramentas de migração (ex: Knex.js ou SQL scripts), Node.js para backend.
- **Documentação**: Conhecimento das estruturas em `RELACIONAMENTO-ENTIDADES.md` e `FLUXOGRAMA-SISTEMA.md`.
- **Testes**: Testes unitários e de integração preparados para atualização.

## Etapa 1: Atualizações no Schema do Banco de Dados
Execute migrações no banco de dados para alinhar com a proposta, garantindo que apenas propostas e reservas usem funis e que clientes sigam a Jornada Geral.

1. **Atualizar Tabela `clients_new`**:
   - Adicione `jornadaStage` e `dealStatus` para gerenciar a Jornada Geral.
   - Remova `funnelId` e `funnelStageId` (clientes não usam funis).
   ```sql
   ALTER TABLE clients_new
   ADD COLUMN IF NOT EXISTS jornadaStage ENUM('em_qualificacao', 'em_negociacao', 'reserva_ativa', 'lead_dormente', 'inativo') DEFAULT 'em_qualificacao',
   ADD COLUMN IF NOT EXISTS dealStatus ENUM('active', 'dormant', 'inactive') DEFAULT 'active',
   DROP COLUMN IF EXISTS funnelId,
   DROP COLUMN IF EXISTS funnelStageId;
   ```

2. **Atualizar Tabela `proposals`**:
   - Adicione `funnelId` (obrigatório) e `funnelStageId` para associação com funis.
   ```sql
   ALTER TABLE proposals
   ADD COLUMN IF NOT EXISTS funnelId UUID REFERENCES sales_funnels(id) NOT NULL,
   ADD COLUMN IF NOT EXISTS funnelStageId UUID REFERENCES sales_funnel_stages(id);
   ```

3. **Atualizar Tabela `bookings`**:
   - Adicione `funnelId` e `funnelStageId`, herdados da proposta.
   ```sql
   ALTER TABLE bookings
   ADD COLUMN IF NOT EXISTS funnelId UUID REFERENCES sales_funnels(id),
   ADD COLUMN IF NOT EXISTS funnelStageId UUID REFERENCES sales_funnel_stages(id);
   ```

4. **Modificar Tabela `stage_transitions`**:
   - Atualize `entityType` para refletir apenas propostas e reservas.
   ```sql
   ALTER TABLE stage_transitions
   ALTER COLUMN entityType TYPE ENUM('proposal', 'booking');
   ```

5. **Criar View para Relatórios**:
   - Crie a view `client_jornada` para relatórios consolidados.
   ```sql
   CREATE OR REPLACE VIEW client_jornada AS
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
   ```

6. **Adicionar Índices para Performance**:
   ```sql
   CREATE INDEX IF NOT EXISTS clients_jornada_idx ON clients_new (jornadaStage, agencyId, userId);
   CREATE INDEX IF NOT EXISTS proposals_funnel_status_idx ON proposals (funnelId, funnelStageId, status, clientId);
   CREATE INDEX IF NOT EXISTS bookings_funnel_idx ON bookings (funnelId, funnelStageId, proposalId);
   ```

7. **Migração de Dados Existentes**:
   - Atualize `jornadaStage` e `dealStatus` para clientes existentes com base em propostas.
   ```sql
   UPDATE clients_new c
   SET jornadaStage = CASE
     WHEN EXISTS (SELECT 1 FROM proposals p WHERE p.clientId = c.id AND p.status = 'active_booking') THEN 'reserva_ativa'
     WHEN EXISTS (SELECT 1 FROM proposals p WHERE p.clientId = c.id AND p.status IN ('draft', 'sent', 'approved', 'contract', 'awaiting_payment')) THEN 'em_negociacao'
     ELSE 'em_qualificacao'
   END,
   dealStatus = CASE
     WHEN jornadaStage IN ('em_qualificacao', 'em_negociacao', 'reserva_ativa') THEN 'active'
     WHEN jornadaStage = 'lead_dormente' THEN 'dormant'
     ELSE 'inactive'
   END;
   ```

## Etapa 2: Atualizações no Código Backend (API e Rotas)
Atualize os arquivos em `h:\Programação\saas-starter\app\(dashboard)\`, garantindo que mudanças de `funnelStageId` sejam manuais e que clientes usem apenas `jornadaStage`.

1. **Clientes (`clients/route.js`)**:
   - Criação e atualização de clientes, sem referências a funis.
   ```javascript
   async function createClient(data) {
     data.jornadaStage = 'em_qualificacao';
     data.dealStatus = 'active';
     return await db.insert('clients_new', data);
   }

   async function updateClient(clientId, data) {
     delete data.funnelId;
     delete data.funnelStageId;
     return await db.update('clients_new', data, { id: clientId });
   }
   ```

2. **Propostas (`proposals/route.js`)**:
   - Criação de proposta com `funnelId` obrigatório e `funnelStageId` inicial manual.
   ```javascript
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
   ```
   - Atualização de status (sem alterar `funnelStageId` automaticamente).
   ```javascript
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
   ```
   - Mudança manual de etapa do funil.
   ```javascript
   async function updateProposalFunnelStage(proposalId, newFunnelStageId, userId, reason) {
     const proposal = await db.select('proposals', { id: proposalId });
     if (!proposal) throw new Error('Proposta não encontrada');
     await db.update('proposals', 
       { funnelStageId: newFunnelStageId }, 
       { id: proposalId }
     );
     await db.insert('stage_transitions', {
       entityType: 'proposal',
       entityId: proposalId,
       fromStageId: proposal.funnelStageId,
       toStageId: newFunnelStageId,
       userId,
       reason
     });
     return proposal;
   }
   ```

3. **Reservas (`bookings/route.js`)**:
   - Criação de reserva com herança de `funnelId` e `funnelStageId` manual.
   ```javascript
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
   ```
   - Mudança manual de etapa do funil.
   ```javascript
   async function updateBookingFunnelStage(bookingId, newFunnelStageId, userId, reason) {
     const booking = await db.select('bookings', { id: bookingId });
     if (!booking) throw new Error('Reserva não encontrada');
     await db.update('bookings', 
       { funnelStageId: newFunnelStageId }, 
       { id: bookingId }
     );
     await db.insert('stage_transitions', {
       entityType: 'booking',
       entityId: bookingId,
       fromStageId: booking.funnelStageId,
       toStageId: newFunnelStageId,
       userId,
       reason
     });
     return booking;
   }
   ```

4. **Funis (`funnels/route.js`)**:
   - Consulta de dados de funis para propostas e reservas.
   ```javascript
   async function getFunnelData(funnelId) {
     return await db.query(`
       SELECT 'proposal' AS entityType, p.id, p.proposalNumber, p.funnelStageId, p.status
       FROM proposals p
       WHERE p.funnelId = $1
       UNION
       SELECT 'booking' AS entityType, b.id, b.bookingNumber, b.funnelStageId, b.status
       FROM bookings b
       WHERE b.funnelId = $1
     `, [funnelId]);
   }
   ```

5. **Funções Auxiliares**:
   - Implemente `getFirstStage(funnelId)`: Retorna a primeira etapa de um funil.
   - Implemente `getPostSaleStage(funnelId)`: Retorna a etapa de pós-venda.
   - Implemente `generateBookingNumber()`: Gera número único por agência.
   - Implemente `getClientName(clientId)`: Retorna o nome do cliente.

## Etapa 3: Atualizações na UI e Componentes Frontend
Atualize os componentes em `h:\Programação\saas-starter\components\`.

1. **Clientes (`components/clients`)**:
   - No form de criação/edição, adicione um `<select>` para `jornadaStage` com opções do ENUM (`em_qualificacao`, `em_negociacao`, `reserva_ativa`, `lead_dormente`, `inativo`).
   - Exiba `jornadaStage` e propostas associadas na UI, usando a view `client_jornada`.
   - Remova qualquer referência a funis na interface de clientes.

2. **Propostas (`components/proposals`)**:
   - No form, torne o `<select>` para `funnelId` obrigatório, listando funis de `sales_funnels`.
   - Adicione um `<select>` para `funnelStageId`, exigindo escolha manual (default: primeira etapa do funil).
   - Exiba `status` (ex: 'draft', 'sent') e `funnelStageId` separadamente na UI.

3. **Reservas (`components/bookings`)**:
   - Exiba `funnelId` e `funnelStageId` herdados da proposta.
   - Adicione um `<select>` para `funnelStageId`, exigindo escolha manual.

4. **Funis (`components/funnels`)**:
   - No dashboard, mostre:
     - Jornada Geral para clientes (via `jornadaStage`).
     - Funis para propostas e reservas (via `funnelId`/`funnelStageId`).

## Etapa 4: Automações e Regras de Negócio
1. **Automações da Jornada Geral**:
   - **Criação de Cliente**: Atribui `jornadaStage = 'em_qualificacao'` e `dealStatus = 'active'`.
   - **Criação de Proposta**: Atualiza cliente para `jornadaStage = 'em_negociacao'`.
   - **Proposta com `status = 'active_booking'`**: Atualiza cliente para `jornadaStage = 'reserva_ativa'`; cria reserva.
   - **Inatividade (30 dias sem interação)**: Crie um job para sugerir mover cliente para `jornadaStage = 'inativo'`.

2. **Mudanças de Etapas de Funil**:
   - **Manuais**: Mudanças de `funnelStageId` em propostas e reservas só ocorrem via `updateProposalFunnelStage` ou `updateBookingFunnelStage`, com ação explícita do usuário e registro em `stage_transitions`.
   - **Sem automação**: Não implemente triggers ou jobs que alterem `funnelStageId` automaticamente.

3. **Validações**:
   - **Propostas**: `funnelId` obrigatório; `funnelStageId` deve ser escolhido manualmente ou default para primeira etapa.
   - **Reservas**: Herdam `funnelId` da proposta; `funnelStageId` definido manualmente (ex: pós-venda).
   - **Unicidade**: Garanta unicidade de `proposalNumber` e `bookingNumber` por `agencyId`.

4. **Permissões**:
   - **AGENT**: Só visualiza/altera seus clientes, propostas e reservas.
   - **ADMIN/MASTER**: Acesso total à agência.
   - Valide permissões em todas as rotas e componentes.

## Etapa 5: Integrações Externas
- **API Endpoints**:
  - `/api/clients`: Inclua `jornadaStage` e `dealStatus`; remova `funnelId`/`funnelStageId`.
  - `/api/proposals`: Inclua `funnelId` (obrigatório) e `funnelStageId` (manual).
  - `/api/bookings`: Inclua `funnelId` e `funnelStageId` herdados.
  - Novo endpoint: `/api/proposals/:id/funnel-stage` e `/api/bookings/:id/funnel-stage` para mudanças manuais de `funnelStageId`.

- **Webhooks**:
  - Mudança de `status` da proposta: Registre em log (não afeta `funnelStageId`).
  - Proposta para `active_booking`: Crie reserva, atualize `jornadaStage`.

- **Integrações Externas**:
  - Mantenha integrações com Stripe, email, SMS e PDFs, ajustando payloads para incluir `jornadaStage` e funis onde aplicável.

## Etapa 6: Testes
1. **Testes Unitários**:
   - Criação de cliente: Verifique `jornadaStage = 'em_qualificacao'` e `dealStatus = 'active'`.
   - Criação de proposta: Valide `funnelId` obrigatório, `funnelStageId` manual, e atualização de `jornadaStage`.
   - Criação de reserva: Confirme herança de `funnelId` e `funnelStageId` manual.
   - Mudança de `funnelStageId`: Teste funções `updateProposalFunnelStage` e `updateBookingFunnelStage`, com registro em `stage_transitions`.

2. **Testes de Integração**:
   - Simule fluxo: Cliente → Proposta → Reserva, com mudanças manuais de `funnelStageId`.
   - Verifique relatórios da view `client_jornada`.
   - Teste permissões para AGENT e ADMIN.

3. **Testes de Performance**:
   - Valide índices (`clients_jornada_idx`, `proposals_funnel_status_idx`, `bookings_funnel_idx`).
   - Teste cache da view `client_jornada` em relatórios.

## Etapa 7: Deploy
1. **Staging**:
   - Aplique migrações do banco.
   - Implante código atualizado.
   - Execute testes completos.

2. **Produção**:
   - Aplique migrações após validação em staging.
   - Monitore performance e logs.
   - Valide automações da Jornada Geral e mudanças manuais de funis.

## Etapa 8: Documentação
- Atualize `RELACIONAMENTO-ENTIDADES.md` e `FLUXOGRAMA-SISTEMA.md` com:
  - `jornadaStage` para clientes.
  - Funis exclusivos para propostas e reservas.
  - Mudanças manuais de `funnelStageId`.
  - View `client_jornada` e índices.
- Documente endpoints e webhooks atualizados.

## Considerações Finais
- **Tempo Estimado**: 2-4 dias, dependendo da complexidade.
- **Riscos**:
  - Erros na migração de dados (teste exaustivamente).
  - Falhas na validação de permissões.
- **Manutenção**:
  - Monitore jobs de inatividade.
  - Verifique performance de índices e view.
- **Resumo**:
  - Clientes usam apenas `jornadaStage` (automático).
  - Propostas e reservas usam funis, com `funnelStageId` alterado manualmente.
  - Arquitetura multi-tenant e permissões preservadas.