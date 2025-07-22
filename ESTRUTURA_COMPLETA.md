# Estrutura Completa do SaaS Starter

Esta é a estrutura completa de arquivos e diretórios do aplicativo SaaS desenvolvido em Next.js 15.

## Estrutura de Diretórios e Arquivos

```
D:\Programação\saas-starter\
├── CLAUDE.md
├── COMPONENT_REFACTORING_OPPORTUNITIES.md
├── LICENSE
├── README.md
├── components.json
├── docker-compose.yml
├── drizzle.config.ts
├── jest.config.js
├── jest.setup.js
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
├── test-clients.js
├── tsconfig.json
├── tsconfig.tsbuildinfo
│
├── __tests__\
│   ├── actions\
│   │   └── auth\
│   │       └── sign-in-rate-limit.test.ts
│   ├── services\
│   │   ├── cache-system.test.ts
│   │   ├── error-handler\
│   │   │   └── database-errors.test.ts
│   │   └── rate-limiter.test.ts
│   └── validations\
│       └── common.schema.test.ts
│
├── app\
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.module.css
│   ├── layout.tsx
│   ├── not-found.module.css
│   ├── not-found.tsx
│   │
│   ├── (dashboard)\
│   │   ├── dashboard.module.css
│   │   ├── layout.module.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── terminal.module.css
│   │   ├── terminal.tsx
│   │   │
│   │   ├── catalog\
│   │   │   ├── catalog.module.css
│   │   │   ├── page.tsx
│   │   │   └── [id]\
│   │   │       └── page.tsx
│   │   │
│   │   ├── clients\
│   │   │   ├── clients.module.css
│   │   │   ├── page.tsx
│   │   │   ├── [clientId]\
│   │   │   ├── [id]\
│   │   │   │   ├── client-details.module.css
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit\
│   │   │   │       ├── edit-client.module.css
│   │   │   │       └── page.tsx
│   │   │   └── new\
│   │   │       ├── new-client-content.tsx
│   │   │       ├── new-client.module.css
│   │   │       └── page.tsx
│   │   │
│   │   ├── demo\
│   │   │   ├── demo.module.css
│   │   │   └── page.tsx
│   │   │
│   │   ├── funnels\
│   │   │   ├── page.module.css
│   │   │   ├── page.tsx
│   │   │   └── [funnelId]\
│   │   │       ├── funnel-editor.module.css
│   │   │       ├── page-clean.tsx
│   │   │       ├── page.module.css
│   │   │       └── page.tsx
│   │   │
│   │   ├── operators\
│   │   │   ├── page.module.css
│   │   │   ├── page.tsx
│   │   │   └── [operatorId]\
│   │   │       ├── page.module.css
│   │   │       └── page.tsx
│   │   │
│   │   ├── pricing\
│   │   │   ├── page.module.css
│   │   │   ├── page.tsx
│   │   │   ├── submit-button.module.css
│   │   │   └── submit-button.tsx
│   │   │
│   │   ├── profile\
│   │   │   ├── actions.ts
│   │   │   ├── change-avatar-modal.module.css
│   │   │   ├── change-avatar-modal.tsx
│   │   │   ├── change-password-modal.module.css
│   │   │   ├── change-password-modal.tsx
│   │   │   ├── edit-profile-modal.module.css
│   │   │   ├── edit-profile-modal.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile-modals.tsx
│   │   │   └── profile.module.css
│   │   │
│   │   ├── proposals\
│   │   │   ├── page.tsx
│   │   │   └── proposals.module.css
│   │   │
│   │   ├── reports\
│   │   │   ├── page.tsx
│   │   │   └── reports.module.css
│   │   │
│   │   ├── settings\
│   │   │   ├── actions.ts
│   │   │   ├── appearance-card.tsx
│   │   │   ├── edit-agency-modal.module.css
│   │   │   ├── edit-agency-modal.tsx
│   │   │   ├── page.tsx
│   │   │   └── settings.module.css
│   │   │
│   │   ├── style-demo\
│   │   │   ├── page.module.css
│   │   │   └── page.tsx
│   │   │
│   │   └── users\
│   │       ├── page.tsx
│   │       └── users.module.css
│   │
│   ├── (login)\
│   │   ├── actions.ts
│   │   ├── agency-actions.ts
│   │   ├── login.module.css
│   │   ├── login.tsx
│   │   ├── sign-in\
│   │   │   └── page.tsx
│   │   └── sign-up\
│   │       └── page.tsx
│   │
│   ├── api\
│   │   ├── agency\
│   │   │   └── route.ts
│   │   ├── auth\
│   │   │   └── logout\
│   │   │       └── route.ts
│   │   ├── clients\
│   │   │   ├── route.ts
│   │   │   ├── [id]\
│   │   │   │   └── route.ts
│   │   │   └── filters\
│   │   │       └── route.ts
│   │   ├── csrf-token\
│   │   │   └── route.ts
│   │   ├── stripe\
│   │   │   ├── checkout\
│   │   │   │   └── route.ts
│   │   │   └── webhook\
│   │   │       └── route.ts
│   │   ├── team\
│   │   │   └── route.ts
│   │   └── user\
│   │       └── route.ts
│   │
│   └── test-modals\
│       ├── page.module.css
│       └── page.tsx
│
├── components\
│   ├── theme-selector.module.css
│   ├── theme-selector.tsx
│   │
│   ├── catalog\
│   │   ├── add-field-modal.module.css
│   │   ├── add-field-modal.tsx
│   │   ├── base-item-card.module.css
│   │   ├── base-item-card.tsx
│   │   ├── base-item-detail-content.module.css
│   │   ├── base-item-detail-content.tsx
│   │   ├── base-items-list.module.css
│   │   ├── base-items-list.tsx
│   │   ├── base-items-page-content.module.css
│   │   ├── base-items-page-content.tsx
│   │   ├── catalog-page-skeleton.module.css
│   │   ├── catalog-page-skeleton.tsx
│   │   ├── create-base-item-button.module.css
│   │   ├── create-base-item-button.tsx
│   │   ├── create-base-item-modal.module.css
│   │   ├── create-base-item-modal.tsx
│   │   ├── edit-field-modal.module.css
│   │   └── edit-field-modal.tsx
│   │
│   ├── clients\
│   │   ├── client-details-content-badges.module.css
│   │   ├── client-details-content.module.css
│   │   ├── client-details-content.tsx
│   │   ├── client-details-skeleton.module.css
│   │   ├── client-details-skeleton.tsx
│   │   ├── client-funnel-stage-editor.module.css
│   │   ├── client-funnel-stage-editor.tsx
│   │   ├── clients-page-content.module.css
│   │   ├── clients-page-content.tsx
│   │   ├── clients-page-skeleton.module.css
│   │   ├── clients-page-skeleton.tsx
│   │   ├── transfer-modal.module.css
│   │   ├── forms\
│   │   │   ├── client-form.module.css
│   │   │   └── client-form.tsx
│   │   ├── interactions\
│   │   │   ├── interaction-form.module.css
│   │   │   ├── interaction-form.tsx
│   │   │   ├── interaction-item.module.css
│   │   │   ├── interaction-item.tsx
│   │   │   ├── interaction-list.module.css
│   │   │   └── interaction-list.tsx
│   │   └── tasks\
│   │       ├── task-card.module.css
│   │       ├── task-card.tsx
│   │       ├── task-form.module.css
│   │       ├── task-form.tsx
│   │       ├── task-list.module.css
│   │       └── task-list.tsx
│   │
│   ├── examples\
│   │   ├── csrf-example.module.css
│   │   └── csrf-example.tsx
│   │
│   ├── funnels\
│   │   ├── color-picker.module.css
│   │   ├── color-picker.tsx
│   │   ├── create-funnel-modal.module.css
│   │   ├── create-funnel-modal.tsx
│   │   ├── stage-card-new.module.css
│   │   ├── stage-card-new.tsx
│   │   ├── stage-card.module.css
│   │   └── stage-card.tsx
│   │
│   ├── layout\
│   │   ├── main-layout.module.css
│   │   └── main-layout.tsx
│   │
│   ├── operators\
│   │   ├── commission-modal.module.css
│   │   ├── commission-modal.tsx
│   │   ├── create-commission-rule-modal.module.css
│   │   ├── create-commission-rule-modal.tsx
│   │   ├── delete-operator-modal.module.css
│   │   ├── delete-operator-modal.tsx
│   │   ├── edit-commission-rule-modal.module.css
│   │   ├── edit-commission-rule-modal.tsx
│   │   ├── edit-item-modal.module.css
│   │   ├── edit-item-modal.tsx
│   │   ├── item-association-modal.module.css
│   │   ├── item-association-modal.tsx
│   │   ├── operator-details-content.module.css
│   │   ├── operator-details-content.tsx
│   │   ├── operator-form-modal.module.css
│   │   ├── operator-form-modal.tsx
│   │   ├── operators-page-content.module.css
│   │   └── operators-page-content.tsx
│   │
│   ├── shared\
│   │   ├── search-filters.README.md
│   │   ├── search-filters.config.ts
│   │   ├── search-filters.examples.tsx
│   │   ├── search-filters.module.css
│   │   ├── search-filters.tsx
│   │   ├── theme-toggle.module.css
│   │   └── theme-toggle.tsx
│   │
│   ├── ui\
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.module.css
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button-new.module.css
│   │   ├── button.module.css
│   │   ├── button.tsx
│   │   ├── card.module.css
│   │   ├── card.tsx
│   │   ├── checkbox.module.css
│   │   ├── checkbox.tsx
│   │   ├── confirm-dialog.module.css
│   │   ├── confirm-dialog.tsx
│   │   ├── confirm-modal.module.css
│   │   ├── confirm-modal.tsx
│   │   ├── dialog.module.css
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.module.css
│   │   ├── dropdown-menu.tsx
│   │   ├── form-modal.tsx
│   │   ├── form-styles.module.css
│   │   ├── form.module.css
│   │   ├── form.tsx
│   │   ├── index.ts
│   │   ├── input.module.css
│   │   ├── input.tsx
│   │   ├── label.module.css
│   │   ├── label.tsx
│   │   ├── loading-icon.module.css
│   │   ├── modal.module.css
│   │   ├── modal.tsx
│   │   ├── radio-group.module.css
│   │   ├── radio-group.tsx
│   │   ├── select.module.css
│   │   ├── select.tsx
│   │   ├── tabs.module.css
│   │   ├── tabs.tsx
│   │   ├── textarea.module.css
│   │   ├── textarea.tsx
│   │   ├── toast.module.css
│   │   └── toast.tsx
│   │
│   └── users\
│       ├── delete-user-modal.module.css
│       ├── delete-user-modal.tsx
│       ├── reset-password-modal.module.css
│       ├── reset-password-modal.tsx
│       ├── user-filters.module.css
│       ├── user-filters.tsx
│       ├── user-form-modal.module.css
│       ├── user-form-modal.tsx
│       ├── user-table.module.css
│       └── user-table.tsx
│
├── coverage\
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── lcov.info
│   └── lcov-report\
│       ├── base.css
│       ├── block-navigation.js
│       ├── favicon.png
│       ├── index.html
│       ├── prettify.css
│       ├── prettify.js
│       ├── sort-arrow-sprite.png
│       ├── sorter.js
│       ├── app\
│       │   └── [arquivos de cobertura HTML...]
│       └── lib\
│           └── [arquivos de cobertura HTML...]
│
├── diretrizes\
│   ├── 1-prd-saas.md
│   ├── 2-schema-prisma.md
│   ├── 3-flowchar-mermaid.md
│   ├── 4-scope.md
│   ├── 5-melhorias.md
│   ├── 6-estrutura-de-arquivos.md
│   ├── adequacao.md
│   ├── estilos.md
│   ├── fase-1.md
│   ├── fase-2.md
│   ├── fase-3.md
│   ├── fase-4.md
│   ├── fase-5.md
│   ├── x - comandos.md
│   ├── x-funil-de-vendas.md
│   ├── x-item-base.md
│   ├── x-operadoras.md
│   ├── x-usuários.md
│   └── xxxxxxx.md
│
├── docs\
│   └── MODAL_SYSTEM.md
│
├── hooks\
│   ├── use-agency.ts
│   ├── use-csrf.ts
│   ├── use-input-mask.ts
│   ├── use-permissions.ts
│   ├── use-phone-mask.ts
│   └── use-theme.ts
│
├── lib\
│   ├── actions\
│   │   ├── action-wrapper.ts
│   │   ├── activity\
│   │   │   └── log-activity.ts
│   │   ├── auth\
│   │   │   ├── account.ts
│   │   │   ├── sign-in.ts
│   │   │   └── sign-up.ts
│   │   ├── catalog\
│   │   │   ├── base-item-fields.ts
│   │   │   ├── base-items.ts
│   │   │   └── index.ts
│   │   ├── funnels\
│   │   │   ├── create-funnel.ts
│   │   │   ├── create-stage.ts
│   │   │   ├── delete-funnel.ts
│   │   │   ├── delete-stage.ts
│   │   │   ├── duplicate-funnel.ts
│   │   │   ├── get-funnel-by-id.ts
│   │   │   ├── get-funnels.ts
│   │   │   ├── get-stages.ts
│   │   │   ├── index.ts
│   │   │   ├── reorder-stages.ts
│   │   │   ├── set-default-funnel.ts
│   │   │   ├── update-funnel.ts
│   │   │   └── update-stage.ts
│   │   ├── operators\
│   │   │   ├── associate-items.ts
│   │   │   ├── calculate-commission.ts
│   │   │   ├── confirm-delete-operator.ts
│   │   │   ├── create-commission-rule.ts
│   │   │   ├── create-operator.ts
│   │   │   ├── delete-operator-item.ts
│   │   │   ├── delete-operator.ts
│   │   │   ├── get-operator-details.ts
│   │   │   ├── get-operators.ts
│   │   │   ├── toggle-operator-item-status.ts
│   │   │   ├── toggle-operator-status.ts
│   │   │   ├── update-operator-item.ts
│   │   │   └── update-operator.ts
│   │   └── users\
│   │       ├── change-password.ts
│   │       ├── confirm-delete-user.ts
│   │       ├── create-user.ts
│   │       ├── delete-user.ts
│   │       ├── get-users.ts
│   │       ├── reset-password.ts
│   │       ├── toggle-user-status.ts
│   │       └── update-user.ts
│   │
│   ├── auth\
│   │   ├── auth.ts
│   │   ├── csrf.ts
│   │   ├── middleware.ts
│   │   ├── permission-middleware.ts
│   │   ├── permissions.ts
│   │   ├── session-manager.ts
│   │   └── session.ts
│   │
│   ├── cache\
│   │   └── index.ts
│   │
│   ├── config\
│   │   └── env.ts
│   │
│   ├── constants\
│   │   ├── base-items.ts
│   │   ├── funnel-templates.ts
│   │   └── theme.ts
│   │
│   ├── db\
│   │   ├── cached-queries.ts
│   │   ├── drizzle.ts
│   │   ├── queries.ts
│   │   ├── schema.ts
│   │   ├── seed.ts
│   │   ├── setup.ts
│   │   ├── migrations\
│   │   │   ├── 0000_numerous_the_spike.sql
│   │   │   ├── 0001_lyrical_dark_phoenix.sql
│   │   │   ├── 0002_perfect_killer_shrike.sql
│   │   │   ├── 0003_eager_black_bolt.sql
│   │   │   ├── 0004_mixed_tyger_tiger.sql
│   │   │   ├── 0005_add_guidelines_to_stages.sql
│   │   │   ├── 0006_familiar_boom_boom.sql
│   │   │   ├── 0007_daffy_radioactive_man.sql
│   │   │   ├── 0008_lively_black_bolt.sql
│   │   │   ├── 0009_remarkable_inertia.sql
│   │   │   ├── 0010_greedy_cobalt_man.sql
│   │   │   ├── 0011_add-clients-and-proposals-tables.sql
│   │   │   ├── 0012_secret_vivisector.sql
│   │   │   ├── 0013_swift_microbe.sql
│   │   │   ├── relations.ts
│   │   │   ├── schema.ts
│   │   │   └── meta\
│   │   │       ├── 0000_snapshot.json
│   │   │       ├── 0001_snapshot.json
│   │   │       ├── 0002_snapshot.json
│   │   │       ├── 0003_snapshot.json
│   │   │       ├── 0004_snapshot.json
│   │   │       ├── 0005_snapshot.json
│   │   │       ├── 0006_snapshot.json
│   │   │       ├── 0007_snapshot.json
│   │   │       ├── 0008_snapshot.json
│   │   │       ├── 0009_snapshot.json
│   │   │       ├── 0010_snapshot.json
│   │   │       ├── 0011_snapshot.json
│   │   │       ├── 0012_snapshot.json
│   │   │       ├── 0013_snapshot.json
│   │   │       └── _journal.json
│   │   ├── queries\
│   │   │   ├── activity.ts
│   │   │   ├── agency.ts
│   │   │   ├── auth.ts
│   │   │   ├── clients.ts
│   │   │   └── sales-funnels.ts
│   │   ├── query-builders\
│   │   │   └── operators.ts
│   │   └── schema\
│   │       ├── activity.ts
│   │       ├── agency.ts
│   │       ├── auth.ts
│   │       ├── clients.ts
│   │       ├── index.ts
│   │       ├── users.ts
│   │       ├── catalog\
│   │       │   └── index.ts
│   │       ├── funnels\
│   │       │   └── index.ts
│   │       └── operators\
│   │           └── index.ts
│   │
│   ├── hooks\
│   │   └── use-modal.ts
│   │
│   ├── payments\
│   │   ├── actions.ts
│   │   └── stripe.ts
│   │
│   ├── services\
│   │   ├── activity-logger.ts
│   │   ├── rate-limiter.ts
│   │   ├── activity-logger\
│   │   │   └── index.ts
│   │   ├── cache\
│   │   │   ├── README.md
│   │   │   ├── examples.ts
│   │   │   ├── index.ts
│   │   │   ├── manager.ts
│   │   │   ├── memory-cache.ts
│   │   │   ├── redis-cache.ts
│   │   │   ├── tagged-cache.ts
│   │   │   └── types.ts
│   │   ├── error-handler\
│   │   │   ├── README.md
│   │   │   ├── action-wrapper.ts
│   │   │   ├── database-errors.ts
│   │   │   └── index.ts
│   │   └── rate-limiter\
│   │       ├── README.md
│   │       └── index.ts
│   │
│   ├── types\
│   │   ├── interactions.ts
│   │   ├── tasks.ts
│   │   └── clients\
│   │       └── index.ts
│   │
│   ├── utils.ts
│   ├── utils\
│   │   ├── dates.ts
│   │   └── icons.ts
│   │
│   └── validations\
│       ├── auth.schema.ts
│       ├── clients.ts
│       ├── common.schema.ts
│       ├── email-unique.ts
│       ├── interactions.ts
│       ├── tasks.ts
│       ├── catalog\
│       │   ├── category.schema.ts
│       │   ├── field.schema.ts
│       │   ├── index.ts
│       │   └── item.schema.ts
│       ├── clients\
│       │   └── client.schema.ts
│       ├── funnels\
│       │   ├── funnel.schema.ts
│       │   ├── index.ts
│       │   └── stage.schema.ts
│       ├── operators\
│       │   ├── association.schema.ts
│       │   ├── commission.schema.ts
│       │   └── operator.schema.ts
│       └── users\
│           ├── create-user-action.schema.ts
│           ├── delete-user.schema.ts
│           ├── update-user.schema.ts
│           └── user.schema.ts
│
├── node_modules\
│   └── [dependências npm...]
│
├── providers\
│   └── theme-provider.tsx
│
├── scripts\
│   ├── fix-clients-without-funnel.ts
│   ├── test-validate-error.ts
│   └── validate-env.ts
│
└── styles\
    ├── buttons.css
    ├── components.css
    ├── forms.css
    └── modals.css
```

## Resumo da Arquitetura

### **Tecnologias Principais**
- **Framework:** Next.js 15 com App Router
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL com Drizzle ORM
- **Estilização:** CSS Modules + Tailwind CSS
- **Autenticação:** JWT com cookies httpOnly
- **Pagamentos:** Stripe
- **Testes:** Jest
- **Gerenciador de Pacotes:** PNPM

### **Principais Características**

#### **Tipos de Arquivos**
- **`.tsx/.ts`** - Componentes React e lógica do servidor
- **`.module.css`** - Estilos específicos de componentes
- **`.css`** - Estilos globais
- **`.sql`** - Migrações de banco de dados
- **`.test.ts`** - Testes automatizados
- **`.md`** - Documentação

#### **Estrutura Modular**
- **`app/`** - Pages do Next.js App Router
  - **`(dashboard)/`** - Rotas protegidas
  - **`(login)/`** - Páginas públicas de autenticação
  - **`api/`** - Endpoints da API

- **`components/`** - Componentes React organizados por funcionalidade
  - **`catalog/`** - Gestão de catálogo de produtos
  - **`clients/`** - Gestão de clientes
  - **`funnels/`** - Funis de vendas
  - **`operators/`** - Gestão de operadoras
  - **`users/`** - Gestão de usuários
  - **`ui/`** - Componentes de interface reutilizáveis

- **`lib/`** - Lógica de negócio central
  - **`actions/`** - Server Actions do Next.js
  - **`auth/`** - Sistema de autenticação
  - **`db/`** - Configuração e esquemas do banco
  - **`services/`** - Serviços (cache, rate limiting, logging)
  - **`validations/`** - Esquemas de validação Zod

#### **Sistema Multi-tenant**
- Filtragem por `agencyId` em todas as consultas
- Roles de usuário: developer, master, administrator, agent
- Sistema de permissões baseado em middleware

#### **Padrões de Desenvolvimento**
- Server Components por padrão
- CSS Modules para evitar conflitos de estilo
- Validação com Zod
- Error handling centralizado
- Cache system com fallback Redis → Memory
- Rate limiting para APIs
- CSRF protection

Este arquivo serve como referência completa para navegação e entendimento da estrutura do projeto.