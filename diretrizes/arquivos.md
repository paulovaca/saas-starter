# 📋 Plano de Execução Revisado - CRM Travel SaaS

## 🎯 Fase 1: Fundação, Arquitetura e Multi-Tenancy (2-3 semanas)

### Etapa 1.1: Configuração Inicial do Projeto
- **Inicializar projeto** com Next.js 15 e configurações TypeScript
- **Criar estrutura de pastas** seguindo padrão modular:
  - `app/(auth)/` - Páginas de autenticação
  - `app/(app)/` - Aplicação principal
  - `lib/actions/` - Server Actions centralizadas
  - `lib/validations/` - Schemas Zod
  - `lib/services/` - Lógica de negócio
  - `lib/db/schema/` - Schemas separados por domínio

### Etapa 1.2: Configuração do Banco de Dados
- **Arquivo: `lib/db/drizzle.ts`** - Configuração da conexão com PostgreSQL
- **Arquivo: `lib/db/schema/index.ts`** - Export agregado de todos os schemas
- **Arquivo: `lib/db/schema/auth.ts`** - Tabelas users, roles
- **Arquivo: `lib/db/schema/agency.ts`** - Tabelas agencies, agencySettings
- **Arquivo: `lib/db/schema/activity.ts`** - Tabela activityLogs com índices
- **Executar migrações** iniciais para criar estrutura base

### Etapa 1.3: Sistema de Variáveis de Ambiente Tipadas
- **Arquivo: `lib/config/env.ts`** - Schema Zod para validação de environment variables
- **Arquivo: `.env.example`** - Template documentado de variáveis
- **Arquivo: `types/env.d.ts`** - Tipos TypeScript para process.env

### Etapa 1.4: Sistema de Tratamento de Erros
- **Arquivo: `lib/services/error-handler/index.ts`** - Classes de erro customizadas
- **Arquivo: `lib/services/error-handler/action-wrapper.ts`** - Wrapper para Server Actions
- **Arquivo: `lib/services/error-handler/api-wrapper.ts`** - Wrapper para API routes

### Etapa 1.5: Sistema de Validação Centralizado
- **Arquivo: `lib/validations/common.schema.ts`** - Validações brasileiras (CPF, CNPJ, telefone, CEP)
- **Arquivo: `lib/validations/auth.schema.ts`** - Schemas de autenticação
- **Arquivo: `lib/validations/agency.schema.ts`** - Schemas de agência

### Etapa 1.6: Sistema de Autenticação
- **Arquivo: `lib/auth/session.ts`** - Gerenciamento de sessões JWT
- **Arquivo: `lib/auth/middleware.ts`** - Middleware de autenticação
- **Arquivo: `lib/actions/auth/sign-up.ts`** - Action de registro com validação
- **Arquivo: `lib/actions/auth/sign-in.ts`** - Action de login com tratamento de erros
- **Arquivo: `lib/actions/auth/sign-out.ts`** - Action de logout
- **Arquivo: `app/(auth)/sign-up/page.tsx`** - UI de registro
- **Arquivo: `app/(auth)/sign-in/page.tsx`** - UI de login

### Etapa 1.7: Sistema de Activity Logs
- **Arquivo: `lib/services/activity-logger/index.ts`** - Serviço de logging com captura de IP/User-Agent
- **Arquivo: `lib/db/queries/activity.ts`** - Queries otimizadas para logs
- **Arquivo: `app/(app)/settings/activity/page.tsx`** - UI de visualização de logs

### Etapa 1.8: Multi-tenancy e Isolamento
- **Arquivo: `lib/db/queries/index.ts`** - Queries base com isolamento por agencyId
- **Arquivo: `lib/middleware/tenant-isolation.ts`** - Middleware para garantir isolamento
- **Arquivo: `lib/db/cached-queries.ts`** - Sistema de cache com revalidação

### Etapa 1.9: Dashboard e Layout Base
- **Arquivo: `app/(app)/layout.tsx`** - Layout principal com navegação
- **Arquivo: `app/(app)/dashboard/page.tsx`** - Dashboard com métricas
- **Arquivo: `components/ui/`** - Componentes base do shadcn/ui

## 🏗️ Fase 2: Módulos de Configuração da Agência (2 semanas)

### Etapa 2.1: Gestão de Usuários (RF26, RF27)
- **Arquivo: `lib/validations/user.schema.ts`** - Validações de usuário com roles
- **Arquivo: `lib/actions/users/create.ts`** - Action para criar usuários com permissões
- **Arquivo: `lib/actions/users/update.ts`** - Action para atualizar usuários
- **Arquivo: `lib/actions/users/delete.ts`** - Soft delete de usuários
- **Arquivo: `lib/services/permissions/index.ts`** - Sistema de permissões granular
- **Arquivo: `app/(app)/settings/users/page.tsx`** - Listagem de usuários
- **Arquivo: `app/(app)/settings/users/new/page.tsx`** - Formulário de novo usuário
- **Arquivo: `app/(app)/settings/users/[id]/edit/page.tsx`** - Edição de usuário

### Etapa 2.2: Sistema de Funis de Venda (RF06-RF09)
- **Arquivo: `lib/validations/funnel.schema.ts`** - Validações de funis e estágios
- **Arquivo: `lib/db/schema/sales.ts`** - Tabelas salesFunnels, salesFunnelStages
- **Arquivo: `lib/actions/funnels/create.ts`** - Criar funil com estágios
- **Arquivo: `lib/actions/funnels/update.ts`** - Atualizar funil e reordenar estágios
- **Arquivo: `lib/actions/funnels/set-default.ts`** - Definir funil padrão
- **Arquivo: `lib/db/queries/funnels.ts`** - Queries com agregação de estágios
- **Arquivo: `app/(app)/funnels/page.tsx`** - Board Kanban principal
- **Arquivo: `app/(app)/funnels/settings/page.tsx`** - Configuração de funis
- **Arquivo: `components/funnels/funnel-board.tsx`** - Componente drag-and-drop

### Etapa 2.3: Catálogo de Produtos Base (RF10-RF12)
- **Arquivo: `lib/validations/base-item.schema.ts`** - Validações com campos dinâmicos
- **Arquivo: `lib/db/schema/catalog.ts`** - Tabelas baseItems, baseItemFields
- **Arquivo: `lib/actions/base-items/create.ts`** - Criar item com campos customizados
- **Arquivo: `lib/actions/base-items/update.ts`** - Atualizar item e campos
- **Arquivo: `lib/services/dynamic-fields/index.ts`** - Gerenciador de campos dinâmicos
- **Arquivo: `app/(app)/catalog/page.tsx`** - Listagem de itens base
- **Arquivo: `app/(app)/catalog/new/page.tsx`** - Criar novo item
- **Arquivo: `components/dynamic-fields/field-builder.tsx`** - UI para campos customizados

### Etapa 2.4: Gestão de Operadoras (RF13-RF16)
- **Arquivo: `lib/validations/operator.schema.ts`** - Validações de operadora
- **Arquivo: `lib/db/schema/operators.ts`** - Tabelas operators, operatorItems
- **Arquivo: `lib/actions/operators/create.ts`** - Criar operadora
- **Arquivo: `lib/actions/operators/associate-items.ts`** - Associar itens base
- **Arquivo: `lib/actions/operators/set-commissions.ts`** - Definir comissões por pagamento
- **Arquivo: `lib/services/commission/calculator.ts`** - Calculadora de comissões
- **Arquivo: `app/(app)/operators/page.tsx`** - Listagem de operadoras
- **Arquivo: `app/(app)/operators/[id]/items/page.tsx`** - Gerenciar portfólio
- **Arquivo: `components/operators/commission-table.tsx`** - Tabela de comissões

## 💼 Fase 3: Core do CRM - Clientes e Propostas (3 semanas)

### Etapa 3.1: Gestão Completa de Clientes (RF01-RF05)
- **Arquivo: `lib/validations/client.schema.ts`** - Validações PF/PJ com documentos BR
- **Arquivo: `lib/db/schema/clients.ts`** - Tabelas clients, interactions, tasks
- **Arquivo: `lib/actions/clients/create.ts`** - Criar cliente com funil padrão
- **Arquivo: `lib/actions/clients/update.ts`** - Atualizar dados do cliente
- **Arquivo: `lib/actions/clients/transfer.ts`** - Transferir cliente entre agentes
- **Arquivo: `lib/actions/clients/bulk-import.ts`** - Importação em massa
- **Arquivo: `lib/db/queries/clients.ts`** - Queries com filtros avançados
- **Arquivo: `lib/services/client-enrichment/index.ts`** - Enriquecimento de dados
- **Arquivo: `app/(app)/clients/page.tsx`** - Listagem com filtros
- **Arquivo: `app/(app)/clients/new/page.tsx`** - Formulário inteligente PF/PJ
- **Arquivo: `app/(app)/clients/[id]/page.tsx`** - Perfil completo do cliente
- **Arquivo: `app/(app)/clients/import/page.tsx`** - Interface de importação
- **Arquivo: `components/clients/interaction-timeline.tsx`** - Timeline de interações
- **Arquivo: `components/clients/task-manager.tsx`** - Gerenciador de tarefas

### Etapa 3.2: Sistema de Propostas (RF17-RF21)
- **Arquivo: `lib/validations/proposal.schema.ts`** - Validações de proposta
- **Arquivo: `lib/db/schema/proposals.ts`** - Tabelas proposals, proposalItems
- **Arquivo: `lib/actions/proposals/create.ts`** - Criar proposta draft
- **Arquivo: `lib/actions/proposals/add-item.ts`** - Adicionar produto com cálculo
- **Arquivo: `lib/actions/proposals/update-status.ts`** - Máquina de estados
- **Arquivo: `lib/services/proposal/state-machine.ts`** - Estados e transições
- **Arquivo: `lib/services/proposal/calculator.ts`** - Cálculo de totais e margens
- **Arquivo: `lib/services/pdf/proposal-generator.ts`** - Gerador de PDF
- **Arquivo: `app/(app)/proposals/page.tsx`** - Listagem de propostas
- **Arquivo: `app/(app)/proposals/new/page.tsx`** - Wizard de criação
- **Arquivo: `app/(app)/proposals/[id]/edit/page.tsx`** - Editor de proposta
- **Arquivo: `app/(app)/proposals/[id]/preview/page.tsx`** - Preview do PDF
- **Arquivo: `components/proposals/item-selector.tsx`** - Seletor de produtos
- **Arquivo: `components/proposals/dynamic-form.tsx`** - Formulário campos customizados

## 📊 Fase 4: Pós-Venda e Financeiro (2.5 semanas)

### Etapa 4.1: Gestão de Reservas (RF22-RF25)
- **Arquivo: `lib/validations/reservation.schema.ts`** - Validações de reserva
- **Arquivo: `lib/db/schema/reservations.ts`** - Tabelas reservations, documents
- **Arquivo: `lib/actions/reservations/create-from-proposal.ts`** - Conversão automática
- **Arquivo: `lib/actions/reservations/update-status.ts`** - Atualizar status
- **Arquivo: `lib/actions/reservations/attach-document.ts`** - Upload de documentos
- **Arquivo: `lib/services/storage/document-manager.ts`** - Gerenciador de arquivos
- **Arquivo: `app/(app)/reservations/page.tsx`** - Dashboard de reservas
- **Arquivo: `app/(app)/reservations/[id]/page.tsx`** - Detalhes da reserva
- **Arquivo: `components/reservations/status-tracker.tsx`** - Rastreador de status
- **Arquivo: `components/reservations/document-gallery.tsx`** - Galeria de documentos

### Etapa 4.2: Sistema Financeiro (RF28-RF32)
- **Arquivo: `lib/validations/financial.schema.ts`** - Validações financeiras
- **Arquivo: `lib/db/schema/financial.ts`** - Tabelas financialRecords, commissions
- **Arquivo: `lib/actions/financial/create-transaction.ts`** - Lançamentos manuais
- **Arquivo: `lib/actions/financial/process-payment.ts`** - Processar pagamentos
- **Arquivo: `lib/actions/financial/calculate-commissions.ts`** - Calcular comissões
- **Arquivo: `lib/services/financial/cash-flow.ts`** - Gerador de fluxo de caixa
- **Arquivo: `lib/services/financial/reports.ts`** - Gerador de relatórios
- **Arquivo: `app/(app)/financial/receivables/page.tsx`** - Contas a receber
- **Arquivo: `app/(app)/financial/payables/page.tsx`** - Contas a pagar
- **Arquivo: `app/(app)/financial/cash-flow/page.tsx`** - Fluxo de caixa
- **Arquivo: `app/(app)/financial/reports/page.tsx`** - DRE simplificado
- **Arquivo: `components/financial/charts.tsx`** - Gráficos com Recharts

## 🔔 Fase 5: Módulos de Suporte (2 semanas)

### Etapa 5.1: Sistema de Notificações (RF37-RF39)
- **Arquivo: `lib/db/schema/notifications.ts`** - Tabela notifications
- **Arquivo: `lib/services/notification/manager.ts`** - Gerenciador de notificações
- **Arquivo: `lib/services/notification/email-sender.ts`** - Integração email (Resend)
- **Arquivo: `lib/services/notification/push-sender.ts`** - Push notifications
- **Arquivo: `lib/actions/notifications/mark-read.ts`** - Marcar como lida
- **Arquivo: `app/(app)/notifications/page.tsx`** - Central de notificações
- **Arquivo: `app/(app)/settings/notifications/page.tsx`** - Preferências
- **Arquivo: `components/notifications/bell.tsx`** - Componente sino
- **Arquivo: `components/notifications/toast-provider.tsx`** - Provider de toasts

### Etapa 5.2: Auditoria e Logs (RF33-RF36)
- **Arquivo: `lib/db/schema/audit.ts`** - Tabela logs expandida
- **Arquivo: `lib/services/audit/logger.ts`** - Logger avançado com contexto
- **Arquivo: `lib/middleware/audit-middleware.ts`** - Middleware de auditoria
- **Arquivo: `app/(app)/admin/audit/page.tsx`** - Visualizador de logs
- **Arquivo: `components/audit/log-viewer.tsx`** - Componente de visualização
- **Arquivo: `components/audit/filters.tsx`** - Filtros avançados

### Etapa 5.3: Otimizações e PWA
- **Arquivo: `lib/services/cache/manager.ts`** - Gerenciador de cache
- **Arquivo: `lib/services/performance/monitor.ts`** - Monitor de performance
- **Arquivo: `public/manifest.json`** - Manifest PWA
- **Arquivo: `public/service-worker.js`** - Service worker para offline
- **Arquivo: `app/(app)/settings/preferences/page.tsx`** - Preferências do usuário

## 🧪 Fase 6: Testes e Deploy (Contínuo)

### Etapa 6.1: Configuração de Testes
- **Arquivo: `jest.config.js`** - Configuração Jest
- **Arquivo: `playwright.config.ts`** - Configuração E2E
- **Arquivo: `__tests__/unit/`** - Testes unitários
- **Arquivo: `__tests__/integration/`** - Testes de integração
- **Arquivo: `__tests__/e2e/`** - Testes end-to-end

### Etapa 6.2: CI/CD e Monitoramento
- **Arquivo: `.github/workflows/ci.yml`** - Pipeline de CI
- **Arquivo: `.github/workflows/deploy.yml`** - Pipeline de deploy
- **Arquivo: `docker-compose.yml`** - Ambiente de desenvolvimento
- **Arquivo: `vercel.json`** - Configuração de deploy
- **Arquivo: `lib/services/monitoring/sentry.ts`** - Integração Sentry

## 📈 Cronograma Estimado

- **Fase 1**: 2-3 semanas (Fundação sólida)
- **Fase 2**: 2 semanas (Configurações base)
- **Fase 3**: 3 semanas (Core do CRM)
- **Fase 4**: 2.5 semanas (Financeiro)
- **Fase 5**: 2 semanas (Suporte)
- **Fase 6**: Contínuo durante todo o projeto

**Total**: ~12 semanas para MVP completo

## 🎯 Pontos de Verificação

Após cada fase, validar:
1. ✅ Todos os testes passando
2. ✅ Cobertura de código > 70%
3. ✅ Performance dentro dos limites (LCP < 2.5s, API < 500ms)
4. ✅ Sem vulnerabilidades de segurança
5. ✅ Documentação atualizada
6. ✅ Deploy em staging funcionando