# Component Refactoring Opportunities

Este documento mapeia os padrões de código repetitivos identificados no aplicativo e descreve como eles podem ser transformados em componentes reutilizáveis.


## Benefícios da Refatoração

1. **Redução de Código**: Eliminar ~40-60% de código duplicado
2. **Consistência**: UI e UX uniformes em todo o app
3. **Manutenibilidade**: Mudanças centralizadas
4. **Produtividade**: Desenvolvimento mais rápido com componentes prontos
5. **Qualidade**: Menos bugs por reutilização de código testado
6. **Acessibilidade**: Implementação consistente de a11y

## Prioridade de Implementação

1. **Alta Prioridade**
   - Modal System (usado em 20+ lugares)
   - Form Components (usado em todos os módulos)
   - DataTable (substituir múltiplas implementações)

2. **Média Prioridade**
   - Loading States
   - EmptyState
   - Pagination
   - StatusBadge

3. **Baixa Prioridade**
   - Tooltip
   - ProgressBar
   - Utility Hooks

## Considerações de Migração

- Implementar componentes novos sem quebrar existentes
- Migrar gradualmente, módulo por módulo
- Manter retrocompatibilidade temporária
- Documentar padrões e uso dos novos componentes (criar arquivo e escrever a documentação nele)
- Criar storybook para visualização dos componentes
- Já substitua os antigos códigos pelos componentes novos

### 1. Modal/Dialog System

#### Padrão Atual
- **3 implementações diferentes**: Dialog customizado, Radix UI Alert Dialog, e implementações diretas
- **20+ modais** com estrutura similar mas código duplicado
- Gerenciamento de estado inconsistente (`isOpen/onClose` vs `open/onOpenChange`)

#### Componente Proposto: `<Modal>`

```typescript
interface ModalProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'dialog' | 'alert' | 'form';
  title: string;
  description?: string;
  footer?: ReactNode;
  loading?: boolean;
  preventClose?: boolean;
  // ... outras props
}
```

**Como transformar:**
1. Criar um componente base que unifique as 3 implementações
2. Extrair lógica comum (overlay, animações, tecla ESC)
3. Implementar variantes para diferentes casos de uso
4. Criar hook `useModal()` para gerenciamento de estado consistente

#### Componentes Derivados

##### `<FormModal>`
Especialização para modais com formulários:
- Integração com React Hook Form
- Estados de loading/submitting
- Tratamento de erros padrão
- Botões de ação padronizados

##### `<ConfirmModal>`
Para ações destrutivas:
- Layout de aviso consistente
- Input de confirmação opcional
- Botões com estilo destrutivo

### 2. Form System

#### Padrão Atual
- Configuração repetitiva de React Hook Form + Zod
- Tratamento de erros duplicado
- Estados de loading inconsistentes
- Formatação de campos repetida

#### Componente Proposto: `<Form>`

```typescript
interface FormProps<T> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<ActionResponse>;
  defaultValues?: T;
  successMessage?: string;
  onSuccess?: () => void;
}
```

**Como transformar:**
1. Encapsular configuração do React Hook Form
2. Integrar tratamento de erros e toasts
3. Gerenciar estados de loading automaticamente
4. Prover contexto para campos filhos

#### Componentes de Campo

##### `<FormField>`
```typescript
interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
}
```
- Renderiza label, input e erro de forma consistente
- Integração automática com contexto do form
- Suporte para diferentes tipos de input

##### `<MaskedInput>`
```typescript
interface MaskedInputProps {
  mask: 'phone' | 'cpf' | 'cnpj' | 'cep' | 'currency';
  // herda props do input
}
```
- Formatação automática durante digitação
- Validação integrada com máscara
- Remoção de formatação para submissão

##### `<AsyncField>`
Para campos com validação assíncrona:
- Debounce configurável
- Indicador de validação
- Cache de resultados

##### `<FormActions>`
Botões padronizados de formulário:
- Layout consistente
- Estados de loading
- Botão cancelar opcional

### 3. Data Display Components

#### Padrão Atual
- Múltiplas implementações de tabelas/listas
- Paginação duplicada
- Estados vazios inconsistentes
- Filtros e busca repetidos

#### Componente Proposto: `<DataTable>`

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: PaginationConfig;
  sorting?: boolean;
  filtering?: FilterConfig[];
  onRowClick?: (row: T) => void;
  actions?: ActionConfig<T>[];
  emptyState?: EmptyStateConfig;
}
```

**Como transformar:**
1. Criar componente base flexível
2. Suportar renderização customizada de células
3. Integrar com SearchFilters existente
4. Implementar estados de loading/empty

#### Componentes Relacionados

##### `<DataGrid>`
Para layouts em grid/cards:
```typescript
interface DataGridProps<T> {
  data: T[];
  renderCard: (item: T) => ReactNode;
  columns?: ResponsiveColumns;
  pagination?: PaginationConfig;
}
```

##### `<EmptyState>`
```typescript
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'no-data' | 'filtered' | 'error';
}
```

##### `<TableActions>`
Menu de ações para linhas:
```typescript
interface TableActionsProps<T> {
  row: T;
  actions: Action<T>[];
  permissions?: string[];
}
```

##### `<Pagination>`
Controles de paginação reutilizáveis:
- Navegação entre páginas
- Seletor de itens por página
- Contagem de resultados

### 4. Loading States

#### Padrão Atual
- "Loading..." texto repetido
- Skeletons customizados por página
- Falta de indicadores visuais consistentes

#### Componentes Propostos

##### `<Spinner>`
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'white';
  label?: string;
}
```

##### `<Skeleton>`
```typescript
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}
```

##### `<LoadingOverlay>`
Para cobrir conteúdo durante carregamento:
- Backdrop semi-transparente
- Spinner centralizado
- Mensagem opcional

### 5. Feedback Components

#### Componentes Propostos

##### `<StatusBadge>`
```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  label?: string;
  size?: 'sm' | 'md';
}
```
- Cores e ícones padronizados por status
- Variantes consistentes

##### `<Tooltip>`
```typescript
interface TooltipProps {
  content: ReactNode;
  placement?: Placement;
  delay?: number;
}
```
- Substituir uso de `title` attribute
- Posicionamento inteligente
- Suporte para conteúdo rico

##### `<ProgressBar>`
```typescript
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}
```

### 6. Utility Hooks

#### `useDebounce`
Para inputs com busca/validação:
```typescript
function useDebounce<T>(value: T, delay: number): T
```

#### `useAsync`
Para operações assíncronas:
```typescript
function useAsync<T>(
  asyncFunction: () => Promise<T>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => void;
}
```

#### `usePermission`
Para verificação de permissões:
```typescript
function usePermission(permission: string): boolean
```
