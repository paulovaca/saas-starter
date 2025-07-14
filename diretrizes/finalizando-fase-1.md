Vou detalhar cada melhoria com um passo a passo bem explicado:

## 1. 🚦 **Adicionar Rate Limiting** (Limitador de Requisições)

### O que é?
Rate limiting é como um "porteiro" que controla quantas vezes alguém pode fazer algo em um período de tempo. Por exemplo: "você só pode tentar fazer login 5 vezes em 10 minutos".

### Por que precisa?
Para proteger contra ataques onde alguém tenta milhares de senhas diferentes ou sobrecarrega o servidor.

### Como implementar:

**Passo 1:** Instalar a biblioteca
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

**Passo 2:** Criar o arquivo do rate limiter
````typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuração para desenvolvimento (usa memória local)
const ratelimitMemory = new Map();

class RateLimiter {
  private limiter: Ratelimit | null = null;

  constructor() {
    // Se tiver Redis configurado, usa ele
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      this.limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requisições por minuto
      });
    }
  }

  async check(identifier: string, action: string) {
    // Em desenvolvimento, usa um limitador simples em memória
    if (!this.limiter) {
      const key = `${identifier}:${action}`;
      const now = Date.now();
      const windowMs = 60000; // 1 minuto
      const limit = 10;

      // Pega ou cria array de timestamps
      const timestamps = ratelimitMemory.get(key) || [];
      
      // Remove timestamps antigos
      const validTimestamps = timestamps.filter((ts: number) => now - ts < windowMs);
      
      if (validTimestamps.length >= limit) {
        throw new Error('Muitas tentativas. Aguarde alguns minutos.');
      }

      validTimestamps.push(now);
      ratelimitMemory.set(key, validTimestamps);
      return;
    }

    // Usa o Redis em produção
    const { success } = await this.limiter.limit(identifier);
    if (!success) {
      throw new Error('Muitas tentativas. Aguarde alguns minutos.');
    }
  }
}

export const rateLimiter = new RateLimiter();
````

**Passo 3:** Atualizar o wrapper de actions
````typescript
// ...existing code...
import { rateLimiter } from '@/lib/services/rate-limiter';
import { headers } from 'next/headers';

export function withActionWrapper<TArgs extends any[], TReturn>(
  action: (context: ActionContext, ...args: TArgs) => Promise<TReturn>,
  options?: ActionOptions
): (...args: TArgs) => Promise<ActionResult<TReturn>> {
  return async (...args: TArgs): Promise<ActionResult<TReturn>> => {
    try {
      // Pega o IP do usuário
      const headersList = headers();
      const ip = headersList.get('x-forwarded-for') || 'anonymous';
      
      // Verifica rate limit se configurado
      if (options?.rateLimit) {
        await rateLimiter.check(ip, options.rateLimit.action || 'general');
      }

      // ...existing code...
    } catch (error) {
      // ...existing code...
    }
  };
}
````

**Passo 4:** Usar nas actions sensíveis
````typescript
export const signIn = withFormAction(
  async (context, data: FormData | any) => {
    // ...existing code...
  },
  {
    requireAuth: false,
    activityType: 'SIGN_IN' as any,
    rateLimit: {
      action: 'sign-in',
      limit: 5,        // 5 tentativas
      window: '10m'    // em 10 minutos
    }
  }
);
````

## 2. 💾 **Evoluir Sistema de Cache**

### O que é?
Cache é como uma "memória de curto prazo" que guarda informações frequentemente usadas para não precisar buscá-las do banco toda vez.

### Como melhorar:

**Passo 1:** Criar interface para diferentes tipos de cache
````typescript
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export interface CacheOptions {
  ttl?: number;        // Tempo de vida em segundos
  tags?: string[];     // Tags para invalidação em grupo
  prefix?: string;     // Prefixo para a chave
}
````

**Passo 2:** Implementar provider Redis
````typescript
import { Redis } from '@upstash/redis';
import { CacheProvider } from '../types';

export class RedisCache implements CacheProvider {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data as T | null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await this.redis.set(key, JSON.stringify(value));
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushall();
  }

  async has(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }
}
````

**Passo 3:** Cache com tags (para invalidar grupos)
````typescript
// filepath: lib/services/cache/tagged-cache.ts
import { CacheManager } from './manager';

export class TaggedCache {
  private cache = CacheManager.getInstance();
  private tagPrefix = 'tag:';

  async remember<T>(
    key: string,
    fn: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<T> {
    // Tenta pegar do cache
    const cached = await this.cache.get<T>(key);
    if (cached !== null) return cached;

    // Executa a função e salva
    const result = await fn();
    await this.set(key, result, options);
    
    return result;
  }

  async set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<void> {
    // Salva o valor
    await this.cache.set(key, value, options?.ttl);

    // Salva as tags
    if (options?.tags) {
      for (const tag of options.tags) {
        const tagKey = `${this.tagPrefix}${tag}`;
        const keys = await this.cache.get<string[]>(tagKey) || [];
        keys.push(key);
        await this.cache.set(tagKey, keys);
      }
    }
  }

  async invalidateTag(tag: string): Promise<void> {
    const tagKey = `${this.tagPrefix}${tag}`;
    const keys = await this.cache.get<string[]>(tagKey) || [];
    
    // Deleta todas as chaves com essa tag
    for (const key of keys) {
      await this.cache.delete(key);
    }
    
    // Deleta a lista de chaves da tag
    await this.cache.delete(tagKey);
  }
}

export const taggedCache = new TaggedCache();
````

**Passo 4:** Usar o cache melhorado
````typescript
import { taggedCache } from '@/lib/services/cache/tagged-cache';

export async function getCachedUser(userId: string) {
  return taggedCache.remember(
    `user:${userId}`,
    () => getUserFromDB(userId),
    {
      ttl: 300, // 5 minutos
      tags: ['users', `user:${userId}`]
    }
  );
}

// Quando o usuário for atualizado, invalida o cache
export async function updateUser(userId: string, data: any) {
  const result = await updateUserInDB(userId, data);
  
  // Invalida todos os caches relacionados a usuários
  await taggedCache.invalidateTag('users');
  await taggedCache.invalidateTag(`user:${userId}`);
  
  return result;
}
````

## 3. 📚 **Adicionar Mais Documentação**

### O que é?
Documentação são "instruções" dentro do código que explicam o que cada parte faz.

### Como fazer:

**Passo 1:** Adicionar JSDoc em funções importantes
````typescript
/**
 * Busca um usuário pelo ID e retorna seus dados junto com a agência
 * 
 * @param userId - O ID único do usuário
 * @returns Os dados do usuário com informações da agência ou null se não encontrado
 * 
 * @example
 * ```typescript
 * const user = await getUser('123');
 * if (user) {
 *   console.log(user.name); // "João Silva"
 *   console.log(user.agency?.name); // "Minha Agência"
 * }
 * ```
 * 
 * @throws {DatabaseError} Se houver erro na conexão com o banco
 */
export async function getUser(userId: string) {
  // ...código...
}
````

**Passo 2:** Criar README para cada módulo
````markdown
# Sistema de Cache

## Visão Geral
Este módulo fornece um sistema de cache flexível com suporte a múltiplos providers.

## Como Usar

### Cache Simples
```typescript
import { CacheManager } from './manager';

const cache = CacheManager.getInstance();

// Salvar no cache
await cache.set('minha-chave', { nome: 'João' }, 300); // 5 minutos

// Buscar do cache
const dados = await cache.get('minha-chave');
```

### Cache com Tags
```typescript
import { taggedCache } from './tagged-cache';

// Salvar com tags
await taggedCache.set('produto:123', produto, {
  ttl: 3600,
  tags: ['produtos', 'categoria:eletrônicos']
});

// Invalidar todos os produtos
await taggedCache.invalidateTag('produtos');
```

## Configuração

### Desenvolvimento
Por padrão usa cache em memória.

### Produção
Configure as variáveis de ambiente:
- `UPSTASH_REDIS_REST_URL`: URL do Redis
- `UPSTASH_REDIS_REST_TOKEN`: Token de autenticação
````

**Passo 3:** Documentar tipos complexos
````typescript
/**
 * Resultado padrão de uma action
 * @template T - Tipo dos dados retornados em caso de sucesso
 */
export interface ActionResult<T = void> {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  
  /** Dados retornados em caso de sucesso */
  data?: T;
  
  /** Mensagem de erro em caso de falha */
  error?: string;
  
  /** Código de erro específico para tratamento no frontend */
  errorCode?: ErrorCode;
  
  /** Detalhes adicionais do erro para debugging */
  details?: Record<string, any>;
}

/**
 * Códigos de erro padronizados
 */
export enum ErrorCode {
  /** Credenciais inválidas no login */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  /** Usuário não tem permissão para esta ação */
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  /** Dados enviados são inválidos */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  /** Erro interno do servidor */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
````

## 4. 🛡️ **Melhorar Tratamento de Erros de DB**

### O que é?
Transformar erros técnicos do banco em mensagens amigáveis para o usuário.

### Como fazer:

**Passo 1:** Criar mapeamento de erros
````typescript
/**
 * Mapeia códigos de erro do PostgreSQL para mensagens amigáveis
 */
export const postgresErrorMap: Record<string, string> = {
  // Violação de chave única
  '23505': 'Este registro já existe no sistema.',
  
  // Violação de chave estrangeira
  '23503': 'Este registro está sendo usado em outro lugar e não pode ser removido.',
  
  // Violação de not null
  '23502': 'Campos obrigatórios não foram preenchidos.',
  
  // Dados muito longos
  '22001': 'Um ou mais campos excedem o tamanho máximo permitido.',
  
  // Tipo de dado inválido
  '22P02': 'Formato de dados inválido.',
  
  // Divisão por zero
  '22012': 'Operação matemática inválida.',
  
  // Timeout
  '57014': 'A operação demorou muito tempo. Tente novamente.',
};

/**
 * Converte erro do Postgres em erro amigável
 */
export function handleDatabaseError(error: any): AppError {
  // Se não for erro do Postgres, retorna erro genérico
  if (!error.code) {
    return new AppError('Erro ao processar operação no banco de dados.');
  }

  // Procura mensagem específica
  const message = postgresErrorMap[error.code];
  if (message) {
    // Se for erro de duplicação, tenta extrair o campo
    if (error.code === '23505' && error.detail) {
      const match = error.detail.match(/Key \((.+?)\)=/);
      if (match) {
        const field = match[1];
        const fieldMap: Record<string, string> = {
          'email': 'Este e-mail já está cadastrado.',
          'cpf': 'Este CPF já está cadastrado.',
          'cnpj': 'Este CNPJ já está cadastrado.',
        };
        
        return new ValidationError(fieldMap[field] || message);
      }
    }
    
    return new DatabaseError(message);
  }

  // Erro desconhecido
  console.error('Erro de banco não mapeado:', error.code, error);
  return new AppError('Erro inesperado no banco de dados.');
}
````

**Passo 2:** Usar no wrapper de actions
````typescript
import { handleDatabaseError } from './database-errors';

// ...existing code...

} catch (error) {
  // Se for erro do Postgres
  if (error?.code && typeof error.code === 'string' && error.code.length === 5) {
    error = handleDatabaseError(error);
  }
  
  // ...resto do tratamento de erro...
}
````

## 5. 🧪 **Adicionar Mais Testes**

### O que são?
Testes são "verificações automáticas" que garantem que o código funciona corretamente.

### Como criar:

**Passo 1:** Testes para actions
````typescript
import { signIn } from '@/lib/actions/auth/sign-in';
import { db } from '@/lib/db/drizzle';
import { hashPassword } from '@/lib/auth/session';

// Mock do banco de dados
jest.mock('@/lib/db/drizzle');

describe('signIn action', () => {
  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('deve autenticar usuário com credenciais válidas', async () => {
    // Prepara dados de teste
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: await hashPassword('senha123'),
      isActive: true,
    };

    // Configura o mock para retornar o usuário
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockUser])
        })
      })
    });

    // Cria FormData de teste
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'senha123');

    // Executa a action
    const result = await signIn(formData);

    // Verifica o resultado
    expect(result.success).toBe(true);
    expect(db.select).toHaveBeenCalled();
  });

  test('deve rejeitar credenciais inválidas', async () => {
    // Configura mock para não encontrar usuário
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      })
    });

    const formData = new FormData();
    formData.append('email', 'wrong@example.com');
    formData.append('password', 'wrongpass');

    const result = await signIn(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Credenciais inválidas');
  });

  test('deve validar campos obrigatórios', async () => {
    const formData = new FormData();
    // Não adiciona email nem senha

    const result = await signIn(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('email');
  });
});
````

**Passo 2:** Testes de integração
````typescript
import { signUp, signIn, signOut } from '@/lib/actions/auth';
import { db } from '@/lib/db/drizzle';

describe('Fluxo completo de autenticação', () => {
  // Dados de teste
  const testUser = {
    email: 'integration@test.com',
    password: 'Test123!@#',
    name: 'Teste Integração',
  };

  afterAll(async () => {
    // Limpa dados de teste do banco
    await db.delete(users).where(eq(users.email, testUser.email));
  });

  test('deve completar fluxo de registro e login', async () => {
    // 1. Registra novo usuário
    const signUpData = new FormData();
    Object.entries(testUser).forEach(([key, value]) => {
      signUpData.append(key, value);
    });

    const signUpResult = await signUp(signUpData);
    expect(signUpResult.success).toBe(true);

    // 2. Faz login
    const signInData = new FormData();
    signInData.append('email', testUser.email);
    signInData.append('password', testUser.password);

    const signInResult = await signIn(signInData);
    expect(signInResult.success).toBe(true);

    // 3. Verifica se a sessão foi criada
    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session?.user).toBeDefined();

    // 4. Faz logout
    const signOutResult = await signOut();
    expect(signOutResult.success).toBe(true);

    // 5. Verifica se a sessão foi removida
    const sessionAfterLogout = await getSession();
    expect(sessionAfterLogout).toBeNull();
  });
});
````

**Passo 3:** Executar testes
```bash
# Rodar todos os testes
npm test

# Rodar com cobertura (mostra quanto do código está testado)
npm test -- --coverage

# Rodar apenas um arquivo
npm test sign-in.test.ts

# Rodar em modo watch (fica rodando automaticamente)
npm test -- --watch
```

## 6. ✅ **Script de Validação de Ambiente**

### O que é?
Um script que verifica se todas as configurações necessárias estão corretas antes de rodar o sistema.

### Como criar:

**Passo 1:** Criar o script
````typescript
import { config } from 'dotenv';
import { z } from 'zod';
import chalk from 'chalk';

// Carrega .env
config();

// Define o que é obrigatório
const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string().url().refine(
    (url) => url.startsWith('postgres://') || url.startsWith('postgresql://'),
    'DATABASE_URL deve ser uma URL PostgreSQL válida'
  ),

  // Autenticação
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET deve ter pelo menos 32 caracteres'),

  // URLs
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL deve ser uma URL válida'),

  // Stripe (opcional em dev)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Redis (opcional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Função principal
async function validateEnvironment() {
  console.log(chalk.blue('🔍 Validando variáveis de ambiente...\n'));

  try {
    // Valida
    const env = envSchema.parse(process.env);

    // Mostra resumo
    console.log(chalk.green('✅ Variáveis obrigatórias:'));
    console.log(`   - DATABASE_URL: ${chalk.gray('Configurado')}`);
    console.log(`   - AUTH_SECRET: ${chalk.gray('Configurado')}`);
    console.log(`   - NEXT_PUBLIC_APP_URL: ${chalk.gray(env.NEXT_PUBLIC_APP_URL)}`);

    console.log('\n' + chalk.yellow('📦 Variáveis opcionais:'));
    
    // Stripe
    if (env.STRIPE_SECRET_KEY) {
      console.log(`   - Stripe: ${chalk.green('Configurado')}`);
    } else {
      console.log(`   - Stripe: ${chalk.gray('Não configurado (pagamentos desabilitados)')}`);
    }

    // Redis
    if (env.UPSTASH_REDIS_REST_URL) {
      console.log(`   - Redis: ${chalk.green('Configurado')}`);
    } else {
      console.log(`   - Redis: ${chalk.gray('Não configurado (usando cache em memória)')}`);
    }

    // Testa conexão com banco
    console.log('\n' + chalk.blue('🔌 Testando conexão com banco de dados...'));
    const { db } = await import('@/lib/db/drizzle');
    await db.select().from(schema.users).limit(1);
    console.log(chalk.green('✅ Conexão com banco estabelecida!'));

    console.log('\n' + chalk.green.bold('✨ Ambiente validado com sucesso!'));
    process.exit(0);

  } catch (error) {
    console.log(chalk.red.bold('\n❌ Erro na validação:\n'));

    if (error instanceof z.ZodError) {
      // Mostra erros de validação
      error.errors.forEach((err) => {
        console.log(chalk.red(`   - ${err.path.join('.')}: ${err.message}`));
      });

      console.log('\n' + chalk.yellow('💡 Dica: Copie .env.example para .env e preencha os valores'));
    } else {
      // Outros erros
      console.log(chalk.red(error.message));
    }

    process.exit(1);
  }
}

// Executa
validateEnvironment();
````

**Passo 2:** Adicionar script no package.json
````json
{
  "scripts": {
    "validate:env": "tsx scripts/validate-env.ts",
    "predev": "npm run validate:env",
    "prebuild": "npm run validate:env"
  }
}
````

**Passo 3:** Instalar dependência para cores no terminal
```bash
pnpm add -D chalk
```

Agora, sempre que rodar `npm run dev` ou `npm run build`, o script vai verificar se tudo está configurado corretamente primeiro!

## 📋 Resumo de Implementação

1. **Rate Limiting**: Protege contra spam e ataques
2. **Cache Melhorado**: Performance muito melhor com cache inteligente
3. **Documentação**: Código mais fácil de entender e manter
4. **Erros de DB**: Mensagens claras para o usuário
5. **Testes**: Garantia de que tudo funciona
6. **Validação de Ambiente**: Evita problemas de configuração

Todas essas melhorias tornam o sistema mais robusto, seguro e profissional! 🚀

Similar code found with 1 license type