# Análise de Relacionamentos entre Entidades do Sistema SaaS

## 📊 Visão Geral do Sistema

Este documento detalha o relacionamento entre as principais entidades do sistema de gestão para agências de viagem, incluindo Clientes, Propostas, Reservas e Funis de Venda.

## 🗄️ Estrutura do Banco de Dados

### 1. **Funis de Venda (Sales Funnels)**

#### Tabelas:
- `sales_funnels` - Funis de venda configuráveis por agência
- `sales_funnel_stages` - Etapas de cada funil
- `stage_transitions` - Histórico de transições entre etapas

#### Campos Principais:
```sql
sales_funnels:
  - id (UUID)
  - name (VARCHAR)
  - description (TEXT)
  - isDefault (BOOLEAN)
  - agencyId (UUID) -> agencies.id
  - createdBy (UUID) -> users.id

sales_funnel_stages:
  - id (UUID)
  - name (VARCHAR)
  - description (TEXT)
  - guidelines (TEXT)
  - color (VARCHAR)
  - order (INTEGER)
  - isActive (BOOLEAN)
  - funnelId (UUID) -> sales_funnels.id

stage_transitions:
  - id (UUID)
  - fromStageId (UUID) -> sales_funnel_stages.id
  - toStageId (UUID) -> sales_funnel_stages.id
  - clientId (UUID) -> clients_new.id
  - userId (UUID) -> users.id
  - reason (TEXT)
```

### 2. **Clientes (Clients)**

#### Tabelas:
- `clients_new` - Tabela principal de clientes
- `client_interactions` - Histórico de interações
- `client_tasks` - Tarefas relacionadas ao cliente
- `client_transfers` - Transferências entre agentes

#### Campos Principais:
```sql
clients_new:
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
  - funnelId (UUID) -> sales_funnels.id
  - funnelStageId (UUID) -> sales_funnel_stages.id
  - notes (TEXT)
  - isActive (BOOLEAN)
```

### 3. **Propostas (Proposals)**

#### Tabelas:
- `proposals` - Propostas comerciais
- `proposal_items` - Itens de cada proposta
- `proposal_status_history` - Histórico de mudanças de status
- `proposal_views` - Visualizações da proposta

#### Campos Principais:
```sql
proposals:
  - id (UUID)
  - proposalNumber (VARCHAR) - Único por agência
  - agencyId (UUID) -> agencies.id
  - clientId (UUID) -> clients_new.id
  - userId (UUID) -> users.id
  - operatorId (UUID) -> operators.id
  - status (ENUM):
    * 'draft' - Rascunho
    * 'sent' - Enviada
    * 'approved' - Aprovada
    * 'contract' - Contrato Assinado
    * 'rejected' - Rejeitada
    * 'expired' - Expirada
    * 'awaiting_payment' - Aguardando Pagamento
    * 'active_booking' - Reserva Ativa
    * 'cancelled' - Cancelada
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

proposal_items:
  - id (UUID)
  - proposalId (UUID) -> proposals.id
  - operatorProductId (UUID) -> operator_items.id
  - baseItemId (UUID) -> base_items.id
  - name (VARCHAR)
  - description (TEXT)
  - quantity (INTEGER)
  - unitPrice (DECIMAL)
  - subtotal (DECIMAL)
  - customFields (JSONB)
```

### 4. **Reservas (Bookings)**

#### Tabelas:
- `bookings` - Reservas confirmadas
- `booking_status_history` - Histórico de status
- `booking_documents` - Documentos anexados
- `booking_timeline` - Timeline de eventos

#### Campos Principais:
```sql
bookings:
  - id (UUID)
  - proposalId (UUID) -> proposals.id
  - agencyId (UUID) -> agencies.id
  - bookingNumber (VARCHAR) - Único
  - status (ENUM):
    * 'pending_documents' - Aguardando Documentos
    * 'under_analysis' - Em Análise
    * 'approved' - Aprovado
    * 'pending_installation' - Aguardando Instalação
    * 'installed' - Instalado
    * 'active' - Ativo
    * 'cancelled' - Cancelado
    * 'suspended' - Suspenso
  - notes (TEXT)
  - metadata (JSONB):
    * installationDate
    * installationAddress
    * technician
    * proposalNumber
    * clientName
    * clientEmail
    * clientPhone
    * totalAmount
  - createdBy (UUID) -> users.id

booking_documents:
  - id (UUID)
  - bookingId (UUID) -> bookings.id
  - documentType (ENUM):
    * 'rg_cpf'
    * 'proof_of_residence'
    * 'proof_of_income'
    * 'signed_contract'
    * 'other'
  - fileName (VARCHAR)
  - fileUrl (TEXT)
  - uploadedBy (UUID) -> users.id
```

## 🔗 Relacionamentos Entre Entidades

### 1. **Funil → Cliente**
```
sales_funnels (1) ← → (N) clients_new [via funnelId]
sales_funnel_stages (1) ← → (N) clients_new [via funnelStageId]
```
- Cada cliente está associado a um funil e uma etapa específica
- Cliente progride através das etapas do funil conforme avança no processo de venda

### 2. **Cliente → Proposta**
```
clients_new (1) ← → (N) proposals [via clientId]
```
- Um cliente pode ter múltiplas propostas
- Cada proposta está vinculada a um único cliente
- Propostas herdam informações do cliente (nome, email, telefone)

### 3. **Proposta → Reserva**
```
proposals (1) ← → (1) bookings [via proposalId]
```
- Uma proposta com status `active_booking` gera automaticamente uma reserva
- A reserva mantém referência à proposta original
- Dados da proposta são copiados para metadata da reserva

### 4. **Agência → Todas as Entidades**
```
agencies (1) ← → (N) sales_funnels
agencies (1) ← → (N) clients_new
agencies (1) ← → (N) proposals
agencies (1) ← → (N) bookings
```
- Multi-tenancy: Todas as entidades são filtradas por `agencyId`
- Isolamento completo de dados entre agências

### 5. **Usuário → Entidades**
```
users (1) ← → (N) clients_new [agente responsável]
users (1) ← → (N) proposals [vendedor]
users (1) ← → (N) bookings [criador]
users (1) ← → (N) client_interactions
users (1) ← → (N) client_tasks
```
- Usuários com role AGENT só veem seus próprios clientes
- Rastreamento de todas as ações por usuário

## 📈 Fluxo do Processo de Vendas

### 1. **Criação do Cliente**
1. Cliente é criado e associado a um funil de vendas
2. Cliente é posicionado na primeira etapa do funil
3. Um agente é designado como responsável

### 2. **Progressão no Funil**
1. Cliente avança pelas etapas do funil conforme interações
2. Cada mudança de etapa é registrada em `stage_transitions`
3. Interações e tarefas são registradas ao longo do processo

### 3. **Criação de Proposta**
1. Proposta é criada para o cliente com status `draft`
2. Itens são adicionados à proposta (produtos/serviços)
3. Cálculos de valores, descontos e comissões são realizados

### 4. **Ciclo de Vida da Proposta**
```
draft → sent → approved/rejected
         ↓
      approved → contract → awaiting_payment → active_booking
         ↓                                           ↓
      rejected                              [Cria Reserva Automaticamente]
         ↓
      expired/cancelled
```

### 5. **Criação Automática de Reserva**
- Trigger: Quando proposta muda para status `active_booking`
- Ação: Sistema cria automaticamente uma reserva (`booking`)
- Dados copiados:
  - `proposalId` - Referência à proposta original
  - `agencyId` - Mesma agência
  - `bookingNumber` - Gerado automaticamente (formato: BKG-YYYYMMDD-XXXXX)
  - `metadata` - Dados do cliente e valores da proposta

### 6. **Gestão da Reserva**
1. Reserva inicia com status `pending_documents`
2. Documentos são anexados conforme necessário
3. Timeline registra todos os eventos importantes
4. Status progride conforme processo operacional

## 🔄 Sincronização de Dados

### Cliente → Proposta
- Nome, email, telefone do cliente são referenciados
- Agência e usuário responsável são mantidos

### Proposta → Reserva
- Número da proposta é armazenado em `metadata.proposalNumber`
- Valor total é copiado para `metadata.totalAmount`
- Dados do cliente são duplicados em `metadata` para histórico

### Mudanças de Status
- Todas as mudanças são registradas em tabelas de histórico
- Timestamps específicos para cada transição importante
- Rastreamento do usuário que realizou cada ação

## 🛡️ Regras de Negócio

### 1. **Integridade Referencial**
- Cliente não pode ser deletado se tiver propostas
- Proposta não pode ser deletada se tiver reserva ativa
- Funil não pode ser deletado se tiver clientes associados

### 2. **Validações**
- CPF/CNPJ validados com algoritmos brasileiros
- CEP no formato brasileiro (XXXXX-XXX)
- Email único por agência (quando informado)
- Número de proposta único por agência

### 3. **Permissões**
- AGENT: Vê apenas seus próprios clientes e propostas
- ADMIN: Acesso total aos dados da agência
- MASTER: Gerencia configurações e billing
- DEVELOPER: Acesso total ao sistema

### 4. **Automações**
- Criação de reserva ao confirmar pagamento
- Notificações em mudanças de status
- Expiração automática de propostas vencidas
- Atualização de timestamps em todas as operações

## 📊 Índices e Performance

### Índices Principais:
- `clients_agency_user_idx` - Busca rápida de clientes por agente
- `clients_funnel_stage_idx` - Filtragem por etapa do funil
- `proposals_client_status_idx` - Propostas por cliente e status
- `proposals_agency_number_unique` - Unicidade do número da proposta
- `bookings.proposalId` - Vínculo com proposta original

### Otimizações:
- Soft deletes com campo `deletedAt`
- Campos JSONB para dados flexíveis
- Índices compostos para queries frequentes
- Timestamps com default para auditoria

## 🚀 Pontos de Integração

### 1. **API Endpoints**
- `/api/clients` - CRUD de clientes
- `/api/proposals` - Gestão de propostas
- `/api/bookings` - Controle de reservas
- `/api/funnels` - Configuração de funis

### 2. **Webhooks e Triggers**
- Proposta aprovada → Notificação ao cliente
- Pagamento confirmado → Criação de reserva
- Documento anexado → Atualização de status
- Mudança de etapa → Log de atividade

### 3. **Integrações Externas**
- Stripe para pagamentos
- Email para notificações
- SMS/WhatsApp para comunicação
- Geração de PDFs para contratos

## 📝 Considerações Finais

Este sistema implementa um fluxo completo de vendas para agências de viagem, desde a captação do cliente até a gestão da reserva. A arquitetura multi-tenant garante isolamento de dados, enquanto o sistema de permissões controla o acesso baseado em roles. A automação de processos, como a criação de reservas, reduz trabalho manual e erros operacionais.

O relacionamento entre as entidades foi projetado para manter a integridade dos dados, permitir rastreabilidade completa e facilitar relatórios gerenciais. A flexibilidade dos campos JSONB permite customizações sem alterações no schema do banco de dados.