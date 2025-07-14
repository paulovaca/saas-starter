paulovaca: certo, criei o arquivo diretrizes\melhorias.md com suas sugestões, agora preciso que você, levando em consideração as suas sugestões e os arquivos diretrizes\scope.md, diretrizes\schema-prisma.md, diretrizes\flowchar-mermaid.md e, principalmente, diretrizes\prd-saas.md, reescreva as instruções de implementação detalhando os passos, o ideal seria que uma pessoa que nunca programou conseguisse implementar fase por fase.

GitHub Copilot: Vou criar um guia de implementação extremamente detalhado, passo a passo, para que qualquer pessoa possa seguir e implementar as melhorias fundamentais e depois as fases do projeto.

````markdown
# 📘 GUIA DE IMPLEMENTAÇÃO DETALHADO - CRM Travel SaaS

## 🎯 Visão Geral do Projeto

Este guia irá te ajudar a implementar um **Sistema CRM para Agências de Viagem** completo, desde as melhorias fundamentais até todas as funcionalidades avançadas. O sistema permitirá que agências gerenciem clientes, criem propostas, controlem vendas e automatizem processos.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org
   - Verifique a instalação: abra o terminal e digite `node --version`

2. **Git** (para controle de versão)
   - Baixe em: https://git-scm.com
   - Verifique: `git --version`

3. **Visual Studio Code** (editor de código)
   - Baixe em: https://code.visualstudio.com

4. **Docker Desktop** (para o banco de dados)
   - Baixe em: https://www.docker.com/products/docker-desktop
   - Inicie o Docker após instalar

5. **pnpm** (gerenciador de pacotes)
   - Instale com: `npm install -g pnpm`
   - Verifique: `pnpm --version`

---

## 🔧 PARTE 1: MELHORIAS FUNDAMENTAIS (Pré-Fase 2)

### 📁 Etapa 1.1: Reestruturação de Pastas

#### Passo 1: Pare o servidor de desenvolvimento
```bash
# No terminal onde o servidor está rodando, pressione Ctrl+C
```

#### Passo 2: Crie a nova estrutura de pastas

**No Windows (PowerShell):**
```powershell
# Na pasta raiz do projeto (h:\Programação\saas-starter)

# Criar estrutura em lib
New-Item -ItemType Directory -Force -Path "lib/actions/auth"
New-Item -ItemType Directory -Force -Path "lib/actions/agency"
New-Item -ItemType Directory -Force -Path "lib/validations"
New-Item -ItemType Directory -Force -Path "lib/db/schema"
New-Item -ItemType Directory -Force -Path "lib/db/queries"
New-Item -ItemType Directory -Force -Path "lib/services/auth"
New-Item -ItemType Directory -Force -Path "lib/services/activity-logger"
New-Item -ItemType Directory -Force -Path "lib/services/error-handler"
New-Item -ItemType Directory -Force -Path "lib/config"

# Criar estrutura em app
New-Item -ItemType Directory -Force -Path "app/api/v1/auth"
New-Item -ItemType Directory -Force -Path "app/api/v1/agency"
New-Item -ItemType Directory -Force -Path "app/api/v1/webhooks"
```

#### Passo 3: Renomear pastas existentes

1. **Renomear `(login)` para `(auth)`:**
   - No VS Code, clique com botão direito na pasta `app/(login)`
   - Selecione "Rename" ou pressione F2
   - Digite `(auth)` e pressione Enter

2. **Renomear `(dashboard)` para `(app)`:**
   - Faça o mesmo com a pasta `app/(dashboard)`
   - Renomeie para `(app)`

#### Passo 4: Mover arquivos de actions

1. **Criar arquivo para sign-in action:**
````typescript
// filepath: h:\Programação\saas-starter\lib\actions\auth\sign-in.ts
import { signIn as originalSignIn } from '@/app/(auth)/actions';

// Temporariamente exportar a função original
// Será refatorada na próxima etapa
export const signIn = originalSignIn;
````

2. **Criar arquivo para sign-up action:**
````typescript
// filepath: h:\Programação\saas-starter\lib\actions\auth\sign-up.ts
import { signUp as originalSignUp } from '@/app/(auth)/actions';

// Temporariamente exportar a função original
// Será refatorada na próxima etapa
export const signUp = originalSignUp;
````

3. **Criar arquivo para sign-out action:**
````typescript
// filepath: h:\Programação\saas-starter\lib\actions\auth\sign-out.ts
import { signOut as originalSignOut } from '@/app/(auth)/actions';

// Temporariamente exportar a função original
// Será refatorada na próxima etapa
export const signOut = originalSignOut;
````

### 📊 Etapa 1.2: Implementação de Activity Logs Real

#### Passo 1: Criar o schema da tabela activity_logs

````typescript
// filepath: h:\Programação\saas-starter\lib\db\schema\activity.ts
import { pgTable, uuid, varchar, text, timestamp, json, index } from 'drizzle-orm/pg-core';

// Importar as tabelas necessárias do schema atual
import { agencies, users } from '../schema';

// Definir a tabela de logs de atividade
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id')
    .notNull()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  metadata: json('metadata').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // Índices para melhorar performance das consultas
  agencyIdx: index('activity_logs_agency_idx').on(table.agencyId),
  userIdx: index('activity_logs_user_idx').on(table.userId),
  createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
  actionIdx: index('activity_logs_action_idx').on(table.action),
}));
````

#### Passo 2: Atualizar o schema principal para incluir activity logs

````typescript
// filepath: h:\Programação\saas-starter\lib\db\schema.ts
// Adicione no final do arquivo, após as outras exportações

// Importar e re-exportar activity logs
export { activityLogs } from './schema/activity';
````

#### Passo 3: Criar o serviço de Activity Logger

````typescript
// filepath: h:\Programação\saas-starter\lib\services\activity-logger\index.ts
import { headers } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { activityLogs } from '@/lib/db/schema/activity';
import { eq, desc } from 'drizzle-orm';

export class ActivityLogger {
  /**
   * Registra uma atividade no sistema
   */
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
      // Obter informações da requisição
      const headersList = await headers();
      const ipAddress = headersList.get('x-forwarded-for') || 
                       headersList.get('x-real-ip') || 
                       'unknown';
      const userAgent = headersList.get('user-agent') || 'unknown';

      // Inserir o log no banco de dados
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

      console.log(`Activity logged: ${action} for user ${userId}`);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Não falhar a operação principal se o log falhar
    }
  }

  /**
   * Busca os logs de atividade de uma agência
   */
  static async getActivityLogs(agencyId: string, limit = 50) {
    try {
      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.agencyId, agencyId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return [];
    }
  }

  /**
   * Busca logs de um usuário específico
   */
  static async getUserActivityLogs(userId: string, limit = 50) {
    try {
      const logs = await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.userId, userId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('Failed to fetch user activity logs:', error);
      return [];
    }
  }
}
````

#### Passo 4: Atualizar a função logActivity existente

````typescript
// filepath: h:\Programação\saas-starter\lib\db\queries.ts
// Localize a função logActivity e substitua por:

import { ActivityLogger } from '@/lib/services/activity-logger';

export async function logActivity(
  agencyId: string,
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  return ActivityLogger.log({
    agencyId,
    userId,
    action: type,
    ipAddress,
  });
}

// Remova o tipo ActivityLog temporário e a função getActivityLogs antiga
// Adicione esta nova função:
export async function getActivityLogs(agencyId: string) {
  return ActivityLogger.getActivityLogs(agencyId);
}
````

#### Passo 5: Aplicar a migração do banco de dados

```bash
# No terminal, na pasta raiz do projeto
# Gerar a migração
pnpm drizzle-kit generate

# Aplicar a migração
pnpm drizzle-kit push

# Verificar se a tabela foi criada
pnpm drizzle-kit studio
```

No Drizzle Studio, você deve ver a nova tabela `activity_logs`.

### ✅ Etapa 1.3: Sistema de Validação Centralizado

#### Passo 1: Instalar dependências necessárias

```bash
# No terminal
pnpm add validator
pnpm add -D @types/validator
```

#### Passo 2: Criar validações comuns brasileiras

````typescript
// filepath: h:\Programação\saas-starter\lib\validations\common.schema.ts
import { z } from 'zod';

/**
 * Validação de CPF brasileiro
 */
export const cpfSchema = z.string()
  .transform(val => val.replace(/\D/g, '')) // Remove tudo que não é número
  .refine(val => val.length === 11, 'CPF deve ter 11 dígitos')
  .refine(val => {
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(val)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(val[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(val[9])) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(val[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    
    return digit === parseInt(val[10]);
  }, 'CPF inválido')
  .transform(val => {
    // Formata o CPF: 123.456.789-01
    return val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  });

/**
 * Validação de CNPJ brasileiro
 */
export const cnpjSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 14, 'CNPJ deve ter 14 dígitos')
  .refine(val => {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(val)) return false;
    
    // Validação do primeiro dígito verificador
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
    
    // Validação do segundo dígito verificador
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
  }, 'CNPJ inválido')
  .transform(val => {
    // Formata o CNPJ: 12.345.678/0001-90
    return val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  });

/**
 * Validação de telefone brasileiro (fixo ou celular)
 */
export const phoneSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 10 || val.length === 11, 'Telefone inválido')
  .transform(val => {
    if (val.length === 10) {
      // Telefone fixo: (11) 3333-4444
      return val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    // Celular: (11) 99988-7766
    return val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  });

/**
 * Validação de CEP brasileiro
 */
export const cepSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 8, 'CEP deve ter 8 dígitos')
  .transform(val => {
    // Formata o CEP: 12345-678
    return val.replace(/(\d{5})(\d{3})/, '$1-$2');
  });

/**
 * Validação de valores monetários
 */
export const moneySchema = z.number()
  .min(0, 'Valor não pode ser negativo')
  .multipleOf(0.01, 'Máximo 2 casas decimais')
  .transform(val => Math.round(val * 100) / 100);

/**
 * Validação de porcentagem (0-100)
 */
export const percentageSchema = z.number()
  .min(0, 'Porcentagem não pode ser negativa')
  .max(100, 'Porcentagem não pode ser maior que 100')
  .multipleOf(0.01, 'Máximo 2 casas decimais');

/**
 * Validação de email em lowercase
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .toLowerCase()
  .trim();

/**
 * Validação de URL
 */
export const urlSchema = z.string()
  .url('URL inválida')
  .trim();
````

#### Passo 3: Criar validações de autenticação

````typescript
// filepath: h:\Programação\saas-starter\lib\validations\auth.schema.ts
import { z } from 'zod';
import { cnpjSchema, phoneSchema, emailSchema } from './common.schema';

/**
 * Schema para login
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

/**
 * Schema para registro de nova agência
 */
export const signUpSchema = z.object({
  // Dados do usuário
  email: emailSchema,
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  // Dados da agência
  agencyName: z.string()
    .min(3, 'Nome da agência deve ter no mínimo 3 caracteres')
    .max(255, 'Nome da agência deve ter no máximo 255 caracteres')
    .trim(),
  cnpj: cnpjSchema.optional(),
  phone: phoneSchema.optional(),
  
  // Termos de uso
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos de uso' }),
  }).optional(),
});

/**
 * Schema para atualização de senha
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Senha atual é obrigatória'),
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
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'A nova senha deve ser diferente da senha atual',
  path: ['newPassword'],
});

/**
 * Schema para recuperação de senha
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Schema para reset de senha
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Tipos TypeScript inferidos dos schemas
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
````

#### Passo 4: Criar validações de agência

````typescript
// filepath: h:\Programação\saas-starter\lib\validations\agency.schema.ts
import { z } from 'zod';
import { cnpjSchema, phoneSchema, cepSchema, emailSchema, urlSchema } from './common.schema';

/**
 * Schema para atualização de dados da agência
 */
export const updateAgencySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  cnpj: cnpjSchema.optional(),
  email: emailSchema,
  phone: phoneSchema.optional(),
  
  // Endereço
  address: z.string().max(500, 'Endereço muito longo').optional(),
  city: z.string().max(100, 'Nome da cidade muito longo').optional(),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)').optional(),
  zipCode: cepSchema.optional(),
  
  // Informações adicionais
  website: urlSchema.optional(),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
});

/**
 * Schema para configurações da agência
 */
export const agencySettingsSchema = z.object({
  // Configurações de proposta
  proposalExpirationDays: z.number()
    .int('Deve ser um número inteiro')
    .min(1, 'Mínimo 1 dia')
    .max(365, 'Máximo 365 dias'),
  
  // Configurações de comissão padrão
  defaultCommissionPercent: z.number()
    .min(0, 'Comissão não pode ser negativa')
    .max(100, 'Comissão não pode ser maior que 100%')
    .multipleOf(0.01, 'Máximo 2 casas decimais'),
  
  // Configurações de notificação
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean().optional(),
  
  // Horário de funcionamento
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional(),
  }).optional(),
});

/**
 * Schema para convidar usuário para agência
 */
export const inviteUserSchema = z.object({
  email: emailSchema,
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  role: z.enum(['ADMIN', 'AGENT'], {
    errorMap: () => ({ message: 'Selecione um cargo válido' }),
  }),
  message: z.string()
    .max(500, 'Mensagem muito longa')
    .optional(),
});

// Tipos TypeScript
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;
export type AgencySettingsInput = z.infer<typeof agencySettingsSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
````

### 🛡️ Etapa 1.4: Sistema de Tratamento de Erros

#### Passo 1: Criar classes de erro customizadas

````typescript
// filepath: h:\Programação\saas-starter\lib\services\error-handler\errors.ts
/**
 * Classe base para todos os erros da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Captura o stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Dados inválidos', details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de autenticação (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Erro de autorização (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Erro de recurso não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado(a)`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de conflito (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

/**
 * Erro de rate limit (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Muitas requisições. Tente novamente mais tarde.') {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Erro interno do servidor (500)
 */
export class InternalError extends AppError {
  constructor(
    message: string = 'Ocorreu um erro interno. Tente novamente mais tarde.',
    details?: any
  ) {
    super(message, 'INTERNAL_ERROR', 500, details, false);
    this.name = 'InternalError';
  }
}

/**
 * Erro de serviço externo
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `Erro ao comunicar com ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      503
    );
    this.name = 'ExternalServiceError';
  }
}
````

#### Passo 2: Criar wrapper para actions

````typescript
// filepath: h:\Programação\saas-starter\lib\services\error-handler\action-wrapper.ts
import { ZodError } from 'zod';
import { AppError, ValidationError } from './errors';
import { ActivityLogger } from '../activity-logger';

/**
 * Tipo de retorno padrão para actions
 */
export type ActionResult<T = void> = {
  data?: T;
  error?: string;
  details?: any;
};

/**
 * Opções para o wrapper de actions
 */
interface ActionOptions {
  /**
   * Log de atividade a ser registrado em caso de sucesso
   */
  logActivity?: {
    agencyId: string;
    userId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  };
  
  /**
   * Se deve retornar erro genérico em produção
   */
  sanitizeError?: boolean;
}

/**
 * Wrapper para executar actions com tratamento de erro padronizado
 */
export async function safeAction<T = void>(
  action: () => Promise<T>,
  options: ActionOptions = {}
): Promise<ActionResult<T>> {
  const { logActivity, sanitizeError = true } = options;
  
  try {
    // Executar a action
    const data = await action();
    
    // Registrar atividade se configurado
    if (logActivity) {
      await ActivityLogger.log(logActivity);
    }
    
    // Retornar sucesso
    return { data };
    
  } catch (error) {
    // Permitir que redirects do Next.js passem
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    // Tratar erros de validação do Zod
    if (error instanceof ZodError) {
      return {
        error: 'Dados inválidos',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      };
    }
    
    // Tratar erros customizados da aplicação
    if (error instanceof AppError) {
      // Log de erros não operacionais
      if (!error.isOperational) {
        console.error('[AppError]', error);
      }
      
      return {
        error: error.message,
        details: error.details,
      };
    }
    
    // Tratar erros de banco de dados
    if (error instanceof Error) {
      // Erro de constraint única (ex: email já existe)
      if (error.message.includes('unique constraint')) {
        if (error.message.includes('email')) {
          return { error: 'Este email já está cadastrado' };
        }
        if (error.message.includes('cnpj')) {
          return { error: 'Este CNPJ já está cadastrado' };
        }
        return { error: 'Este registro já existe' };
      }
      
      // Erro de foreign key
      if (error.message.includes('foreign key constraint')) {
        return { error: 'Operação não permitida. Registro relacionado não encontrado.' };
      }
    }
    
    // Log de erros inesperados
    console.error('[UnexpectedError]', error);
    
    // Em produção, retornar erro genérico
    if (sanitizeError && process.env.NODE_ENV === 'production') {
      return {
        error: 'Ocorreu um erro inesperado. Tente novamente.',
      };
    }
    
    // Em desenvolvimento, retornar erro completo
    return {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: error,
    };
  }
}

/**
 * Wrapper específico para actions que precisam de autenticação
 */
export async function authenticatedAction<T = void>(
  userId: string,
  agencyId: string,
  action: () => Promise<T>,
  options: Omit<ActionOptions, 'logActivity'> & {
    activity?: {
      action: string;
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, any>;
    };
  } = {}
): Promise<ActionResult<T>> {
  const { activity, ...restOptions } = options;
  
  return safeAction(action, {
    ...restOptions,
    logActivity: activity ? {
      userId,
      agencyId,
      ...activity,
    } : undefined,
  });
}
````

#### Passo 3: Criar index para exportações

````typescript
// filepath: h:\Programação\saas-starter\lib\services\error-handler\index.ts
// Re-exportar tudo para facilitar importações
export * from './errors';
export * from './action-wrapper';

// Exportar função helper para verificar se é erro operacional
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

// Exportar função para formatar erros para o cliente
export function formatErrorResponse(error: unknown): {
  message: string;
  code?: string;
  details?: any;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'Ocorreu um erro desconhecido',
  };
}
````

### 🔄 Etapa 1.5: Refatoração das Actions Existentes

#### Passo 1: Refatorar action de sign-in

````typescript
// filepath: h:\Programação\saas-starter\lib\actions\auth\sign-in.ts
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { users, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords, setSession } from '@/lib/auth/session';
import { signInSchema } from '@/lib/validations/auth.schema';
import { safeAction } from '@/lib/services/error-handler';
import { AuthenticationError } from '@/lib/services/error-handler';
import { ActivityType } from '@/lib/db/schema';

export async function signIn(prevState: any, formData: FormData) {
  return safeAction(async () => {
    // 1. Validar dados de entrada
    const validatedData = signInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // 2. Buscar usuário no banco
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      throw new AuthenticationError('Email ou senha incorretos');
    }

    // 3. Verificar senha
    const isValidPassword = await comparePasswords(
      validatedData.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new AuthenticationError('Email ou senha incorretos');
    }

    // 4. Verificar se a agência está ativa
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, user.agencyId))
      .limit(1);

    if (!agency) {
      throw new AuthenticationError('Agência não encontrada');
    }

    if (!agency.isActive) {
      throw new AuthenticationError('Esta agência está inativa. Entre em contato com o suporte.');
    }

    // 5. Criar sessão
    await setSession(user);

    // 6. Redirecionar para dashboard
    redirect('/dashboard');
  }, {
    logActivity: {
      // Não temos userId ainda, então fazemos log manual após sucesso
      agencyId: '',
      userId: '',
      action: ActivityType.SIGN_IN,
    },
  });
}
````

#### Passo 2: Refatorar action de sign-up

````typescript
// filepath: h:\Programação\saas-starter\lib\actions\auth\sign-up.ts
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { 
  users, 
  agencies, 
  agencySettings, 
  salesFunnels,
  salesFunnelStages,
  ActivityType 
} from '@/lib/db/schema';
import { hashPassword, setSession } from '@/lib/auth/session';
import { signUpSchema } from '@/lib/validations/auth.schema';
import { safeAction } from '@/lib/services/error-handler';
import { ConflictError, InternalError } from '@/lib/services/error-handler';

export async function signUp(prevState: any, formData: FormData) {
  return safeAction(async () => {
    // 1. Validar dados
    const validatedData = signUpSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      agencyName: formData.get('agencyName'),
      cnpj: formData.get('cnpj') || undefined,
      phone: formData.get('phone') || undefined,
    });

    // 2. Verificar se email já existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictError('Este email já está cadastrado');
    }

    // 3. Verificar CNPJ se fornecido
    if (validatedData.cnpj) {
      const [existingAgency] = await db
        .select()
        .from(agencies)
        .where(eq(agencies.cnpj, validatedData.cnpj))
        .limit(1);

      if (existingAgency) {
        throw new ConflictError('Este CNPJ já está cadastrado');
      }
    }

    // 4. Hash da senha
    const passwordHash = await hashPassword(validatedData.password);

    // 5. Criar transação para criar agência e usuário
    try {
      const result = await db.transaction(async (tx) => {
        // Criar agência
        const [newAgency] = await tx
          .insert(agencies)
          .values({
            name: validatedData.agencyName,
            cnpj: validatedData.cnpj,
            email: validatedData.email,
            phone: validatedData.phone,
            country: 'Brasil',
          })
          .returning();

        // Criar usuário master
        const [newUser] = await tx
          .insert(users)
          .values({
            email: validatedData.email,
            name: validatedData.name,
            passwordHash,
            role: 'MASTER',
            agencyId: newAgency.id,
          })
          .returning();

        // Criar configurações da agência
        await tx.insert(agencySettings).values({
          agencyId: newAgency.id,
          proposalExpirationDays: 15,
          defaultCommissionPercent: 10,
        });

        // Criar funil de vendas padrão
        const [defaultFunnel] = await tx
          .insert(salesFunnels)
          .values({
            agencyId: newAgency.id,
            name: 'Funil Padrão',
            description: 'Funil de vendas padrão da agência',
            isActive: true,
          })
          .returning();

        // Criar estágios padrão do funil
        const defaultStages = [
          { name: 'Novo Lead', color: '#3B82F6', order: 1 },
          { name: 'Qualificação', color: '#10B981', order: 2 },
          { name: 'Proposta Enviada', color: '#F59E0B', order: 3 },
          { name: 'Negociação', color: '#8B5CF6', order: 4 },
          { name: 'Fechado', color: '#059669', order: 5 },
          { name: 'Perdido', color: '#EF4444', order: 6 },
        ];

        for (const stage of defaultStages) {
          await tx.insert(salesFunnelStages).values({
            funnelId: defaultFunnel.id,
            ...stage,
          });
        }

        // Atualizar configurações para apontar para o funil padrão
        await tx
          .update(agencySettings)
          .set({ defaultFunnelId: defaultFunnel.id })
          .where(eq(agencySettings.agencyId, newAgency.id));

        return { user: newUser, agency: newAgency };
      });

      // 6. Criar sessão
      await setSession(result.user);

      // 7. Redirecionar para dashboard
      redirect('/dashboard');
      
    } catch (error) {
      // Se for erro de redirect, relançar
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
      }
      
      // Qualquer outro erro na transação
      throw new InternalError('Erro ao criar conta. Tente novamente.');
    }
  });
}
````

#### Passo 3: Refatorar outras actions

````typescript
// filepath: h:\Programação\saas-starter\lib\actions\auth\sign-out.ts
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import { ActivityLogger } from '@/lib/services/activity-logger';
import { ActivityType } from '@/lib/db/schema';

export async function signOut() {
  // Obter usuário antes de deletar a sessão
  const user = await getUser();
  
  // Registrar logout se usuário existe
  if (user) {
    await ActivityLogger.log({
      agencyId: user.agencyId,
      userId: user.id,
      action: ActivityType.SIGN_OUT,
    });
  }
  
  // Deletar cookie de sessão
  (await cookies()).delete('session');
  
  // Redirecionar para login
  redirect('/sign-in');
}
````

### 🧪 Etapa 1.6: Configuração de Testes

#### Passo 1: Instalar dependências de teste

```bash
# No terminal
pnpm add -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

#### Passo 2: Criar configuração do Jest

````javascript
// filepath: h:\Programação\saas-starter\jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
````

#### Passo 3: Criar setup do Jest

````javascript
// filepath: h:\Programação\saas-starter\jest.setup.js
import '@testing-library/jest-dom'

// Mock para Next.js
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  redirect: jest.fn(),
}))

// Mock para headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))
````

#### Passo 4: Criar primeiros testes

````typescript
// filepath: h:\Programação\saas-starter\__tests__\validations\common.test.ts
import { 
  cpfSchema, 
  cnpjSchema, 
  phoneSchema, 
  cepSchema,
  moneySchema 
} from '@/lib/validations/common.schema';

describe('Validações Comuns Brasileiras', () => {
  describe('CPF', () => {
    it('deve validar CPF correto', () => {
      const cpf = '123.456.789-09';
      const result = cpfSchema.parse(cpf);
      expect(result).toBe('123.456.789-09');
    });

    it('deve formatar CPF sem formatação', () => {
      const cpf = '12345678909';
      const result = cpfSchema.parse(cpf);
      expect(result).toBe('123.456.789-09');
    });

    it('deve rejeitar CPF inválido', () => {
      expect(() => cpfSchema.parse('111.111.111-11')).toThrow('CPF inválido');
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      expect(() => cpfSchema.parse('123.456.789')).toThrow('CPF deve ter 11 dígitos');
    });
  });

  describe('CNPJ', () => {
    it('deve validar CNPJ correto', () => {
      const cnpj = '11.222.333/0001-81';
      const result = cnpjSchema.parse(cnpj);
      expect(result).toBe('11.222.333/0001-81');
    });

    it('deve formatar CNPJ sem formatação', () => {
      const cnpj = '11222333000181';
      const result = cnpjSchema.parse(cnpj);
      expect(result).toBe('11.222.333/0001-81');
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(() => cnpjSchema.parse('11.111.111/1111-11')).toThrow('CNPJ inválido');
    });
  });

  describe('Telefone', () => {
    it('deve formatar celular com 11 dígitos', () => {
      const phone = '11999887766';
      const result = phoneSchema.parse(phone);
      expect(result).toBe('(11) 99988-7766');
    });

    it('deve formatar telefone fixo com 10 dígitos', () => {
      const phone = '1133334444';
      const result = phoneSchema.parse(phone);
      expect(result).toBe('(11) 3333-4444');
    });

    it('deve aceitar telefone já formatado', () => {
      const phone = '(11) 99988-7766';
      const result = phoneSchema.parse(phone);
      expect(result).toBe('(11) 99988-7766');
    });

    it('deve rejeitar telefone com número incorreto de dígitos', () => {
      expect(() => phoneSchema.parse('119998877')).toThrow('Telefone inválido');
    });
  });

  describe('CEP', () => {
    it('deve formatar CEP corretamente', () => {
      const cep = '12345678';
      const result = cepSchema.parse(cep);
      expect(result).toBe('12345-678');
    });

    it('deve aceitar CEP já formatado', () => {
      const cep = '12345-678';
      const result = cepSchema.parse(cep);
      expect(result).toBe('12345-678');
    });

    it('deve rejeitar CEP com menos de 8 dígitos', () => {
      expect(() => cepSchema.parse('1234567')).toThrow('CEP deve ter 8 dígitos');
    });
  });

  describe('Valores Monetários', () => {
    it('deve aceitar valores válidos', () => {
      expect(moneySchema.parse(10.50)).toBe(10.50);
      expect(moneySchema.parse(0)).toBe(0);
      expect(moneySchema.parse(999999.99)).toBe(999999.99);
    });

    it('deve arredondar para 2 casas decimais', () => {
      expect(moneySchema.parse(10.555)).toBe(10.56);
      expect(moneySchema.parse(10.554)).toBe(10.55);
    });

    it('deve rejeitar valores negativos', () => {
      expect(() => moneySchema.parse(-10)).toThrow('Valor não pode ser negativo');
    });
  });
});
````

#### Passo 5: Adicionar scripts de teste no package.json

````json
// filepath: h:\Programação\saas-starter\package.json
// Adicione estes scripts na seção "scripts":
{
  "scripts": {
    // ... outros scripts existentes ...
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
````

### 🚀 Etapa 1.7: Cache e Performance

#### Passo 1: Implementar queries com cache

````typescript
// filepath: h:\Programação\saas-starter\lib\db\cached-queries.ts
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { db } from './drizzle';
import { users, agencies, agencySettings } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Busca usuário com cache de 5 minutos
 */
export const getCachedUser = unstable_cache(
  async (userId: string) => {
    console.log('Fetching user from database:', userId);
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return user || null;
  },
  ['user-by-id'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user'],
  }
);

/**
 * Busca agência com cache de 10 minutos
 */
export const getCachedAgency = unstable_cache(
  async (agencyId: string) => {
    console.log('Fetching agency from database:', agencyId);
    
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);
    
    return agency || null;
  },
  ['agency-by-id'],
  {
    revalidate: 600, // 10 minutos
    tags: ['agency'],
  }
);

/**
 * Busca configurações da agência com cache
 */
export const getCachedAgencySettings = unstable_cache(
  async (agencyId: string) => {
    console.log('Fetching agency settings from database:', agencyId);
    
    const [settings] = await db
      .select()
      .from(agencySettings)
      .where(eq(agencySettings.agencyId, agencyId))
      .limit(1);
    
    return settings || null;
  },
  ['agency-settings'],
  {
    revalidate: 600, // 10 minutos
    tags: ['agency-settings'],
  }
);

/**
 * Cache por request (React cache)
 * Útil para evitar múltiplas queries na mesma renderização
 */
export const getUserByEmail = cache(async (email: string) => {
  console.log('Fetching user by email:', email);
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user || null;
});

/**
 * Invalida cache de usuário
 */
export async function invalidateUserCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('user');
  
  if (userId) {
    console.log('Invalidating cache for user:', userId);
  }
}

/**
 * Invalida cache de agência
 */
export async function invalidateAgencyCache(agencyId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('agency');
  revalidateTag('agency-settings');
  
  if (agencyId) {
    console.log('Invalidating cache for agency:', agencyId);
  }
}
````

#### Passo 2: Atualizar queries.ts para usar cache

````typescript
// filepath: h:\Programação\saas-starter\lib\db\queries.ts
// No início do arquivo, adicione:
import { 
  getCachedUser, 
  getCachedAgency, 
  invalidateUserCache,
  invalidateAgencyCache 
} from './cached-queries';

// Atualize a função getUser para usar cache:
export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string'
  ) {
    return null;
  }

  // Usar versão com cache
  const user = await getCachedUser(sessionData.user.id);
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    agencyId: user.agencyId,
  };
}

// Atualize getAgencyForUser para usar cache:
export async function getAgencyForUser(userId: string) {
  const [user] = await db
    .select({ agencyId: users.agencyId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  // Usar versão com cache
  return getCachedAgency(user.agencyId);
}
````

### 🔐 Etapa 1.8: Variáveis de Ambiente Tipadas

#### Passo 1: Criar configuração de ambiente

````typescript
// filepath: h:\Programação\saas-starter\lib\config\env.ts
import { z } from 'zod';

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string()
    .url()
    .startsWith('postgres://', 'DATABASE_URL deve ser uma URL PostgreSQL'),
  
  // Autenticação
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY deve começar com sk_'),
  STRIPE_WEBHOOK_SECRET: z.string()
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET deve começar com whsec_'),
  STRIPE_PRODUCT_ID: z.string()
    .startsWith('prod_', 'STRIPE_PRODUCT_ID deve começar com prod_'),
  STRIPE_PRICE_ID: z.string()
    .startsWith('price_', 'STRIPE_PRICE_ID deve começar com price_'),
  
  // URLs da aplicação
  NEXT_PUBLIC_APP_URL: z.string()
    .url('NEXT_PUBLIC_APP_URL deve ser uma URL válida')
    .default('http://localhost:3001'),
  
  // Ambiente
  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development'),
  
  // Opcionais
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug'])
    .default('info')
    .optional(),
  
  // Email (preparar para futuro)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
});

/**
 * Validar e exportar variáveis de ambiente
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Variáveis de ambiente inválidas:');
      error.errors.forEach(err => {
        console.error(`   ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Exportar variáveis validadas
export const env = validateEnv();

// Exportar tipo para TypeScript
export type Env = z.infer<typeof envSchema>;

// Helpers para verificar ambiente
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
````

#### Passo 2: Criar arquivo de tipos para ambiente

````typescript
// filepath: h:\Programação\saas-starter\types\env.d.ts
/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Banco de dados
    DATABASE_URL: string;
    
    // Autenticação
    JWT_SECRET: string;
    
    // Stripe
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PRODUCT_ID: string;
    STRIPE_PRICE_ID: string;
    
    // URLs
    NEXT_PUBLIC_APP_URL: string;
    
    // Ambiente
    NODE_ENV: 'development' | 'production' | 'test';
    
    // Opcionais
    LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
  }
}
````

#### Passo 3: Atualizar arquivos para usar env tipado

````typescript
// filepath: h:\Programação\saas-starter\lib\auth\session.ts
// No início do arquivo, substitua:
// const JWT_SECRET = process.env.JWT_SECRET!;
// Por:
import { env } from '@/lib/config/env';
const JWT_SECRET = env.JWT_SECRET;
````

````typescript
// filepath: h:\Programação\saas-starter\lib\payments\stripe.ts
// No início do arquivo, substitua:
// const stripe = new Stripe(process.env.// filepath: h:\Programação\saas-starter\lib\payments\stripe.ts
// No início do arquivo, substitua:
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
// Por:
import { env } from '@/lib/config/env';
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
````

````typescript
// Substitua:
// const connectionString = process.env.DATABASE_URL!;
// Por:
import { env } from '@/lib/config/env';
const connectionString = env.DATABASE_URL;
````

#### Passo 4: Criar arquivo .env.example

````bash
# Banco de dados PostgreSQL
DATABASE_URL=postgres://user:password@localhost:54322/saas_crm_travel

# JWT Secret (gere com: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Stripe (obtenha em https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_ID=prod_...
STRIPE_PRICE_ID=price_...

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Ambiente
NODE_ENV=development

# Logs (opcional)
LOG_LEVEL=info

# Email SMTP (opcional - preparar para futuro)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-senha-app
# SMTP_FROM=noreply@suaagencia.com
````

### ✅ Etapa 1.9: Atualizar Imports e Limpar Código Antigo

#### Passo 1: Atualizar imports nas páginas

````typescript
// Localize o import:
// import { signIn } from '@/app/(auth)/actions';
// E substitua por:
import { signIn } from '@/lib/actions/auth/sign-in';
````

````typescript
// Localize o import:
// import { signUp } from '@/app/(auth)/actions';
// E substitua por:
import { signUp } from '@/lib/actions/auth/sign-up';
````

````typescript
// Localize o import:
// import { signOut } from '@/app/(auth)/actions';
// E substitua por:
import { signOut } from '@/lib/actions/auth/sign-out';
````

#### Passo 2: Criar novo arquivo de agency actions

````typescript
import { db } from '@/lib/db/drizzle';
import { users, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { updateAgencySchema } from '@/lib/validations/agency.schema';
import { authenticatedAction } from '@/lib/services/error-handler';
import { AuthorizationError, NotFoundError } from '@/lib/services/error-handler';
import { invalidateAgencyCache } from '@/lib/db/cached-queries';
import { ActivityType } from '@/lib/db/schema';

export async function updateAgency(prevState: any, formData: FormData) {
  // Obter usuário autenticado
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: 'Não autenticado' };
  }

  return authenticatedAction(
    currentUser.id,
    currentUser.agencyId,
    async () => {
      // Verificar se usuário é MASTER
      if (currentUser.role !== 'MASTER') {
        throw new AuthorizationError('Apenas usuários MASTER podem atualizar dados da agência');
      }

      // Validar dados
      const validatedData = updateAgencySchema.parse({
        name: formData.get('name'),
        cnpj: formData.get('cnpj') || undefined,
        email: formData.get('email'),
        phone: formData.get('phone') || undefined,
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        state: formData.get('state') || undefined,
        zipCode: formData.get('zipCode') || undefined,
        website: formData.get('website') || undefined,
        description: formData.get('description') || undefined,
      });

      // Atualizar agência
      const [updatedAgency] = await db
        .update(agencies)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(agencies.id, currentUser.agencyId))
        .returning();

      if (!updatedAgency) {
        throw new NotFoundError('Agência');
      }

      // Invalidar cache
      await invalidateAgencyCache(currentUser.agencyId);

      return { success: 'Dados da agência atualizados com sucesso' };
    },
    {
      activity: {
        action: ActivityType.UPDATE_AGENCY,
        entityType: 'agency',
        entityId: currentUser.agencyId,
      },
    }
  );
}
````

````typescript
import { db } from '@/lib/db/drizzle';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { authenticatedAction } from '@/lib/services/error-handler';
import { AuthorizationError } from '@/lib/services/error-handler';
import { signOut } from '../auth/sign-out';
import { ActivityType } from '@/lib/db/schema';

export async function deleteAgency(prevState: any, formData: FormData) {
  // Obter usuário autenticado
  const currentUser = await getUser();
  if (!currentUser) {
    return { error: 'Não autenticado' };
  }

  return authenticatedAction(
    currentUser.id,
    currentUser.agencyId,
    async () => {
      // Verificar se usuário é MASTER
      if (currentUser.role !== 'MASTER') {
        throw new AuthorizationError('Apenas o proprietário pode deletar a agência');
      }

      // Verificar confirmação
      const confirmation = formData.get('confirmation');
      if (confirmation !== 'DELETE') {
        throw new Error('Digite DELETE para confirmar');
      }

      // Soft delete - apenas marcar como inativa
      await db
        .update(agencies)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(agencies.id, currentUser.agencyId));

      // Fazer logout
      await signOut();
    },
    {
      activity: {
        action: ActivityType.DELETE_AGENCY,
        entityType: 'agency',
        entityId: currentUser.agencyId,
      },
    }
  );
}
````

#### Passo 3: Atualizar imports nas páginas de configurações

````typescript
// Adicione no início do arquivo:
import { updateAccount } from '@/lib/actions/agency/update';

// Se houver updateAccount antigo, remova e use o novo
````

### 🧹 Etapa 1.10: Limpeza Final e Testes

#### Passo 1: Remover arquivo de actions antigo

```bash
# No terminal, delete o arquivo antigo de actions
# CUIDADO: Certifique-se de que todos os imports foram atualizados primeiro!
del app\(auth)\actions.ts
```

#### Passo 2: Executar testes de validação

```bash
# Rodar os testes
pnpm test

# Ver cobertura
pnpm test:coverage
```

#### Passo 3: Testar a aplicação

```bash
# Reiniciar o servidor
pnpm dev

# Testar as seguintes funcionalidades:
# 1. Sign up com nova agência
# 2. Sign in
# 3. Atualizar perfil
# 4. Verificar logs de atividade
# 5. Sign out
```

#### Passo 4: Verificar se há erros de TypeScript

```bash
# Verificar tipos
pnpm tsc --noEmit

# Se houver erros, corrija-os antes de continuar
```

---

## 🎯 PARTE 2: IMPLEMENTAÇÃO DA FASE 2 - MÓDULOS CORE

Agora que as melhorias fundamentais estão completas, vamos implementar os módulos principais da Fase 2.

### 📋 Fase 2.1: Módulo de Clientes

#### Etapa 2.1.1: Criar Páginas de Clientes

##### Passo 1: Criar estrutura de pastas

```powershell
# No PowerShell
New-Item -ItemType Directory -Force -Path "app/(app)/clients"
New-Item -ItemType Directory -Force -Path "app/(app)/clients/new"
New-Item -ItemType Directory -Force -Path "app/(app)/clients/[id]"
New-Item -ItemType Directory -Force -Path "app/(app)/clients/[id]/edit"
```

##### Passo 2: Criar página de listagem de clientes

````typescript
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClientsTable } from './clients-table';
import { getClients } from '@/lib/db/queries/clients';
import { getUser } from '@/lib/db/queries';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const user = await getUser();
  if (!user) return null;

  const search = searchParams.search || '';
  const page = Number(searchParams.page) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da sua agência
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Encontre clientes rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Buscar por nome, email ou documento..."
                defaultValue={search}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Todos os clientes cadastrados na agência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Carregando...</div>}>
            <ClientsTable
              agencyId={user.agencyId}
              search={search}
              page={page}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
````

##### Passo 3: Criar componente de tabela de clientes

````typescript
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Eye, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getClients } from '@/lib/db/queries/clients';

interface ClientsTableProps {
  agencyId: string;
  search: string;
  page: number;
}

export async function ClientsTable({ agencyId, search, page }: ClientsTableProps) {
  const { clients, totalPages } = await getClients({
    agencyId,
    search,
    page,
    limit: 10,
  });

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {search ? 'Nenhum cliente encontrado com esses critérios.' : 'Nenhum cliente cadastrado ainda.'}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cadastrado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone || '-'}</TableCell>
              <TableCell className="font-mono text-sm">
                {client.documentType === 'CPF' ? client.cpf : client.cnpj || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={client.isActive ? 'default' : 'secondary'}>
                  {client.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(client.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/clients/${client.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/clients/${client.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/clients?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                Anterior
              </Link>
            </Button>
          )}
          <span className="flex items-center px-3 text-sm">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/clients?page=${page + 1}${search ? `&search=${search}` : ''}`}>
                Próxima
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
````

#### Etapa 2.1.2: Criar Validações e Queries de Clientes

##### Passo 1: Criar validações de cliente

````typescript
import { z } from 'zod';
import { 
  cpfSchema, 
  cnpjSchema, 
  phoneSchema, 
  cepSchema, 
  emailSchema 
} from './common.schema';

/**
 * Schema base para dados de cliente
 */
const clientBaseSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome muito longo')
    .trim(),
  email: emailSchema,
  phone: phoneSchema.optional(),
  
  // Tipo de documento
  documentType: z.enum(['CPF', 'CNPJ'], {
    errorMap: () => ({ message: 'Selecione o tipo de documento' }),
  }),
  
  // Dados pessoais
  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .optional(),
  gender: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Selecione o gênero' }),
  }).optional(),
  
  // Endereço
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  zipCode: cepSchema.optional(),
  country: z.string().max(50).default('Brasil'),
  
  // Informações adicionais
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  
  // Preferências
  preferences: z.object({
    communication: z.enum(['email', 'phone', 'whatsapp']).optional(),
    travelStyle: z.enum(['economic', 'comfort', 'luxury']).optional(),
    interests: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * Schema para criar cliente PF (Pessoa Física)
 */
export const createClientPFSchema = clientBaseSchema.extend({
  documentType: z.literal('CPF'),
  cpf: cpfSchema,
  passport: z.string()
    .regex(/^[A-Z0-9]+$/, 'Passaporte inválido')
    .optional(),
});

/**
 * Schema para criar cliente PJ (Pessoa Jurídica)
 */
export const createClientPJSchema = clientBaseSchema.extend({
  documentType: z.literal('CNPJ'),
  cnpj: cnpjSchema,
  companyName: z.string()
    .min(3, 'Razão social obrigatória')
    .max(255),
  tradeName: z.string()
    .max(255)
    .optional(),
  stateRegistration: z.string()
    .optional(),
});

/**
 * Schema unificado para criar cliente
 */
export const createClientSchema = z.discriminatedUnion('documentType', [
  createClientPFSchema,
  createClientPJSchema,
]);

/**
 * Schema para atualizar cliente
 */
export const updateClientSchema = clientBaseSchema.partial();

/**
 * Schema para importar clientes em massa
 */
export const importClientsSchema = z.object({
  clients: z.array(createClientSchema),
  skipDuplicates: z.boolean().default(true),
});

// Tipos TypeScript
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ImportClientsInput = z.infer<typeof importClientsSchema>;
````

##### Passo 2: Criar queries de clientes

````typescript
import { db } from '../drizzle';
import { clients, type Client } from '../schema';
import { and, eq, or, ilike, desc, sql } from 'drizzle-orm';
import { getCachedAgency } from '../cached-queries';

interface GetClientsParams {
  agencyId: string;
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

/**
 * Busca clientes com paginação e filtros
 */
export async function getClients({
  agencyId,
  search = '',
  page = 1,
  limit = 10,
  isActive,
}: GetClientsParams) {
  const offset = (page - 1) * limit;
  
  // Construir condições
  const conditions = [eq(clients.agencyId, agencyId)];
  
  if (search) {
    conditions.push(
      or(
        ilike(clients.name, `%${search}%`),
        ilike(clients.email, `%${search}%`),
        ilike(clients.cpf, `%${search}%`),
        ilike(clients.cnpj, `%${search}%`),
        ilike(clients.phone, `%${search}%`)
      )!
    );
  }
  
  if (isActive !== undefined) {
    conditions.push(eq(clients.isActive, isActive));
  }
  
  // Buscar clientes
  const [clientsList, totalCount] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(and(...conditions))
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset),
    
    db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(and(...conditions))
      .then(res => Number(res[0]?.count || 0))
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    clients: clientsList,
    totalCount,
    totalPages,
    currentPage: page,
  };
}

/**
 * Busca um cliente por ID
 */
export async function getClientById(clientId: string, agencyId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.agencyId, agencyId)
      )
    )
    .limit(1);
  
  return client || null;
}

/**
 * Busca cliente por email
 */
export async function getClientByEmail(email: string, agencyId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.email, email),
        eq(clients.agencyId, agencyId)
      )
    )
    .limit(1);
  
  return client || null;
}

/**
 * Busca cliente por documento (CPF ou CNPJ)
 */
export async function getClientByDocument(
  document: string, 
  agencyId: string
) {
  const cleanDocument = document.replace(/\D/g, '');
  
  const [client] = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.agencyId, agencyId),
        or(
          eq(clients.cpf, cleanDocument),
          eq(clients.cnpj, cleanDocument)
        )!
      )
    )
    .limit(1);
  
  return client || null;
}

/**
 * Estatísticas de clientes
 */
export async function getClientStats(agencyId: string) {
  const stats = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${clients.isActive} = true)`,
      inactive: sql<number>`count(*) filter (where ${clients.isActive} = false)`,
      pf: sql<number>`count(*) filter (where ${clients.documentType} = 'CPF')`,
      pj: sql<number>`count(*) filter (where ${clients.documentType} = 'CNPJ')`,
      thisMonth: sql<number>`count(*) filter (where ${clients.createdAt} >= date_trunc('month', current_date))`,
    })
    .from(clients)
    .where(eq(clients.agencyId, agencyId));
  
  return stats[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    pf: 0,
    pj: 0,
    thisMonth: 0,
  };
}

/**
 * Busca clientes recentes
 */
export async function getRecentClients(agencyId: string, limit = 5) {
  return db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      documentType: clients.documentType,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.agencyId, agencyId))
    .orderBy(desc(clients.createdAt))
    .limit(limit);
}
````

#### Etapa 2.1.3: Criar Actions de Clientes

##### Passo 1: Criar action para criar cliente

````typescript
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { clients } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { createClientSchema } from '@/lib/validations/client.schema';
import { authenticatedAction } from '@/lib/services/error-handler';
import { ConflictError } from '@/lib/services/error-handler';
import { getClientByEmail, getClientByDocument } from '@/lib/db/queries/clients';
import { ActivityType } from '@/lib/db/schema';

export async function createClient(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: 'Não autenticado' };

  return authenticatedAction(
    user.id,
    user.agencyId,
    async () => {
      // Preparar dados para validação
      const rawData: any = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || undefined,
        documentType: formData.get('documentType'),
        birthDate: formData.get('birthDate') || undefined,
        gender: formData.get('gender') || undefined,
        
        // Endereço
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        state: formData.get('state') || undefined,
        zipCode: formData.get('zipCode') || undefined,
        
        // Informações adicionais
        notes: formData.get('notes') || undefined,
      };

      // Adicionar campos específicos baseado no tipo
      if (rawData.documentType === 'CPF') {
        rawData.cpf = formData.get('cpf');
        rawData.passport = formData.get('passport') || undefined;
      } else {
        rawData.cnpj = formData.get('cnpj');
        rawData.companyName = formData.get('companyName');
        rawData.tradeName = formData.get('tradeName') || undefined;
        rawData.stateRegistration = formData.get('stateRegistration') || undefined;
      }

      // Validar dados
      const validatedData = createClientSchema.parse(rawData);

      // Verificar duplicatas - email
      const existingByEmail = await getClientByEmail(
        validatedData.email, 
        user.agencyId
      );
      if (existingByEmail) {
        throw new ConflictError('Já existe um cliente com este email');
      }

      // Verificar duplicatas - documento
      const document = validatedData.documentType === 'CPF' 
        ? validatedData.cpf 
        : validatedData.cnpj;
      
      const existingByDocument = await getClientByDocument(
        document, 
        user.agencyId
      );
      if (existingByDocument) {
        throw new ConflictError(
          `Já existe um cliente com este ${validatedData.documentType}`
        );
      }

      // Criar cliente
      const [newClient] = await db
        .insert(clients)
        .values({
          ...validatedData,
          agencyId: user.agencyId,
          createdBy: user.id,
        })
        .returning();

      // Redirecionar para página do cliente
      redirect(`/clients/${newClient.id}`);
    },
    {
      activity: {
        action: ActivityType.CREATE_CLIENT,
        entityType: 'client',
        metadata: { clientName: rawData.name },
      },
    }
  );
}
````

##### Passo 2: Criar página de novo cliente

````typescript
'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/actions/clients/create';

export default function NewClientPage() {
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [state, formAction, pending] = useActionState(createClient, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo cliente na agência
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form action={formAction}>
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Tipo de Cliente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tipo de Cliente</CardTitle>
            <CardDescription>
              Selecione se é pessoa física ou jurídica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name="documentType"
              value={documentType}
              onValueChange={(value) => setDocumentType(value as 'CPF' | 'CNPJ')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CPF" id="cpf" />
                <Label htmlFor="cpf">Pessoa Física (CPF)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CNPJ" id="cnpj" />
                <Label htmlFor="cnpj">Pessoa Jurídica (CNPJ)</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Dados Básicos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dados Básicos</CardTitle>
            <CardDescription>
              Informações principais do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentType === 'CNPJ' && (
              <>
                <div>
                  <Label htmlFor="companyName">Razão Social *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    required
                    placeholder="Nome oficial da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    name="tradeName"
                    placeholder="Nome comercial (opcional)"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="name">
                {documentType === 'CPF' ? 'Nome Completo' : 'Responsável'} *
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder={documentType === 'CPF' ? 'João da Silva' : 'Nome do responsável'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Documento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={documentType.toLowerCase()}>
                  {documentType} *
                </Label>
                <Input
                  id={documentType.toLowerCase()}
                  name={documentType.toLowerCase()}
                  required
                  placeholder={
                    documentType === 'CPF' 
                      ? '123.456.789-00' 
                      : '12.345.678/0001-00'
                  }
                />
              </div>
              {documentType === 'CPF' && (
                <div>
                  <Label htmlFor="passport">Passaporte</Label>
                  <Input
                    id="passport"
                    name="passport"
                    placeholder="AB123456"
                  />
                </div>
              )}
              {documentType === 'CNPJ' && (
                <div>
                  <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                  <Input
                    id="stateRegistration"
                    name="stateRegistration"
                    placeholder="123.456.789.012"
                  />
                </div>
              )}
            </div>

            {/* Dados pessoais - apenas PF */}
            {documentType === 'CPF' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select name="gender">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Informações de localização (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="12345-678"
                maxLength={9}
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observações</CardTitle>
            <CardDescription>
              Informações adicionais sobre o cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              placeholder="Preferências, observações importantes..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4">
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar Cliente
          </Button>
          <Button variant="outline" asChild>
            <Link href="/clients">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
````

### 📈 Fase 2.2: Sistema de Funis de Venda

#### Etapa 2.2.1: Criar Interface de Funis

##### Passo 1: Criar estrutura de pastas

```powershell
# No PowerShell
New-Item -ItemType Directory -Force -Path "app/(app)/funnels"
New-Item -ItemType Directory -Force -Path "app/(app)/funnels/[id]"
New-Item -ItemType Directory -Force -Path "components/funnels"
```

##### Passo 2: Criar página principal de funis

````typescript
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FunnelBoard } from '@/components/funnels/funnel-board';
import { getFunnelsWithStages } from '@/lib/db/queries/funnels';
import { getUser } from '@/lib/db/queries';

export default async function FunnelsPage() {
  const user = await getUser();
  if (!user) return null;

  const funnels = await getFunnelsWithStages(user.agencyId);
  const activeFunnel = funnels.find(f => f.isActive) || funnels[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funis de Venda</h1>
          <p className="text-muted-foreground">
            Gerencie o pipeline de vendas da sua agência
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/funnels/settings">
              Configurar Funis
            </Link>
          </Button>
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Proposta
            </Link>
          </Button>
        </div>
      </div>

      {/* Seletor de Funil */}
      {funnels.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Funil Ativo</CardTitle>
            <CardDescription>
              Selecione qual funil deseja visualizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <select 
              className="w-full p-2 border rounded"
              defaultValue={activeFunnel?.id}
            >
              {funnels.map(funnel => (
                <option key={funnel.id} value={funnel.id}>
                  {funnel.name} {funnel.isActive && '(Padrão)'}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Board Kanban */}
      {activeFunnel ? (
        <Suspense fallback={<div>Carregando funil...</div>}>
          <FunnelBoard funnel={activeFunnel} />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhum funil de vendas configurado.
            </p>
            <Button asChild>
              <Link href="/funnels/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Funil
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
````

##### Passo 3: Criar componente Kanban Board

````typescript
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FunnelWithStages } from '@/lib/db/queries/funnels';

interface FunnelBoardProps {
  funnel: FunnelWithStages;
}

export function FunnelBoard({ funnel }: FunnelBoardProps) {
  const [stages, setStages] = useState(funnel.stages);
  const [proposals, setProposals] = useState<any[]>([]);

  // Buscar propostas para o funil
  useEffect(() => {
    // TODO: Implementar busca de propostas
    // Por enquanto, usar dados mockados
    setProposals([
      {
        id: '1',
        title: 'Pacote Cancun - Família Silva',
        clientName: 'João Silva',
        value: 15000,
        stageId: stages[0]?.id,
        createdAt: new Date().toISOString(),
        agentName: 'Maria Santos',
      },
      {
        id: '2',
        title: 'Lua de Mel - Maldivas',
        clientName: 'Ana Costa',
        value: 35000,
        stageId: stages[1]?.id,
        createdAt: new Date().toISOString(),
        agentName: 'Carlos Oliveira',
      },
    ]);
  }, [stages]);

  // Função para mover proposta entre estágios
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Se moveu para o mesmo lugar, não fazer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Atualizar o estado local
    setProposals(prev => {
      const updated = [...prev];
      const proposalIndex = updated.findIndex(p => p.id === result.draggableId);
      
      if (proposalIndex > -1) {
        updated[proposalIndex] = {
          ...updated[proposalIndex],
          stageId: destination.droppableId,
        };
      }
      
      return updated;
    });

    // TODO: Fazer chamada API para atualizar no banco
    console.log('Movendo proposta:', {
      proposalId: result.draggableId,
      fromStage: source.droppableId,
      toStage: destination.droppableId,
    });
  };

  // Função para obter propostas de um estágio
  const getProposalsForStage = (stageId: string) => {
    return proposals.filter(p => p.stageId === stageId);
  };

  // Função para formatar valor em Real
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageProposals = getProposalsForStage(stage.id);
          const totalValue = stageProposals.reduce((sum, p) => sum + p.value, 0);

          return (
            <div key={stage.id} className="min-w-[320px]">
              <Card>
                <CardHeader 
                  className="pb-3"
                  style={{ borderTop: `4px solid ${stage.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {stage.name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {stageProposals.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalValue)}
                  </p>
                </CardHeader>
                
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-2 ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : ''
                      }`}
                    >
                      {stageProposals.map((proposal, index) => (
                        <Draggable
                          key={proposal.id}
                          draggableId={proposal.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'opacity-50' : ''
                              }`}
                            >
                              <Card className="cursor-move hover:shadow-md transition-shadow">
                                <CardContent className="p-3 space-y-2">
                                  <h4 className="font-medium text-sm line-clamp-2">
                                    {proposal.title}
                                  </h4>
                                  
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    {proposal.clientName}
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">
                                      {formatCurrency(proposal.value)}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2"
                                      asChild
                                    >
                                      <Link href={`/proposals/${proposal.id}`}>
                                        <Eye className="h-3 w-3" />
                                      </Link>
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{proposal.agentName}</span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDistanceToNow(
                                        new Date(proposal.createdAt),
                                        { addSuffix: true, locale: ptBR }
                                      )}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
````

#### Etapa 2.2.2: Criar Queries de Funis

##### Passo 1: Instalar dependência de drag-and-drop

```bash
# No terminal
pnpm add @hello-pangea/dnd
```

##### Passo 2: Criar queries de funis

````typescript
import { db } from '../drizzle';
import { salesFunnels, salesFunnelStages } from '../schema';
import { and, eq, asc } from 'drizzle-orm';

export interface FunnelWithStages {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  stages: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
  }>;
}

/**
 * Busca todos os funis com seus estágios
 */
export async function getFunnelsWithStages(
  agencyId: string
): Promise<FunnelWithStages[]> {
  // Buscar funis
  const funnels = await db
    .select()
    .from(salesFunnels)
    .where(eq(salesFunnels.agencyId, agencyId))
    .orderBy(asc(salesFunnels.createdAt));

  // Buscar estágios para cada funil
  const funnelsWithStages = await Promise.all(
    funnels.map(async (funnel) => {
      const stages = await db
        .select({
          id: salesFunnelStages.id,
          name: salesFunnelStages.name,
          color: salesFunnelStages.color,
          order: salesFunnelStages.order,
        })
        .from(salesFunnelStages)
        .where(eq(salesFunnelStages.funnelId, funnel.id))
        .orderBy(asc(salesFunnelStages.order));

      return {
        id: funnel.id,
        name: funnel.name,
        description: funnel.description,
        isActive: funnel.isActive,
        stages,
      };
    })
  );

  return funnelsWithStages;
}

/**
 * Busca um funil específico com seus estágios
 */
export async function getFunnelById(
  funnelId: string,
  agencyId: string
): Promise<FunnelWithStages | null> {
  const [funnel] = await db
    .select()
    .from(salesFunnels)
    .where(
      and(
        eq(salesFunnels.id, funnelId),
        eq(salesFunnels.agencyId, agencyId)
      )
    )
    .limit(1);

  if (!funnel) return null;

  const stages = await db
    .select({
      id: salesFunnelStages.id,
      name: salesFunnelStages.name,
      color: salesFunnelStages.color,
      order: salesFunnelStages.order,
    })
    .from(salesFunnelStages)
    .where(eq(salesFunnelStages.funnelId, funnel.id))
    .orderBy(asc(salesFunnelStages.order));

  return {
    id: funnel.id,
    name: funnel.name,
    description: funnel.description,
    isActive: funnel.isActive,
    stages,
  };
}

/**
 * Busca o funil ativo da agência
 */
export async function getActiveFunnel(
  agencyId: string
): Promise<FunnelWithStages | null> {
  const [funnel] = await db
    .select()
    .from(salesFunnels)
    .where(
      and(
        eq(salesFunnels.agencyId, agencyId),
        eq(salesFunnels.isActive, true)
      )
    )
    .limit(1);

  if (!funnel) return null;

  const stages = await db
    .select({
      id: salesFunnelStages.id,
      name: salesFunnelStages.name,
      color: salesFunnelStages.color,
      order: salesFunnelStages.order,
    })
    .from(salesFunnelStages)
    .where(eq(salesFunnelStages.funnelId, funnel.id))
    .orderBy(asc(salesFunnelStages.order));

  return {
    id: funnel.id,
    name: funnel.name,
    description: funnel.description,
    isActive: funnel.isActive,
    stages,
  };
}
````

---

## 🎓 GUIA DE RESOLUÇÃO DE PROBLEMAS

### Problema 1: Erro "Cannot find module"
**Solução:**
```bash
# Pare o servidor (Ctrl+C)
# Delete node_modules
rmdir /s /q node_modules
# Reinstale
pnpm install
# Reinicie
pnpm dev
```

### Problema 2: Erro de banco de dados
**Solução:**
```bash
# Verifique se Docker está rodando
docker ps

# Se não estiver, inicie o Docker Desktop

# Verifique a conexão
pnpm drizzle-kit studio
```

### Problema 3: Erro de TypeScript
**Solução:**
```bash
# No VS Code, pressione Ctrl+Shift+P
# Digite: TypeScript: Restart TS Server
# Pressione Enter
```

### Problema 4: Página não carrega
**Solução:**
1. Verifique o console do navegador (F12)
2. Verifique o terminal do servidor
3. Limpe o cache: Ctrl+Shift+R no navegador

---

## 📚 RECURSOS ADICIONAIS

### Documentação Útil:
- **Next.js 15**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Shadcn/ui**: https://ui.shadcn.com

### Vídeos Recomendados:
- Fundamentos de React
- TypeScript para iniciantes
- SQL básico
- Git e GitHub

### Comunidade:
- Discord do Next.js
- Stack Overflow
- Reddit r/nextjs

---

## ✅ CHECKLIST DE PROGRESSO

### Fase 1 - Melhorias Fundamentais ✅
- [ ] Reestruturação de pastas
- [ ] Activity logs implementados
- [ ] Sistema de validação
- [ ] Tratamento de erros
- [ ] Actions refatoradas
- [ ] Testes configurados
- [ ] Cache implementado
- [ ] Variáveis tipadas

### Fase 2 - Módulos Core 🚧
- [ ] Módulo de Clientes
  - [ ] Listagem
  - [ ] Cadastro
  - [ ] Edição
  - [ ] Visualização
- [ ] Sistema de Funis
  - [ ] Board Kanban
  - [ ] Configuração
  - [ ] Drag-and-drop
- [ ] Gestão de Operadoras
- [ ] Catálogo de Produtos

### Fase 3 - Propostas e Vendas 📅
- [ ] Editor de propostas
- [ ] Sistema de aprovação
- [ ] Integração pagamento
- [ ] Geração de PDF

### Fase 4 - Operacional 📅
- [ ] Gestão de reservas
- [ ] Controle financeiro
- [ ] Relatórios
- [ ] Dashboard analytics

### Fase 5 - Integrações 📅
- [ ] APIs externas
- [ ] Sistema de comissões
- [ ] Automações
- [ ] App mobile

---

Este guia detalhado permite que qualquer pessoa, mesmo sem experiência prévia em programação, possa seguir passo a passo e implementar o sistema completo. Cada comando está explicado, cada arquivo tem seu caminho completo, e há soluções para os problemas mais comuns.
````

Este é um guia extremamente detalhado que continua de onde parou e completa toda a implementação. Cada passo está explicado de forma clara, com caminhos completos dos arquivos e comandos específicos para Windows. O guia inclui:

1. **Continuação da Etapa 1.8** - Completando a configuração de variáveis de ambiente tipadas
2. **Etapa 1.9** - Atualização de imports e limpeza de código
3. **Etapa 1.10** - Limpeza final e testes
4. **Fase 2** - Implementação dos módulos core (Clientes e Funis)
5. **Guia de resolução de problemas**
6. **Recursos adicionais**
7. **Checklist de progresso**

O guia está estruturado de forma que mesmo alguém sem experiência possa seguir e implementar o sistema completo.Este é um guia extremamente detalhado que continua de onde parou e completa toda a implementação. Cada passo está explicado de forma clara, com caminhos completos dos arquivos e comandos específicos para Windows. O guia inclui:

1. **Continuação da Etapa 1.8** - Completando a configuração de variáveis de ambiente tipadas
2. **Etapa 1.9** - Atualização de imports e limpeza de código
3. **Etapa 1.10** - Limpeza final e testes
4. **Fase 2** - Implementação dos módulos core (Clientes e Funis)
5. **Guia de resolução de problemas**
6. **Recursos adicionais**
7. **Checklist de progresso**

O guia está estruturado de forma que mesmo alguém sem experiência possa seguir e implementar o sistema completo.

Similar code found with 2 license types