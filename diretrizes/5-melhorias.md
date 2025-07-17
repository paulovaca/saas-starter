# 🎯 Melhorias Fundamentais Pós-Fase 1 - CRM Travel SaaS

## 📊 Estado Atual (Fase 1 Completa)

### ✅ O que já temos implementado:
- **Autenticação**: Login/Signup com JWT
- **Multi-tenancy**: Isolamento por agencyId
- **Roles básicos**: DEVELOPER, MASTER, ADMIN, AGENT
- **Dashboard inicial**: Página principal e configurações
- **Integração Stripe**: Checkout e webhook básicos
- **Schema do banco**: 11 tabelas principais definidas

### ⚠️ O que precisa ser melhorado ANTES da Fase 2:
- Logs de atividade sem implementação real (apenas placeholder)
- Estrutura de pastas misturando responsabilidades
- Validação de dados inconsistente
- Ausência de tratamento de erros padronizado
- Falta de testes automatizados
- Sem cache ou otimizações de performance

## 🔧 Melhorias Estruturais Imediatas (Antes da Fase 2)

### 1. **Reestruturação de Pastas - Separação de Responsabilidades**

```
app/                              # Apenas roteamento e UI
├── (auth)/                       # Renomear de (login)
│   ├── sign-in/
│   │   └── page.tsx             # Apenas UI
│   ├── sign-up/
│   │   └── page.tsx             # Apenas UI
│   └── layout.tsx
├── (app)/                        # Renomear de (dashboard)
│   ├── dashboard/
│   │   └── page.tsx             # Apenas UI
│   ├── settings/                 # Agrupar todas as configurações
│   │   ├── general/
│   │   ├── security/
│   │   └── activity/
│   └── layout.tsx
└── api/
    └── v1/                       # Versionamento desde o início
        ├── auth/
        ├── agency/
        └── webhooks/

lib/                              # Lógica de negócio separada da UI
├── actions/                      # Server Actions centralizadas
│   ├── auth/
│   │   ├── sign-in.ts
│   │   ├── sign-up.ts
│   │   └── sign-out.ts
│   └── agency/
│       ├── update.ts
│       └── delete.ts
├── validations/                  # Schemas Zod centralizados
│   ├── auth.schema.ts
│   ├── agency.schema.ts
│   └── common.schema.ts         # CPF, CNPJ, telefone BR
├── db/
│   ├── schema/                   # Separar schemas por domínio
│   │   ├── auth.ts              # users, roles
│   │   ├── agency.ts            # agencies, settings
│   │   ├── activity.ts          # NEW: activity_logs
│   │   └── index.ts             # Export agregado
│   └── queries/                  # Queries organizadas por domínio
│       ├── auth.ts
│       ├── agency.ts
│       └── activity.ts          # NEW: queries reais
└── services/                     # Serviços reutilizáveis
    ├── auth/
    ├── activity-logger/          # NEW: logging real
    └── error-handler/            # NEW: tratamento padronizado
```

### 2. **Implementação Real de Activity Logs**

```typescript
// lib/db/schema/activity.ts
import { pgTable, uuid, varchar, text, timestamp, json, index } from 'drizzle-orm/pg-core';
import { agencies } from './agency';
import { users } from './auth';

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  metadata: json('metadata').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  agencyIdx: index('activity_logs_agency_idx').on(table.agencyId),
  userIdx: index('activity_logs_user_idx').on(table.userId),
  createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
  actionIdx: index('activity_logs_action_idx').on(table.action),
}));

// lib/services/activity-logger/index.ts
import { headers } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { activityLogs } from '@/lib/db/schema/activity';

export class ActivityLogger {
  static async log({
    agencyId,
    userId,
    action,
    entityType,
    entityId,
    metadata,
  }: {
    agencyId: string;
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const headersList = headers();
      const ipAddress = headersList.get('x-forwarded-for') || 
                       headersList.get('x-real-ip') || 
                       'unknown';
      const userAgent = headersList.get('user-agent') || 'unknown';

      await db.insert(activityLogs).values({
        agencyId,
        userId,
        action,
        entityType,
        entityId,
        metadata,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Não falhar a operação principal se o log falhar
    }
  }

  static async getActivityLogs(agencyId: string, limit = 50) {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.agencyId, agencyId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
}
```

### 3. **Sistema de Validação Centralizado com Schemas Brasileiros**

```typescript
// lib/validations/common.schema.ts
import { z } from 'zod';

// Validações brasileiras
export const cpfSchema = z.string().transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 11, 'CPF deve ter 11 dígitos')
  .refine(val => {
    // Algoritmo de validação de CPF
    if (/^(\d)\1{10}$/.test(val)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(val[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(val[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(val[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    
    return digit === parseInt(val[10]);
  }, 'CPF inválido');

export const cnpjSchema = z.string().transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 14, 'CNPJ deve ter 14 dígitos')
  .refine(val => {
    // Algoritmo de validação de CNPJ
    if (/^(\d)\1{13}$/.test(val)) return false;
    
    let length = val.length - 2;
    let numbers = val.substring(0, length);
    let digits = val.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits[0])) return false;
    
    length = length + 1;
    numbers = val.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits[1]);
  }, 'CNPJ inválido');

export const phoneSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 10 || val.length === 11, 'Telefone inválido')
  .transform(val => {
    if (val.length === 10) {
      return `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6)}`;
    }
    return `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
  });

export const cepSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 8, 'CEP deve ter 8 dígitos')
  .transform(val => `${val.substring(0, 5)}-${val.substring(5)}`);

export const moneySchema = z.number()
  .min(0, 'Valor não pode ser negativo')
  .multipleOf(0.01, 'Máximo 2 casas decimais')
  .transform(val => Math.round(val * 100) / 100);

// lib/validations/auth.schema.ts
import { z } from 'zod';
import { cnpjSchema, phoneSchema } from './common.schema';

export const signInSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').trim(),
  agencyName: z.string().min(3, 'Nome da agência deve ter no mínimo 3 caracteres').trim(),
  cnpj: cnpjSchema.optional(),
  phone: phoneSchema.optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});
```

### 4. **Tratamento de Erros Padronizado**

```typescript
// lib/services/error-handler/index.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 'NOT_FOUND', 404);
  }
}

// lib/services/error-handler/action-wrapper.ts
import { AppError } from './index';
import { ZodError } from 'zod';
import { ActivityLogger } from '../activity-logger';

type ActionResult<T> = {
  data?: T;
  error?: string;
  details?: any;
};

export async function safeAction<T>(
  action: () => Promise<T>,
  options?: {
    logActivity?: {
      agencyId: string;
      userId: string;
      action: string;
      entityType?: string;
      entityId?: string;
    };
  }
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    
    // Log atividade se configurado
    if (options?.logActivity) {
      await ActivityLogger.log(options.logActivity);
    }
    
    return { data };
  } catch (error) {
    // Tratamento específico para redirects do Next.js
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    // Tratamento de erros de validação Zod
    if (error instanceof ZodError) {
      return {
        error: 'Dados inválidos',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    
    // Tratamento de erros customizados
    if (error instanceof AppError) {
      return {
        error: error.message,
        details: error.details,
      };
    }
    
    // Log de erros não esperados
    console.error('Unexpected error:', error);
    
    return {
      error: 'Ocorreu um erro inesperado. Tente novamente.',
    };
  }
}
```

### 5. **Refatoração das Actions com Nova Estrutura**

```typescript
// lib/actions/auth/sign-in.ts
import { signInSchema } from '@/lib/validations/auth.schema';
import { safeAction } from '@/lib/services/error-handler/action-wrapper';
import { AuthenticationError } from '@/lib/services/error-handler';
import { comparePasswords, setSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function signIn(state: any, formData: FormData) {
  return safeAction(async () => {
    // Validação
    const validatedData = signInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Buscar usuário
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verificar senha
    const validPassword = await comparePasswords(
      validatedData.password,
      user.passwordHash
    );

    if (!validPassword) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verificar se agência está ativa
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, user.agencyId))
      .limit(1);

    if (!agency?.isActive) {
      throw new AuthenticationError('Agência inativa');
    }

    // Criar sessão
    await setSession(user);
    
    // Redirect será capturado e relançado
    redirect('/dashboard');
  }, {
    logActivity: user ? {
      agencyId: user.agencyId,
      userId: user.id,
      action: 'SIGN_IN',
    } : undefined,
  });
}
```

### 6. **Otimizações de Performance com Cache**

```typescript
// lib/db/cached-queries.ts
import { unstable_cache } from 'next/cache';
import { db } from './drizzle';
import { users, agencies } from './schema';
import { eq } from 'drizzle-orm';

export const getCachedUser = unstable_cache(
  async (userId: string) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return user;
  },
  ['user'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user'],
  }
);

export const getCachedAgency = unstable_cache(
  async (agencyId: string) => {
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);
    
    return agency;
  },
  ['agency'],
  {
    revalidate: 600, // 10 minutos
    tags: ['agency'],
  }
);

// Função para invalidar cache quando necessário
export async function invalidateUserCache(userId: string) {
  revalidateTag('user');
}

export async function invalidateAgencyCache(agencyId: string) {
  revalidateTag('agency');
}
```

### 7. **Configuração de Testes Básicos**

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

// __tests__/validations/common.test.ts
import { cpfSchema, cnpjSchema, phoneSchema } from '@/lib/validations/common.schema';

describe('Brazilian Validations', () => {
  describe('CPF Validation', () => {
    it('should validate correct CPF', () => {
      const validCPF = '123.456.789-09';
      expect(() => cpfSchema.parse(validCPF)).not.toThrow();
    });

    it('should reject invalid CPF', () => {
      const invalidCPF = '111.111.111-11';
      expect(() => cpfSchema.parse(invalidCPF)).toThrow();
    });
  });

  describe('CNPJ Validation', () => {
    it('should validate correct CNPJ', () => {
      const validCNPJ = '11.222.333/0001-81';
      expect(() => cnpjSchema.parse(validCNPJ)).not.toThrow();
    });

    it('should reject invalid CNPJ', () => {
      const invalidCNPJ = '11.111.111/1111-11';
      expect(() => cnpjSchema.parse(invalidCNPJ)).toThrow();
    });
  });

  describe('Phone Validation', () => {
    it('should format mobile phone', () => {
      const phone = '11999887766';
      const result = phoneSchema.parse(phone);
      expect(result).toBe('(11) 99988-7766');
    });

    it('should format landline', () => {
      const phone = '1133334444';
      const result = phoneSchema.parse(phone);
      expect(result).toBe('(11) 3333-4444');
    });
  });
});
```

### 8. **Configuração de Variáveis de Ambiente Tipadas**

```typescript
// lib/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  JWT_SECRET: z.string().min(32),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_PRODUCT_ID: z.string().startsWith('prod_'),
  STRIPE_PRICE_ID: z.string().startsWith('price_'),
  
  // App
  BASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Optional
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
});

export const env = envSchema.parse(process.env);

// Type helper
export type Env = z.infer<typeof envSchema>;
```

## 🚀 Ordem de Implementação (Antes da Fase 2)

### Semana 1 - Fundação
1. **Dia 1-2**: Reestruturação de pastas e movimentação de arquivos
2. **Dia 3-4**: Implementação real de activity logs com migração
3. **Dia 5**: Sistema de validação centralizado com schemas BR

### Semana 2 - Qualidade
1. **Dia 1-2**: Tratamento de erros padronizado e wrapper de actions
2. **Dia 3-4**: Refatoração de todas as actions existentes
3. **Dia 5**: Configuração de testes e primeiros testes unitários

### Semana 3 - Performance e Segurança
1. **Dia 1-2**: Implementação de cache com revalidação
2. **Dia 3**: Variáveis de ambiente tipadas
3. **Dia 4-5**: Testes de integração e documentação

## ✅ Critérios de Sucesso

Antes de iniciar a Fase 2, devemos ter:

1. **100% dos logs de atividade** funcionando em produção
2. **100% das actions** usando validação e tratamento de erros padronizado
3. **Cobertura de testes** de pelo menos 70% nas validações e utils
4. **Estrutura de pastas** clara e escalável
5. **Performance**: Tempo de resposta < 200ms para queries cached
6. **Segurança**: Todas as entradas validadas com Zod

## 📈 Benefícios Esperados

- **Redução de bugs**: Validação forte previne erros em runtime
- **Facilidade de manutenção**: Código organizado e padronizado
- **Melhor debugging**: Logs estruturados e erros rastreáveis
- **Performance**: Cache reduz carga no banco
- **Confiança para escalar**: Base sólida para features complexas

## 🎯 Próximos Passos

Após completar estas melhorias fundamentais, estaremos prontos para:

1. **Fase 2**: Implementar módulos de Clientes, Funis e Operadoras
2. **Fase 3**: Sistema complexo de Propostas e Vendas
3. **Fase 4**: Funcionalidades operacionais avançadas

Com esta base sólida, o desenvolvimento das próximas fases será mais rápido, seguro e sustentável.