# 📋 Plano de Execução Revisado com Arquitetura Centralizada - CRM Travel SaaS

## 🏗️ Módulos Centralizados (Core Services)

### 📦 Módulo Central de Entidades Base
- **Arquivo: `lib/core/entities/base-entity.ts`** - Classe base para todas as entidades com campos comuns (id, timestamps, agencyId)
- **Arquivo: `lib/core/entities/interfaces.ts`** - Interfaces compartilhadas (Auditable, Searchable, Exportable)
- **Arquivo: `lib/core/entities/mixins.ts`** - Mixins reutilizáveis (softDelete, versionControl, tagging)

### 🔧 Módulo Central de CRUD
- **Arquivo: `lib/core/crud/base-service.ts`** - Serviço CRUD genérico com isolamento por tenant
- **Arquivo: `lib/core/crud/base-actions.ts`** - Actions genéricas (create, update, delete, list)
- **Arquivo: `lib/core/crud/base-queries.ts`** - Queries genéricas com cache e paginação
- **Arquivo: `lib/core/crud/filters.ts`** - Sistema de filtros dinâmicos reutilizável

### 📊 Módulo Central de Listagens
- **Arquivo: `lib/core/ui/data-table/index.tsx`** - Tabela genérica com sort, filter, pagination
- **Arquivo: `lib/core/ui/data-table/columns.ts`** - Definições de colunas reutilizáveis
- **Arquivo: `lib/core/ui/data-table/filters.tsx`** - Componentes de filtro genéricos
- **Arquivo: `lib/core/ui/data-table/export.ts`** - Exportação para CSV/Excel

### 📝 Módulo Central de Formulários
- **Arquivo: `lib/core/forms/base-form.tsx`** - Componente base de formulário com validação
- **Arquivo: `lib/core/forms/field-registry.ts`** - Registro de tipos de campos customizados
- **Arquivo: `lib/core/forms/dynamic-form.tsx`** - Formulário dinâmico baseado em schema
- **Arquivo: `lib/core/forms/form-builder.tsx`** - Construtor visual de formulários

### 🔍 Módulo Central de Busca
- **Arquivo: `lib/core/search/search-engine.ts`** - Motor de busca unificado
- **Arquivo: `lib/core/search/indexer.ts`** - Indexador automático de conteúdo
- **Arquivo: `lib/core/search/search-ui.tsx`** - Componente de busca global
- **Arquivo: `lib/core/search/suggestions.ts`** - Sistema de sugestões

### 📈 Módulo Central de Relatórios
- **Arquivo: `lib/core/reports/report-engine.ts`** - Motor de relatórios configurável
- **Arquivo: `lib/core/reports/templates/`** - Templates de relatórios
- **Arquivo: `lib/core/reports/export.ts`** - Exportação PDF/Excel
- **Arquivo: `lib/core/reports/scheduler.ts`** - Agendador de relatórios

### 🔐 Módulo Central de Permissões
- **Arquivo: `lib/core/permissions/rbac.ts`** - Sistema RBAC completo
- **Arquivo: `lib/core/permissions/policies.ts`** - Políticas de acesso centralizadas
- **Arquivo: `lib/core/permissions/guards.tsx`** - Guards de componentes
- **Arquivo: `lib/core/permissions/hooks.ts`** - Hooks usePermission, useRole

### 📊 Módulo Central de Métricas
- **Arquivo: `lib/core/metrics/collector.ts`** - Coletor de métricas genérico
- **Arquivo: `lib/core/metrics/dashboard.tsx`** - Dashboard configurável
- **Arquivo: `lib/core/metrics/widgets/`** - Widgets reutilizáveis
- **Arquivo: `lib/core/metrics/kpi-calculator.ts`** - Calculadora de KPIs

---

## 🎯 Fase 1: Fundação e Infraestrutura Core (3 semanas)

### Etapa 1.1: Setup e Arquitetura Base
- **Criar estrutura modular** com pastas core centralizadas
- **Arquivo: `lib/core/config/app.config.ts`** - Configuração central da aplicação
- **Arquivo: `lib/core/config/features.config.ts`** - Feature flags centralizadas
- **Arquivo: `lib/core/config/modules.registry.ts`** - Registro de módulos dinâmicos

### Etapa 1.2: Sistema de Banco de Dados Modular
- **Arquivo: `lib/core/db/base-schema.ts`** - Schemas base reutilizáveis
- **Arquivo: `lib/core/db/migrations/runner.ts`** - Runner de migrações centralizado
- **Arquivo: `lib/core/db/seeders/base-seeder.ts`** - Sistema de seed modular
- **Arquivo: `lib/core/db/connection-manager.ts`** - Gerenciador de conexões

### Etapa 1.3: Infraestrutura de Serviços
- **Arquivo: `lib/core/services/service-registry.ts`** - Registro central de serviços
- **Arquivo: `lib/core/services/event-bus.ts`** - Sistema de eventos interno
- **Arquivo: `lib/core/services/queue-manager.ts`** - Gerenciador de filas
- **Arquivo: `lib/core/services/cache-layer.ts`** - Camada de cache unificada

### Etapa 1.4: Sistema de Plugins
- **Arquivo: `lib/core/plugins/plugin-manager.ts`** - Gerenciador de plugins
- **Arquivo: `lib/core/plugins/hooks.ts`** - Sistema de hooks para extensão
- **Arquivo: `lib/core/plugins/api.ts`** - API para plugins terceiros

### Etapa 1.5: Autenticação e Segurança Centralizada
- **Arquivo: `lib/core/auth/auth-provider.tsx`** - Provider unificado
- **Arquivo: `lib/core/auth/strategies/`** - Estratégias de auth (JWT, OAuth, etc)
- **Arquivo: `lib/core/auth/session-manager.ts`** - Gerenciador de sessões
- **Arquivo: `lib/core/security/encryption.ts`** - Serviços de criptografia

### Etapa 1.6: Sistema de Logs e Auditoria Unificado
- **Arquivo: `lib/core/audit/audit-logger.ts`** - Logger centralizado
- **Arquivo: `lib/core/audit/audit-viewer.tsx`** - Visualizador genérico
- **Arquivo: `lib/core/audit/retention-policy.ts`** - Políticas de retenção

### Etapa 1.7: Multi-tenancy Core
- **Arquivo: `lib/core/tenant/tenant-resolver.ts`** - Resolvedor de tenant
- **Arquivo: `lib/core/tenant/isolation-middleware.ts`** - Middleware de isolamento
- **Arquivo: `lib/core/tenant/data-scoper.ts`** - Escopo automático de dados

### Etapa 1.8: UI Kit Centralizado
- **Arquivo: `lib/core/ui/theme-provider.tsx`** - Provider de tema unificado
- **Arquivo: `lib/core/ui/layout-system/`** - Sistema de layouts
- **Arquivo: `lib/core/ui/navigation/`** - Navegação dinâmica
- **Arquivo: `lib/core/ui/feedback/`** - Sistema de feedback (toasts, modals)

---

## 🏗️ Fase 2: Módulos de Domínio com Core Reutilizado (2 semanas)

### Etapa 2.1: Módulo de Usuários (Usando Core)
- **Arquivo: `lib/modules/users/config.ts`** - Configuração do módulo
- **Arquivo: `lib/modules/users/schema.ts`** - Estende base-entity
- **Arquivo: `lib/modules/users/service.ts`** - Estende base-service
- **Arquivo: `lib/modules/users/permissions.ts`** - Define permissões específicas
- **Arquivo: `app/(app)/users/page.tsx`** - Usa data-table genérica

### Etapa 2.2: Módulo de Funis (Usando Core)
- **Arquivo: `lib/modules/funnels/config.ts`** - Configuração do módulo
- **Arquivo: `lib/modules/funnels/components/kanban.tsx`** - Estende componentes core
- **Arquivo: `lib/modules/funnels/drag-drop-service.ts`** - Serviço específico

### Etapa 2.3: Módulo de Catálogo (Usando Core)
- **Arquivo: `lib/modules/catalog/dynamic-fields.ts`** - Usa field-registry
- **Arquivo: `lib/modules/catalog/templates/`** - Templates de produtos
- **Arquivo: `lib/modules/catalog/import-export.ts`** - Usa serviços core

### Etapa 2.4: Módulo de Operadoras (Usando Core)
- **Arquivo: `lib/modules/operators/commission-engine.ts`** - Motor específico
- **Arquivo: `lib/modules/operators/api-connectors/`** - Conectores externos
- **Arquivo: `lib/modules/operators/sync-service.ts`** - Sincronização

---

## 💼 Fase 3: CRM Modular (2.5 semanas)

### Etapa 3.1: Módulo de Clientes (Altamente Modular)
- **Arquivo: `lib/modules/clients/client-service.ts`** - Estende CRUD base
- **Arquivo: `lib/modules/clients/enrichment/`** - Plugins de enriquecimento
- **Arquivo: `lib/modules/clients/importers/`** - Importadores plugáveis
- **Arquivo: `lib/modules/clients/timeline/`** - Sistema de timeline genérico

### Etapa 3.2: Módulo de Propostas (Configurável)
- **Arquivo: `lib/modules/proposals/proposal-engine.ts`** - Motor configurável
- **Arquivo: `lib/modules/proposals/templates/`** - Templates customizáveis
- **Arquivo: `lib/modules/proposals/calculators/`** - Calculadoras plugáveis
- **Arquivo: `lib/modules/proposals/approval-flow/`** - Fluxo configurável

---

## 📊 Fase 4: Módulos Financeiros Centralizados (2 semanas)

### Etapa 4.1: Core Financeiro
- **Arquivo: `lib/core/financial/money.ts`** - Classe Money para cálculos precisos
- **Arquivo: `lib/core/financial/accounting.ts`** - Regras contábeis centralizadas
- **Arquivo: `lib/core/financial/tax-engine.ts`** - Motor de impostos configurável
- **Arquivo: `lib/core/financial/payment-gateway.ts`** - Gateway unificado

### Etapa 4.2: Módulos Financeiros Específicos
- **Arquivo: `lib/modules/receivables/`** - Usa core financeiro
- **Arquivo: `lib/modules/payables/`** - Usa core financeiro
- **Arquivo: `lib/modules/cash-flow/`** - Usa core financeiro
- **Arquivo: `lib/modules/reports/financial/`** - Templates financeiros

---

## 🔔 Fase 5: Infraestrutura de Comunicação (1.5 semanas)

### Etapa 5.1: Core de Notificações
- **Arquivo: `lib/core/notifications/notification-center.ts`** - Centro unificado
- **Arquivo: `lib/core/notifications/channels/`** - Canais plugáveis
- **Arquivo: `lib/core/notifications/templates/`** - Sistema de templates
- **Arquivo: `lib/core/notifications/preferences.ts`** - Preferências centralizadas

### Etapa 5.2: Sistema de Mensageria
- **Arquivo: `lib/core/messaging/message-bus.ts`** - Bus de mensagens
- **Arquivo: `lib/core/messaging/queue-processor.ts`** - Processador de filas
- **Arquivo: `lib/core/messaging/webhooks.ts`** - Sistema de webhooks

---

## 🧪 Fase 6: Qualidade e Deploy (Contínuo)

### Etapa 6.1: Framework de Testes
- **Arquivo: `lib/core/testing/test-factory.ts`** - Factory para dados de teste
- **Arquivo: `lib/core/testing/test-utils.tsx`** - Utilidades de teste
- **Arquivo: `lib/core/testing/mocks/`** - Mocks centralizados

### Etapa 6.2: DevOps e Monitoramento
- **Arquivo: `lib/core/monitoring/health-check.ts`** - Health checks
- **Arquivo: `lib/core/monitoring/metrics-collector.ts`** - Coleta de métricas
- **Arquivo: `lib/core/monitoring/error-boundary.tsx`** - Error boundaries

---

## 🎯 Benefícios da Arquitetura Centralizada

### 1. **Reutilização Máxima**
- CRUD genérico elimina 70% do código repetitivo
- Componentes UI centralizados garantem consistência
- Serviços base reduzem duplicação

### 2. **Manutenção Simplificada**
- Correções no core beneficiam todos os módulos
- Atualizações centralizadas de segurança
- Menos pontos de falha

### 3. **Escalabilidade**
- Novos módulos criados rapidamente
- Plugins permitem extensão sem modificar core
- Performance otimizada centralmente

### 4. **Padronização**
- Todos os módulos seguem mesma estrutura
- APIs consistentes
- Documentação unificada

### 5. **Testabilidade**
- Testes do core cobrem funcionalidades base
- Mocks centralizados
- Testes de integração simplificados

## 📈 Métricas de Sucesso

- **Redução de código**: ~60% menos código repetitivo
- **Tempo de desenvolvimento**: Novos módulos em dias, não semanas
- **Bugs**: Redução estimada de 40% por centralização
- **Performance**: Otimizações centralizadas beneficiam tudo
- **Onboarding**: Novos devs produtivos em 1 semana

## 🚀 Estrutura Final de Pastas

```
lib/
├── core/                    # Núcleo reutilizável
│   ├── auth/               # Autenticação centralizada
│   ├── crud/               # CRUD genérico
│   ├── db/                 # Base de dados
│   ├── forms/              # Sistema de formulários
│   ├── permissions/        # RBAC centralizado
│   ├── search/             # Busca unificada
│   ├── ui/                 # Componentes base
│   └── ...                 # Outros serviços core
├── modules/                # Módulos de domínio
│   ├── clients/           # Específico de clientes
│   ├── proposals/         # Específico de propostas
│   ├── financial/         # Específico financeiro
│   └── ...                # Outros módulos
└── shared/                # Utilidades compartilhadas
    ├── constants/         # Constantes globais
    ├── types/             # Tipos TypeScript
    └── utils/             # Funções utilitárias
```

Esta arquitetura centralizada reduz drasticamente a complexidade, melhora a manutenibilidade e acelera o desenvolvimento de novos recursos.