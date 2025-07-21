# =� Plano de Implementa��o Detalhado de Melhorias

Este documento fornece um plano de implementa��o completo e detalhado para todas as melhorias identificadas na an�lise do SaaS starter.

## =4 **IMPLEMENTA��O CR�TICA - Prioridade M�xima**

<!-- ### 1. **Prote��o CSRF**

#### Implementa��o Passo a Passo:

**1.1. Instalar Depend�ncia**
```bash
npm install csrf
```

**1.2. Criar Middleware CSRF**
```typescript
// lib/auth/csrf.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.CSRF_SECRET || 'your-csrf-secret';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  const expectedToken = crypto
    .createHmac('sha256', SECRET)
    .update(sessionToken)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

export function getCSRFToken(request: NextRequest): string | null {
  return request.headers.get('x-csrf-token') || 
         request.nextUrl.searchParams.get('_token');
}
```

**1.3. Atualizar Middleware Principal**
```typescript
// middleware.ts
import { validateCSRFToken, getCSRFToken } from '@/lib/auth/csrf';

export async function middleware(request: NextRequest) {
  // ... c�digo existente ...

  // Validar CSRF em m�todos de muta��o
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = getCSRFToken(request);
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!csrfToken || !sessionToken || !validateCSRFToken(csrfToken, sessionToken)) {
      return new Response('CSRF token inv�lido', { status: 403 });
    }
  }

  // ... resto do c�digo ...
}
```

**1.4. Criar Hook para Cliente**
```typescript
// hooks/use-csrf.ts
import { useEffect, useState } from 'react';

export function useCSRF() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, []);

  return token;
}
```

**1.5. API Route para Token**
```typescript
// app/api/csrf-token/route.ts
import { generateCSRFToken } from '@/lib/auth/csrf';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'N�o autorizado' }, { status: 401 });
  }

  const token = generateCSRFToken();
  return Response.json({ token });
}
``` -->

<!-- ### 2. **Headers de Seguran�a**

**2.1. Configurar Headers no Middleware**
```typescript
// middleware.ts
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com"
  ].join('; ')
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Aplicar headers de seguran�a
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
```

**2.2. Configurar no Next.js**
```typescript
// next.config.ts
const nextConfig = {
  // ... configura��o existente ...
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
``` -->

### 3. **Autentica��o 2FA**

**3.1. Instalar Depend�ncias**
```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

**3.2. Server Actions para 2FA**
```typescript
// lib/actions/auth/two-factor.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function generateTwoFactorSecret() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usu�rio n�o autenticado');

  const secret = speakeasy.generateSecret({
    name: `${user.name} (${user.agency.name})`,
    issuer: 'SaaS Starter'
  });

  // Salvar secret tempor�rio (n�o ativado ainda)
  await db.update(users)
    .set({ 
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false
    })
    .where(eq(users.id, user.id));

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32
  };
}

export async function enableTwoFactor(token: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usu�rio n�o autenticado');

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret!,
    encoding: 'base32',
    token,
    window: 1
  });

  if (!isValid) {
    throw new Error('Token inv�lido');
  }

  await db.update(users)
    .set({ twoFactorEnabled: true })
    .where(eq(users.id, user.id));

  return { success: true };
}

export async function verifyTwoFactor(token: string, userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user?.twoFactorSecret) return false;

  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1
  });
}
```

**3.3. Componente de Configura��o 2FA**
```typescript
// components/auth/two-factor-setup.tsx
'use client';

import { useState } from 'react';
import { generateTwoFactorSecret, enableTwoFactor } from '@/lib/actions/auth/two-factor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export function TwoFactorSetup() {
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleGenerateSecret() {
    setLoading(true);
    try {
      const result = await generateTwoFactorSecret();
      setSecret(result.secret);
      setQrCode(result.qrCode);
    } catch (error) {
      console.error('Erro ao gerar secret:', error);
    }
    setLoading(false);
  }

  async function handleEnable2FA() {
    setLoading(true);
    try {
      await enableTwoFactor(token);
      // Redirecionar ou mostrar sucesso
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {!secret ? (
        <Button onClick={handleGenerateSecret} disabled={loading}>
          Configurar Autentica��o 2FA
        </Button>
      ) : (
        <div className="space-y-4">
          <div>
            <h3>Escaneie o QR Code</h3>
            <Image src={qrCode} alt="QR Code" width={200} height={200} />
          </div>
          
          <div>
            <p>Ou digite manualmente:</p>
            <code className="bg-gray-100 p-2 rounded">{secret}</code>
          </div>

          <div>
            <Input
              placeholder="Digite o c�digo do app"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
            />
            <Button 
              onClick={handleEnable2FA} 
              disabled={loading || token.length !== 6}
            >
              Ativar 2FA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

<!-- ### 4. **Gest�o de Sess�es**

**4.1. Criar Tabela de Sess�es Ativas**
```sql
-- migrations/add_active_sessions.sql
CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX idx_active_sessions_expires ON active_sessions(expires_at);
```

**4.2. Schema Drizzle**
```typescript
// lib/db/schema/sessions.ts
import { pgTable, text, timestamp, jsonb, inet, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const activeSessions = pgTable('active_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  deviceInfo: jsonb('device_info'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});
```

**4.3. Gerenciador de Sess�es**
```typescript
// lib/auth/session-manager.ts
import { db } from '@/lib/db';
import { activeSessions } from '@/lib/db/schema/sessions';
import { eq, lt } from 'drizzle-orm';

export class SessionManager {
  static async createSession(userId: string, sessionToken: string, request: Request) {
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || '';

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

    await db.insert(activeSessions).values({
      userId,
      sessionToken,
      userAgent,
      ipAddress,
      expiresAt,
      deviceInfo: {
        userAgent,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async updateLastAccessed(sessionToken: string) {
    await db.update(activeSessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(activeSessions.sessionToken, sessionToken));
  }

  static async getUserSessions(userId: string) {
    return await db.select()
      .from(activeSessions)
      .where(eq(activeSessions.userId, userId));
  }

  static async revokeSession(sessionId: string, userId: string) {
    await db.delete(activeSessions)
      .where(eq(activeSessions.id, sessionId))
      .where(eq(activeSessions.userId, userId));
  }

  static async revokeAllUserSessions(userId: string, exceptToken?: string) {
    let query = db.delete(activeSessions)
      .where(eq(activeSessions.userId, userId));
    
    if (exceptToken) {
      query = query.where(ne(activeSessions.sessionToken, exceptToken));
    }

    await query;
  }

  static async cleanupExpiredSessions() {
    await db.delete(activeSessions)
      .where(lt(activeSessions.expiresAt, new Date()));
  }
}
``` -->

## =� **ALTA PRIORIDADE - Implementa��o Estrutural**

<!-- ### 5. **Corre��o N+1 Queries**

**5.1. Otimizar getOperatorDetails**
```typescript
// lib/actions/operators/get-operator-details.ts (CORRIGIDO)
export async function getOperatorDetails(operatorId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('N�o autorizado');

  // ANTES: N+1 Query
  // const items = await getOperatorItems();
  // const itemsWithRules = await Promise.all(
  //   items.map(async (item) => {
  //     const rules = await getCommissionRules(item.id);
  //     return { ...item, rules };
  //   })
  // );

  // DEPOIS: Single Query com JOIN
  const operatorWithItems = await db
    .select({
      // Operator fields
      operatorId: operators.id,
      operatorName: operators.name,
      operatorType: operators.type,
      
      // Item fields
      itemId: operatorItems.id,
      itemName: operatorItems.name,
      catalogItemId: operatorItems.catalogItemId,
      
      // Commission rule fields
      ruleId: commissionRules.id,
      ruleType: commissionRules.type,
      ruleValue: commissionRules.value,
      ruleConditions: commissionRules.conditions
    })
    .from(operators)
    .leftJoin(operatorItems, eq(operators.id, operatorItems.operatorId))
    .leftJoin(commissionRules, eq(operatorItems.id, commissionRules.operatorItemId))
    .where(
      and(
        eq(operators.id, operatorId),
        eq(operators.agencyId, user.agencyId)
      )
    );

  // Agrupar resultados
  const grouped = operatorWithItems.reduce((acc, row) => {
    if (!acc.operator) {
      acc.operator = {
        id: row.operatorId,
        name: row.operatorName,
        type: row.operatorType,
        items: []
      };
    }

    if (row.itemId) {
      let item = acc.operator.items.find(i => i.id === row.itemId);
      if (!item) {
        item = {
          id: row.itemId,
          name: row.itemName,
          catalogItemId: row.catalogItemId,
          commissionRules: []
        };
        acc.operator.items.push(item);
      }

      if (row.ruleId) {
        item.commissionRules.push({
          id: row.ruleId,
          type: row.ruleType,
          value: row.ruleValue,
          conditions: row.ruleConditions
        });
      }
    }

    return acc;
  }, { operator: null });

  return grouped.operator;
}
```

**5.2. Query Builder para Reutiliza��o**
```typescript
// lib/db/query-builders/operators.ts
export class OperatorQueryBuilder {
  static withItems(operatorId: string) {
    return db
      .select({
        // Campos do operador
        operatorId: operators.id,
        operatorName: operators.name,
        
        // Campos dos itens
        itemId: operatorItems.id,
        itemName: operatorItems.name,
        
        // Campos das regras de comiss�o
        ruleId: commissionRules.id,
        ruleType: commissionRules.type
      })
      .from(operators)
      .leftJoin(operatorItems, eq(operators.id, operatorItems.operatorId))
      .leftJoin(commissionRules, eq(operatorItems.id, commissionRules.operatorItemId))
      .where(eq(operators.id, operatorId));
  }

  static withAgencyFilter(agencyId: string) {
    return this.where(eq(operators.agencyId, agencyId));
  }
}
``` -->

### 6. **Sistema de Permiss�es Centralizado**

**6.1. Enum de Permiss�es**
```typescript
// lib/auth/permissions.ts
export enum Permission {
  // Usu�rios
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
  
  // Cat�logo
  CATALOG_CREATE = 'catalog:create',
  CATALOG_READ = 'catalog:read',
  CATALOG_UPDATE = 'catalog:update',
  CATALOG_DELETE = 'catalog:delete',
  
  // Configura��es
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  
  // Admin
  AGENCY_SETTINGS = 'agency:settings',
  BILLING_MANAGE = 'billing:manage'
}

export const RolePermissions = {
  [UserRole.DEVELOPER]: Object.values(Permission), // Todas as permiss�es
  
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
```

**6.2. Hook de Permiss�es**
```typescript
// hooks/use-permissions.ts
import { useUser } from '@/hooks/use-user';
import { Permission, RolePermissions } from '@/lib/auth/permissions';

export function usePermissions() {
  const user = useUser();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return RolePermissions[user.role].includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: RolePermissions[user?.role] || []
  };
}
```

**6.3. Middleware de Permiss�es**
```typescript
// lib/auth/permission-middleware.ts
import { Permission, RolePermissions } from './permissions';
import { getCurrentUser } from './session';

export function requirePermission(permission: Permission) {
  return async function permissionMiddleware<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    ...args: T
  ): Promise<R> {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Usu�rio n�o autenticado');
    }

    const userPermissions = RolePermissions[user.role];
    if (!userPermissions.includes(permission)) {
      throw new Error(`Permiss�o ${permission} negada para role ${user.role}`);
    }

    return await fn(...args);
  };
}

// Decorator para server actions
export function withPermission(permission: Permission) {
  return function decorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('Usu�rio n�o autenticado');
      }

      const userPermissions = RolePermissions[user.role];
      if (!userPermissions.includes(permission)) {
        throw new Error(`Permiss�o ${permission} negada`);
      }

      return await originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
```

### 7. **Padroniza��o de Server Actions**

**7.1. Action Wrapper Universal**
```typescript
// lib/actions/action-wrapper.ts
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/session';
import { Permission, RolePermissions } from '@/lib/auth/permissions';
import { handleDatabaseError } from '@/lib/services/error';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { RateLimiter } from '@/lib/services/rate-limiter';

interface ActionOptions {
  permission?: Permission;
  requireAuth?: boolean;
  rateLimitKey?: string;
  rateLimitAttempts?: number;
  rateLimitWindow?: number;
  logActivity?: boolean;
  activityType?: string;
}

export function createAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, user: any) => Promise<TOutput>,
  options: ActionOptions = {}
) {
  return async (input: unknown): Promise<{ success: true; data: TOutput } | { success: false; error: string }> => {
    try {
      // 1. Validar entrada
      const validatedInput = schema.parse(input);

      // 2. Autentica��o
      let user = null;
      if (options.requireAuth !== false) {
        user = await getCurrentUser();
        if (!user) {
          return { success: false, error: 'Usu�rio n�o autenticado' };
        }
      }

      // 3. Verificar permiss�es
      if (options.permission && user) {
        const userPermissions = RolePermissions[user.role];
        if (!userPermissions.includes(options.permission)) {
          return { success: false, error: 'Permiss�o negada' };
        }
      }

      // 4. Rate limiting
      if (options.rateLimitKey && user) {
        const rateLimiter = new RateLimiter({
          keyPrefix: options.rateLimitKey,
          attempts: options.rateLimitAttempts || 10,
          window: options.rateLimitWindow || 60000
        });

        const isAllowed = await rateLimiter.check(user.id);
        if (!isAllowed) {
          return { success: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' };
        }
      }

      // 5. Executar a��o
      const result = await handler(validatedInput, user);

      // 6. Log de atividade
      if (options.logActivity && options.activityType && user) {
        await ActivityLogger.log({
          userId: user.id,
          agencyId: user.agencyId,
          type: options.activityType,
          description: `A��o executada: ${options.activityType}`,
          metadata: { input: validatedInput }
        });
      }

      return { success: true, data: result };

    } catch (error) {
      console.error('Erro na action:', error);

      // Tratar erros de banco de dados
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = handleDatabaseError(error as any);
        return { success: false, error: dbError.message };
      }

      // Erros de valida��o
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return { success: false, error: `Erro de valida��o: ${firstError.message}` };
      }

      // Outros erros
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      return { success: false, error: message };
    }
  };
}
```

**7.2. Exemplo de Uso da Action Wrapper**
```typescript
// lib/actions/users/create-user.ts
import { createAction } from '../action-wrapper';
import { createUserSchema } from '@/lib/validations/users';
import { Permission } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const createUser = createAction(
  createUserSchema,
  async (input, currentUser) => {
    const [newUser] = await db.insert(users).values({
      ...input,
      agencyId: currentUser.agencyId
    }).returning();

    return newUser;
  },
  {
    permission: Permission.USER_CREATE,
    rateLimitKey: 'create-user',
    rateLimitAttempts: 5,
    rateLimitWindow: 60000,
    logActivity: true,
    activityType: 'USER_CREATED'
  }
);
```

## =� **M�DIA PRIORIDADE - Melhorias de Experi�ncia**

### 8. **Melhorias de Acessibilidade**

**8.1. Componente de Skip Links**
```typescript
// components/ui/skip-links.tsx
export function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-white focus:p-4 focus:border-2 focus:border-blue-500">
      <a href="#main-content" className="underline text-blue-600">
        Pular para o conte�do principal
      </a>
      <a href="#navigation" className="underline text-blue-600 ml-4">
        Pular para a navega��o
      </a>
    </div>
  );
}
```

**8.2. Hook para Gerenciamento de Foco**
```typescript
// hooks/use-focus-management.ts
import { useEffect, useRef } from 'react';

export function useFocusManagement() {
  const focusableElementsString = 
    'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(focusableElementsString);
    const firstTabStop = focusableElements[0] as HTMLElement;
    const lastTabStop = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstTabStop) {
            e.preventDefault();
            lastTabStop.focus();
          }
        } else {
          if (document.activeElement === lastTabStop) {
            e.preventDefault();
            firstTabStop.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        element.dispatchEvent(new CustomEvent('escape'));
      }
    });

    // Focar no primeiro elemento
    firstTabStop?.focus();
  };

  return { trapFocus };
}
```

**8.3. Componente Dialog Acess�vel**
```typescript
// components/ui/dialog.tsx (MELHORADO)
'use client';

import { useEffect, useRef } from 'react';
import { useFocusManagement } from '@/hooks/use-focus-management';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { trapFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Salvar elemento que tinha foco antes
      const previousActiveElement = document.activeElement as HTMLElement;
      
      // Configurar trap de foco
      trapFocus(dialogRef.current);

      // Event listener para escape
      const handleEscape = () => onClose();
      dialogRef.current.addEventListener('escape', handleEscape);

      // Cleanup
      return () => {
        dialogRef.current?.removeEventListener('escape', handleEscape);
        previousActiveElement?.focus();
      };
    }
  }, [isOpen, trapFocus, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar modal"
          >
            
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

### 9. **Formul�rios Multi-Step**

**9.1. Hook para Multi-Step Forms**
```typescript
// hooks/use-multi-step-form.ts
import { useState } from 'react';

interface UseMultiStepFormProps {
  steps: string[];
  initialStep?: number;
}

export function useMultiStepForm({ steps, initialStep = 0 }: UseMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const markStepAsCompleted = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const isStepCompleted = (step: number) => {
    return completedSteps.has(step);
  };

  const canGoToStep = (step: number) => {
    // Pode ir para steps anteriores ou o pr�ximo step se o atual estiver completo
    return step <= currentStep || (step === currentStep + 1 && isStepCompleted(currentStep));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return {
    currentStep,
    currentStepName: steps[currentStep],
    steps,
    nextStep,
    previousStep,
    goToStep,
    markStepAsCompleted,
    isStepCompleted,
    canGoToStep,
    progress,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1
  };
}
```

**9.2. Componente Step Progress**
```typescript
// components/ui/step-progress.tsx
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
  canGoToStep?: (step: number) => boolean;
}

export function StepProgress({ 
  steps, 
  currentStep, 
  completedSteps, 
  onStepClick,
  canGoToStep = () => true
}: StepProgressProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <button
              onClick={() => canGoToStep(index) && onStepClick?.(index)}
              disabled={!canGoToStep(index)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                transition-colors duration-200
                ${index === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : completedSteps.has(index)
                  ? 'bg-green-600 text-white'
                  : canGoToStep(index)
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {completedSteps.has(index) ? '' : index + 1}
            </button>
            <span className="text-xs mt-1 text-center">
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className={`
                h-px flex-1 mx-2 mt-4
                ${completedSteps.has(index) ? 'bg-green-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**9.3. Client Form Multi-Step**
```typescript
// components/clients/client-form-multi-step.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMultiStepForm } from '@/hooks/use-multi-step-form';
import { StepProgress } from '@/components/ui/step-progress';
import { clientFormSchema } from '@/lib/validations/clients';

const FORM_STEPS = [
  'Informa��es B�sicas',
  'Contato',
  'Endere�o',
  'Documentos',
  'Configura��es'
];

export function ClientFormMultiStep() {
  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    mode: 'onChange'
  });

  const {
    currentStep,
    nextStep,
    previousStep,
    goToStep,
    markStepAsCompleted,
    isStepCompleted,
    canGoToStep,
    isFirstStep,
    isLastStep,
    progress
  } = useMultiStepForm({
    steps: FORM_STEPS
  });

  const validateCurrentStep = async () => {
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(stepFields);
    
    if (isValid) {
      markStepAsCompleted(currentStep);
    }
    
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const handleStepClick = async (step: number) => {
    if (step < currentStep || await validateCurrentStep()) {
      goToStep(step);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <StepProgress
          steps={FORM_STEPS}
          currentStep={currentStep}
          completedSteps={new Set()} // Implementar l�gica de steps completos
          onStepClick={handleStepClick}
          canGoToStep={canGoToStep}
        />
      </div>

      <form className="space-y-6">
        {/* Renderizar step atual */}
        {currentStep === 0 && <BasicInfoStep form={form} />}
        {currentStep === 1 && <ContactStep form={form} />}
        {currentStep === 2 && <AddressStep form={form} />}
        {currentStep === 3 && <DocumentsStep form={form} />}
        {currentStep === 4 && <SettingsStep form={form} />}

        {/* Navega��o */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={previousStep}
            disabled={isFirstStep}
            className="px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            Anterior
          </button>
          
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Pr�ximo
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Finalizar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function getStepFields(step: number): string[] {
  const fieldsByStep = {
    0: ['name', 'type', 'status'],
    1: ['email', 'phone', 'whatsapp'],
    2: ['address', 'city', 'state', 'zipCode'],
    3: ['cpf', 'rg', 'cnpj'],
    4: ['funnelId', 'stageId', 'tags']
  };
  
  return fieldsByStep[step as keyof typeof fieldsByStep] || [];
}
```

### 10. **Sistema de Cache Inteligente**

**10.1. Cache Service com Tags e TTL**
```typescript
// lib/services/cache/intelligent-cache.ts
export class IntelligentCache {
  private static instance: IntelligentCache;
  private cache: Map<string, CacheEntry> = new Map();
  private tags: Map<string, Set<string>> = new Map();

  static getInstance(): IntelligentCache {
    if (!this.instance) {
      this.instance = new IntelligentCache();
    }
    return this.instance;
  }

  async remember<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const entry = this.cache.get(key);
    
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }

    const data = await fn();
    this.set(key, data, options);
    
    return data;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const entry: CacheEntry = {
      data,
      createdAt: Date.now(),
      ttl: options.ttl || 300000, // 5 minutos default
      tags: options.tags || []
    };

    this.cache.set(key, entry);

    // Indexar por tags
    entry.tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)!.add(key);
    });
  }

  invalidateByTag(tag: string): void {
    const keys = this.tags.get(tag);
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
      this.tags.delete(tag);
    }
  }

  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  // Cleanup autom�tico
  startCleanupTimer(): void {
    setInterval(() => {
      this.cache.forEach((entry, key) => {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
        }
      });
    }, 60000); // Cleanup a cada minuto
  }
}

interface CacheEntry {
  data: any;
  createdAt: number;
  ttl: number;
  tags: string[];
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}
```

**10.2. Query Cache para Banco de Dados**
```typescript
// lib/db/query-cache.ts
import { IntelligentCache } from '@/lib/services/cache/intelligent-cache';

export class QueryCache {
  private static cache = IntelligentCache.getInstance();

  static async remember<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      agencyId?: string;
    } = {}
  ): Promise<T> {
    const key = options.agencyId 
      ? `${options.agencyId}:${queryKey}`
      : queryKey;

    return await this.cache.remember(key, queryFn, {
      ttl: options.ttl || 300000, // 5 minutos
      tags: options.tags || []
    });
  }

  static invalidateByAgency(agencyId: string): void {
    this.cache.invalidateByPattern(`${agencyId}:.*`);
  }

  static invalidateUsers(agencyId: string): void {
    this.cache.invalidateByTag(`users:${agencyId}`);
  }

  static invalidateClients(agencyId: string): void {
    this.cache.invalidateByTag(`clients:${agencyId}`);
  }

  static invalidateOperators(agencyId: string): void {
    this.cache.invalidateByTag(`operators:${agencyId}`);
  }
}
```

**10.3. Exemplo de Uso em Server Actions**
```typescript
// lib/actions/clients/get-clients.ts
import { QueryCache } from '@/lib/db/query-cache';

export async function getClients() {
  const user = await getCurrentUser();
  if (!user) throw new Error('N�o autorizado');

  return await QueryCache.remember(
    'clients:list',
    async () => {
      return await db.select()
        .from(clients)
        .where(eq(clients.agencyId, user.agencyId))
        .orderBy(desc(clients.createdAt));
    },
    {
      ttl: 300000, // 5 minutos
      tags: [`clients:${user.agencyId}`],
      agencyId: user.agencyId
    }
  );
}

// Invalidar cache ap�s muta��es
export async function createClient(input: CreateClientInput) {
  const result = await createAction(/* ... */);
  
  // Invalidar cache relacionado
  QueryCache.invalidateClients(user.agencyId);
  
  return result;
}
```

## =5 **BAIXA PRIORIDADE - Features Avan�adas**

### 11. **Internacionaliza��o (i18n)**

**11.1. Configura��o Next-Intl**
```bash
npm install next-intl
```

**11.2. Configura��o**
```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

**11.3. Middleware i18n**
```typescript
// middleware.ts (ATUALIZADO)
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['pt', 'en', 'es'],
  defaultLocale: 'pt'
});

export default function middleware(request: NextRequest) {
  // Aplicar i18n primeiro
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  // Depois aplicar auth e seguran�a
  return authMiddleware(request);
}
```

### 12. **Sistema de Webhooks**

**12.1. Schema de Webhooks**
```typescript
// lib/db/schema/webhooks.ts
export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  name: text('name').notNull(),
  url: text('url').notNull(),
  events: jsonb('events').notNull(), // ['client.created', 'user.updated']
  secret: text('secret').notNull(),
  isActive: boolean('is_active').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  failureCount: integer('failure_count').default(0),
  createdAt: timestamp('created_at').defaultNow()
});
```

**12.2. Webhook Service**
```typescript
// lib/services/webhook.ts
export class WebhookService {
  static async trigger(event: string, data: any, agencyId: string) {
    const activeWebhooks = await db.select()
      .from(webhooks)
      .where(
        and(
          eq(webhooks.agencyId, agencyId),
          eq(webhooks.isActive, true)
        )
      );

    const relevantWebhooks = activeWebhooks.filter(webhook => 
      (webhook.events as string[]).includes(event)
    );

    await Promise.allSettled(
      relevantWebhooks.map(webhook => 
        this.sendWebhook(webhook, event, data)
      )
    );
  }

  private static async sendWebhook(webhook: any, event: string, data: any) {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook_id: webhook.id
    };

    const signature = this.generateSignature(payload, webhook.secret);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'SaaS-Starter-Webhooks/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Sucesso - resetar contador de falhas
      await db.update(webhooks)
        .set({ 
          failureCount: 0,
          lastTriggeredAt: new Date()
        })
        .where(eq(webhooks.id, webhook.id));

    } catch (error) {
      // Incrementar contador de falhas
      const newFailureCount = webhook.failureCount + 1;
      
      await db.update(webhooks)
        .set({ 
          failureCount: newFailureCount,
          isActive: newFailureCount < 5 // Desativar ap�s 5 falhas
        })
        .where(eq(webhooks.id, webhook.id));

      console.error(`Webhook ${webhook.id} failed:`, error);
    }
  }

  private static generateSignature(payload: any, secret: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
```

### 13. **Analytics e M�tricas**

**13.1. Schema de Analytics**
```typescript
// lib/db/schema/analytics.ts
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  userId: uuid('user_id').references(() => users.id),
  event: text('event').notNull(), // 'page_view', 'client_created', etc.
  properties: jsonb('properties'), // Dados adicionais
  timestamp: timestamp('timestamp').defaultNow(),
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address')
});
```

**13.2. Analytics Service**
```typescript
// lib/services/analytics.ts
export class AnalyticsService {
  static async track(
    event: string,
    properties: Record<string, any> = {},
    options: {
      userId?: string;
      agencyId?: string;
      sessionId?: string;
      userAgent?: string;
      ipAddress?: string;
    } = {}
  ) {
    await db.insert(analyticsEvents).values({
      event,
      properties,
      agencyId: options.agencyId!,
      userId: options.userId,
      sessionId: options.sessionId,
      userAgent: options.userAgent,
      ipAddress: options.ipAddress
    });
  }

  static async getMetrics(agencyId: string, dateRange: DateRange) {
    // Implementar queries para m�tricas espec�ficas
    const clientsCreated = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.agencyId, agencyId),
          eq(analyticsEvents.event, 'client_created'),
          gte(analyticsEvents.timestamp, dateRange.start),
          lte(analyticsEvents.timestamp, dateRange.end)
        )
      );

    return {
      clientsCreated: clientsCreated[0]?.count || 0,
      // Mais m�tricas...
    };
  }
}
```

## =� **Cronograma de Implementa��o Sugerido**

### **Fase 1 - Seguran�a Cr�tica (Semana 1-2)**
- [ ] Implementar prote��o CSRF
- [ ] Configurar headers de seguran�a
- [ ] Implementar 2FA
- [ ] Melhorar gest�o de sess�es

### **Fase 2 - Performance Cr�tica (Semana 3)**
- [ ] Corrigir N+1 queries
- [ ] Eliminar queries duplicadas
- [ ] Implementar cache em queries DB

### **Fase 3 - Arquitetura (Semana 4-5)**
- [ ] Sistema centralizado de permiss�es
- [ ] Padronizar server actions
- [ ] Implementar action wrapper universal

### **Fase 4 - UX/UI (Semana 6-7)**
- [ ] Melhorias de acessibilidade
- [ ] Formul�rios multi-step
- [ ] Design system consistente

### **Fase 5 - Testes (Semana 8)**
- [ ] Expandir cobertura de testes
- [ ] Testes de integra��o
- [ ] Testes E2E cr�ticos

### **Fase 6 - Features Avan�adas (Semana 9-12)**
- [ ] Sistema de cache inteligente
- [ ] Webhooks
- [ ] Analytics b�sico
- [ ] i18n (se necess�rio)

## <� **Crit�rios de Sucesso**

### **Seguran�a**
- [ ] Todas as vulnerabilidades cr�ticas corrigidas
- [ ] Headers de seguran�a implementados
- [ ] 2FA funcionando
- [ ] Gest�o de sess�es robusta

### **Performance**
- [ ] N+1 queries eliminadas
- [ ] Tempo de resposta < 500ms para 95% das requests
- [ ] Cache hit ratio > 70%
- [ ] Bundle size otimizado

### **Qualidade**
- [ ] Cobertura de testes > 75%
- [ ] Zero erros TypeScript
- [ ] Padr�es de c�digo consistentes
- [ ] Documenta��o atualizada

### **UX/UI**
- [ ] Score de acessibilidade > 90
- [ ] Responsivo em todos os breakpoints
- [ ] Formul�rios otimizados
- [ ] Loading states implementados

Este plano detalha cada implementa��o necess�ria para elevar seu SaaS ao n�vel de produ��o enterprise. Cada se��o pode ser implementada independentemente, permitindo flexibilidade no cronograma.