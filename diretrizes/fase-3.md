Collecting workspace informationAnalisando todos os arquivos fornecidos, vou reavaliar e reescrever a Fase 3 considerando o que já foi implementado nas fases anteriores e as necessidades específicas do projeto.

# 📘 GUIA DE IMPLEMENTAÇÃO DETALHADO - FASE 3: CORE DO CRM (CLIENTES E PROPOSTAS) 
# Implantação 0
## 🎯 O que vamos fazer nesta fase

Com toda a infraestrutura (Fase 1) e configurações (Fase 2) prontas, agora vamos construir o coração do sistema: os módulos de **Clientes** e **Propostas**. Estes são os módulos mais utilizados no dia a dia pelos agentes.

## O que já temos implementado:
- ✅ Sistema de autenticação e permissões
- ✅ Gestão completa de usuários
- ✅ Funis de venda configurados
- ✅ Catálogo de itens base estruturado
- ✅ Operadoras com produtos e comissões
- ✅ Sistema de tema claro/escuro
- ✅ Logs de atividade funcionando

## O que vamos construir:
- 👤 **Gestão completa de clientes** com validação brasileira
- 💼 **Sistema de propostas** com cálculo automático
- 🔄 **Integração entre módulos** respeitando permissões
- 📊 **Dashboard de vendas** com métricas em tempo real

## ⚠️ AVISOS IMPORTANTES SOBRE ESTILOS E TYPESCRIPT

## 🎨 Regras de Estilo OBRIGATÓRIAS:
1. **NUNCA use estilos inline** - Sempre crie classes no arquivo CSS do módulo
2. **SEMPRE verifique o globals.css** - Use as variáveis CSS existentes para cores
3. **Para cada novo componente** - Crie um arquivo `.module.css` correspondente
4. **Use as classes do tema** - Aproveite `dark:` para estilos do modo escuro
5. **Teste sempre em ambos os temas** - Alterne entre claro e escuro durante desenvolvimento

## 📘 Prevenção de Erros TypeScript:
1. **Sempre defina tipos explícitos** - Evite usar `any` ou deixar tipos implícitos
2. **Use interfaces para props** - Defina interfaces claras para componentes
3. **Valide dados externos** - Use Zod schemas para validar dados de API/formulários
4. **Trate valores null/undefined** - Use optional chaining (`?.`) e nullish coalescing (`??`)
5. **Importe tipos corretamente** - Use `import type` quando importar apenas tipos
6. **Verifique antes do build** - Execute `npm run type-check` regularmente


# Implantação 1
## 🗄️ ESTRUTURA COMPLETA DO BANCO DE DADOS

### 📊 Tabela: `clients`
**Descrição**: Armazena todos os dados dos clientes da agência

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único do cliente |
| `agency_id` | uuid | Sim | ID da agência (FK para agencies) |
| `user_id` | uuid | Sim | ID do agente responsável (FK para users) |
| `name` | varchar(255) | Sim | Nome completo do cliente |
| `email` | varchar(255) | Sim | Email único do cliente |
| `phone` | varchar(20) | Não | Telefone com formato brasileiro |
| `document_type` | enum('cpf','cnpj') | Sim | Tipo de documento |
| `document_number` | varchar(18) | Sim | CPF ou CNPJ (único por agência) |
| `birth_date` | date | Não | Data de nascimento |
| `address_zipcode` | varchar(9) | Não | CEP formato 12345-678 |
| `address_street` | varchar(255) | Não | Logradouro |
| `address_number` | varchar(10) | Não | Número |
| `address_complement` | varchar(100) | Não | Complemento |
| `address_neighborhood` | varchar(100) | Não | Bairro |
| `address_city` | varchar(100) | Não | Cidade |
| `address_state` | varchar(2) | Não | Estado (UF) |
| `funnel_id` | uuid | Sim | ID do funil atual (FK para funnels) |
| `funnel_stage_id` | uuid | Sim | ID da etapa atual (FK para funnel_stages) |
| `notes` | text | Não | Observações gerais |
| `is_active` | boolean | Sim | Se o cliente está ativo (default: true) |
| `created_at` | timestamp | Sim | Data de criação |
| `updated_at` | timestamp | Sim | Data da última atualização |
| `deleted_at` | timestamp | Não | Soft delete |

**Índices**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (agency_id, email)`
- `UNIQUE INDEX (agency_id, document_number)`
- `INDEX (agency_id, user_id)`
- `INDEX (funnel_stage_id)`
- `INDEX (created_at)`

### 📊 Tabela: `client_interactions`
**Descrição**: Registra todas as interações com os clientes

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `client_id` | uuid | Sim | ID do cliente (FK para clients) |
| `user_id` | uuid | Sim | ID do usuário que fez a interação |
| `type` | enum | Sim | Tipo: 'call', 'email', 'whatsapp', 'meeting', 'note' |
| `description` | text | Sim | Descrição detalhada da interação |
| `contact_date` | timestamp | Sim | Data/hora da interação |
| `duration_minutes` | integer | Não | Duração em minutos (para calls/meetings) |
| `created_at` | timestamp | Sim | Data de registro |

**Índices**:
- `PRIMARY KEY (id)`
- `INDEX (client_id, contact_date DESC)`
- `INDEX (user_id)`

### 📊 Tabela: `client_tasks`
**Descrição**: Tarefas relacionadas aos clientes

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `client_id` | uuid | Sim | ID do cliente (FK para clients) |
| `assigned_to` | uuid | Sim | ID do usuário responsável |
| `created_by` | uuid | Sim | ID de quem criou a tarefa |
| `title` | varchar(255) | Sim | Título da tarefa |
| `description` | text | Não | Descrição detalhada |
| `priority` | enum | Sim | 'low', 'medium', 'high' |
| `status` | enum | Sim | 'pending', 'in_progress', 'completed', 'cancelled' |
| `due_date` | timestamp | Sim | Data de vencimento |
| `completed_at` | timestamp | Não | Quando foi concluída |
| `created_at` | timestamp | Sim | Data de criação |
| `updated_at` | timestamp | Sim | Última atualização |

**Índices**:
- `PRIMARY KEY (id)`
- `INDEX (client_id, status)`
- `INDEX (assigned_to, status, due_date)`
- `INDEX (due_date)`

### 📊 Tabela: `client_transfers`
**Descrição**: Log de transferências de clientes entre agentes

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `client_id` | uuid | Sim | ID do cliente |
| `from_user_id` | uuid | Sim | ID do agente anterior |
| `to_user_id` | uuid | Sim | ID do novo agente |
| `transferred_by` | uuid | Sim | ID de quem fez a transferência |
| `reason` | text | Sim | Justificativa (mínimo 20 caracteres) |
| `transferred_at` | timestamp | Sim | Data/hora da transferência |

**Índices**:
- `PRIMARY KEY (id)`
- `INDEX (client_id, transferred_at DESC)`
- `INDEX (from_user_id)`
- `INDEX (to_user_id)`

### 📊 Tabela: `proposals`
**Descrição**: Propostas comerciais do sistema

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `proposal_number` | varchar(20) | Sim | Número único da proposta (ex: 2024/0001) |
| `agency_id` | uuid | Sim | ID da agência |
| `client_id` | uuid | Sim | ID do cliente |
| `user_id` | uuid | Sim | ID do agente responsável |
| `operator_id` | uuid | Sim | ID da operadora |
| `status` | enum | Sim | 'draft', 'sent', 'accepted', 'rejected', 'expired' |
| `subtotal` | decimal(10,2) | Sim | Soma dos itens |
| `discount_amount` | decimal(10,2) | Não | Valor de desconto |
| `discount_percent` | decimal(5,2) | Não | Percentual de desconto |
| `total_amount` | decimal(10,2) | Sim | Valor total final |
| `commission_amount` | decimal(10,2) | Sim | Comissão calculada |
| `commission_percent` | decimal(5,2) | Sim | Percentual de comissão |
| `payment_method` | varchar(50) | Não | Forma de pagamento selecionada |
| `valid_until` | date | Sim | Data de validade da proposta |
| `notes` | text | Não | Observações da proposta |
| `internal_notes` | text | Não | Notas internas (não aparecem no PDF) |
| `sent_at` | timestamp | Não | Quando foi enviada |
| `decided_at` | timestamp | Não | Quando foi aceita/rejeitada |
| `created_at` | timestamp | Sim | Data de criação |
| `updated_at` | timestamp | Sim | Última atualização |

**Índices**:
- `PRIMARY KEY (id)`
- `UNIQUE INDEX (agency_id, proposal_number)`
- `INDEX (client_id, status)`
- `INDEX (user_id, status)`
- `INDEX (status, valid_until)`
- `INDEX (created_at DESC)`

### 📊 Tabela: `proposal_items`
**Descrição**: Itens que compõem cada proposta

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `proposal_id` | uuid | Sim | ID da proposta |
| `operator_product_id` | uuid | Sim | ID do produto da operadora |
| `base_item_id` | uuid | Sim | ID do item base do catálogo |
| `name` | varchar(255) | Sim | Nome do item (snapshot) |
| `description` | text | Não | Descrição do item |
| `quantity` | integer | Sim | Quantidade |
| `unit_price` | decimal(10,2) | Sim | Valor unitário |
| `subtotal` | decimal(10,2) | Sim | Quantidade × Valor unitário |
| `custom_fields` | jsonb | Não | Campos customizados e seus valores |
| `sort_order` | integer | Sim | Ordem de exibição |
| `created_at` | timestamp | Sim | Data de adição |

**Índices**:
- `PRIMARY KEY (id)`
- `INDEX (proposal_id, sort_order)`
- `INDEX (operator_product_id)`

### 📊 Tabela: `proposal_status_history`
**Descrição**: Histórico de mudanças de status das propostas

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `proposal_id` | uuid | Sim | ID da proposta |
| `from_status` | enum | Não | Status anterior |
| `to_status` | enum | Sim | Novo status |
| `changed_by` | uuid | Sim | ID do usuário que mudou |
| `reason` | text | Não | Motivo da mudança |
| `changed_at` | timestamp | Sim | Data/hora da mudança |

**Índices**:
- `PRIMARY KEY (id)`
- `INDEX (proposal_id, changed_at DESC)`

### 📊 Tabela: `proposal_views`
**Descrição**: Registro de visualizações de propostas (para links compartilhados)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | uuid | Sim | Identificador único |
| `proposal_id` | uuid | Sim | ID da proposta |
| `ip_address` | varchar(45) | Não | IP do visitante |
| `user_agent` | text | Não | Navegador/dispositivo |
| `viewed_at` | timestamp | Sim | Data/hora da visualização |

**Índices**:
- `PRIMARY KEY (id)`
- `INDEX (proposal_id, viewed_at DESC)`



## ✅ PASSO A PASSO DETALHADO

### 👤 MÓDULO 1: GESTÃO DE CLIENTES

#### Etapa 1.1: Criar estrutura completa para clientes

No terminal do VS Code, execute:

```bash
# Criar estrutura de pastas para clientes
mkdir -p app/(dashboard)/clients
mkdir -p app/(dashboard)/clients/[clientId]
mkdir -p app/(dashboard)/clients/[clientId]/edit
mkdir -p lib/actions/clients
mkdir -p lib/validations/clients
mkdir -p lib/types/clients
mkdir -p components/clients
mkdir -p components/clients/forms
mkdir -p components/clients/interactions
mkdir -p components/clients/tasks
mkdir -p styles/clients
```

#### Etapa 1.2: Criar tipos TypeScript para clientes

1. Na pasta `lib/types/clients`, crie `index.ts`
2. **Este arquivo servirá para**: Definir todos os tipos relacionados a clientes
3. **Tipos necessários**:
   - `Client`: Interface completa do cliente com todas as colunas da tabela
   - `ClientFormData`: Dados do formulário (sem IDs e timestamps)
   - `ClientInteraction`: Estrutura de interações com tipos específicos
   - `ClientTask`: Estrutura de tarefas com enums de prioridade e status
   - `ClientTransfer`: Estrutura de transferências com justificativa
   - `ClientStatus`: Enum de status possíveis
   - `DocumentType`: 'cpf' | 'cnpj'
   - `InteractionType`: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note'
   - `TaskPriority`: 'low' | 'medium' | 'high'
   - `TaskStatus`: 'pending' | 'in_progress' | 'completed' | 'cancelled'

#### Etapa 1.3: Atualizar schema do banco para clientes

1. Na pasta `lib/db/schema`, crie `clients.ts`
2. **Este arquivo deve conter**:
   ```typescript
   // Definir todas as tabelas usando Drizzle ORM
   // Incluir todas as colunas listadas acima
   // Definir as relações entre tabelas
   // Adicionar os índices necessários
   ```
3. **Importante**: 
   - Use `decimal` para valores monetários
   - Use `uuid` com default para IDs
   - Configure `ON DELETE CASCADE` onde apropriado
   - Adicione timestamps com defaults

#### Etapa 1.4: Criar validações brasileiras específicas

1. Na pasta `lib/validations/clients`, crie `client.schema.ts`
2. **Este arquivo servirá para**: Validar dados específicos do Brasil
3. **Validações obrigatórias com Zod**:
   ```typescript
   // CPF: validar dígito verificador
   // CNPJ: validar 14 dígitos e cálculo completo
   // Telefone: aceitar (11) 98765-4321 ou (11) 3456-7890
   // CEP: formato 12345-678
   // Email: validação padrão + verificar unicidade
   // Document: alternar validação baseado no type
   ```
4. **Mensagens de erro em português**: 
   - "CPF inválido"
   - "CNPJ deve ter 14 dígitos"
   - "Telefone deve estar no formato (XX) XXXXX-XXXX"
   - "CEP deve estar no formato XXXXX-XXX"

#### Etapa 1.5: Criar estilos base para o módulo

1. Na pasta `styles/clients`, crie `clients.module.css`
2. **Este arquivo servirá para**: Estilos específicos do módulo de clientes
3. **Classes essenciais**:
   ```css
   /* Container principal */
   .clientsContainer
   
   /* Cabeçalho com título e ações */
   .clientsHeader
   
   /* Grid responsivo para cards */
   .clientsGrid
   
   /* Card individual de cliente */
   .clientCard
   
   /* Badge de status do funil */
   .clientStatus
   
   /* Botões de ação */
   .clientActions
   
   /* Estados dos cards */
   .clientCard:hover
   .clientCard.selected
   
   /* Responsividade */
   @media (max-width: 768px)
   ```
4. **Use variáveis do globals.css**: 
   - `var(--primary)`
   - `var(--background)`
   - `var(--foreground)`
   - `var(--muted)`
   - `var(--border)`

# Implantação 2
## ✅ PASSO A PASSO DETALHADO

### 👤 MÓDULO 1: GESTÃO DE CLIENTES
#### Etapa 1.6: Criar página de listagem de clientes

1. Na pasta `app/(dashboard)/clients`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todos os clientes com filtros
3. **Componentes necessários**:
   - Header com título "Clientes" e botão "Novo Cliente"
   - Barra de filtros: por etapa do funil, por agente, por data
   - Campo de busca: nome, CPF/CNPJ, email, telefone
   - Tabela ou cards (alternável) com dados dos clientes
   - Indicador visual colorido da etapa do funil
   - Paginação para performance (20 por página)
4. **Colunas da tabela/informações do card**:
   - Nome completo
   - Email e telefone
   - CPF/CNPJ formatado
   - Etapa atual do funil (com cor)
   - Responsável (nome do agente)
   - Última interação
   - Data de criação
5. **Permissões importantes**:
   - Agents: veem apenas seus próprios clientes
   - Admin/Master: veem todos os clientes da agência
6. **Sem estilos inline**: Use apenas classes do `clients.module.css`

#### Etapa 1.7: Criar formulário de cliente com validação

1. Na pasta `components/clients/forms`, crie `client-form.tsx`
2. **Este arquivo servirá para**: Criar e editar clientes
3. **Campos do formulário organizados em seções**:
   
   **Dados Básicos**:
   - Nome completo (obrigatório, mínimo 3 caracteres)
   - Email (obrigatório, único, validação de formato)
   - Telefone com máscara brasileira
   - Data de nascimento (datepicker)
   
   **Documento**:
   - Tipo (radio: CPF ou CNPJ)
   - Número com máscara dinâmica
   - Validação em tempo real
   
   **Endereço**:
   - CEP com busca automática (API ViaCEP)
   - Logradouro (auto-preenchido)
   - Número
   - Complemento
   - Bairro (auto-preenchido)
   - Cidade (auto-preenchido)
   - Estado (auto-preenchido)
   
   **Comercial**:
   - Funil de vendas (select)
   - Etapa inicial (select baseado no funil)
   - Observações (textarea)

4. **Validações em tempo real**:
   - Mostrar erro apenas após o usuário sair do campo
   - CPF/CNPJ válido antes de permitir salvar
   - Email único verificado no banco
   - Loading state durante verificações
5. **Importante**: Use `react-hook-form` com Zod para validação

#### Etapa 1.8: Criar página de detalhes do cliente

1. Na pasta `app/(dashboard)/clients/[clientId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Central de informações do cliente
3. **Seções da página**:
   
   **Header fixo**:
   - Nome do cliente (grande)
   - Email e telefone (clicáveis)
   - CPF/CNPJ formatado
   - Badge da etapa do funil
   - Ações: Editar, Nova Interação, Nova Tarefa, Nova Proposta, Transferir
   
   **Informações em tabs ou sidebar**:
   - **Resumo**: Dados cadastrais completos
   - **Timeline**: Todas as interações cronológicas
   - **Tarefas**: Lista com filtros e status
   - **Propostas**: Cards de propostas com status
   - **Histórico**: Mudanças de etapa e transferências
   
4. **Layout responsivo**: 
   - Desktop: Sidebar à esquerda com tabs
   - Mobile: Tabs horizontais scrolláveis
5. **Carregamento otimizado**: Use Suspense para cada seção

# Implantação 3
## ✅ PASSO A PASSO DETALHADO

### 👤 MÓDULO 1: GESTÃO DE CLIENTES
#### Etapa 1.9: Criar sistema de interações

1. Na pasta `components/clients/interactions`, crie:
   
   **interaction-form.tsx**:
   - Select para tipo de interação
   - Textarea para descrição (obrigatório, mínimo 10 caracteres)
   - DateTimePicker para data/hora
   - Campo de duração (se call ou meeting)
   - Botões: Salvar e Cancelar
   
   **interaction-list.tsx**:
   - Lista cronológica (mais recentes primeiro)
   - Filtro por tipo
   - Busca por conteúdo
   - Paginação (10 por página)
   
   **interaction-item.tsx**:
   - Ícone baseado no tipo
   - Nome do usuário que interagiu
   - Data/hora formatada
   - Descrição (expandível se longa)
   - Duração (se aplicável)

2. **Tipos de interação com ícones**:
   - 📞 Ligação telefônica
   - ✉️ Email enviado
   - 💬 WhatsApp
   - 👥 Reunião presencial
   - 📝 Observação geral

#### Etapa 1.10: Criar sistema de tarefas

1. Na pasta `components/clients/tasks`, crie:
   
   **task-form.tsx**:
   - Input para título (obrigatório)
   - Textarea para descrição
   - Select de prioridade (com cores)
   - DateTimePicker para vencimento
   - Select de responsável (se Admin)
   - Checkbox "Notificar responsável"
   
   **task-list.tsx**:
   - Filtros: Status, Prioridade, Responsável
   - Ordenação: Vencimento, Prioridade, Criação
   - Cards ou lista (alternável)
   - Destaque vermelho para vencidas
   
   **task-card.tsx**:
   - Checkbox para marcar como concluída
   - Título e descrição
   - Badge de prioridade colorido
   - Data de vencimento (vermelho se vencida)
   - Avatar do responsável
   - Botões: Editar, Excluir

2. **Estados visuais**:
   - Vencida: borda vermelha
   - Alta prioridade: badge vermelho
   - Concluída: texto riscado
   - Em progresso: borda azul

# Implantação 4
## ✅ PASSO A PASSO DETALHADO

### 👤 MÓDULO 1: GESTÃO DE CLIENTES
#### Etapa 1.11: Criar sistema de transferência

1. Na pasta `components/clients`, crie `transfer-modal.tsx`
2. **Este arquivo servirá para**: Transferir cliente entre agentes
3. **Campos do modal**:
   - Cliente atual (readonly)
   - Responsável atual (readonly)
   - Novo responsável (select com busca)
   - Justificativa (textarea, mínimo 20 caracteres)
   - Checkbox "Notificar novo responsável"
4. **Regras de negócio**:
   - Apenas Admin/Master podem transferir
   - Não pode transferir para o mesmo agente
   - Não pode transferir para usuário inativo
   - Registro completo no log de atividades
   - Email automático se checkbox marcado
5. **Feedback visual**: Loading state e mensagem de sucesso

#### Etapa 1.12: Criar actions com tratamento de erro

1. Na pasta `lib/actions/clients`, crie:
   
   **create-client.ts**:
   ```typescript
   // Validar permissões (qualquer user autenticado)
   // Validar dados com Zod schema
   // Verificar email único na agência
   // Verificar CPF/CNPJ único na agência
   // Criar cliente com funil padrão
   // Registrar no log de atividades
   // Retornar cliente criado ou erro
   ```
   
   **update-client.ts**:
   ```typescript
   // Validar permissões (owner ou admin)
   // Validar dados alterados
   // Verificar unicidade se mudou email/documento
   // Comparar e registrar mudanças
   // Atualizar updated_at
   // Log detalhado das alterações
   ```
   
   **delete-client.ts**:
   ```typescript
   // Validar permissões (apenas Master)
   // Verificar se não tem propostas ativas
   // Soft delete (setar deleted_at)
   // Registrar quem e quando deletou
   ```
   
   **get-clients.ts**:
   ```typescript
   // Verificar permissões
   // Se Agent: filtrar por user_id
   // Aplicar filtros (busca, funil, etapa)
   // Incluir última interação
   // Paginar resultados
   // Retornar com total de registros
   ```
   
   **transfer-client.ts**:
   ```typescript
   // Validar permissões (Admin/Master)
   // Validar novo responsável
   // Criar registro de transferência
   // Atualizar user_id do cliente
   // Notificar se solicitado
   // Log completo da operação
   ```


# Implantação 5
## ✅ PASSO A PASSO DETALHADO
### 💼 MÓDULO 2: SISTEMA DE PROPOSTAS

#### Etapa 2.1: Criar estrutura para propostas

```bash
# Criar estrutura de pastas para propostas
mkdir -p app/(dashboard)/proposals
mkdir -p app/(dashboard)/proposals/new
mkdir -p app/(dashboard)/proposals/[proposalId]
mkdir -p app/(dashboard)/proposals/[proposalId]/edit
mkdir -p lib/actions/proposals
mkdir -p lib/validations/proposals
mkdir -p lib/types/proposals
mkdir -p lib/services/proposal-calculator
mkdir -p lib/services/pdf-generator
mkdir -p components/proposals
mkdir -p components/proposals/forms
mkdir -p components/proposals/items
mkdir -p components/proposals/status
mkdir -p styles/proposals
```

#### Etapa 2.2: Definir tipos TypeScript completos

1. Na pasta `lib/types/proposals`, crie `index.ts`
2. **Este arquivo servirá para**: Tipos de todo o sistema de propostas
3. **Interfaces necessárias baseadas nas tabelas**:
   ```typescript
   // Proposal: todas as colunas da tabela proposals
   // ProposalItem: estrutura completa com custom fields
   // ProposalStatus: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
   // ProposalCalculation: {subtotal, discount, total, commission}
   // ProposalFormData: dados do formulário sem IDs
   // ProposalStatusHistory: log de mudanças
   ```

#### Etapa 2.3: Criar schema do banco para propostas

1. Na pasta `lib/db/schema`, crie `proposals.ts`
2. **Definir todas as tabelas** com as colunas listadas acima
3. **Configurar relações**:
   - Proposal -> Client (many to one)
   - Proposal -> Operator (many to one)
   - Proposal -> ProposalItems (one to many)
   - ProposalItem -> OperatorProduct (many to one)
4. **Triggers importantes**:
   - Auto-gerar proposal_number sequencial por agência
   - Atualizar updated_at automaticamente

#### Etapa 2.4: Criar wizard de nova proposta

1. Na pasta `app/(dashboard)/proposals/new`, crie `page.tsx`
2. **Este arquivo servirá para**: Criar proposta passo a passo
3. **Estrutura do wizard com 4 passos**:
   
   **Passo 1 - Selecionar Cliente**:
   - Campo de busca com autocomplete
   - Mostrar dados básicos ao selecionar
   - Botão "Criar novo cliente" inline
   - Validar se cliente pode receber proposta
   
   **Passo 2 - Selecionar Operadora**:
   - Cards de operadoras ativas
   - Mostrar logo e nome
   - Quantidade de produtos disponíveis
   - Comissões por forma de pagamento
   
   **Passo 3 - Adicionar Itens**:
   - Lista de produtos da operadora
   - Para cada item: campos customizados
   - Quantidade e valor unitário
   - Cálculo automático do subtotal
   - Resumo lateral com total
   
   **Passo 4 - Revisar e Configurar**:
   - Resumo completo da proposta
   - Campo de desconto (valor ou %)
   - Seleção de forma de pagamento
   - Data de validade (default: 30 dias)
   - Observações da proposta
   - Notas internas

4. **Navegação do wizard**:
   - Indicador de progresso no topo
   - Botões Voltar/Avançar
   - Validação antes de avançar
   - Salvar rascunho automático

#### Etapa 2.5: Criar seletor de cliente

1. Na pasta `components/proposals/forms`, crie `client-selector.tsx`
2. **Funcionalidades**:
   - Input com busca em tempo real
   - Debounce de 300ms
   - Buscar por: nome, email, CPF/CNPJ
   - Dropdown com resultados
   - Mostrar: Nome, Documento, Email
   - Botão "+" para criar novo inline
3. **Validações**:
   - Cliente deve estar ativo
   - Não pode ter proposta em aberto
   - Mostrar alerta se houver restrição

#### Etapa 2.6: Criar seletor de operadora

1. Na pasta `components/proposals/forms`, crie `operator-selector.tsx`
2. **Layout em grid de cards**:
   - Logo da operadora (se houver)
   - Nome em destaque
   - Badge com quantidade de produtos
   - Tabela de comissões resumida
   - Estado visual de seleção
3. **Filtros**:
   - Apenas operadoras ativas
   - Com pelo menos 1 produto
   - Ordenar por nome

#### Etapa 2.7: Criar sistema de itens

1. Na pasta `components/proposals/items`, crie:
   
   **item-selector.tsx**:
   - Grid ou lista de produtos
   - Busca por nome
   - Filtro por categoria
   - Mostrar campos obrigatórios
   - Botão "Adicionar" em cada item
   
   **item-form.tsx**:
   - Renderizar campos customizados dinamicamente
   - Tipos: text, number, select, date, boolean
   - Validações por campo
   - Quantidade (default: 1)
   - Valor unitário (editável se permitido)
   
   **item-list.tsx**:
   - Tabela de itens adicionados
   - Colunas: Nome, Qtd, Valor Unit., Subtotal, Ações
   - Editar inline ou modal
   - Remover com confirmação
   - Arrastar para reordenar
   
   **item-summary.tsx**:
   - Card fixo lateral/inferior
   - Subtotal dos itens
   - Desconto (se houver)
   - Total geral em destaque
   - Comissão calculada



# Implantação 6
## ✅ PASSO A PASSO DETALHADO
### 💼 MÓDULO 2: SISTEMA DE PROPOSTAS
#### Etapa 2.8: Criar calculadora de proposta

1. Na pasta `lib/services/proposal-calculator`, crie `index.ts`
2. **Funções necessárias**:
   ```typescript
   // calculateSubtotal(items): soma quantity * unit_price
   // applyDiscount(subtotal, discount): valor ou percentual
   // calculateTotal(subtotal, discount): total final
   // calculateCommission(total, rate, method): comissão por pagamento
   // validateTotals(proposal): verificar consistência
   ```
3. **Use biblioteca para decimais** (ex: decimal.js)
4. **Arredondar sempre para 2 casas**

#### Etapa 2.9: Criar página de listagem

1. Na pasta `app/(dashboard)/proposals`, crie `page.tsx`
2. **Elementos da página**:
   
   **Header**:
   - Título "Propostas"
   - Botão "Nova Proposta"
   - Toggle visualização (cards/tabela)
   
   **Filtros em linha**:
   - Status (multi-select)
   - Período (date range)
   - Cliente (autocomplete)
   - Operadora (select)
   - Valor mín/máx
   
   **Visualização em tabela**:
   - Número da proposta
   - Cliente
   - Operadora
   - Valor total
   - Status (badge colorido)
   - Data de criação
   - Validade
   - Ações (dropdown)
   
   **Visualização em cards**:
   - Layout em grid
   - Informações principais
   - Status em destaque
   - Preview dos itens

3. **Cores por status**:
   - draft: cinza
   - sent: azul
   - accepted: verde
   - rejected: vermelho
   - expired: laranja


# Implantação 7
## ✅ PASSO A PASSO DETALHADO
### 💼 MÓDULO 2: SISTEMA DE PROPOSTAS
#### Etapa 2.10: Criar página de detalhes

1. Na pasta `app/(dashboard)/proposals/[proposalId]`, crie `page.tsx`
2. **Layout da página**:
   
   **Header com ações por status**:
   - Draft: Editar, Enviar, Duplicar, Excluir
   - Sent: Marcar Aceita, Marcar Recusada, Reenviar
   - Accepted: Ver Reserva, Gerar PDF
   - Rejected: Duplicar, Arquivar
   
   **Seção de informações**:
   - Número e data
   - Cliente (link clicável)
   - Operadora
   - Responsável
   - Status com timeline
   
   **Seção de itens**:
   - Tabela detalhada
   - Campos customizados visíveis
   - Totalizadores
   
   **Seção de valores**:
   - Breakdown completo
   - Comissão destacada
   - Forma de pagamento
   
   **Timeline lateral**:
   - Criação
   - Edições
   - Envio
   - Visualizações
   - Decisão

#### Etapa 2.11: Criar gerador de PDF

1. Na pasta `lib/services/pdf-generator`, crie:
   
   **proposal-template.tsx**:
   - Layout profissional A4
   - Header com logo e dados da agência
   - Dados do cliente formatados
   - Tabela de itens estilizada
   - Totais em destaque
   - Rodapé com validade e condições
   - QR Code para aceite online
   
   **generator.ts**:
   ```typescript
   // Usar React PDF ou similar
   // Gerar em memória
   // Opção de preview
   // Download direto
   // Envio por email
   ```

#### Etapa 2.12: Criar sistema de status

1. Na pasta `components/proposals/status`, crie:
   
   **status-badge.tsx**:
   - Badge com cor e ícone
   - Tooltip com descrição
   - Animação em mudanças
   
   **status-actions.tsx**:
   - Botões contextuais por status
   - Modais de confirmação
   - Loading states
   
   **status-timeline.tsx**:
   - Lista vertical com datas
   - Ícones por tipo de evento
   - Usuário responsável
   - Descrição da ação

2. **Automações ao mudar status**:
   - Sent: registrar data/hora, notificar cliente
   - Accepted: criar reserva, mover cliente no funil
   - Rejected: registrar motivo, mover no funil
   - Expired: verificar daily e marcar automático

#### Etapa 2.13: Criar actions de proposta

1. Na pasta `lib/actions/proposals`, crie todas as actions:
   
   **create-proposal.ts**:
   ```typescript
   // Validar cliente e operadora
   // Gerar número sequencial
   // Validar e salvar itens
   // Calcular valores
   // Criar com status draft
   // Log de criação
   ```
   
   **update-proposal.ts**:
   ```typescript
   // Validar se pode editar (apenas draft)
   // Recalcular se mudou itens
   // Manter histórico de valores
   // Atualizar updated_at
   ```
   
   **change-status.ts**:
   ```typescript
   // Validar transição permitida
   // Executar automações
   // Criar histórico
   // Notificar se necessário
   ```

# Implantação 8
## ✅ PASSO A PASSO DETALHADO
### 💼 MÓDULO 2: SISTEMA DE PROPOSTAS
### 🔗 INTEGRAÇÕES ENTRE MÓDULOS

#### Etapa 3.1: Criar widget de propostas no cliente

1. No arquivo de detalhes do cliente, adicione componente
2. **Mostrar**:
   - Grid de cards de propostas
   - Status visual colorido
   - Valor e data
   - Total vendido no header
   - Botão "Nova Proposta" que pre-seleciona

#### Etapa 3.2: Atualizar funil automaticamente

1. Crie `lib/services/funnel-automation.ts`
2. **Configurações e automações**:
   ```typescript
   // Se habilitado nas configurações:
   // - Cliente criado: primeira etapa do funil padrão
   // - Proposta enviada: mover para etapa "Proposta Enviada"
   // - Proposta aceita: mover para "Fechado"
   // - Proposta recusada: mover para "Perdido"
   // Sempre criar log da movimentação
   ```

#### Etapa 3.3: Criar dashboard de vendas

1. Na pasta `components/dashboard`, atualize o dashboard principal
2. **Cards de métricas**:
   - Propostas do mês (total, por status)
   - Taxa de conversão (aceitas/enviadas)
   - Ticket médio (total/quantidade)
   - Valor total vendido
   - Comissões geradas
   
3. **Gráficos**:
   - Evolução mensal (linha)
   - Propostas por status (pizza)
   - Ranking de agentes (barras)
   - Performance por operadora
   
4. **Filtros globais**:
   - Período (mês atual default)
   - Agente (se Admin)
   - Operadora

### ✅ TESTES E VALIDAÇÃO

#### Etapa 4.1: Criar testes de tipos

1. **Scripts úteis no package.json**:
   ```bash
   npm run type-check    # Verifica tipos
   npm run lint         # Verifica código
   npm run build        # Testa build completa
   ```

#### Etapa 4.2: Testar fluxo completo

1. **Fluxo completo de cliente**:
   - Criar cliente com CPF válido (use gerador)
   - Verificar máscara funcionando
   - Buscar CEP real e validar preenchimento
   - Adicionar 3 interações diferentes
   - Criar tarefa para amanhã
   - Transferir se Admin
   - Verificar logs criados

2. **Fluxo completo de proposta**:
   - Iniciar nova proposta
   - Selecionar cliente criado
   - Escolher operadora com produtos
   - Adicionar 3 itens com campos custom
   - Aplicar desconto de 10%
   - Verificar cálculos corretos
   - Salvar como rascunho
   - Enviar proposta
   - Marcar como aceita
   - Verificar se criou reserva
   - Gerar e baixar PDF

#### Etapa 4.3: Validar responsividade

1. **Testar em múltiplos dispositivos**:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
   
2. **Verificar principais elementos**:
   - Menus adaptáveis
   - Tabelas scrolláveis
   - Formulários empilhados
   - Modais responsivos

#### Etapa 4.4: Validar permissões

1. **Criar usuários de teste**:
   - 1 Master
   - 1 Admin
   - 2 Agents
   
2. **Testar restrições**:
   - Agent não vê clientes de outros
   - Agent não pode transferir
   - Admin vê todos mas não deleta
   - Master tem acesso total

### 📋 Checklist de Conclusão da Fase 3

- [ ] **Banco de Dados**
  - [ ] Todas as tabelas criadas com colunas corretas
  - [ ] Índices otimizados implementados
  - [ ] Relações e constraints configuradas
  - [ ] Migrations executadas sem erro

- [ ] **Clientes**
  - [ ] CRUD completo com validações brasileiras
  - [ ] CPF e CNPJ validando corretamente
  - [ ] CEP buscando endereço
  - [ ] Sistema de interações salvando
  - [ ] Tarefas com alertas de vencimento
  - [ ] Transferência registrando logs
  - [ ] Busca e filtros performáticos

- [ ] **Propostas**
  - [ ] Wizard intuitivo de 4 passos
  - [ ] Campos customizados renderizando
  - [ ] Cálculos precisos até centavos
  - [ ] PDF profissional gerando
  - [ ] Status com histórico completo
  - [ ] Automação de funil funcionando

- [ ] **Qualidade**
  - [ ] Zero erros no type-check
  - [ ] Sem nenhum estilo inline
  - [ ] Tema claro e escuro perfeitos
  - [ ] Build passando sem warnings
  - [ ] Performance < 3s no carregamento

### 🎯 Próximos Passos

Com o core do CRM implementado, você estará pronto para:
- **Fase 4**: Sistema de Reservas e Dashboard completo
- **Fase 5**: Módulo Financeiro com comissões
- **Fase 6**: Relatórios avançados e exportações

### 💡 Dicas Finais para Evitar Problemas

#### TypeScript:
```typescript
// SEMPRE defina tipos explícitos
const getClient = async (id: string): Promise<Client | null> => {}

// USE type guards
if (client && 'document_number' in client) {}

// EVITE any - use unknown
const parseData = (data: unknown): Client => {}

// NULL safety sempre
const name = client?.name ?? 'Sem nome'
```

#### Estilos:
```css
/* SEMPRE use classes modulares */
.proposalCard { }

/* NUNCA valores fixos de cor */
color: var(--foreground);

/* SEMPRE teste dark mode */
.dark .proposalCard { }
```

#### Performance:
```typescript
// SEMPRE pagine listas grandes
const clients = await getClients({ page: 1, limit: 20 })

// USE React.memo em componentes pesados
export default React.memo(ClientCard)

// LAZY load rotas grandes
const ProposalWizard = lazy(() => import('./proposal-wizard'))
```

---

🎉 **Parabéns!** Com a Fase 3 completa, você terá um CRM robusto e profissional, pronto para gerenciar toda a operação comercial da agência!