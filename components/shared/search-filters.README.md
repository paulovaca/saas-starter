# SearchFilters - Componente Reutilizável de Busca e Filtros

Um componente React reutilizável para implementar funcionalidades de busca e filtros em todas as páginas do sistema. Substitui componentes específicos como `UserFilters`, centralizando a lógica e mantendo consistência visual.

## 🚀 Características

- **Reutilizável**: Funciona em qualquer página (Usuários, Clientes, Funis, etc.)
- **Responsivo**: Design adaptável para mobile e desktop
- **Tema claro/escuro**: Suporte completo aos temas do sistema
- **Acessibilidade**: Componente acessível com suporte a teclado
- **URL sync**: Sincronização automática com URL search params
- **TypeScript**: Tipagem completa para melhor DX

## 📦 Instalação e Uso

### Uso Básico

```tsx
import { SearchFilters } from '@/components/shared/search-filters';

function MinhasPaginas() {
  return (
    <SearchFilters
      searchPlaceholder="Buscar usuários..."
      filters={[
        {
          key: 'status',
          label: 'Todos os status',
          options: [
            { value: 'active', label: 'Ativo' },
            { value: 'inactive', label: 'Inativo' },
          ]
        }
      ]}
    />
  );
}
```

### Uso com Configurações Predefinidas

```tsx
import { SearchFilters } from '@/components/shared/search-filters';
import { userFiltersConfig } from '@/components/shared/search-filters.config';

function UsersPage({ searchParams }) {
  const params = await searchParams;
  
  return (
    <SearchFilters
      searchPlaceholder={userFiltersConfig.searchPlaceholder}
      defaultSearch={params.search || ''}
      filters={userFiltersConfig.filters.map(filter => ({
        ...filter,
        defaultValue: params[filter.key] || ''
      }))}
    />
  );
}
```

## 🔧 API do Componente

### Props Principais

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `searchPlaceholder` | `string` | `"Buscar..."` | Placeholder do campo de busca |
| `defaultSearch` | `string` | `""` | Valor inicial da busca |
| `filters` | `FilterConfig[]` | `[]` | Array de configurações de filtros |
| `onFiltersChange` | `function` | `undefined` | Callback quando filtros mudam |
| `className` | `string` | `""` | Classe CSS adicional |
| `showFilterButton` | `boolean` | `true` | Mostrar botão "Filtrar" |
| `showClearButton` | `boolean` | `true` | Mostrar botão "Limpar Filtros" |

### Tipo FilterConfig

```typescript
type FilterConfig = {
  key: string;           // Chave do parâmetro na URL
  label: string;         // Label da primeira opção (ex: "Todos os status")
  options: FilterOption[]; // Opções do select
  defaultValue?: string; // Valor padrão
};

type FilterOption = {
  value: string; // Valor da opção
  label: string; // Texto exibido
};
```

## 📋 Configurações Predefinidas

O arquivo `search-filters.config.ts` contém configurações prontas para cada página:

- `userFiltersConfig` - Para página de usuários
- `clientFiltersConfig` - Para página de clientes  
- `funnelFiltersConfig` - Para página de funis
- `catalogFiltersConfig` - Para página de catálogo
- `operatorFiltersConfig` - Para página de operadoras
- `proposalFiltersConfig` - Para página de propostas
- `reportFiltersConfig` - Para página de relatórios

## 🎨 Temas e Estilos

O componente utiliza variáveis CSS do sistema para suporte automático aos temas:

```css
/* Principais variáveis utilizadas */
--card              /* Fundo do container */
--background        /* Fundo dos inputs */
--foreground        /* Cor do texto */
--border            /* Cor das bordas */
--primary           /* Cor do botão principal */
--muted-foreground  /* Cor de textos secundários */
--ring              /* Cor do foco */
```

### Customização de Estilos

```tsx
<SearchFilters
  className="minha-classe-customizada"
  // outras props...
/>
```

```css
/* No seu arquivo CSS */
.minha-classe-customizada {
  margin-bottom: 2rem;
  background: var(--muted);
}
```

## 🔄 Migração de Componentes Existentes

### De UserFilters para SearchFilters

**Antes:**
```tsx
<UserFilters
  defaultSearch={search}
  defaultRole={role || ''}
  defaultStatus={status || ''}
/>
```

**Depois:**
```tsx
<SearchFilters
  searchPlaceholder="Buscar por nome ou email..."
  defaultSearch={search}
  filters={userFiltersConfig.filters.map(filter => ({
    ...filter,
    defaultValue: params[filter.key] || ''
  }))}
/>
```

## 📱 Responsividade

O componente é totalmente responsivo:

- **Desktop**: Layout horizontal com busca à esquerda e filtros à direita
- **Mobile**: Layout vertical com todos os elementos empilhados
- **Breakpoint**: 768px (configurável via CSS)

## ♿ Acessibilidade

- **Navegação por teclado**: Tab, Enter, Escape
- **ARIA labels**: Labels apropriados nos selects
- **Alto contraste**: Suporte ao modo de alto contraste
- **Screen readers**: Compatível com leitores de tela

## 🔧 Funcionalidades Avançadas

### Callback Personalizado

```tsx
<SearchFilters
  onFiltersChange={(filters) => {
    console.log('Filtros alterados:', filters);
    // analytics, API calls, etc.
  }}
  // outras props...
/>
```

### Carregamento Dinâmico de Opções

```tsx
async function MyPage() {
  const operators = await fetchOperators();
  
  const dynamicFilters = [{
    key: 'operator',
    label: 'Todas as operadoras',
    options: operators.map(op => ({
      value: op.id,
      label: op.name
    }))
  }];

  return (
    <SearchFilters
      filters={dynamicFilters}
      // outras props...
    />
  );
}
```

### Filtro Automático (sem botão)

```tsx
<SearchFilters
  showFilterButton={false}
  // Filtra automaticamente quando qualquer campo muda
/>
```

## 🧪 Estados e Feedback

- **Loading**: Componente desabilitado durante navegação
- **Animações**: Transições suaves nos estados
- **Feedback visual**: Indicadores claros de ações do usuário

## 📚 Exemplos Completos

Veja o arquivo `search-filters.examples.tsx` para exemplos detalhados de uso em diferentes cenários.

## 🐛 Troubleshooting

### Filtros não aparecem na URL
Certifique-se de que as `keys` dos filtros correspondem aos parâmetros esperados pela sua API.

### Estilos não aplicam corretamente
Verifique se as variáveis CSS do tema estão definidas no seu `globals.css`.

### Não funciona no tema escuro
Confirme que o seletor `.dark` está sendo aplicado corretamente no HTML.
