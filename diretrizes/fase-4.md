# 📘 GUIA DE IMPLEMENTAÇÃO DETALHADO - FASE 4: PÓS-VENDA E FINANCEIRO

## 🎯 O que vamos fazer nesta fase

Com o CRM operacional (Fases 1-3), agora vamos implementar o sistema de **Reservas** (pós-venda) e o **Módulo Financeiro** completo. Estes módulos garantem o acompanhamento após a venda e o controle financeiro de comissões e pagamentos.

## ✅ Pré-requisitos da Fase 4

Antes de começar, confirme que você tem:
- [ ] Fases 1, 2 e 3 completamente implementadas
- [ ] Pelo menos uma proposta aceita no sistema
- [ ] Sistema de logs funcionando
- [ ] Permissões configuradas corretamente
- [x] Implantação de claro e escuro. 
- [x] Criação de arquivos individuais css. Nao aceitar estilos inline. 

## 🚀 PASSO A PASSO DETALHADO

### 📋 MÓDULO 1: SISTEMA DE RESERVAS

#### Etapa 1.1: Criar estrutura para reservas

No terminal do VS Code, execute:

```bash
# Criar estrutura de pastas para reservas
mkdir -p app/(dashboard)/bookings
mkdir -p app/(dashboard)/bookings/[bookingId]
mkdir -p lib/actions/bookings
mkdir -p lib/validations/bookings
mkdir -p components/bookings
mkdir -p components/bookings/documents
mkdir -p components/bookings/status
mkdir -p lib/services/storage
```

#### Etapa 1.2: Criar schema para reservas

1. Na pasta `lib/db/schema`, crie o arquivo `bookings.ts`
2. **Este arquivo servirá para**: Definir tabelas do sistema de reservas
3. **Tabelas necessárias**:
   - `bookings`: id, proposalId, bookingNumber, status, notes, createdAt
   - `booking_status_history`: id, bookingId, previousStatus, newStatus, reason, userId, createdAt
   - `booking_documents`: id, bookingId, documentType, fileName, fileUrl, uploadedBy, uploadedAt
   - `booking_timeline`: id, bookingId, eventType, description, userId, createdAt

#### Etapa 1.3: Definir tipos de status

1. Na pasta `lib/types`, crie `booking-status.ts`
2. **Este arquivo servirá para**: Definir todos os status possíveis
3. **Status necessários**:
   - `pending_documents`: Aguardando documentos
   - `under_analysis`: Em análise
   - `approved`: Aprovado
   - `pending_installation`: Aguardando instalação
   - `installed`: Instalado
   - `active`: Ativo
   - `cancelled`: Cancelado
   - `suspended`: Suspenso

#### Etapa 1.4: Executar migrations

No terminal:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 1.5: Criar trigger de geração automática

1. Na pasta `lib/actions/bookings`, crie `booking-triggers.ts`
2. **Este arquivo servirá para**: Criar reserva automaticamente quando proposta é aceita
3. **Funcionalidades**:
   - Gerar número único de reserva
   - Copiar dados da proposta
   - Definir status inicial
   - Notificar responsáveis

#### Etapa 1.6: Criar página de listagem de reservas

1. Na pasta `app/(dashboard)/bookings`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todas as reservas
3. **Funcionalidades essenciais**:
   - Tabela com número, cliente, status, data
   - Filtros por status e período
   - Indicadores visuais por status (cores)
   - Busca por número ou cliente
   - **Permissões**: Agentes veem apenas suas reservas

#### Etapa 1.7: Criar página de detalhes da reserva

1. Na pasta `app/(dashboard)/bookings/[bookingId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Central de gestão da reserva
3. **Seções necessárias**:
   - Header com informações principais
   - Timeline de eventos
   - Gestão de documentos
   - Mudança de status
   - Dados da proposta original
   - Anotações internas

#### Etapa 1.8: Criar sistema de upload de documentos

1. Na pasta `components/bookings/documents`, crie `document-uploader.tsx`
2. **Este arquivo servirá para**: Upload e gestão de documentos
3. **Tipos de documento**:
   - RG/CPF
   - Comprovante de residência
   - Comprovante de renda
   - Contrato assinado
   - Outros documentos

#### Etapa 1.9: Criar componente de mudança de status

1. Na pasta `components/bookings/status`, crie `status-changer.tsx`
2. **Este arquivo servirá para**: Alterar status com justificativa
3. **Funcionalidades**:
   - Seletor de novo status (apenas válidos)
   - Campo obrigatório de justificativa
   - Confirmação para status críticos
   - Registro automático no histórico

#### Etapa 1.10: Configurar storage de arquivos

1. Na pasta `lib/services/storage`, crie `file-storage.ts`
2. **Este arquivo servirá para**: Gerenciar upload e download de arquivos
3. **Funcionalidades**:
   - Upload para cloud (S3, Cloudinary, etc)
   - Validação de tipos permitidos
   - Compressão de imagens
   - URLs temporárias para download

#### Etapa 1.11: Criar actions de reservas

1. Na pasta `lib/actions/bookings`, crie:
   - `create-booking.ts` - **Servirá para**: Criar reserva manualmente
   - `update-booking-status.ts` - **Servirá para**: Mudar status com validações
   - `upload-document.ts` - **Servirá para**: Fazer upload de documento
   - `delete-document.ts` - **Servirá para**: Remover documento
   - `add-note.ts` - **Servirá para**: Adicionar anotação
   - `get-bookings.ts` - **Servirá para**: Buscar reservas com filtros

### 💰 MÓDULO 2: SISTEMA FINANCEIRO

#### Etapa 2.1: Criar estrutura financeira

No terminal:

```bash
# Criar estrutura de pastas para financeiro
mkdir -p app/(dashboard)/finance
mkdir -p app/(dashboard)/finance/commissions
mkdir -p app/(dashboard)/finance/transactions
mkdir -p app/(dashboard)/finance/reports
mkdir -p lib/actions/finance
mkdir -p lib/validations/finance
mkdir -p components/finance
mkdir -p components/finance/charts
mkdir -p lib/services/commission-calculator
```

#### Etapa 2.2: Criar schema financeiro

1. Na pasta `lib/db/schema`, crie `finance.ts`
2. **Este arquivo servirá para**: Definir tabelas financeiras
3. **Tabelas necessárias**:
   - `commissions`: id, userId, proposalId, baseValue, percentage, finalValue, status, paidAt
   - `commission_adjustments`: id, commissionId, reason, oldValue, newValue, adjustedBy
   - `financial_transactions`: id, type, category, description, value, date, agencyId
   - `payment_confirmations`: id, proposalId, paymentDate, amount, confirmedBy

#### Etapa 2.3: Criar calculadora de comissões

1. Na pasta `lib/services/commission-calculator`, crie `index.ts`
2. **Este arquivo servirá para**: Calcular comissões com regras complexas
3. **Funcionalidades**:
   - Aplicar tabela de comissões da operadora
   - Considerar metas e bonificações
   - Calcular splits (divisão entre agentes)
   - Aplicar descontos e ajustes

#### Etapa 2.4: Criar trigger de cálculo automático

1. Na pasta `lib/actions/finance`, crie `commission-triggers.ts`
2. **Este arquivo servirá para**: Calcular comissão quando pagamento é confirmado
3. **Fluxo**:
   - Proposta aceita → Comissão pendente
   - Pagamento confirmado → Comissão aprovada
   - Ciclo fechado → Comissão liberada

#### Etapa 2.5: Criar dashboard financeiro global

1. Na pasta `app/(dashboard)/finance`, crie `page.tsx`
2. **Este arquivo servirá para**: Visão geral financeira (Master/Admin)
3. **Componentes**:
   - Cards com totais (vendas, comissões, despesas)
   - Gráfico de evolução mensal
   - Tabela de últimas transações
   - Filtros por período

#### Etapa 2.6: Criar página de comissões

1. Na pasta `app/(dashboard)/finance/commissions`, crie `page.tsx`
2. **Este arquivo servirá para**: Gerenciar comissões
3. **Para Admin/Master**:
   - Lista todas as comissões
   - Filtros por agente, status, período
   - Ações de aprovar/ajustar
   - Exportar relatório

#### Etapa 2.7: Criar página "Minhas Comissões"

1. Crie também `app/(dashboard)/my-commissions/page.tsx`
2. **Este arquivo servirá para**: Agentes verem suas comissões
3. **Funcionalidades**:
   - Apenas comissões do agente logado
   - Resumo do mês atual
   - Histórico de pagamentos
   - Detalhamento por proposta

#### Etapa 2.8: Criar sistema de confirmação de pagamento

1. Na pasta `components/finance`, crie `payment-confirmation.tsx`
2. **Este arquivo servirá para**: Confirmar pagamento de propostas
3. **Campos necessários**:
   - Data do pagamento
   - Valor recebido
   - Comprovante (upload)
   - Observações

#### Etapa 2.9: Criar relatórios financeiros

1. Na pasta `app/(dashboard)/finance/reports`, crie `page.tsx`
2. **Este arquivo servirá para**: Gerar relatórios detalhados
3. **Tipos de relatório**:
   - Comissões por período
   - Vendas por operadora
   - Performance por agente
   - Fluxo de caixa

#### Etapa 2.10: Criar gráficos interativos

1. Na pasta `components/finance/charts`, crie:
   - `revenue-chart.tsx` - Evolução de receita
   - `commission-chart.tsx` - Distribuição de comissões
   - `agent-ranking.tsx` - Ranking de vendas

#### Etapa 2.11: Criar sistema de lançamentos manuais

1. Na pasta `components/finance`, crie `manual-transaction.tsx`
2. **Este arquivo servirá para**: Registrar receitas/despesas extras
3. **Campos**:
   - Tipo (receita/despesa)
   - Categoria
   - Descrição
   - Valor
   - Data
   - Anexos

#### Etapa 2.12: Criar actions financeiras

1. Na pasta `lib/actions/finance`, crie:
   - `confirm-payment.ts` - **Servirá para**: Confirmar pagamento de proposta
   - `calculate-commissions.ts` - **Servirá para**: Calcular comissões
   - `adjust-commission.ts` - **Servirá para**: Ajustar valor de comissão
   - `approve-commissions.ts` - **Servirá para**: Aprovar lote de comissões
   - `create-transaction.ts` - **Servirá para**: Criar lançamento manual
   - `generate-report.ts` - **Servirá para**: Gerar relatórios

### 🔗 INTEGRAÇÕES ENTRE MÓDULOS

#### Etapa 3.1: Conectar reservas com financeiro

1. Crie `lib/services/booking-finance-sync.ts`
2. **Este arquivo servirá para**: Sincronizar status entre módulos
3. **Regras**:
   - Reserva cancelada → Estornar comissão
   - Instalação concluída → Liberar comissão
   - Documento pendente → Notificar financeiro

#### Etapa 3.2: Criar notificações automáticas

1. Na pasta `lib/services`, crie `notification-scheduler.ts`
2. **Este arquivo servirá para**: Enviar notificações programadas
3. **Exemplos**:
   - Documentos pendentes há 3 dias
   - Comissões aprovadas
   - Pagamentos vencidos

### ✅ TESTES E VALIDAÇÃO

#### Etapa 4.1: Testar fluxo de reservas

1. Aceite uma proposta e verifique criação automática
2. Faça upload de 3 documentos diferentes
3. Mude status com justificativas
4. Verifique timeline completa
5. Teste permissões de visualização

#### Etapa 4.2: Testar fluxo financeiro

1. Confirme pagamento de uma proposta
2. Verifique cálculo automático de comissão
3. Faça um ajuste manual
4. Aprove lote de comissões
5. Gere relatório mensal
6. Crie lançamento manual

#### Etapa 4.3: Testar integrações

1. Cancele uma reserva e verifique estorno
2. Complete instalação e verifique liberação
3. Teste notificações automáticas

### 📋 Checklist de Conclusão da Fase 4

- [ ] Reservas sendo criadas automaticamente
- [ ] Upload de documentos funcionando
- [ ] Timeline de eventos registrando tudo
- [ ] Mudanças de status com histórico
- [ ] Cálculo automático de comissões
- [ ] Dashboard financeiro com métricas
- [ ] Agentes visualizando suas comissões
- [ ] Relatórios sendo gerados corretamente
- [ ] Notificações automáticas funcionando
- [ ] Permissões respeitadas em todos módulos

### 🎯 Próximos Passos

Com o sistema completo de pós-venda e financeiro:
- **Fase 5**: Relatórios avançados, logs detalhados e configurações

### 💡 Dicas Importantes para a Fase 4

1. **Segurança em primeiro lugar** - Dados financeiros são críticos
2. **Auditoria completa** - Todo valor alterado deve ter justificativa
3. **Backup de documentos** - Implemente redundância no storage
4. **Cálculos precisos** - Use bibliotecas para cálculos monetários
5. **Validações rigorosas** - Impeça alterações indevidas em comissões
6. **Performance em relatórios** - Use queries otimizadas e cache

---

Parabéns! Com a Fase 4 completa, você tem um sistema robusto de CRM com controle financeiro completo. O sistema está quase pronto para produção! 💪