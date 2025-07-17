# 📘 GUIA DE IMPLEMENTAÇÃO DETALHADO - FASE 3: CORE DO CRM (CLIENTES E PROPOSTAS)

## 🎯 O que vamos fazer nesta fase

Com toda a infraestrutura (Fase 1) e configurações (Fase 2) prontas, agora vamos construir o coração do sistema: os módulos de **Clientes** e **Propostas**. Estes são os módulos mais utilizados no dia a dia pelos agentes.

## ✅ Pré-requisitos da Fase 3

Antes de começar, confirme que você tem:
- [ ] Fases 1 e 2 completamente implementadas
- [ ] Pelo menos um funil de vendas criado
- [ ] Itens no catálogo cadastrados
- [ ] Pelo menos uma operadora com itens associados
- [ ] Sistema rodando sem erros
- [x] Implantação de claro e escuro. 
- [x] Criação de arquivos individuais css. Nao aceitar estilos inline. 

## 🚀 PASSO A PASSO DETALHADO

### 👤 MÓDULO 1: GESTÃO DE CLIENTES

#### Etapa 1.1: Criar estrutura completa para clientes

No terminal do VS Code, execute:

```bash
# Criar estrutura de pastas para clientes
mkdir -p app/(dashboard)/clients
mkdir -p app/(dashboard)/clients/[clientId]
mkdir -p lib/actions/clients
mkdir -p lib/validations/clients
mkdir -p components/clients
mkdir -p components/clients/interactions
mkdir -p components/clients/tasks
```

#### Etapa 1.2: Criar schema do banco para clientes

1. Na pasta `lib/db/schema`, crie ou atualize o arquivo `clients.ts`
2. **Este arquivo servirá para**: Definir todas as tabelas relacionadas a clientes
3. **Tabelas necessárias**:
   - `clients`: id, name, email, phone, cpf, cnpj, address, funnelStageId, assignedAgentId, agencyId, createdAt
   - `client_interactions`: id, clientId, userId, type, content, createdAt
   - `client_tasks`: id, clientId, assignedToId, title, description, dueDate, status, createdAt

#### Etapa 1.3: Executar migrations

No terminal:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 1.4: Criar página de listagem de clientes

1. Na pasta `app/(dashboard)/clients`, crie `page.tsx`
2. **Este arquivo servirá para**: Mostrar todos os clientes respeitando permissões
3. **Funcionalidades essenciais**:
   - Tabela/cards com informações básicas do cliente
   - Indicador visual da etapa do funil (cor e nome)
   - Filtros: por etapa, por agente, por data
   - Busca por nome/CPF/email
   - Botão "Novo Cliente"
   - **Importante**: Agentes só veem seus próprios clientes

#### Etapa 1.5: Criar formulário de novo cliente

1. Na pasta `components/clients`, crie `client-form.tsx`
2. **Este arquivo servirá para**: Formulário completo de cadastro/edição
3. **Campos obrigatórios**:
   - Nome completo
   - CPF ou CNPJ (com validação)
   - Telefone (com máscara brasileira)
   - Email
   - Endereço completo (com busca por CEP)
   - Funil e etapa inicial
   - Agente responsável (auto-preenchido para agents)

#### Etapa 1.6: Criar página de detalhes do cliente

1. Na pasta `app/(dashboard)/clients/[clientId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Central de informações e ações do cliente
3. **Seções necessárias**:
   - Header com informações principais e ações rápidas
   - Timeline de interações
   - Tarefas pendentes
   - Propostas relacionadas
   - Histórico de mudanças de etapa

#### Etapa 1.7: Criar componente de registro de interação

1. Na pasta `components/clients/interactions`, crie `interaction-form.tsx`
2. **Este arquivo servirá para**: Registrar qualquer contato com o cliente
3. **Tipos de interação**:
   - Ligação telefônica
   - WhatsApp
   - Email
   - Reunião presencial
   - Outro (campo para escrita)
   - Observação geral

#### Etapa 1.8: Criar componente de tarefas

1. Na pasta `components/clients/tasks`, crie `task-manager.tsx`
2. **Este arquivo servirá para**: Gerenciar tarefas relacionadas ao cliente
3. **Funcionalidades**:
   - Criar nova tarefa com prazo
   - Marcar como concluída
   - Filtrar por status
   - Notificação de tarefas vencidas

#### Etapa 1.9: Criar sistema de transferência de agente

1. Na pasta `components/clients`, crie `agent-transfer-modal.tsx`
2. **Este arquivo servirá para**: Transferir cliente entre agentes
3. **Campos necessários**:
   - Selecionar novo agente
   - Motivo da transferência (obrigatório)
   - Data efetiva
   - **Nota**: Apenas Master/Admin podem transferir

#### Etapa 1.10: Criar actions de clientes

1. Na pasta `lib/actions/clients`, crie:
   - `create-client.ts` - **Servirá para**: Criar novo cliente com validações
   - `update-client.ts` - **Servirá para**: Atualizar dados do cliente
   - `get-clients.ts` - **Servirá para**: Buscar clientes com filtros e permissões
   - `register-interaction.ts` - **Servirá para**: Salvar nova interação
   - `create-task.ts` - **Servirá para**: Criar tarefa para o cliente
   - `complete-task.ts` - **Servirá para**: Marcar tarefa como concluída
   - `transfer-client.ts` - **Servirá para**: Transferir cliente entre agentes
   - `move-funnel-stage.ts` - **Servirá para**: Mover cliente entre etapas

### 💼 MÓDULO 2: SISTEMA DE PROPOSTAS

#### Etapa 2.1: Criar estrutura para propostas

No terminal:

```bash
# Criar estrutura de pastas para propostas
mkdir -p app/(dashboard)/proposals
mkdir -p app/(dashboard)/proposals/new
mkdir -p app/(dashboard)/proposals/[proposalId]
mkdir -p lib/actions/proposals
mkdir -p lib/validations/proposals
mkdir -p components/proposals
mkdir -p components/proposals/items
mkdir -p lib/services/pdf-generator
```

#### Etapa 2.2: Criar schema para propostas

1. Adicione ao schema as tabelas:
   - `proposals`: id, clientId, operatorId, status, totalValue, commission, validUntil, createdBy, agencyId
   - `proposal_items`: id, proposalId, catalogItemId, customValues, quantity, unitPrice, totalPrice
   - `proposal_history`: id, proposalId, action, userId, details, createdAt

2. Execute migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 2.3: Criar fluxo de nova proposta - Passo 1

1. Na pasta `app/(dashboard)/proposals/new`, crie `page.tsx`
2. **Este arquivo servirá para**: Wizard de criação de proposta
3. **Passo 1 - Selecionar cliente**:
   - Buscar cliente existente
   - Ou criar novo cliente inline
   - Mostrar dados básicos do cliente selecionado

#### Etapa 2.4: Criar seletor de operadora

1. Na pasta `components/proposals`, crie `operator-selector.tsx`
2. **Este arquivo servirá para**: Escolher qual operadora para a proposta
3. **Funcionalidades**:
   - Cards com logo das operadoras ativas
   - Filtro por tipo de produto disponível
   - Destaque para operadoras mais usadas

#### Etapa 2.5: Criar seletor de itens

1. Na pasta `components/proposals/items`, crie `item-selector.tsx`
2. **Este arquivo servirá para**: Adicionar produtos da operadora
3. **Funcionalidades**:
   - Lista de itens disponíveis da operadora
   - Campos personalizados por item
   - Quantidade e valor unitário
   - Cálculo automático do total

#### Etapa 2.6: Criar resumo da proposta

1. Na pasta `components/proposals`, crie `proposal-summary.tsx`
2. **Este arquivo servirá para**: Revisar antes de finalizar
3. **Deve mostrar**:
   - Cliente e operadora
   - Lista de itens com valores
   - Total geral
   - Comissão calculada
   - Validade da proposta

#### Etapa 2.7: Criar página de listagem de propostas

1. Na pasta `app/(dashboard)/proposals`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todas as propostas
3. **Funcionalidades**:
   - Filtros por status (rascunho, enviada, aceita, recusada)
   - Busca por cliente ou número
   - Indicadores visuais de status
   - Valor total e comissão
   - **Permissões**: Agentes veem apenas suas propostas

#### Etapa 2.8: Criar página de detalhes da proposta

1. Na pasta `app/(dashboard)/proposals/[proposalId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Visualizar e gerenciar proposta
3. **Seções**:
   - Informações gerais e status
   - Itens da proposta
   - Ações disponíveis por status
   - Timeline de eventos
   - Botões de exportação

#### Etapa 2.9: Criar gerador de PDF

1. Na pasta `lib/services/pdf-generator`, crie `proposal-pdf.ts`
2. **Este arquivo servirá para**: Gerar PDF profissional da proposta
3. **Deve incluir**:
   - Logo da agência
   - Dados do cliente
   - Detalhamento dos itens
   - Valores e condições
   - Assinatura digital

#### Etapa 2.10: Criar integração com WhatsApp

1. Na pasta `lib/services`, crie `whatsapp-sender.ts`
2. **Este arquivo servirá para**: Enviar proposta por WhatsApp
3. **Funcionalidades**:
   - Gerar link do PDF
   - Criar mensagem formatada
   - Abrir WhatsApp Web com mensagem pronta

#### Etapa 2.11: Criar actions de propostas

1. Na pasta `lib/actions/proposals`, crie:
   - `create-proposal.ts` - **Servirá para**: Criar nova proposta
   - `update-proposal.ts` - **Servirá para**: Editar proposta em rascunho
   - `add-item.ts` - **Servirá para**: Adicionar item à proposta
   - `remove-item.ts` - **Servirá para**: Remover item
   - `send-proposal.ts` - **Servirá para**: Marcar como enviada
   - `accept-proposal.ts` - **Servirá para**: Confirmar aceitação
   - `reject-proposal.ts` - **Servirá para**: Registrar recusa
   - `generate-pdf.ts` - **Servirá para**: Criar PDF da proposta

### 🔗 INTEGRAÇÕES ENTRE CLIENTES E PROPOSTAS

#### Etapa 3.1: Criar widget de propostas no cliente

1. Na pasta `components/clients`, crie `client-proposals-widget.tsx`
2. **Este arquivo servirá para**: Mostrar propostas do cliente
3. **Funcionalidades**:
   - Lista resumida de propostas
   - Status e valores
   - Botão para criar nova proposta
   - Link para detalhes

#### Etapa 3.2: Atualizar etapa do funil automaticamente

1. Crie `lib/services/funnel-automation.ts`
2. **Este arquivo servirá para**: Mover cliente no funil baseado em ações
3. **Regras exemplo**:
   - Ao criar proposta → mover para "Proposta"
   - Ao aceitar proposta → mover para "Fechamento"
   - Configurável por funil

#### Etapa 3.3: Criar dashboard de vendas

1. Na pasta `components/dashboard`, crie `sales-metrics.tsx`
2. **Este arquivo servirá para**: KPIs de vendas em tempo real
3. **Métricas**:
   - Propostas do mês
   - Taxa de conversão
   - Ticket médio
   - Ranking de agentes (para Admin/Master)

### ✅ TESTES E VALIDAÇÃO

#### Etapa 4.1: Testar fluxo completo de cliente

1. Crie um novo cliente com todos os dados
2. Registre 3 interações diferentes
3. Crie 2 tarefas (uma vencida, uma futura)
4. Mova o cliente entre etapas do funil
5. Transfira para outro agente (se Admin/Master)

#### Etapa 4.2: Testar fluxo de proposta

1. Crie proposta para o cliente
2. Adicione 3 itens diferentes
3. Verifique cálculo de comissão
4. Gere PDF
5. Envie por WhatsApp
6. Marque como aceita
7. Verifique se o cliente mudou de etapa

#### Etapa 4.3: Validar permissões

1. Como Agent: tente ver clientes de outros
2. Como Admin: visualize todos os clientes
3. Como Agent: tente transferir cliente (deve falhar)
4. Como Master: faça transferência com sucesso

### 📋 Checklist de Conclusão da Fase 3

- [ ] Cadastro completo de clientes funcionando
- [ ] Validação de CPF/CNPJ implementada
- [ ] Sistema de interações registrando corretamente
- [ ] Tarefas com notificações de vencimento
- [ ] Criação de propostas passo a passo
- [ ] Cálculo automático de valores e comissões
- [ ] Geração de PDF profissional
- [ ] Envio por WhatsApp funcionando
- [ ] Permissões respeitadas em todos os módulos
- [ ] Cliente movendo no funil automaticamente
- [ ] Dashboard mostrando métricas corretas

### 🎯 Próximos Passos

Com o core do CRM implementado, você está pronto para:
- **Fase 4**: Sistema de Reservas e Módulo Financeiro
- **Fase 5**: Relatórios avançados e ferramentas de suporte

### 💡 Dicas Importantes para a Fase 3

1. **Performance é crucial** - Use paginação nas listagens
2. **Cache agressivo** - Clientes e propostas são muito acessados
3. **Validação dupla** - Frontend e backend devem validar CPF/CNPJ
4. **Logs detalhados** - Toda ação em cliente/proposta deve ser registrada
5. **Testes de stress** - Simule 1000+ clientes para testar performance
6. **UX mobile** - Agentes usarão muito no celular

---

Excelente trabalho! A Fase 3 implementa as funcionalidades mais importantes do sistema. Com Clientes e Propostas funcionando bem, você tem um CRM operacional! 🎉