// Constantes para nomenclatura consistente do módulo de Itens Base
export const BASE_ITEMS_LABELS = {
  MODULE_NAME: 'Itens Base',
  MODULE_DESCRIPTION: 'Gerencie os itens base utilizados na criação de propostas',
  PAGE_TITLE: 'Itens Base',
  SINGLE_ITEM: 'Item Base',
  PLURAL_ITEMS: 'Itens Base',
  CREATE_BUTTON: 'Novo Item Base',
  SEARCH_PLACEHOLDER: 'Buscar itens base...',
  EMPTY_STATE: {
    TITLE: 'Nenhum item base encontrado',
    DESCRIPTION_FILTERED: 'Tente ajustar os filtros ou criar um novo item base',
    DESCRIPTION_EMPTY: 'Comece criando categorias e itens base para utilizar nas propostas',
  },
  CATEGORIES: {
    TITLE: 'Categorias',
    ALL: 'Todas',
    CREATE_BUTTON: 'Nova categoria',
    EMPTY_MESSAGE: 'Nenhuma categoria criada ainda',
    CREATE_FIRST: 'Criar primeira categoria',
  },
  PERMISSIONS: {
    ACCESS_DENIED: 'Apenas usuários Master e Admin podem acessar os Itens Base',
    REQUIRED_ROLES: ['MASTER', 'ADMIN'],
  },
  MODAL_TITLES: {
    CREATE_CATEGORY: 'Nova Categoria',
    EDIT_CATEGORY: 'Editar Categoria',
    CREATE_ITEM: 'Novo Item Base',
    EDIT_ITEM: 'Editar Item Base',
  },
} as const;

// Tipos de roles permitidos
type AllowedRole = 'MASTER' | 'ADMIN';

// Função para verificar se o usuário tem permissão para acessar itens base
export function canAccessBaseItems(userRole: string): boolean {
  return BASE_ITEMS_LABELS.PERMISSIONS.REQUIRED_ROLES.includes(userRole as AllowedRole);
}

// Função para verificar se o usuário pode gerenciar itens base (criar, editar, excluir)
export function canManageBaseItems(userRole: string): boolean {
  return BASE_ITEMS_LABELS.PERMISSIONS.REQUIRED_ROLES.includes(userRole as AllowedRole);
}
