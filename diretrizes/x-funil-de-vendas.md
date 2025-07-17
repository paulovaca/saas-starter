Collecting workspace informationAnalisando a estrutura do seu sistema, vou criar um manual completo sobre o módulo de Funis de Venda:

# 📊 Manual do Módulo de Funis de Venda

## 📋 Índice
1. Visão Geral
2. Conceitos Fundamentais
3. Permissões de Acesso
4. Funcionalidades
5. Guia do Usuário
6. Guia do Desenvolvedor
7. Regras de Negócio
8. Integrações

---

## 🎯 Visão Geral

O módulo de **Funis de Venda** é uma ferramenta essencial do CRM que permite organizar e acompanhar a jornada dos clientes através de diferentes etapas do processo comercial. Cada agência pode criar múltiplos funis personalizados para diferentes tipos de vendas ou segmentos de clientes.

### Principais Benefícios:
- **Visualização clara** do pipeline de vendas
- **Padronização** do processo comercial
- **Acompanhamento** da evolução dos clientes
- **Métricas** de conversão entre etapas
- **Flexibilidade** para diferentes tipos de negociação

---

## 🔑 Conceitos Fundamentais

### O que é um Funil de Venda?
Um funil representa o caminho que um cliente percorre desde o primeiro contato até o fechamento da venda. É composto por **etapas sequenciais** que representam diferentes momentos da negociação.

### Estrutura do Funil:
```
Funil (SalesFunnel)
├── Nome
├── Descrição
├── É Padrão? (isDefault)
└── Etapas (SalesFunnelStage)
    ├── Nome
    ├── Ordem
    ├── Cor
    ├── Descrição
    └── Instruções para o agente
```

### Exemplo Prático:
**Funil B2C - Viagens de Lazer**
1. 🎯 **Interesse Inicial** → Cliente demonstrou interesse
2. 📞 **Contato Realizado** → Primeiro contato estabelecido
3. 📋 **Proposta Enviada** → Proposta comercial enviada
4. 💬 **Negociação** → Em processo de negociação
5. ✅ **Fechado** → Venda concluída

---

## 🔒 Permissões de Acesso

### Matriz de Permissões:

| Ação | Master | Admin | Agent |
|------|--------|-------|-------|
| Visualizar funis | ✅ | ✅ | ✅ |
| Criar novo funil | ✅ | ✅ | ❌ |
| Editar funil | ✅ | ✅ | ❌ |
| Excluir funil | ✅ | ✅ | ❌ |
| Definir funil padrão | ✅ | ✅ | ❌ |
| Reordenar etapas | ✅ | ✅ | ❌ |
| Mover clientes entre etapas | ✅ | ✅ | ✅ |

### Observações:
- **Agents** podem apenas visualizar e utilizar os funis criados
- **Master/Admin** têm controle total sobre a estrutura dos funis
- Todos os usuários podem mover seus clientes entre as etapas

---

## 🛠️ Funcionalidades

### 1. Gestão de Funis
- **Criar Funil**: Definir nome, descrição e etapas iniciais
- **Editar Funil**: Alterar informações e estrutura
- **Duplicar Funil**: Criar cópia de um funil existente
- **Excluir Funil**: Remover funil (apenas se vazio)
- **Definir Padrão**: Marcar funil como padrão para novos clientes

### 2. Gestão de Etapas
- **Adicionar Etapa**: Criar nova etapa no funil
- **Editar Etapa**: Alterar nome, cor e instruções
- **Reordenar**: Arrastar e soltar para reorganizar
- **Excluir Etapa**: Remover etapa (apenas se vazia)
- **Personalizar Cores**: Definir cor visual de cada etapa

### 3. Movimentação de Clientes
- **Mover Cliente**: Arrastar cliente entre etapas
- **Registrar Motivo**: Documentar razão da mudança
- **Histórico**: Visualizar todas as transições
- **Automação**: Cliente move automaticamente ao aceitar proposta

---

## 👤 Guia do Usuário

### Para Administradores (Master/Admin)

#### Criar um Novo Funil:
1. Acesse **Funis de Venda** no menu lateral
2. Clique em **"Novo Funil"**
3. Preencha:
   - **Nome**: Ex: "Funil B2B Corporativo"
   - **Descrição**: Detalhes sobre o uso do funil
4. Adicione as etapas iniciais
5. Configure cores e instruções
6. Salve o funil

#### Configurar Etapas:
1. No editor de funil, clique em **"Adicionar Etapa"**
2. Defina:
   - **Nome da Etapa**: Ex: "Qualificação"
   - **Cor**: Para identificação visual
   - **Instruções**: Orientações para os agentes
3. Use drag-and-drop para reordenar
4. Salve as alterações

#### Definir Funil Padrão:
1. Na lista de funis, localize o desejado
2. Clique no menu de ações (⋮)
3. Selecione **"Definir como Padrão"**
4. Confirme a ação

### Para Agentes

#### Visualizar Funis:
- Acesse a página do cliente para ver em qual etapa está
- O funil é exibido visualmente com cores
- Clique nas etapas para ver instruções

#### Mover Cliente de Etapa:
1. Na página do cliente, localize o funil atual
2. Clique em **"Mover para próxima etapa"**
3. Selecione a nova etapa
4. Adicione uma justificativa (obrigatório)
5. Confirme a movimentação

---

## 💻 Guia do Desenvolvedor

### Estrutura de Arquivos:

```
app/(dashboard)/funnels/          # Páginas do módulo
├── page.tsx                      # Lista de funis
└── [funnelId]/                  
    └── page.tsx                  # Editor de funil

components/funnels/               # Componentes
├── funnel-card.tsx              # Card de funil
├── funnel-form-modal.tsx        # Modal criar/editar
├── stage-editor.tsx             # Editor de etapas
├── stage-card.tsx               # Card de etapa
└── color-picker.tsx             # Seletor de cores

lib/actions/funnels/             # Server Actions
├── create-funnel.ts             # Criar funil
├── update-funnel.ts             # Atualizar funil
├── delete-funnel.ts             # Excluir funil
├── set-default-funnel.ts        # Definir padrão
└── reorder-stages.ts            # Reordenar etapas

lib/validations/funnels/         # Validações
├── funnel.schema.ts             # Schema do funil
└── stage.schema.ts              # Schema da etapa

lib/db/schema/funnels/           # Banco de dados
└── index.ts                     # Definições das tabelas
```

### Schema do Banco de Dados:

```typescript
// Tabela: sales_funnels
{
  id: uuid (PK)
  name: string (único por agência)
  description: text
  isDefault: boolean
  agencyId: uuid (FK)
  createdBy: uuid (FK)
  createdAt: timestamp
  updatedAt: timestamp
}

// Tabela: sales_funnel_stages
{
  id: uuid (PK)
  funnelId: uuid (FK)
  name: string
  order: integer
  color: string (hex)
  description: text
  instructions: text
  isActive: boolean
}

// Tabela: stage_transitions
{
  id: uuid (PK)
  fromStageId: uuid (FK)
  toStageId: uuid (FK)
  clientId: uuid (FK)
  userId: uuid (FK)
  reason: text
  createdAt: timestamp
}
```

### Validações Implementadas:

```typescript
// funnel.schema.ts
export const createFunnelSchema = z.object({
  name: z.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  description: z.string().optional(),
  stages: z.array(stageSchema).min(2, "Funil deve ter no mínimo 2 etapas")
});

// stage.schema.ts
export const stageSchema = z.object({
  name: z.string().min(2, "Nome da etapa muito curto"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida"),
  order: z.number().int().positive(),
  instructions: z.string().optional()
});
```

### Hooks Personalizados:

```typescript
// hooks/use-funnel.ts
export function useFunnel(funnelId: string) {
  // Busca dados do funil
  // Gerencia estado local
  // Funções de manipulação
}

// hooks/use-stage-drag.ts
export function useStageDrag() {
  // Lógica de drag and drop
  // Reordenação de etapas
  // Animações
}
```

---

## 📐 Regras de Negócio

### Criação e Edição:
1. **Nome único**: Não pode haver funis com mesmo nome na agência
2. **Mínimo de etapas**: Todo funil deve ter pelo menos 2 etapas
3. **Ordem sequencial**: Etapas devem ter ordem sem gaps (1, 2, 3...)
4. **Funil padrão**: Sempre deve existir um funil marcado como padrão

### Exclusão:
1. **Funil vazio**: Só pode excluir funil sem clientes
2. **Etapa vazia**: Só pode excluir etapa sem clientes
3. **Não excluir padrão**: Precisa definir outro como padrão antes

### Movimentação:
1. **Justificativa obrigatória**: Toda mudança de etapa requer motivo
2. **Registro histórico**: Todas as transições são registradas
3. **Permissão**: Agente só move seus próprios clientes

### Automações:
1. **Proposta aceita**: Cliente move para etapa "Fechado" automaticamente
2. **Novo cliente**: Entra automaticamente na primeira etapa do funil padrão

---

## 🔗 Integrações

### Com Módulo de Clientes:
- Todo cliente está associado a uma etapa de funil
- Histórico de movimentações visível no perfil do cliente
- Filtros por etapa na lista de clientes

### Com Módulo de Propostas:
- Propostas exibem a etapa atual do cliente
- Aceitar proposta move cliente automaticamente

### Com Relatórios:
- Taxa de conversão entre etapas
- Tempo médio em cada etapa
- Funil de conversão visual
- Performance por agente

### Com Notificações:
- Alerta quando cliente está parado há muito tempo
- Notificação de mudança de etapa (opcional)
- Resumo semanal de movimentações

---

## 📊 Métricas e KPIs

### Indicadores Disponíveis:
- **Taxa de conversão**: % de clientes que avançam entre etapas
- **Tempo médio**: Dias que cliente permanece em cada etapa
- **Velocity**: Velocidade de movimento no funil
- **Taxa de abandono**: % que não avança após X dias
- **Performance**: Comparativo entre agentes

### Dashboard de Funis:
- Visualização em formato de funil
- Números absolutos e percentuais
- Gráficos de tendência
- Alertas de gargalos

---

## 🎨 Boas Práticas

### Para Administradores:
1. **Nomes claros**: Use nomes descritivos para etapas
2. **Instruções detalhadas**: Ajude os agentes com orientações
3. **Cores significativas**: Verde para fechamento, vermelho para perdido
4. **Revisão periódica**: Analise e otimize os funis regularmente

### Para Agentes:
1. **Atualização constante**: Mantenha clientes na etapa correta
2. **Justificativas completas**: Documente bem as mudanças
3. **Use as instruções**: Siga as orientações de cada etapa
4. **Monitore tempo**: Não deixe clientes parados muito tempo

### Para Desenvolvedores:
1. **Cache eficiente**: Funis são muito acessados
2. **Validações robustas**: Impeça estados inconsistentes
3. **Logs detalhados**: Registre todas as ações
4. **Performance**: Otimize queries de movimentação

---

## 🚨 Troubleshooting

### Problemas Comuns:

**"Não consigo excluir um funil"**
- Verifique se há clientes nesse funil
- Mova os clientes para outro funil primeiro

**"Etapa não aparece após criar"**
- Verifique a ordem das etapas
- Recarregue a página
- Verifique permissões

**"Cliente não muda de etapa"**
- Confirme se adicionou justificativa
- Verifique permissões do usuário
- Consulte logs de erro

---

Este manual será atualizado conforme novas funcionalidades forem adicionadas ao módulo de Funis de Venda.