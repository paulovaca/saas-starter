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

  const canViewReports = () => {
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
    canViewReports,
    canAccessFinancial,
    hasRole,
    hasAnyRole,
  };
}
