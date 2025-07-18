'use client';

import useSWR from 'swr';
import type { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePermissions() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  const canAccessUsers = () => {
    return user && ['DEVELOPER', 'MASTER', 'ADMIN'].includes(user.role);
  };

  const canCreateUsers = () => {
    return user?.role === 'MASTER';
  };

  const canEditUsers = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canDeleteUsers = () => {
    return user?.role === 'MASTER';
  };

  const canManageFunnels = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canManageCatalog = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canManageBaseItems = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canManageOperators = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canDeleteOperators = () => {
    return user?.role === 'MASTER';
  };

  const canViewReports = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canManageClients = () => {
    return ['MASTER', 'ADMIN', 'AGENT'].includes(user?.role || '');
  };

  const canEditAllClients = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canEditClientFunnel = (clientUserId?: string) => {
    if (!user) return false;
    
    // Master e Admin podem alterar qualquer cliente
    if (['MASTER', 'ADMIN'].includes(user.role)) {
      return true;
    }
    
    // Agent pode alterar apenas seus próprios clientes
    if (user.role === 'AGENT' && clientUserId) {
      return user.id === clientUserId;
    }
    
    return false;
  };

  const canDeleteClients = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canTransferClients = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const canAccessFinancial = () => {
    return ['MASTER', 'ADMIN'].includes(user?.role || '');
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.includes(user?.role || '');
  };

  return {
    user,
    canAccessUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canManageFunnels,
    canManageCatalog,
    canManageBaseItems,
    canManageOperators,
    canDeleteOperators,
    canViewReports,
    canManageClients,
    canEditAllClients,
    canEditClientFunnel,
    canDeleteClients,
    canTransferClients,
    canAccessFinancial,
    hasRole,
    hasAnyRole,
  };
}
