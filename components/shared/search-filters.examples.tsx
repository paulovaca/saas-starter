/**
 * EXEMPLOS DE USO DO COMPONENTE SearchFilters
 * 
 * Este arquivo mostra como usar o SearchFilters em diferentes páginas
 */

// ============================================================================
// EXEMPLO 1: USUÁRIOS
// ============================================================================
/*
// Em app/(dashboard)/users/page.tsx
import { SearchFilters } from '@/components/shared/search-filters';
import { userFiltersConfig } from '@/components/shared/search-filters.config';

export default async function UsersPage({ searchParams }) {
  const params = await searchParams;
  const search = params.search || '';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SearchFilters
          searchPlaceholder={userFiltersConfig.searchPlaceholder}
          defaultSearch={search}
          filters={userFiltersConfig.filters.map(filter => ({
            ...filter,
            defaultValue: params[filter.key] || ''
          }))}
        />
        
        // Sua tabela/lista aqui...
      </div>
    </div>
  );
}
*/

// ============================================================================
// EXEMPLO 2: CLIENTES  
// ============================================================================
/*
// Em app/(dashboard)/clients/page.tsx
import { clientFiltersConfig } from '@/components/shared/search-filters.config';

export default async function ClientsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SearchFilters
          searchPlaceholder={clientFiltersConfig.searchPlaceholder}
          defaultSearch={params.search || ''}
          filters={clientFiltersConfig.filters.map(filter => ({
            ...filter,
            defaultValue: params[filter.key] || ''
          }))}
        />
        
        // Tabela de clientes...
      </div>
    </div>
  );
}
*/

// ============================================================================
// EXEMPLO 3: OPERADORAS
// ============================================================================
/*
// Em app/(dashboard)/operators/page.tsx
import { operatorFiltersConfig } from '@/components/shared/search-filters.config';

export default async function OperatorsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SearchFilters
          searchPlaceholder={operatorFiltersConfig.searchPlaceholder}
          defaultSearch={params.search || ''}
          filters={operatorFiltersConfig.filters.map(filter => ({
            ...filter,
            defaultValue: params[filter.key] || ''
          }))}
        />
        
        // Lista de operadoras...
      </div>
    </div>
  );
}
*/

// ============================================================================
// EXEMPLO 4: COMPONENTE COM CALLBACK PERSONALIZADO
// ============================================================================
/*
import { SearchFilters } from '@/components/shared/search-filters';

function AdvancedSearchExample() {
  const handleFiltersChange = (filters: Record<string, string>) => {
    console.log('Filtros alterados:', filters);
    // Pode fazer chamadas de API específicas, analytics, etc.
  };

  return (
    <SearchFilters
      searchPlaceholder="Busca personalizada..."
      filters={[
        {
          key: 'category',
          label: 'Categoria',
          options: [
            { value: 'cat1', label: 'Categoria 1' },
            { value: 'cat2', label: 'Categoria 2' },
          ]
        }
      ]}
      onFiltersChange={handleFiltersChange}
      showFilterButton={false} // Filtra automaticamente
      className="custom-class"
    />
  );
}
*/

// ============================================================================
// EXEMPLO 5: CARREGAMENTO DINÂMICO DE OPÇÕES
// ============================================================================
/*
import { SearchFilters } from '@/components/shared/search-filters';

async function DynamicFiltersExample() {
  // Carregar operadoras da API
  const operators = await fetch('/api/operators').then(res => res.json());
  
  const dynamicConfig = {
    searchPlaceholder: "Buscar...",
    filters: [
      {
        key: 'operator',
        label: 'Todas as operadoras',
        options: operators.map((op: any) => ({
          value: op.id,
          label: op.name
        }))
      }
    ]
  };

  return (
    <SearchFilters
      searchPlaceholder={dynamicConfig.searchPlaceholder}
      filters={dynamicConfig.filters}
    />
  );
}
*/

// ============================================================================
// COMO MIGRAR DE UserFilters PARA SearchFilters
// ============================================================================
/*
// ANTES (UserFilters):
<UserFilters
  defaultSearch={search}
  defaultRole={role || ''}
  defaultStatus={status || ''}
/>

// DEPOIS (SearchFilters):
<SearchFilters
  searchPlaceholder="Buscar por nome ou email..."
  defaultSearch={search}
  filters={[
    {
      key: 'role',
      label: 'Todas as permissões',
      options: [
        { value: 'MASTER', label: 'Master' },
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'AGENT', label: 'Agente' },
      ],
      defaultValue: role || ''
    },
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
      ],
      defaultValue: status || ''
    },
  ]}
/>
*/
