# 📘 GUIA DE IMPLEMENTAÇÃO DETALHADO - FASE 2: MÓDULOS DE CONFIGURAÇÃO

## 🎯 O que vamos fazer nesta fase

Agora que temos uma base sólida (Fase 1 concluída), vamos construir os módulos de configuração do sistema: **Gestão de Usuários**, **Funis de Venda**, **Catálogo de Itens** e **Operadoras**. Estes módulos são fundamentais pois definem como todo o resto do sistema funcionará.

## ✅ Pré-requisitos da Fase 2

Antes de começar, confirme que você tem:
- [ ] Fase 1 completamente implementada
- [ ] Sistema rodando sem erros (`npm run dev`)
- [ ] Docker Desktop aberto
- [ ] VS Code com o projeto aberto

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

#### Etapa 1.2: Criar página de listagem de usuários

1. Na pasta `app/(dashboard)/users`, crie o arquivo `page.tsx`
2. **Este arquivo servirá para**: Mostrar a lista de todos os usuários do sistema com suas permissões
3. **Funcionalidades que deve ter**: 
   - Tabela com nome, email, role, status
   - Filtros por role e status
   - Botão para adicionar novo usuário (só Master/Admin)
   - Ações para editar/desativar (respeitando permissões)

#### Etapa 1.3: Criar modal de criação/edição de usuário

1. Na pasta `components/users`, crie o arquivo `user-form-modal.tsx`
2. **Este arquivo servirá para**: Formulário para criar ou editar usuários
3. **Campos necessários**:
   - Nome completo
   - Email
   - Role (Master, Admin, Agent)
   - Senha (apenas na criação)
   - Status (ativo/inativo)

#### Etapa 1.4: Criar validações de usuário

1. Na pasta `lib/validations/users`, crie o arquivo `user.schema.ts`
2. **Este arquivo servirá para**: Validar todos os dados de usuário antes de salvar
3. **Validações necessárias**:
   - Email válido e único
   - Senha forte (mínimo 8 caracteres, letras e números)
   - Role válido
   - Nome com mínimo 3 caracteres

#### Etapa 1.5: Criar actions de usuário

1. Na pasta `lib/actions/users`, crie os seguintes arquivos:
   - `create-user.ts` - **Servirá para**: Criar novo usuário respeitando permissões
   - `update-user.ts` - **Servirá para**: Atualizar dados do usuário
   - `toggle-user-status.ts` - **Servirá para**: Ativar/desativar usuário
   - `get-users.ts` - **Servirá para**: Buscar lista de usuários com filtros

#### Etapa 1.6: Adicionar link no menu lateral

1. Abra o arquivo do menu lateral (provavelmente em `components/layout/sidebar.tsx`)
2. Adicione o link para users com ícone apropriado
3. **Importante**: Mostre apenas para Master e Admin

### 🎯 MÓDULO 2: FUNIS DE VENDA

#### Etapa 2.1: Criar estrutura para funis

No terminal:

```bash
# Criar pastas do módulo de funis
mkdir -p app/(dashboard)/funnels
mkdir -p lib/actions/funnels
mkdir -p lib/validations/funnels
mkdir -p components/funnels
mkdir -p lib/db/schema/funnels
```

#### Etapa 2.2: Criar schema do banco para funis

1. Na pasta `lib/db/schema/funnels`, crie o arquivo `index.ts`
2. **Este arquivo servirá para**: Definir as tabelas de funis e etapas
3. **Tabelas necessárias**:
   - `funnels`: id, name, description, agencyId, createdAt
   - `funnel_stages`: id, funnelId, name, order, color

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
   - Cards mostrando cada funil
   - Número de etapas em cada funil
   - Botão para criar novo funil (Master/Admin)
   - Clique para editar funil

#### Etapa 2.5: Criar editor de funil

1. Na pasta `app/(dashboard)/funnels`, crie `[funnelId]/page.tsx`
2. **Este arquivo servirá para**: Editar as etapas de um funil específico
3. **Funcionalidades**:
   - Visualizar etapas em ordem
   - Arrastar para reordenar etapas
   - Adicionar nova etapa
   - Editar nome e cor da etapa
   - Excluir etapa (com confirmação)

#### Etapa 2.6: Criar componente de etapa

1. Na pasta `components/funnels`, crie `stage-card.tsx`
2. **Este arquivo servirá para**: Mostrar uma etapa individual com ações
3. **Deve incluir**:
   - Nome da etapa
   - Indicador de cor
   - Botões de editar/excluir
   - Handle para arrastar

#### Etapa 2.7: Criar actions de funis

1. Na pasta `lib/actions/funnels`, crie:
   - `create-funnel.ts` - **Servirá para**: Criar novo funil com etapas padrão
   - `update-funnel.ts` - **Servirá para**: Atualizar nome/descrição do funil
   - `create-stage.ts` - **Servirá para**: Adicionar nova etapa
   - `update-stage.ts` - **Servirá para**: Atualizar etapa existente
   - `delete-stage.ts` - **Servirá para**: Remover etapa
   - `reorder-stages.ts` - **Servirá para**: Salvar nova ordem das etapas

### 📦 MÓDULO 3: CATÁLOGO DE ITENS

#### Etapa 3.1: Criar estrutura para catálogo

No terminal:

```bash
# Criar pastas do módulo de catálogo
mkdir -p app/(dashboard)/catalog
mkdir -p lib/actions/catalog
mkdir -p lib/validations/catalog
mkdir -p components/catalog
```

#### Etapa 3.2: Criar schema para itens

1. Adicione ao schema do banco as tabelas:
   - `catalog_items`: id, name, description, baseFields, agencyId
   - `item_custom_fields`: id, itemId, fieldName, fieldType, required

2. Execute as migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 3.3: Criar página do catálogo

1. Na pasta `app/(dashboard)/catalog`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todos os itens base do catálogo
3. **Funcionalidades**:
   - Grid/lista de itens
   - Busca por nome
   - Botão para adicionar item (Master/Admin)
   - Preview dos campos de cada item

#### Etapa 3.4: Criar editor de item

1. Na pasta `components/catalog`, crie `item-editor.tsx`
2. **Este arquivo servirá para**: Criar/editar um item e seus campos
3. **Funcionalidades**:
   - Nome e descrição do item
   - Adicionar campos personalizados
   - Definir tipo de campo (texto, número, data, select)
   - Marcar campos como obrigatórios
   - Reordenar campos

#### Etapa 3.5: Criar actions do catálogo

1. Na pasta `lib/actions/catalog`, crie:
   - `create-item.ts` - **Servirá para**: Criar novo item base
   - `update-item.ts` - **Servirá para**: Atualizar item existente
   - `add-custom-field.ts` - **Servirá para**: Adicionar campo personalizado
   - `remove-custom-field.ts` - **Servirá para**: Remover campo
   - `get-items.ts` - **Servirá para**: Buscar itens com filtros

### 🏢 MÓDULO 4: OPERADORAS

#### Etapa 4.1: Criar estrutura para operadoras

No terminal:

```bash
# Criar pastas do módulo de operadoras
mkdir -p app/(dashboard)/operators
mkdir -p lib/actions/operators
mkdir -p lib/validations/operators
mkdir -p components/operators
```

#### Etapa 4.2: Criar schema para operadoras

1. Adicione ao schema:
   - `operators`: id, name, logo, contactInfo, agencyId, isActive
   - `operator_items`: id, operatorId, catalogItemId, customValues, commission
   - `commission_rules`: id, operatorItemId, minValue, maxValue, percentage

2. Execute migrations:
```bash
npm run db:generate
npm run db:migrate
```

#### Etapa 4.3: Criar página de operadoras

1. Na pasta `app/(dashboard)/operators`, crie `page.tsx`
2. **Este arquivo servirá para**: Listar todas as operadoras cadastradas
3. **Funcionalidades**:
   - Cards com logo e nome
   - Indicador de status (ativa/inativa)
   - Número de produtos associados
   - Botão para adicionar operadora (Master/Admin)

#### Etapa 4.4: Criar página de detalhes da operadora

1. Na pasta `app/(dashboard)/operators`, crie `[operatorId]/page.tsx`
2. **Este arquivo servirá para**: Gerenciar uma operadora específica
3. **Abas necessárias**:
   - Informações gerais
   - Produtos/itens associados
   - Tabela de comissões
   - Configurações

#### Etapa 4.5: Criar componente de associação de itens

1. Na pasta `components/operators`, crie `item-association.tsx`
2. **Este arquivo servirá para**: Associar itens do catálogo à operadora
3. **Funcionalidades**:
   - Lista de itens disponíveis
   - Checkbox para selecionar
   - Campos personalizados por item
   - Definir comissão base

#### Etapa 4.6: Criar editor de comissões

1. Na pasta `components/operators`, crie `commission-editor.tsx`
2. **Este arquivo servirá para**: Definir regras de comissão por faixa de valor
3. **Funcionalidades**:
   - Adicionar faixas de valor
   - Definir percentual por faixa
   - Validar sobreposição de faixas
   - Preview do cálculo

#### Etapa 4.7: Criar actions de operadoras

1. Na pasta `lib/actions/operators`, crie:
   - `create-operator.ts` - **Servirá para**: Criar nova operadora
   - `update-operator.ts` - **Servirá para**: Atualizar dados da operadora
   - `toggle-operator-status.ts` - **Servirá para**: Ativar/desativar
   - `associate-items.ts` - **Servirá para**: Vincular itens do catálogo
   - `update-commissions.ts` - **Servirá para**: Salvar tabela de comissões

### 🔧 INTEGRAÇÕES ENTRE MÓDULOS

#### Etapa 5.1: Validar dependências

1. Crie o arquivo `lib/validations/dependencies.ts`
2. **Este arquivo servirá para**: Impedir exclusão de itens em uso
3. **Validações**:
   - Não excluir funil com clientes
   - Não excluir item usado por operadora
   - Não desativar operadora com propostas ativas

#### Etapa 5.2: Criar hook de permissões

1. Crie o arquivo `hooks/use-permissions.ts`
2. **Este arquivo servirá para**: Verificar permissões do usuário em qualquer componente
3. **Métodos necessários**:
   - `canCreateUsers()`
   - `canEditFunnels()`
   - `canManageCatalog()`
   - `canManageOperators()`

### ✅ TESTES E VALIDAÇÃO

#### Etapa 6.1: Testar fluxo de usuários

1. Faça login como Master
2. Crie um usuário Admin
3. Crie um usuário Agent
4. Faça login como Admin e verifique permissões
5. Faça login como Agent e verifique limitações

#### Etapa 6.2: Testar funis

1. Crie um funil "Vendas B2C"
2. Adicione etapas: Prospecção, Qualificação, Proposta, Negociação, Fechamento
3. Reordene as etapas
4. Teste a exclusão de uma etapa

#### Etapa 6.3: Testar catálogo

1. Crie um item "Plano de Internet"
2. Adicione campos: Velocidade, Franquia, Valor
3. Crie outro item "Plano Móvel"
4. Adicione campos: Minutos, Internet, SMS

#### Etapa 6.4: Testar operadoras

1. Crie operadora "Vivo"
2. Associe os itens criados
3. Configure comissões:
   - 0-100: 10%
   - 101-200: 12%
   - 201+: 15%

### 📋 Checklist de Conclusão da Fase 2

- [ ] Módulo de usuários funcionando com permissões
- [ ] Funis criados e com etapas configuráveis
- [ ] Catálogo com itens e campos personalizados
- [ ] Operadoras com itens associados e comissões
- [ ] Validações impedindo exclusões indevidas
- [ ] Logs registrando todas as ações
- [ ] Menu lateral mostrando novos módulos
- [ ] Testes manuais passando

### 🎯 Próximos Passos

Com a Fase 2 completa, você tem toda a configuração necessária para:
- **Fase 3**: Implementar o core do CRM (Clientes e Propostas)
- **Fase 4**: Sistema de reservas e financeiro
- **Fase 5**: Relatórios e módulos de suporte

### 💡 Dicas Importantes para a Fase 2

1. **Teste as permissões constantemente** - faça login com diferentes roles
2. **Valide os dados** - não permita salvar dados incompletos
3. **Use transações** - ao salvar múltiplos registros relacionados
4. **Implemente soft delete** - não exclua fisicamente, apenas marque como inativo
5. **Documente as regras de negócio** - comente o código explicando o "porquê"

---

Parabéns por chegar até aqui! A Fase 2 estabelece todas as configurações que o sistema precisará. Com ela completa, você está pronto para implementar as funcionalidades principais do CRM! 🚀