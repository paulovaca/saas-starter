// lib/auth/permissions.ts
export enum Permission {
  // Usuários
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Clientes
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',
  
  // Operadores
  OPERATOR_CREATE = 'operator:create',
  OPERATOR_READ = 'operator:read',
  OPERATOR_UPDATE = 'operator:update',
  OPERATOR_DELETE = 'operator:delete',
  
  // Catálogo
  CATALOG_CREATE = 'catalog:create',
  CATALOG_READ = 'catalog:read',
  CATALOG_UPDATE = 'catalog:update',
  CATALOG_DELETE = 'catalog:delete',
  
  // Configurações
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  
  // Admin
  AGENCY_SETTINGS = 'agency:settings',
  BILLING_MANAGE = 'billing:manage'
}

// User role enum matching the database schema
export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT'
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.DEVELOPER]: Object.values(Permission), // Todas as permissões
  
  [UserRole.MASTER]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
    Permission.OPERATOR_CREATE,
    Permission.OPERATOR_READ,
    Permission.OPERATOR_UPDATE,
    Permission.OPERATOR_DELETE,
    Permission.CATALOG_CREATE,
    Permission.CATALOG_READ,
    Permission.CATALOG_UPDATE,
    Permission.CATALOG_DELETE,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.AGENCY_SETTINGS,
    Permission.BILLING_MANAGE
  ],
  
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.OPERATOR_READ,
    Permission.CATALOG_READ,
    Permission.SETTINGS_READ
  ],
  
  [UserRole.AGENT]: [
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CATALOG_READ
  ]
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole | string, permission: Permission): boolean {
  const rolePermissions = RolePermissions[userRole as UserRole];
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Check if a user role has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole | string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user role has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole | string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(userRole: UserRole | string): Permission[] {
  return RolePermissions[userRole as UserRole] || [];
}

/**
 * Permission groups for easier management
 */
export const PermissionGroups = {
  USER_MANAGEMENT: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
  ],
  CLIENT_MANAGEMENT: [
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
  ],
  OPERATOR_MANAGEMENT: [
    Permission.OPERATOR_CREATE,
    Permission.OPERATOR_READ,
    Permission.OPERATOR_UPDATE,
    Permission.OPERATOR_DELETE,
  ],
  CATALOG_MANAGEMENT: [
    Permission.CATALOG_CREATE,
    Permission.CATALOG_READ,
    Permission.CATALOG_UPDATE,
    Permission.CATALOG_DELETE,
  ],
  SETTINGS_MANAGEMENT: [
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
  ],
  ADMIN_FEATURES: [
    Permission.AGENCY_SETTINGS,
    Permission.BILLING_MANAGE,
  ],
} as const;