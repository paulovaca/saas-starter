# 📘 GUIA DE IMPLEMENTAÇÃO DETALHADO - FASE 2: MÓDULOS DE CONFIGURAÇÃO

## 🎯 O que vamos fazer nesta fase

Agora que temos uma base sólida (Fase 1 concluída), vamos construir os módulos de configuração do sistema: **Gestão de Usuários**, **Funis de Venda**, **Catálogo de Itens** e **Operadoras**. Estes módulos são fundamentais pois definem como todo o resto do sistema funcionará.

## ✅ Pré-requisitos da Fase 2

Antes de começar, confirme que você tem:
- [x] Fase 1 completamente implementada
- [x] Sistema rodando sem erros (`npm run dev`)
- [x] Docker Desktop aberto com PostgreSQL rodando
- [x] VS Code com o projeto aberto
- [x] Autenticação funcionando com roles (master, admin, agent)

## 🚀 PASSO A PASSO DETALHADO

### 👥 MÓDULO 1: GESTÃO DE USUÁRIOS

#### Etapa 1.1: Criar estrutura de pastas para usuários

No terminal do VS Code, execute:

```bash
# Criar pastas do módulo de usuários
mkdir -p app/(dashboard)/users
mkdir -p lib/actions/users
mkdir -p lib/validations/users
mkdir -p components/users
```

#### Etapa 1.2: Atualizar schema do banco para usuários

1. No arquivo `lib/db/schema/users.ts`, adicione:
   - Campos adicionais: phone, avatar, lastLogin, isActive
   - Relação com agencyId
   - Timestamps (createdAt, updatedAt)

2. Execute as migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 1.3: Criar página de listagem de usuários

1. Na pasta `app/(dashboard)/users`, crie o arquivo `page.tsx`
2. **Este arquivo servirá para**: Mostrar a lista de todos os usuários do sistema com suas permissões
3. **Funcionalidades que deve ter**: 
   - Tabela com nome, email, role, status, último acesso
   - Filtros por role e status
   - Busca por nome/email
   - Paginação
   - Botão para adicionar novo usuário (só Master/Admin)
   - Ações para editar/desativar (respeitando permissões)
   - Indicador visual de usuário online/offline

#### Etapa 1.4: Criar modal de criação/edição de usuário

1. Na pasta `components/users`, crie o arquivo `user-form-modal.tsx`
2. **Este arquivo servirá para**: Formulário para criar ou editar usuários
3. **Campos necessários**:
   - Nome completo (obrigatório)
   - Email (obrigatório, único)
   - Telefone (opcional)
   - Role (Master, Admin, Agent) - com tooltips explicando cada role
   - Senha (apenas na criação, com indicador de força)
   - Confirmar senha
   - Status (ativo/inativo)
   - Avatar (upload de imagem opcional)

#### Etapa 1.5: Criar validações de usuário

1. Na pasta `lib/validations/users`, crie o arquivo `user.schema.ts`
2. **Este arquivo servirá para**: Validar todos os dados de usuário antes de salvar
3. **Schemas necessários**:
   ```typescript
   - createUserSchema: validação para criação
   - updateUserSchema: validação para atualização (senha opcional)
   - changePasswordSchema: validação para trocar senha
   ```
4. **Validações necessárias**:
   - Email válido e único no banco
   - Senha forte (mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial)
   - Role válido e com permissão para criar
   - Nome com mínimo 3 caracteres
   - Telefone no formato brasileiro se preenchido

#### Etapa 1.6: Criar actions de usuário

1. Na pasta `lib/actions/users`, crie os seguintes arquivos:
   - `create-user.ts` - **Servirá para**: Criar novo usuário respeitando hierarquia de roles
   - `update-user.ts` - **Servirá para**: Atualizar dados do usuário (exceto senha)
   - `change-password.ts` - **Servirá para**: Alterar senha com verificação da senha atual
   - `toggle-user-status.ts` - **Servirá para**: Ativar/desativar usuário
   - `get-users.ts` - **Servirá para**: Buscar lista de usuários com filtros e paginação
   - `get-user-by-id.ts` - **Servirá para**: Buscar dados completos de um usuário
   - `delete-user.ts` - **Servirá para**: Soft delete do usuário (Master only)

2. **Importante**: Todas as actions devem:
   - Verificar autenticação
   - Verificar permissões baseadas em role
   - Registrar log de auditoria
   - Retornar mensagens de erro claras

#### Etapa 1.7: Adicionar link no menu lateral

1. Abra o arquivo `components/layout/sidebar.tsx`
2. Adicione o link para `/users` com ícone de Users
3. **Importante**: Use o hook `usePermissions()` para mostrar apenas para Master e Admin

#### Etapa 1.8: Criar página de perfil do usuário

1. Na pasta `app/(dashboard)/users/[userId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Visualizar e editar perfil individual
3. **Abas necessárias**:
   - Informações gerais
   - Segurança (trocar senha, sessões ativas)
   - Histórico de atividades
   - Permissões detalhadas

### 🎯 MÓDULO 2: FUNIS DE VENDA

#### Etapa 2.1: Criar estrutura para funis

No terminal:

```bash
# Criar pastas do módulo de funis
mkdir -p app/(dashboard)/funnels
mkdir -p app/(dashboard)/funnels/[funnelId]
mkdir -p lib/actions/funnels
mkdir -p lib/validations/funnels
mkdir -p components/funnels
mkdir -p lib/db/schema/funnels
```

#### Etapa 2.2: Criar schema do banco para funis

1. Na pasta `lib/db/schema/funnels`, crie o arquivo `index.ts`
2. **Este arquivo servirá para**: Definir as tabelas de funis e etapas
3. **Tabelas necessárias**:
   ```typescript
   - funnels: id, name, description, isDefault, agencyId, createdBy, createdAt, updatedAt
   - funnel_stages: id, funnelId, name, order, color, description, isActive
   - stage_transitions: id, fromStageId, toStageId, clientId, userId, reason, createdAt
   ```

#### Etapa 2.3: Executar migration

No terminal:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 2.4: Criar página de funis

1. Na pasta `app/(dashboard)/funnels`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todos os funis da agência
3. **Funcionalidades**:
   - Cards mostrando cada funil com preview das etapas
   - Número de etapas e clientes em cada funil
   - Indicador de funil padrão
   - Botão para criar novo funil (Master/Admin)
   - Botão para duplicar funil existente
   - Ações rápidas: editar, definir como padrão, excluir

#### Etapa 2.5: Criar modal de criação de funil

1. Na pasta `components/funnels`, crie `create-funnel-modal.tsx`
2. **Este arquivo servirá para**: Criar novo funil com etapas iniciais
3. **Opções**:
   - Criar funil em branco
   - Usar template pré-definido (B2C, B2B, Suporte)
   - Duplicar funil existente

#### Etapa 2.6: Criar editor de funil

1. Na pasta `app/(dashboard)/funnels/[funnelId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Editar as etapas de um funil específico
3. **Funcionalidades**:
   - Visualizar etapas em ordem visual (cards horizontais)
   - Drag and drop para reordenar etapas
   - Adicionar nova etapa com modal
   - Editar nome, cor e descrição da etapa inline
   - Excluir etapa (verificar se não há clientes)
   - Preview de quantos clientes em cada etapa
   - Botão para salvar alterações

#### Etapa 2.7: Criar componente de etapa

1. Na pasta `components/funnels`, crie `stage-card.tsx`
2. **Este arquivo servirá para**: Mostrar uma etapa individual com ações
3. **Deve incluir**:
   - Nome da etapa (editável inline)
   - Badge com cor customizável
   - Contador de clientes na etapa
   - Descrição (tooltip)
   - Botões de ações: editar, excluir
   - Handle para arrastar
   - Indicador de etapa inicial/final

#### Etapa 2.8: Criar componente de seletor de cor

1. Na pasta `components/funnels`, crie `color-picker.tsx`
2. **Este arquivo servirá para**: Selecionar cor da etapa
3. **Cores pré-definidas**: Verde, Azul, Amarelo, Vermelho, Roxo, Cinza

#### Etapa 2.9: Criar validações de funis

1. Na pasta `lib/validations/funnels`, crie:
   - `funnel.schema.ts` - Validações do funil
   - `stage.schema.ts` - Validações das etapas
2. **Validações necessárias**:
   - Nome único do funil por agência
   - Mínimo 2 etapas por funil
   - Nome único de etapa dentro do funil
   - Ordem sequencial sem gaps

#### Etapa 2.10: Criar actions de funis

1. Na pasta `lib/actions/funnels`, crie:
   - `create-funnel.ts` - **Servirá para**: Criar novo funil com etapas padrão
   - `update-funnel.ts` - **Servirá para**: Atualizar nome/descrição do funil
   - `delete-funnel.ts` - **Servirá para**: Excluir funil (se não tiver clientes)
   - `set-default-funnel.ts` - **Servirá para**: Definir funil padrão
   - `duplicate-funnel.ts` - **Servirá para**: Criar cópia do funil
   - `create-stage.ts` - **Servirá para**: Adicionar nova etapa
   - `update-stage.ts` - **Servirá para**: Atualizar etapa existente
   - `delete-stage.ts` - **Servirá para**: Remover etapa (se vazia)
   - `reorder-stages.ts` - **Servirá para**: Salvar nova ordem das etapas
   - `get-funnels.ts` - **Servirá para**: Listar funis com contadores

### 📦 MÓDULO 3: CATÁLOGO DE ITENS

#### Etapa 3.1: Criar estrutura para catálogo

No terminal:

```bash
# Criar pastas do módulo de catálogo
mkdir -p app/(dashboard)/catalog
mkdir -p app/(dashboard)/catalog/[itemId]
mkdir -p lib/actions/catalog
mkdir -p lib/validations/catalog
mkdir -p components/catalog
mkdir -p lib/db/schema/catalog
```

#### Etapa 3.2: Criar schema para itens

1. Na pasta `lib/db/schema/catalog`, crie `index.ts`
2. **Tabelas necessárias**:
   ```typescript
   - catalog_categories: id, name, description, icon, order, agencyId
   - catalog_items: id, categoryId, name, description, baseFields, isActive, agencyId
   - item_custom_fields: id, itemId, fieldName, fieldType, fieldOptions, required, order
   - field_types: text, number, date, select, multiselect, boolean, currency
   ```

3. Execute as migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 3.3: Criar página do catálogo

1. Na pasta `app/(dashboard)/catalog`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todos os itens base do catálogo
3. **Funcionalidades**:
   - Sidebar com categorias
   - Grid/lista de itens filtrados por categoria
   - Busca por nome/descrição
   - Botão para adicionar categoria (Master/Admin)
   - Botão para adicionar item (Master/Admin)
   - Preview dos campos de cada item
   - Indicador de quantas operadoras usam cada item

#### Etapa 3.4: Criar modal de categoria

1. Na pasta `components/catalog`, crie `category-modal.tsx`
2. **Este arquivo servirá para**: Criar/editar categorias
3. **Campos**:
   - Nome da categoria
   - Descrição
   - Ícone (seletor de ícones)
   - Ordem de exibição

#### Etapa 3.5: Criar página de editor de item

1. Na pasta `app/(dashboard)/catalog/[itemId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Criar/editar um item e seus campos
3. **Seções**:
   - Informações básicas (nome, descrição, categoria)
   - Campos do item (lista reordenável)
   - Preview do formulário
   - Operadoras que usam este item

#### Etapa 3.6: Criar componente de editor de campos

1. Na pasta `components/catalog`, crie `field-editor.tsx`
2. **Este arquivo servirá para**: Adicionar/editar campos personalizados
3. **Funcionalidades**:
   - Nome do campo
   - Tipo de campo (dropdown)
   - Opções (para select/multiselect)
   - Campo obrigatório (checkbox)
   - Valor padrão
   - Dica de preenchimento
   - Validações específicas por tipo

#### Etapa 3.7: Criar componente de preview

1. Na pasta `components/catalog`, crie `item-preview.tsx`
2. **Este arquivo servirá para**: Mostrar como o item aparecerá no formulário
3. **Deve renderizar**: Todos os campos na ordem definida com seus tipos

#### Etapa 3.8: Criar validações do catálogo

1. Na pasta `lib/validations/catalog`, crie:
   - `category.schema.ts` - Validações de categoria
   - `item.schema.ts` - Validações de item
   - `field.schema.ts` - Validações de campo
2. **Validações especiais**:
   - Nome único de item por categoria
   - Tipo de campo válido
   - Opções obrigatórias para select
   - Ordem sem duplicatas

#### Etapa 3.9: Criar actions do catálogo

1. Na pasta `lib/actions/catalog`, crie:
   - `create-category.ts` - **Servirá para**: Criar nova categoria
   - `update-category.ts` - **Servirá para**: Atualizar categoria
   - `delete-category.ts` - **Servirá para**: Excluir categoria (se vazia)
   - `reorder-categories.ts` - **Servirá para**: Alterar ordem das categorias
   - `create-item.ts` - **Servirá para**: Criar novo item base
   - `update-item.ts` - **Servirá para**: Atualizar item existente
   - `toggle-item-status.ts` - **Servirá para**: Ativar/desativar item
   - `clone-item.ts` - **Servirá para**: Duplicar item com campos
   - `add-custom-field.ts` - **Servirá para**: Adicionar campo ao item
   - `update-custom-field.ts` - **Servirá para**: Atualizar campo existente
   - `remove-custom-field.ts` - **Servirá para**: Remover campo
   - `reorder-fields.ts` - **Servirá para**: Alterar ordem dos campos
   - `get-items.ts` - **Servirá para**: Buscar itens com filtros
   - `get-item-by-id.ts` - **Servirá para**: Buscar item completo com campos

### 🏢 MÓDULO 4: OPERADORAS

#### Etapa 4.1: Criar estrutura para operadoras

No terminal:

```bash
# Criar pastas do módulo de operadoras
mkdir -p app/(dashboard)/operators
mkdir -p app/(dashboard)/operators/[operatorId]
mkdir -p lib/actions/operators
mkdir -p lib/validations/operators
mkdir -p components/operators
mkdir -p lib/db/schema/operators
```

#### Etapa 4.2: Criar schema para operadoras

1. Na pasta `lib/db/schema/operators`, crie `index.ts`
2. **Tabelas necessárias**:
   ```typescript
   - operators: id, name, logo, cnpj, contactName, contactEmail, contactPhone, 
                address, notes, agencyId, isActive, createdAt, updatedAt
   - operator_items: id, operatorId, catalogItemId, customName, customValues, 
                     commissionType, isActive
   - commission_rules: id, operatorItemId, ruleType, minValue, maxValue, 
                       percentage, fixedValue, conditions
   - operator_documents: id, operatorId, documentType, documentUrl, uploadedAt
   ```

3. Execute migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 4.3: Criar página de operadoras

1. Na pasta `app/(dashboard)/operators`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todas as operadoras cadastradas
3. **Funcionalidades**:
   - Grid de cards com logo, nome e status
   - Indicadores: produtos ativos, propostas no mês
   - Filtros: ativas/inativas, com/sem produtos
   - Busca por nome/CNPJ
   - Botão para adicionar operadora (Master/Admin)
   - Ações rápidas: editar, ativar/desativar

#### Etapa 4.4: Criar modal de operadora

1. Na pasta `components/operators`, crie `operator-form-modal.tsx`
2. **Este arquivo servirá para**: Criar/editar dados básicos da operadora
3. **Campos em abas**:
   - **Dados principais**: Nome, CNPJ, Logo
   - **Contato**: Nome, Email, Telefone do responsável
   - **Endereço**: CEP, Rua, Número, Complemento, Bairro, Cidade, Estado
   - **Observações**: Campo de texto livre

#### Etapa 4.5: Criar página de detalhes da operadora

1. Na pasta `app/(dashboard)/operators/[operatorId]`, crie `page.tsx`
2. **Este arquivo servirá para**: Gerenciar uma operadora específica
3. **Abas necessárias**:
   - **Informações**: Dados cadastrais editáveis
   - **Produtos**: Itens do catálogo associados
   - **Comissões**: Regras de comissionamento
   - **Documentos**: Upload de contratos/documentos
   - **Histórico**: Log de alterações e propostas

#### Etapa 4.6: Criar página de produtos da operadora

1. Na pasta `app/(dashboard)/operators/[operatorId]`, crie `products/page.tsx`
2. **Este arquivo servirá para**: Gerenciar produtos/itens da operadora
3. **Funcionalidades**:
   - Lista de itens do catálogo disponíveis
   - Checkbox para associar/desassociar
   - Nome customizado do produto na operadora
   - Campos específicos da operadora
   - Status ativo/inativo por produto

#### Etapa 4.7: Criar componente de associação de itens

1. Na pasta `components/operators`, crie `item-association.tsx`
2. **Este arquivo servirá para**: Interface para associar itens à operadora
3. **Funcionalidades**:
   - Lista agrupada por categoria
   - Busca de itens
   - Preview dos campos do item
   - Input para nome customizado
   - Configuração inicial de comissão

#### Etapa 4.8: Criar editor de comissões

1. Na pasta `components/operators`, crie `commission-editor.tsx`
2. **Este arquivo servirá para**: Definir regras de comissão complexas
3. **Tipos de comissão**:
   - Percentual fixo
   - Percentual por faixa de valor
   - Valor fixo por venda
   - Escalonada por volume mensal
4. **Funcionalidades**:
   - Adicionar múltiplas regras
   - Condições (prazo, forma de pagamento)
   - Simulador de cálculo
   - Histórico de alterações

#### Etapa 4.9: Criar componente de upload de documentos

1. Na pasta `components/operators`, crie `document-upload.tsx`
2. **Este arquivo servirá para**: Upload e gestão de documentos
3. **Tipos de documento**:
   - Contrato de parceria
   - Tabela de preços
   - Material de marketing
   - Outros documentos
4. **Funcionalidades**:
   - Drag and drop
   - Preview de PDFs
   - Download
   - Excluir com confirmação

#### Etapa 4.10: Criar validações de operadoras

1. Na pasta `lib/validations/operators`, crie:
   - `operator.schema.ts` - Dados da operadora
   - `commission.schema.ts` - Regras de comissão
   - `association.schema.ts` - Associação de produtos
2. **Validações especiais**:
   - CNPJ válido e único
   - Email/telefone válidos
   - Faixas de comissão sem sobreposição
   - Pelo menos um produto ativo para ativar operadora

#### Etapa 4.11: Criar actions de operadoras

1. Na pasta `lib/actions/operators`, crie:
   - `create-operator.ts` - **Servirá para**: Criar nova operadora
   - `update-operator.ts` - **Servirá para**: Atualizar dados cadastrais
   - `toggle-operator-status.ts` - **Servirá para**: Ativar/desativar
   - `upload-logo.ts` - **Servirá para**: Upload e resize de logo
   - `associate-items.ts` - **Servirá para**: Vincular itens do catálogo
   - `update-item-association.ts` - **Servirá para**: Atualizar dados do produto
   - `remove-item-association.ts` - **Servirá para**: Desvincular produto
   - `create-commission-rule.ts` - **Servirá para**: Criar regra de comissão
   - `update-commission-rule.ts` - **Servirá para**: Atualizar regra
   - `delete-commission-rule.ts` - **Servirá para**: Excluir regra
   - `calculate-commission.ts` - **Servirá para**: Calcular comissão de uma venda
   - `upload-document.ts` - **Servirá para**: Upload de documento
   - `delete-document.ts` - **Servirá para**: Excluir documento
   - `get-operators.ts` - **Servirá para**: Listar operadoras com filtros
   - `get-operator-details.ts` - **Servirá para**: Buscar operadora completa

### 🔧 INTEGRAÇÕES ENTRE MÓDULOS

#### Etapa 5.1: Criar validações de dependências

1. Crie o arquivo `lib/validations/dependencies.ts`
2. **Este arquivo servirá para**: Impedir exclusão de itens em uso
3. **Validações necessárias**:
   ```typescript
   - canDeleteUser(): Verificar se usuário tem ações no sistema
   - canDeleteFunnel(): Verificar se funil tem clientes
   - canDeleteStage(): Verificar se etapa tem clientes
   - canDeleteItem(): Verificar se item está em uso por operadora
   - canDeleteCategory(): Verificar se categoria tem itens
   - canDeactivateOperator(): Verificar se tem propostas ativas
   ```

#### Etapa 5.2: Criar hook de permissões

1. Crie o arquivo `hooks/use-permissions.ts`
2. **Este arquivo servirá para**: Verificar permissões do usuário em qualquer componente
3. **Métodos necessários**:
   ```typescript
   - canCreateUsers(): boolean
   - canEditUsers(): boolean
   - canDeleteUsers(): boolean
   - canManageFunnels(): boolean
   - canManageCatalog(): boolean
   - canManageOperators(): boolean
   - canViewReports(): boolean
   - canAccessFinancial(): boolean
   - hasRole(role: string): boolean
   - hasAnyRole(roles: string[]): boolean
   ```

#### Etapa 5.3: Criar hook de contexto da agência

1. Crie o arquivo `hooks/use-agency.ts`
2. **Este arquivo servirá para**: Acessar dados da agência atual
3. **Dados fornecidos**:
   ```typescript
   - agencyId: string
   - agencyName: string
   - agencyLogo: string
   - agencySettings: object
   - defaultFunnelId: string
   ```

#### Etapa 5.4: Criar sistema de notificações

1. Na pasta `components/shared`, crie `notification-center.tsx`
2. **Este arquivo servirá para**: Mostrar notificações do sistema
3. **Tipos de notificação**:
   - Novo usuário criado
   - Funil modificado
   - Item do catálogo atualizado
   - Operadora ativada/desativada

### ✅ TESTES E VALIDAÇÃO

#### Etapa 6.1: Testar fluxo completo de usuários

1. **Como Master**:
   - Criar usuário Admin com todos os dados
   - Criar usuário Agent com restrições
   - Editar perfil de outro usuário
   - Desativar e reativar usuário

2. **Como Admin**:
   - Tentar criar usuário Master (deve falhar)
   - Criar usuário Agent
   - Editar próprio perfil
   - Visualizar logs de atividade

3. **Como Agent**:
   - Verificar que não vê menu de usuários
   - Editar apenas próprio perfil
   - Trocar própria senha

#### Etapa 6.2: Testar funis completos

1. **Criar funis de exemplo**:
   - Funil B2C: Interesse → Contato → Proposta → Negociação → Fechado
   - Funil B2B: Lead → Qualificação → Apresentação → Proposta → Contrato
   - Funil Suporte: Aberto → Em Análise → Aguardando → Resolvido

2. **Testar funcionalidades**:
   - Reordenar etapas via drag and drop
   - Excluir etapa (deve validar se vazia)
   - Definir funil como padrão
   - Duplicar funil existente

#### Etapa 6.3: Testar catálogo completo

1. **Criar estrutura de exemplo**:
   - Categoria "Internet"
     - Item "Internet Fibra" com campos: Velocidade, Upload, Valor
   - Categoria "Telefonia"
     - Item "Plano Móvel" com campos: Minutos, Internet, SMS, Valor
   - Categoria "TV"
     - Item "TV por Assinatura" com campos: Canais, HD, Pontos, Valor

2. **Testar validações**:
   - Campos obrigatórios
   - Tipos de campo corretos
   - Reordenação de campos
   - Preview do formulário

#### Etapa 6.4: Testar operadoras completas

1. **Criar operadoras de exemplo**:
   - Vivo: Associar todos os itens
   - Claro: Associar Internet e Móvel
   - Sky: Associar apenas TV

2. **Configurar comissões variadas**:
   - Vivo Internet: 10% até R$100, 12% até R$200, 15% acima
   - Claro Móvel: R$30 fixo por venda
   - Sky TV: 8% + R$20 bônus se combo

3. **Testar cálculos**:
   - Simular diferentes valores
   - Verificar aplicação correta das regras
   - Testar condições especiais

### 📋 Checklist de Conclusão da Fase 2

- [ ] **Módulo de Usuários**
  - [ ] CRUD completo funcionando
  - [ ] Validações de role e permissões
  - [ ] Upload de avatar
  - [ ] Logs de atividade

- [ ] **Módulo de Funis**
  - [ ] Funis com múltiplas etapas
  - [ ] Drag and drop funcionando
  - [ ] Funil padrão definido
  - [ ] Validações de exclusão

- [ ] **Módulo de Catálogo**
  - [ ] Categorias organizadas
  - [ ] Itens com campos personalizados
  - [ ] Tipos de campo variados
  - [ ] Preview funcionando

- [ ] **Módulo de Operadoras**
  - [ ] Dados completos com CNPJ
  - [ ] Produtos associados
  - [ ] Comissões configuradas
  - [ ] Upload de documentos

- [ ] **Integrações**
  - [ ] Permissões funcionando em todos os módulos
  - [ ] Validações de dependência ativas
  - [ ] Logs registrando todas as ações
  - [ ] Menu lateral com acesso correto

### 🎯 Critérios de Qualidade

1. **Performance**
   - Páginas carregando em menos de 2 segundos
   - Paginação implementada onde necessário
   - Queries otimizadas com joins apropriados

2. **Usabilidade**
   - Feedback visual em todas as ações
   - Mensagens de erro claras
   - Loading states em operações demoradas
   - Confirmação antes de ações destrutivas

3. **Segurança**
   - Todas as actions validam permissões
   - Dados sensíveis não expostos no cliente
   - SQL injection impossível (usando ORM)
   - XSS prevenido (React escapa por padrão)

4. **Manutenibilidade**
   - Código organizado por feature
   - Tipos TypeScript em 100% do código
   - Componentes reutilizáveis
   - Actions com responsabilidade única

### 💡 Dicas Importantes para a Fase 2

1. **Comece pelo schema do banco** - defina bem as relações antes de codar
2. **Implemente um módulo por vez** - não tente fazer tudo junto
3. **Teste as permissões constantemente** - faça login com diferentes roles
4. **Use transações do banco** - principalmente ao criar registros relacionados
5. **Mantenha o código DRY** - crie componentes e utils reutilizáveis
6. **Documente decisões importantes** - use comentários para explicar regras de negócio
7. **Faça commits frequentes** - um commit por funcionalidade concluída
8. **Mantenha as migrations organizadas** - uma migration por alteração lógica

### 🚀 Próximos Passos

Com a Fase 2 completa, você terá:
- Sistema de usuários com permissões robustas
- Funis configuráveis para organizar clientes
- Catálogo flexível de produtos/serviços  
- Operadoras com comissionamento complexo

Isso prepara o terreno para:
- **Fase 3**: Implementar o core do CRM (Clientes e Propostas)
- **Fase 4**: Sistema de reservas e financeiro
- **Fase 5**: Relatórios e módulos de suporte

---

Parabéns por chegar até aqui! A Fase 2 é a mais complexa em termos de configuração, mas estabelece a flexibilidade que torna o sistema poderoso. Com ela completa, você está pronto para implementar as funcionalidades principais do CRM! 🚀