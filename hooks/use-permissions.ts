'use client';

import useSWR from 'swr';
import type { User } from '@/lib/db/schema';
import { Permission, UserRole, hasPermission, hasAnyPermission } from '@/lib/auth/permissions';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePermissions() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  const can = (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user.role as UserRole, permission);
  };

  const canAny = (permissions: Permission[]) => {
    if (!user) return false;
    return hasAnyPermission(user.role as UserRole, permissions);
  };

  // Legacy method wrappers for backward compatibility
  const canAccessUsers = () => can(Permission.USER_READ);
  const canCreateUsers = () => can(Permission.USER_CREATE);
  const canEditUsers = () => can(Permission.USER_UPDATE);
  const canDeleteUsers = () => can(Permission.USER_DELETE);
  
  const canManageFunnels = () => canAny([Permission.SETTINGS_READ, Permission.SETTINGS_UPDATE]);
  const canManageCatalog = () => canAny([Permission.CATALOG_READ, Permission.CATALOG_UPDATE]);
  const canManageBaseItems = () => canAny([Permission.CATALOG_READ, Permission.CATALOG_UPDATE]);
  
  const canManageOperators = () => canAny([Permission.OPERATOR_READ, Permission.OPERATOR_UPDATE]);
  const canDeleteOperators = () => can(Permission.OPERATOR_DELETE);
  
  const canViewReports = () => canAny([Permission.CLIENT_READ, Permission.OPERATOR_READ, Permission.CATALOG_READ]);
  
  const canManageClients = () => canAny([Permission.CLIENT_READ, Permission.CLIENT_UPDATE]);
  const canEditAllClients = () => can(Permission.CLIENT_UPDATE);
  
  const canEditClientFunnel = (clientUserId?: string) => {
    if (!user) return false;
    
    // Master and Admin can edit any client
    if (hasPermission(user.role as UserRole, Permission.CLIENT_UPDATE)) {
      return true;
    }
    
    // Agent can only edit their own clients (if they have client read permission)
    if (user.role === UserRole.AGENT && clientUserId && hasPermission(user.role as UserRole, Permission.CLIENT_READ)) {
      return user.id === clientUserId;
    }
    
    return false;
  };

  const canDeleteClients = () => can(Permission.CLIENT_DELETE);
  const canTransferClients = () => can(Permission.CLIENT_UPDATE);
  const canAccessFinancial = () => can(Permission.BILLING_MANAGE);

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.includes(user?.role || '');
  };

  return {
    user,
    can,
    canAny,
    // Legacy methods for backward compatibility
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
