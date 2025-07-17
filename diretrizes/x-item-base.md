# 📦 Manual do Sistema de Itens Base - CRM Travel SaaS

## 📋 Índice
1. Visão Geral
2. Conceitos Fundamentais
3. Permissões de Acesso
4. Funcionalidades Principais
5. Estrutura de Dados
6. Fluxo de Trabalho
7. Guia do Usuário
8. Guia do Desenvolvedor
9. Validações e Regras de Negócio
10. Integrações com Outros Módulos

---

## 🎯 Visão Geral

O módulo de **Itens Base** (também chamado de Catálogo) é o coração do sistema de produtos e serviços do CRM Travel SaaS. Ele permite que agências de viagem cadastrem e organizem todos os tipos de produtos turísticos que podem vender, desde passagens aéreas até ingressos de parques temáticos.

### Principais Características:
- **Flexibilidade Total**: Cada item pode ter campos personalizados específicos
- **Independência**: Cada item base é único e independente
- **Campos Dinâmicos**: Tipos variados de campos (data, número, texto, valor monetário)
- **Reutilização**: Um item base pode ser usado por múltiplas operadoras
- **Personalização Completa**: Formulários adaptados para cada tipo de produto

---

## 🔑 Conceitos Fundamentais

### Item Base (BaseItem)
É um modelo genérico e independente de produto ou serviço. Exemplos:
- **Hotel Padrão**: Item base para hospedagem comum
- **Resort All Inclusive**: Item base específico para resorts
- **Passagem Aérea Nacional**: Item base para voos domésticos
- **Passagem Aérea Internacional**: Item base para voos internacionais
- **Ingresso Disney**: Item base específico para parques Disney
- **Transfer Privativo**: Item base para transfers exclusivos

### Campos Personalizados (BaseItemField)
Cada item base possui campos específicos que precisam ser preenchidos:
- **Hotel Padrão** pode ter: Data Check-in, Data Check-out, Número de Hóspedes, Tipo de Quarto
- **Passagem Aérea** pode ter: Data Ida, Data Volta, Classe, Origem, Destino, Número de Passageiros
- **Ingresso Disney** pode ter: Data da Visita, Parque, Tipo de Ingresso, Quantidade

### Tipos de Campos Disponíveis
- 📝 **Texto Simples**: Para nomes, códigos, referências curtas
- 📄 **Texto Longo**: Para descrições, observações detalhadas
- 🔢 **Número**: Para quantidades, códigos numéricos
- 💰 **Valor Monetário**: Para preços, taxas, valores
- 📅 **Data**: Para datas específicas
- ✅ **Checkbox**: Para opções sim/não
- 📋 **Seleção Única**: Para escolher uma opção de lista
- 📋 **Seleção Múltipla**: Para escolher várias opções

---

## 🔐 Permissões de Acesso

### Visualização
- ✅ **MASTER**: Acesso total ao catálogo
- ✅ **ADMIN**: Acesso total ao catálogo
- ❌ **AGENT**: Sem acesso direto ao módulo de catálogo

### Operações Permitidas

| Ação | MASTER | ADMIN | AGENT |
|------|--------|-------|-------|
| Visualizar catálogo | ✅ | ✅ | ❌ |
| Criar item base | ✅ | ✅ | ❌ |
| Editar item base | ✅ | ✅ | ❌ |
| Excluir item base | ✅ | ✅ | ❌ |
| Gerenciar campos | ✅ | ✅ | ❌ |
| Clonar item base | ✅ | ✅ | ❌ |
| Ativar/Desativar item | ✅ | ✅ | ❌ |

> **Nota**: Agentes não acessam diretamente o catálogo, mas utilizam os itens base ao criar propostas através dos itens das operadoras.

---

## 🛠️ Funcionalidades Principais

### 1. Gestão de Itens Base
- **Criar** novos itens com informações básicas
- **Definir** nome único e descritivo
- **Adicionar** descrição detalhada do produto/serviço
- **Configurar** status (ativo/inativo)
- **Clonar** itens existentes para criar variações
- **Excluir** itens não utilizados
- **Visualizar** quais operadoras utilizam cada item

### 2. Campos Personalizados
- **Adicionar** campos específicos para cada item
- **Definir tipos** de campo apropriados
- **Configurar** obrigatoriedade de preenchimento
- **Definir** valores padrão quando aplicável
- **Adicionar** placeholders (dicas de preenchimento)
- **Configurar** opções para campos de seleção
- **Reordenar** campos arrastando e soltando
- **Editar** configurações de campos existentes
- **Excluir** campos não utilizados
- **Validar** regras específicas por tipo

### 3. Visualização e Busca
- **Listar** todos os itens base com paginação
- **Buscar** por nome ou descrição
- **Filtrar** por status (ativo/inativo)
- **Ordenar** por nome ou data de criação
- **Visualizar** preview do formulário completo
- **Ver** quantidade de campos de cada item
- **Identificar** itens mais utilizados

### 4. Preview e Teste
- **Visualizar** como o formulário aparecerá
- **Testar** preenchimento de campos
- **Validar** regras e obrigatoriedades
- **Simular** experiência do usuário final

---

## 📊 Estrutura de Dados

### Tabela: base_items
```typescript
{
  id: string,              // UUID único
  name: string,            // Nome do item (único)
  description?: string,    // Descrição detalhada
  isActive: boolean,       // Status ativo/inativo
  createdAt: Date,         // Data de criação
  updatedAt: Date,         // Última atualização
  createdBy?: string,      // ID do usuário criador
  fieldsCount?: number     // Contador de campos (virtual)
}
```

### Tabela: base_item_fields
```typescript
{
  id: string,              // UUID único
  baseItemId: string,      // FK para base_items
  name: string,            // Nome do campo
  fieldType: FieldType,    // Tipo do campo
  isRequired: boolean,     // Campo obrigatório?
  defaultValue?: string,   // Valor padrão
  options?: string[],      // Opções para campos select
  placeholder?: string,    // Texto de ajuda
  displayOrder: number,    // Ordem de exibição
  validation?: {           // Regras de validação
    min?: number,          // Valor mínimo
    max?: number,          // Valor máximo
    pattern?: string,      // Regex para validação
    minLength?: number,    // Comprimento mínimo
    maxLength?: number     // Comprimento máximo
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Enum: FieldType
```typescript
enum FieldType {
  TEXT = "text",              // Texto simples
  TEXTAREA = "textarea",      // Texto longo
  NUMBER = "number",          // Número
  CURRENCY = "currency",      // Valor monetário
  DATE = "date",              // Data
  CHECKBOX = "checkbox",      // Sim/Não
  SELECT = "select",          // Seleção única
  MULTISELECT = "multiselect" // Seleção múltipla
}
```

---

## 🔄 Fluxo de Trabalho

### 1. Criação de Item Base Completo

#### Exemplo: Criando "Passagem Aérea Internacional"
1. **Criar item base**:
   - Nome: "Passagem Aérea Internacional"
   - Descrição: "Bilhete aéreo para voos internacionais com todas as taxas incluídas"
   - Status: Ativo

2. **Adicionar campos necessários**:
   - **Origem** (texto, obrigatório, placeholder: "Ex: São Paulo (GRU)")
   - **Destino** (texto, obrigatório, placeholder: "Ex: Miami (MIA)")
   - **Data Ida** (data, obrigatório)
   - **Data Volta** (data, opcional)
   - **Classe** (seleção: Econômica, Premium Economy, Executiva, Primeira Classe)
   - **Número de Passageiros** (número, obrigatório, mín: 1, máx: 9)
   - **Observações** (texto longo, opcional)

3. **Ordenar campos** logicamente
4. **Testar** com preview
5. **Salvar** configuração

### 2. Uso pelos admin dentro das Operadoras
1. Admin acessa pagina da operadora (fornecedora)
2. Admin clica em itens Base - + Adicionar Item Base
3. Seleciona item base "Passagem Aérea Internacional"
4. Define nome customizado (ex: "Voo Internacional Premium")
5. Após item Adicionado o Admin clica em Comissões e defini regra de comissao para esse item dentro dessa operadora
6. Item fica disponível para suas propostas

### 3. Uso em Propostas
1. Agente cria nova proposta
2. Seleciona operadora parceira
3. Escolhe produto "Voo Internacional Premium"
4. Preenche todos os campos necessários
5. Sistema valida informações
6. Calcula valores automaticamente

---

## 👤 Guia do Usuário

### Para Administradores

#### Criar um Novo Item Base
1. Acesse **"Itens Base"** no menu lateral
2. Clique no botão **"+ Novo Item"**
3. Preencha:
   - **Nome**: Único e descritivo (ex: "Hotel 5 Estrelas")
   - **Descrição**: Detalhes sobre o tipo de produto
4. Clique em **"Criar e Configurar Campos"**

#### Adicionar Campos Personalizados
1. Na página do item, clique em **"+ Adicionar Campo"**
2. Configure o campo:
   - **Nome do Campo**: Claro e objetivo
   - **Tipo**: Selecione o tipo apropriado
   - **Obrigatório**: Marque se for essencial
   - **Valor Padrão**: Para campos com valor comum
   - **Placeholder**: Dica de preenchimento
3. Para campos de seleção:
   - Clique em **"+ Adicionar Opção"**
   - Digite cada opção disponível
4. Configure validações se necessário:
   - Valores mínimos/máximos
   - Comprimento de texto
5. Clique em **"Salvar Campo"**

#### Gerenciar Campos Existentes
- **Reordenar**: Arraste os campos para reorganizar
- **Editar**: Clique no ícone de lápis
- **Excluir**: Clique no ícone de lixeira (apenas campos não utilizados)
- **Duplicar**: Para criar campos similares rapidamente

#### Clonar Item Base
1. Na lista de itens, localize o item desejado
2. Clique no menu **"⋮"** → **"Clonar"**
3. Digite o novo nome (deve ser único)
4. Confirme a clonagem
5. Edite os campos conforme necessário

#### Melhores Práticas
- **Nomeação Clara**: Use nomes que identifiquem exatamente o produto
- **Campos Essenciais**: Marque como obrigatório apenas o necessário
- **Descrições Úteis**: Ajude operadoras a entender o uso do item
- **Teste Sempre**: Use o preview antes de finalizar
- **Documentação**: Mantenha descrições atualizadas
- **Reutilização**: Clone itens similares ao invés de recriar

---

## 💻 Guia do Desenvolvedor

### Arquitetura do Módulo

#### Estrutura de Arquivos
```
app/(dashboard)/catalog/          # Páginas do catálogo
  ├── page.tsx                   # Lista de itens base
  ├── new/
  │   └── page.tsx              # Criar novo item
  └── [itemId]/
      └── page.tsx              # Editar item e campos

components/catalog/              # Componentes
  ├── item-form.tsx             # Formulário de item
  ├── item-list.tsx             # Lista de itens
  ├── field-editor.tsx          # Editor de campos
  ├── field-list.tsx            # Lista de campos
  ├── field-form.tsx            # Formulário de campo
  ├── preview-form.tsx          # Preview do formulário
  └── clone-dialog.tsx          # Dialog para clonar

lib/actions/catalog/            # Server Actions
  ├── create-item.ts           # Criar item base
  ├── update-item.ts           # Atualizar item
  ├── delete-item.ts           # Excluir item
  ├── clone-item.ts            # Clonar item
  ├── toggle-item-status.ts    # Ativar/desativar
  ├── add-custom-field.ts      # Adicionar campo
  ├── update-field.ts          # Atualizar campo
  ├── delete-field.ts          # Excluir campo
  └── reorder-fields.ts        # Reordenar campos

lib/validations/catalog/        # Validações
  ├── item.schema.ts           # Schema de item
  └── field.schema.ts          # Schema de campo
```

#### Componentes Principais

##### ItemForm
```typescript
// Formulário para criar/editar item base
interface ItemFormProps {
  item?: BaseItem;
  onSuccess: () => void;
}
```

##### FieldEditor
```typescript
// Editor completo de campo personalizado
interface FieldEditorProps {
  field?: BaseItemField;
  baseItemId: string;
  onSave: (field: FieldData) => void;
  onCancel: () => void;
}
```

##### PreviewForm
```typescript
// Preview dinâmico do formulário
interface PreviewFormProps {
  fields: BaseItemField[];
  onSubmit?: (data: any) => void;
  readOnly?: boolean;
}
```

### Actions Importantes

#### create-item.ts
```typescript
export async function createItemAction(data: CreateItemInput) {
  // 1. Verificar autenticação e sessão
  // 2. Validar permissão (MASTER/ADMIN)
  // 3. Verificar unicidade do nome
  // 4. Validar schema de entrada
  // 5. Criar item no banco
  // 6. Registrar log de criação
  // 7. Revalidar cache
  // 8. Retornar item criado
}
```

#### add-custom-field.ts
```typescript
export async function addCustomFieldAction(
  itemId: string, 
  fieldData: FieldInput
) {
  // 1. Verificar permissões
  // 2. Validar tipo de campo
  // 3. Verificar nome único no item
  // 4. Calcular próxima ordem
  // 5. Validar opções se for select
  // 6. Criar campo no banco
  // 7. Atualizar timestamp do item
  // 8. Registrar atividade
}
```

#### clone-item.ts
```typescript
export async function cloneItemAction(
  itemId: string,
  newName: string
) {
  // 1. Verificar permissões
  // 2. Buscar item original com campos
  // 3. Verificar nome único
  // 4. Criar novo item
  // 5. Copiar todos os campos
  // 6. Ajustar referências
  // 7. Registrar operação
}
```

---

## ✅ Validações e Regras de Negócio

### Validações de Item Base
- **Nome único**: Não pode haver itens com nomes duplicados
- **Nome mínimo**: 3 caracteres
- **Nome máximo**: 100 caracteres
- **Descrição máxima**: 500 caracteres
- **Status**: Apenas itens não utilizados podem ser desativados

### Validações de Campos
- **Nome único por item**: Campos do mesmo item não podem ter nomes iguais
- **Nome mínimo**: 2 caracteres
- **Tipo válido**: Deve ser um dos tipos permitidos pelo enum
- **Opções obrigatórias**: Campos select/multiselect devem ter pelo menos 2 opções
- **Ordem única**: Campos são automaticamente ordenados sequencialmente
- **Validações por tipo**:
  - **NUMBER**: Pode ter min/max
  - **TEXT**: Pode ter minLength/maxLength
  - **DATE**: Pode ter restrições de data mínima/máxima
  - **CURRENCY**: Sempre positivo, máximo 2 casas decimais

### Regras de Negócio
1. **Exclusão protegida**: Item usado por operadora não pode ser excluído
2. **Desativação**: Item desativado não aparece para novas associações
3. **Exclusão em cascata**: Excluir item remove todos os seus campos
4. **Reordenação automática**: Sistema ajusta ordem ao adicionar/remover campos
5. **Clonagem completa**: Copia item com todos os campos e configurações
6. **Unicidade global**: Nomes de itens são únicos em todo o sistema
7. **Campos órfãos**: Sistema previne campos sem item pai

---

## 🔗 Integrações com Outros Módulos

### Com Operadoras (Suppliers)
- Operadoras **selecionam** itens base do catálogo
- Cada operadora **personaliza** nome e valores do item
- Sistema **valida** se item está ativo antes de associar
- **Herda** estrutura de campos do item base
- **Rastreia** quais operadoras usam cada item

### Com Propostas (Proposals)
- Propostas **utilizam** itens através das operadoras
- Campos do item base **geram** formulário dinâmico
- **Validações** são aplicadas no preenchimento
- **Valores** são calculados com base nas configurações
- **Histórico** mantém snapshot dos campos usados

### Com Dashboard
- **Métricas** de itens mais utilizados
- **Alertas** para itens sem uso
- **Performance** de conversão por tipo de item

### Com Sistema de Logs
- **Todas** as operações são registradas
- **Rastreabilidade** completa de mudanças
- **Auditoria** de criação/edição/exclusão
- **Histórico** de alterações em campos

### Com Notificações
- **Aviso** quando item é desativado
- **Alerta** para operadoras sobre mudanças
- **Notificação** de novos itens disponíveis

---

## 🚀 Conclusão

O módulo de Itens Base é a fundação para toda a flexibilidade do CRM Travel SaaS. Através de itens independentes e campos totalmente personalizáveis, o sistema permite que cada agência configure seu catálogo de produtos exatamente como necessita, sem limitações de categorização rígida. Esta abordagem oferece máxima adaptabilidade para qualquer tipo de produto ou serviço turístico, desde os mais simples até os mais complexos, garantindo que o sistema evolua junto com as necessidades do negócio.