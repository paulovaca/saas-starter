# 📘 GUIA DE IMPLEMENTAÇÃO - FASE 4: MÓDULO FINANCEIRO COMPLETO

## 🎯 Status Atual e Objetivo

### ✅ O que já está implementado:
- **Sistema de Reservas (Bookings)** - Totalmente funcional
  - Criação automática de reservas quando propostas são aceitas
  - Gestão de status com histórico completo
  - Sistema de documentos com upload
  - Timeline de eventos
  - Anotações e observações
  - Sincronização com propostas
- **CRM Completo** (Fases 1-3)
  - Gestão de clientes, operadores e catálogo
  - Sistema de propostas com aprovação
  - Funis de vendas personalizados
  - Sistema de permissões RBAC

### 🎯 O que vamos implementar nesta fase:
Implementar o **Módulo Financeiro Completo** com gestão de comissões, pagamentos e relatórios financeiros, integrando com o sistema de reservas existente.

## ✅ Pré-requisitos da Fase 4

Antes de começar, confirme que você tem:
- [x] Sistema de reservas funcionando
- [x] Pelo menos uma proposta aceita convertida em reserva
- [x] Sistema de permissões configurado
- [x] Activity log registrando ações
- [ ] Configuração de regras de comissão nas operadoras

## 🚀 IMPLEMENTAÇÃO DO MÓDULO FINANCEIRO

### 💰 MÓDULO 1: ESTRUTURA BASE FINANCEIRA

#### Etapa 1.1: Criar estrutura de pastas

```bash
# Execute no terminal
mkdir -p app/(dashboard)/finance
mkdir -p app/(dashboard)/finance/commissions
mkdir -p app/(dashboard)/finance/transactions
mkdir -p app/(dashboard)/finance/reports
mkdir -p app/(dashboard)/my-commissions
mkdir -p lib/actions/finance
mkdir -p lib/validations/finance
mkdir -p lib/services/finance
mkdir -p components/finance
mkdir -p components/finance/charts
mkdir -p components/finance/forms
```

#### Etapa 1.2: Criar schema financeiro

**Arquivo**: `lib/db/schema/finance.ts`

```typescript
// Estrutura das tabelas financeiras necessárias:

// 1. Tabela de comissões
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id").notNull(),
  userId: uuid("user_id").notNull(), // Agente que receberá
  proposalId: uuid("proposal_id").notNull(),
  bookingId: uuid("booking_id"), // Vincula com reserva
  
  // Valores
  baseValue: decimal("base_value", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  calculatedValue: decimal("calculated_value", { precision: 10, scale: 2 }).notNull(),
  adjustedValue: decimal("adjusted_value", { precision: 10, scale: 2 }), // Após ajustes
  finalValue: decimal("final_value", { precision: 10, scale: 2 }).notNull(),
  
  // Status
  status: commissionStatusEnum("status").notNull().default("pending"),
  
  // Datas
  referenceMonth: varchar("reference_month", { length: 7 }), // YYYY-MM
  calculatedAt: timestamp("calculated_at"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by"),
  paidAt: timestamp("paid_at"),
  
  // Metadados
  metadata: jsonb("metadata"), // Detalhes do cálculo, splits, etc
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// 2. Tabela de ajustes de comissão
export const commissionAdjustments = pgTable("commission_adjustments", {
  id: uuid("id").primaryKey().defaultRandom(),
  commissionId: uuid("commission_id").notNull(),
  
  reason: text("reason").notNull(),
  adjustmentType: adjustmentTypeEnum("adjustment_type").notNull(), // bonus, discount, correction
  oldValue: decimal("old_value", { precision: 10, scale: 2 }).notNull(),
  newValue: decimal("new_value", { precision: 10, scale: 2 }).notNull(),
  difference: decimal("difference", { precision: 10, scale: 2 }).notNull(),
  
  adjustedBy: uuid("adjusted_by").notNull(),
  adjustedAt: timestamp("adjusted_at").defaultNow().notNull(),
  
  metadata: jsonb("metadata")
});

// 3. Tabela de transações financeiras
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id").notNull(),
  
  type: transactionTypeEnum("type").notNull(), // income, expense
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  
  // Referências opcionais
  proposalId: uuid("proposal_id"),
  bookingId: uuid("booking_id"),
  commissionId: uuid("commission_id"),
  
  // Anexos
  attachments: jsonb("attachments").$type<Array<{
    name: string;
    url: string;
    type: string;
  }>>(),
  
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// 4. Tabela de confirmações de pagamento
export const paymentConfirmations = pgTable("payment_confirmations", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposalId: uuid("proposal_id").notNull(),
  bookingId: uuid("booking_id"),
  
  paymentDate: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  
  receipt: jsonb("receipt"), // URL do comprovante
  notes: text("notes"),
  
  confirmedBy: uuid("confirmed_by").notNull(),
  confirmedAt: timestamp("confirmed_at").defaultNow().notNull()
});

// 5. Tabela de metas e bonificações
export const commissionTargets = pgTable("commission_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  agencyId: uuid("agency_id").notNull(),
  userId: uuid("user_id"), // null = meta da agência
  
  targetMonth: varchar("target_month", { length: 7 }).notNull(), // YYYY-MM
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  achievedValue: decimal("achieved_value", { precision: 10, scale: 2 }).default(0),
  
  bonusPercentage: decimal("bonus_percentage", { precision: 5, scale: 2 }), // Bônus se atingir
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
```

#### Etapa 1.3: Criar enums e tipos

**Arquivo**: `lib/db/schema/finance.ts` (adicionar no início)

```typescript
// Enums
export const commissionStatusEnum = pgEnum("commission_status", [
  "pending",      // Aguardando pagamento do cliente
  "confirmed",    // Pagamento confirmado, aguardando cálculo
  "calculated",   // Calculada, aguardando aprovação
  "approved",     // Aprovada para pagamento
  "paid",         // Paga ao agente
  "cancelled",    // Cancelada
  "adjusted"      // Ajustada manualmente
]);

export const adjustmentTypeEnum = pgEnum("adjustment_type", [
  "bonus",        // Bonificação
  "discount",     // Desconto
  "correction",   // Correção de valor
  "split",        // Divisão entre agentes
  "target_bonus"  // Bônus por meta
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",       // Receita
  "expense"       // Despesa
]);

// Categorias de transação (não enum, para flexibilidade)
export const TRANSACTION_CATEGORIES = {
  income: [
    "commission",
    "service",
    "product",
    "other_income"
  ],
  expense: [
    "salary",
    "rent",
    "utilities",
    "marketing",
    "office",
    "other_expense"
  ]
} as const;
```

#### Etapa 1.4: Executar migrations

```bash
npm run db:generate
npm run db:migrate
```

### 📊 MÓDULO 2: CALCULADORA DE COMISSÕES

#### Etapa 2.1: Criar serviço de cálculo

**Arquivo**: `lib/services/finance/commission-calculator.ts`

```typescript
// Estrutura do calculador de comissões
export class CommissionCalculator {
  // Calcular comissão base
  calculateBase(proposal: Proposal, rules: CommissionRule[]): number
  
  // Aplicar ajustes (metas, bônus, splits)
  applyAdjustments(baseValue: number, adjustments: Adjustment[]): number
  
  // Calcular split entre múltiplos agentes
  calculateSplit(totalValue: number, agents: Agent[]): SplitResult[]
  
  // Verificar e aplicar bônus de meta
  checkTargetBonus(userId: string, month: string): number
  
  // Gerar detalhamento do cálculo
  generateBreakdown(calculation: CalculationResult): CommissionBreakdown
}
```

#### Etapa 2.2: Criar triggers automáticos

**Arquivo**: `lib/actions/finance/commission-triggers.ts`

```typescript
// Triggers que devem ser implementados:

// 1. Quando pagamento é confirmado
export async function onPaymentConfirmed(proposalId: string) {
  // Buscar proposta e regras de comissão
  // Calcular comissão base
  // Aplicar ajustes e bônus
  // Criar registro de comissão
  // Notificar agente
}

// 2. Quando reserva muda de status
export async function onBookingStatusChanged(bookingId: string, newStatus: string) {
  // Se cancelada: marcar comissão como cancelada
  // Se instalada: liberar comissão para pagamento
  // Se suspensa: suspender comissão
}

// 3. Fim do mês - calcular bônus de meta
export async function calculateMonthlyTargets() {
  // Buscar todas as vendas do mês
  // Comparar com metas
  // Aplicar bônus se atingido
  // Gerar relatório
}
```

### 💼 MÓDULO 3: INTERFACE DO FINANCEIRO

#### Etapa 3.1: Dashboard financeiro principal

**Arquivo**: `app/(dashboard)/finance/page.tsx`

Componentes necessários:
- Cards de resumo (receitas, despesas, lucro, comissões pendentes)
- Gráfico de evolução mensal (últimos 12 meses)
- Tabela de transações recentes
- Atalhos rápidos (confirmar pagamento, lançar despesa, aprovar comissões)

#### Etapa 3.2: Gestão de comissões (Admin/Master)

**Arquivo**: `app/(dashboard)/finance/commissions/page.tsx`

Funcionalidades:
- Tabela com todas as comissões
- Filtros por: agente, status, período, operadora
- Ações em lote: aprovar, ajustar, pagar
- Detalhamento do cálculo ao clicar
- Exportação para Excel/PDF

#### Etapa 3.3: Minhas comissões (Agentes)

**Arquivo**: `app/(dashboard)/my-commissions/page.tsx`

Funcionalidades:
- Resumo do mês atual (vendas, comissões, meta)
- Histórico de comissões
- Detalhamento por proposta
- Status de pagamentos
- Projeção de ganhos

#### Etapa 3.4: Confirmação de pagamentos

**Arquivo**: `components/finance/forms/payment-confirmation.tsx`

Campos:
- Seletor de proposta/reserva
- Data do pagamento
- Valor recebido
- Método de pagamento
- Upload de comprovante
- Observações

Validações:
- Valor não pode ser menor que o da proposta (sem autorização)
- Data não pode ser futura
- Comprovante obrigatório para valores altos

#### Etapa 3.5: Lançamentos manuais

**Arquivo**: `components/finance/forms/manual-transaction.tsx`

Campos:
- Tipo (receita/despesa)
- Categoria (dropdown dinâmico)
- Descrição detalhada
- Valor
- Data
- Anexos opcionais
- Vincular a proposta/reserva (opcional)

### 📈 MÓDULO 4: RELATÓRIOS E GRÁFICOS

#### Etapa 4.1: Página de relatórios

**Arquivo**: `app/(dashboard)/finance/reports/page.tsx`

Tipos de relatório:
1. **Comissões por período**: Detalhamento de todas as comissões
2. **Performance por agente**: Ranking e evolução individual
3. **Análise por operadora**: Qual operadora gera mais comissão
4. **Fluxo de caixa**: Entradas e saídas detalhadas
5. **Previsão de recebimentos**: Baseado em propostas aceitas

#### Etapa 4.2: Componentes de visualização

**Pasta**: `components/finance/charts/`

Criar componentes:
- `revenue-chart.tsx`: Gráfico de linha com evolução de receita
- `commission-distribution.tsx`: Pizza com distribuição por agente
- `cash-flow-chart.tsx`: Barras com entradas vs saídas
- `agent-ranking.tsx`: Ranking de vendas com barras horizontais
- `target-progress.tsx`: Indicador de progresso de meta

### 🔧 MÓDULO 5: ACTIONS E VALIDAÇÕES

#### Etapa 5.1: Actions financeiras

**Pasta**: `lib/actions/finance/`

Criar actions:
```typescript
// confirm-payment.ts
export const confirmPayment = createPermissionAction(
  confirmPaymentSchema,
  Permission.FINANCE_MANAGE,
  async (input, user) => {
    // Validar proposta existe
    // Criar registro de pagamento
    // Disparar cálculo de comissão
    // Atualizar status da reserva
    // Registrar no activity log
  }
);

// calculate-commissions.ts
export const calculateCommissions = createPermissionAction(
  calculateCommissionsSchema,
  Permission.FINANCE_MANAGE,
  async (input, user) => {
    // Buscar propostas do período
    // Aplicar regras de cálculo
    // Considerar metas e bônus
    // Gerar registros de comissão
  }
);

// approve-commissions.ts
export const approveCommissions = createPermissionAction(
  approveCommissionsSchema,
  Permission.FINANCE_MANAGE,
  async (input, user) => {
    // Validar comissões existem
    // Atualizar status para approved
    // Registrar quem aprovou
    // Notificar agentes
  }
);

// adjust-commission.ts
export const adjustCommission = createPermissionAction(
  adjustCommissionSchema,
  Permission.FINANCE_MANAGE,
  async (input, user) => {
    // Criar registro de ajuste
    // Recalcular valor final
    // Justificar mudança
    // Notificar agente afetado
  }
);

// create-transaction.ts
export const createTransaction = createPermissionAction(
  createTransactionSchema,
  Permission.FINANCE_MANAGE,
  async (input, user) => {
    // Validar categoria
    // Criar transação
    // Atualizar saldos
    // Anexar comprovantes
  }
);
```

#### Etapa 5.2: Validações Zod

**Arquivo**: `lib/validations/finance/index.ts`

```typescript
// Schemas de validação necessários
export const confirmPaymentSchema = z.object({
  proposalId: z.string().uuid(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().positive(),
  paymentMethod: z.string().optional(),
  receipt: z.object({
    url: z.string().url(),
    name: z.string()
  }).optional(),
  notes: z.string().optional()
});

export const adjustCommissionSchema = z.object({
  commissionId: z.string().uuid(),
  adjustmentType: z.enum(['bonus', 'discount', 'correction']),
  newValue: z.number().positive(),
  reason: z.string().min(10, "Justificativa deve ter pelo menos 10 caracteres")
});

// Adicionar outros schemas...
```

### 🔄 MÓDULO 6: INTEGRAÇÕES

#### Etapa 6.1: Sincronização Booking-Finance

**Arquivo**: `lib/services/finance/booking-sync.ts`

```typescript
// Sincronizar mudanças de status
export async function syncBookingStatus(bookingId: string, newStatus: string) {
  switch(newStatus) {
    case 'cancelled':
      // Cancelar comissões relacionadas
      await cancelRelatedCommissions(bookingId);
      break;
    case 'active':
      // Liberar comissões para pagamento
      await releaseCommissions(bookingId);
      break;
    case 'suspended':
      // Suspender comissões
      await suspendCommissions(bookingId);
      break;
  }
}
```

#### Etapa 6.2: Notificações automáticas

**Arquivo**: `lib/services/finance/notifications.ts`

Notificações necessárias:
- Comissão calculada
- Comissão aprovada
- Pagamento confirmado
- Meta atingida
- Ajuste realizado

### ✅ TESTES E VALIDAÇÃO

#### Testes do fluxo financeiro

1. **Teste de cálculo de comissão**:
   - Confirmar pagamento de uma proposta
   - Verificar cálculo automático correto
   - Validar aplicação de regras da operadora

2. **Teste de ajustes**:
   - Fazer ajuste manual em comissão
   - Verificar histórico de mudanças
   - Confirmar notificação ao agente

3. **Teste de aprovação em lote**:
   - Selecionar múltiplas comissões
   - Aprovar todas
   - Verificar mudança de status

4. **Teste de relatórios**:
   - Gerar relatório mensal
   - Verificar precisão dos dados
   - Exportar para Excel

5. **Teste de permissões**:
   - Agente vê apenas suas comissões
   - Admin pode aprovar e ajustar
   - Master tem acesso total

### 📋 Checklist de Conclusão

- [ ] Schema financeiro criado e migrado
- [ ] Calculadora de comissões funcionando
- [ ] Confirmação de pagamentos operacional
- [ ] Dashboard financeiro com métricas reais
- [ ] Gestão de comissões para admin
- [ ] Página "Minhas Comissões" para agentes
- [ ] Lançamentos manuais funcionando
- [ ] Relatórios sendo gerados corretamente
- [ ] Gráficos interativos implementados
- [ ] Sincronização com bookings ativa
- [ ] Notificações automáticas configuradas
- [ ] Exportação de dados funcionando
- [ ] Permissões respeitadas em todas as páginas
- [ ] Activity log registrando ações financeiras

### 🎯 Próximos Passos

Com o módulo financeiro completo:
- **Fase 5**: Integrações externas (NF-e, boletos, gateway de pagamento)
- **Fase 6**: Analytics avançado e BI
- **Fase 7**: Automações e workflows customizáveis

### 💡 Dicas Importantes

1. **Precisão monetária**: Use tipos `decimal` no banco, nunca `float`
2. **Auditoria completa**: Toda alteração financeira deve ter justificativa
3. **Imutabilidade**: Comissões pagas nunca devem ser alteradas, apenas ajustadas com novo registro
4. **Performance**: Implemente cache para relatórios pesados
5. **Segurança**: Logs detalhados de todas as operações financeiras
6. **Backup**: Implemente rotina de backup específica para dados financeiros
7. **Conformidade**: Prepare estrutura para futuras integrações fiscais

### 🔒 Considerações de Segurança

- Implementar rate limiting em operações financeiras
- Dupla confirmação para valores acima de limites
- Logs imutáveis de todas as transações
- Criptografia de dados sensíveis
- Sessões com timeout reduzido em páginas financeiras
- Notificação imediata de atividades suspeitas

---

🎉 **Parabéns!** Com a conclusão da Fase 4, seu sistema terá um módulo financeiro robusto e completo, pronto para gerenciar comissões, pagamentos e fornecer insights financeiros valiosos para a agência!