// Configurações prontas para usar o SearchFilters em diferentes páginas

import { FilterOption } from '@/components/shared/search-filters';

// Configuração para Usuários
export const userFiltersConfig = {
  searchPlaceholder: "Buscar por nome ou email...",
  filters: [
    {
      key: 'role',
      label: 'Todas as permissões',
      options: [
        { value: 'MASTER', label: 'Master' },
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'AGENT', label: 'Agente' },
      ] as FilterOption[],
    },
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
      ] as FilterOption[],
    },
  ],
};

// Configuração para Clientes
export const clientFiltersConfig = {
  searchPlaceholder: "Buscar por nome, email ou telefone...",
  filters: [
    {
      key: 'funnel',
      label: 'Todos os funis',
      options: [
        // Essas opções devem ser carregadas dinamicamente da API
        { value: 'leads', label: 'Leads' },
        { value: 'prospects', label: 'Prospects' },
        { value: 'customers', label: 'Clientes' },
      ] as FilterOption[],
    },
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'LEAD', label: 'Lead' },
        { value: 'PROSPECT', label: 'Prospect' },
        { value: 'CUSTOMER', label: 'Cliente' },
        { value: 'INACTIVE', label: 'Inativo' },
      ] as FilterOption[],
    },
    {
      key: 'operator',
      label: 'Todas as operadoras',
      options: [
        // Essas opções devem ser carregadas dinamicamente da API
        { value: 'vivo', label: 'Vivo' },
        { value: 'tim', label: 'TIM' },
        { value: 'claro', label: 'Claro' },
      ] as FilterOption[],
    },
  ],
};

// Configuração para Funis de Venda
export const funnelFiltersConfig = {
  searchPlaceholder: "Buscar por nome ou descrição...",
  filters: [
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
        { value: 'draft', label: 'Rascunho' },
      ] as FilterOption[],
    },
    {
      key: 'operator',
      label: 'Todas as operadoras',
      options: [
        // Essas opções devem ser carregadas dinamicamente da API
        { value: 'vivo', label: 'Vivo' },
        { value: 'tim', label: 'TIM' },
        { value: 'claro', label: 'Claro' },
      ] as FilterOption[],
    },
  ],
};

// Configuração para Item Base (Catálogo)
export const catalogFiltersConfig = {
  searchPlaceholder: "Buscar por nome ou descrição do item...",
  filters: [
    {
      key: 'category',
      label: 'Todas as categorias',
      options: [
        { value: 'phone', label: 'Telefonia' },
        { value: 'internet', label: 'Internet' },
        { value: 'tv', label: 'TV' },
        { value: 'combo', label: 'Combo' },
      ] as FilterOption[],
    },
    {
      key: 'operator',
      label: 'Todas as operadoras',
      options: [
        // Essas opções devem ser carregadas dinamicamente da API
        { value: 'vivo', label: 'Vivo' },
        { value: 'tim', label: 'TIM' },
        { value: 'claro', label: 'Claro' },
      ] as FilterOption[],
    },
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
      ] as FilterOption[],
    },
  ],
};

// Configuração para Operadoras
export const operatorFiltersConfig = {
  searchPlaceholder: "Buscar por nome da operadora...",
  filters: [
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
      ] as FilterOption[],
    },
    {
      key: 'type',
      label: 'Todos os tipos',
      options: [
        { value: 'telecom', label: 'Telecomunicações' },
        { value: 'internet', label: 'Internet' },
        { value: 'tv', label: 'TV por assinatura' },
      ] as FilterOption[],
    },
  ],
};

// Configuração para Propostas
export const proposalFiltersConfig = {
  searchPlaceholder: "Buscar por cliente ou número da proposta...",
  filters: [
    {
      key: 'status',
      label: 'Todos os status',
      options: [
        { value: 'DRAFT', label: 'Rascunho' },
        { value: 'SENT', label: 'Enviada' },
        { value: 'APPROVED', label: 'Aprovada' },
        { value: 'REJECTED', label: 'Rejeitada' },
        { value: 'EXPIRED', label: 'Expirada' },
      ] as FilterOption[],
    },
    {
      key: 'period',
      label: 'Todos os períodos',
      options: [
        { value: 'today', label: 'Hoje' },
        { value: 'week', label: 'Esta semana' },
        { value: 'month', label: 'Este mês' },
        { value: 'quarter', label: 'Este trimestre' },
      ] as FilterOption[],
    },
    {
      key: 'operator',
      label: 'Todas as operadoras',
      options: [
        // Essas opções devem ser carregadas dinamicamente da API
        { value: 'vivo', label: 'Vivo' },
        { value: 'tim', label: 'TIM' },
        { value: 'claro', label: 'Claro' },
      ] as FilterOption[],
    },
  ],
};

// Configuração para Relatórios
export const reportFiltersConfig = {
  searchPlaceholder: "Buscar relatórios...",
  filters: [
    {
      key: 'type',
      label: 'Todos os tipos',
      options: [
        { value: 'sales', label: 'Vendas' },
        { value: 'clients', label: 'Clientes' },
        { value: 'funnels', label: 'Funis' },
        { value: 'performance', label: 'Performance' },
      ] as FilterOption[],
    },
    {
      key: 'period',
      label: 'Todos os períodos',
      options: [
        { value: 'today', label: 'Hoje' },
        { value: 'week', label: 'Esta semana' },
        { value: 'month', label: 'Este mês' },
        { value: 'quarter', label: 'Este trimestre' },
        { value: 'year', label: 'Este ano' },
      ] as FilterOption[],
    },
  ],
};
