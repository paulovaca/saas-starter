// lib/auth/permission-middleware.ts
import { getCurrentUser } from '@/lib/auth/session';
import { Permission, UserRole, hasPermission } from '@/lib/auth/permissions';

/**
 * Server action middleware to check permissions
 */
export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: 'Acesso negado. Usuário não autenticado.' };
  }

  if (!hasPermission(user.role as UserRole, permission)) {
    return { error: 'Acesso negado. Permissão insuficiente.' };
  }

  return { success: true, user };
}

/**
 * Server action middleware to check multiple permissions (any)
 */
export async function requireAnyPermission(permissions: Permission[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: 'Acesso negado. Usuário não autenticado.' };
  }

  const hasAnyPermission = permissions.some(permission => 
    hasPermission(user.role as UserRole, permission)
  );

  if (!hasAnyPermission) {
    return { error: 'Acesso negado. Permissão insuficiente.' };
  }

  return { success: true, user };
}

/**
 * Server action middleware to check multiple permissions (all)
 */
export async function requireAllPermissions(permissions: Permission[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: 'Acesso negado. Usuário não autenticado.' };
  }

  const hasAllPermissions = permissions.every(permission => 
    hasPermission(user.role as UserRole, permission)
  );

  if (!hasAllPermissions) {
    return { error: 'Acesso negado. Permissão insuficiente.' };
  }

  return { success: true, user };
}

/**
 * Server action middleware to check user role
 */
export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: 'Acesso negado. Usuário não autenticado.' };
  }

  if (user.role !== role) {
    return { error: 'Acesso negado. Nível de acesso insuficiente.' };
  }

  return { success: true, user };
}

/**
 * Server action middleware to check user roles (any)
 */
export async function requireAnyRole(roles: UserRole[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: 'Acesso negado. Usuário não autenticado.' };
  }

  if (!roles.includes(user.role as UserRole)) {
    return { error: 'Acesso negado. Nível de acesso insuficiente.' };
  }

  return { success: true, user };
}

/**
 * Helper to wrap server actions with permission checks
 */
export function withPermission<T extends any[], R>(
  permission: Permission,
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const permissionCheck = await requirePermission(permission);
    
    if ('error' in permissionCheck) {
      return permissionCheck as R;
    }

    return action(...args);
  };
}

/**
 * Helper to wrap server actions with multiple permission checks (any)
 */
export function withAnyPermission<T extends any[], R>(
  permissions: Permission[],
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const permissionCheck = await requireAnyPermission(permissions);
    
    if ('error' in permissionCheck) {
      return permissionCheck as R;
    }

    return action(...args);
  };
}

/**
 * Helper to wrap server actions with role checks
 */
export function withRole<T extends any[], R>(
  role: UserRole,
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const roleCheck = await requireRole(role);
    
    if ('error' in roleCheck) {
      return roleCheck as R;
    }

    return action(...args);
  };
}