# Sistema de Rate Limiting

## Visão Geral

O sistema de Rate Limiting protege a aplicação contra spam, ataques de força bruta e sobrecarga de requisições. Ele controla quantas vezes um usuário pode executar determinadas ações em um período específico.

## Funcionalidades

- ✅ **Proteção contra força bruta** em login e registro
- ✅ **Flexível**: Funciona com Redis em produção e memória em desenvolvimento  
- ✅ **Configurável**: Diferentes limites para diferentes ações
- ✅ **Integrado**: Funciona automaticamente com o wrapper de actions
- ✅ **Transparente**: Mensagens de erro claras para o usuário

## Como Funciona

### Em Desenvolvimento
- Usa cache em memória local (`Map`)
- Não requer configuração adicional
- Ideal para testes e desenvolvimento

### Em Produção
- Usa Redis via Upstash para persistência
- Suporta aplicações distribuídas
- Requer configuração das variáveis de ambiente

## Configuração

### Variáveis de Ambiente (Opcionais)

```env
# Para usar Redis em produção
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

Se não configuradas, o sistema usará cache em memória.

## Como Usar

### 1. Em Server Actions

```typescript
import { withFormAction } from '@/lib/services/error-handler/action-wrapper';

export const signIn = withFormAction(
  async (context, data: FormData) => {
    // Sua lógica aqui
  },
  {
    requireAuth: false,
    rateLimit: {
      action: 'sign-in',    // Identificador da ação
      limit: 5,             // 5 tentativas (configurado no rate limiter)
      window: '10m'         // em 10 minutos (configurado no rate limiter)
    }
  }
);
```

### 2. Diretamente (para APIs)

```typescript
import { rateLimiter } from '@/lib/services/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    await rateLimiter.check(ip, 'api-create-user');
    
    // Sua lógica aqui
  } catch (error) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
}
```

## Ações Protegidas Atualmente

| Ação | Limite | Janela | Descrição |
|------|--------|--------|-----------|
| `sign-in` | 5 tentativas | 10 minutos | Login de usuários |
| `sign-up` | 3 tentativas | 15 minutos | Registro de novos usuários |
| `stripe-checkout` | 10 tentativas | 1 minuto | Processamento de checkout |
| `general` | 10 tentativas | 1 minuto | Ações sem configuração específica |

## Adicionando Novas Proteções

### Para Server Actions

```typescript
export const minhaAction = withFormAction(
  async (context, data: FormData) => {
    // Sua lógica
  },
  {
    rateLimit: {
      action: 'minha-action',  // Nome único para esta ação
    }
  }
);
```

### Para APIs

```typescript
import { rateLimiter } from '@/lib/services/rate-limiter';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  try {
    await rateLimiter.check(ip, 'minha-api');
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 429 }
    );
  }
  
  // Processar requisição...
}
```

## Configuração de Limites

Os limites são configurados no construtor do `RateLimiter`:

```typescript
// Arquivo: lib/services/rate-limiter/index.ts

// Para produção (Redis)
this.limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
});

// Para desenvolvimento (Memória)
const windowMs = 60000; // 1 minuto
const limit = 10;       // 10 tentativas
```

Para diferentes limites por ação, você pode criar múltiplas instâncias ou modificar o comportamento baseado no `action`.

## Monitoramento

### Logs

O sistema automaticamente registra tentativas que excedem o limite:

```typescript
// Verifique os logs da aplicação para:
console.error('Rate limit exceeded:', { ip, action, timestamp });
```

### Métricas (Redis)

Se usando Redis, você pode monitorar:
- Chaves ativas: `KEYS *:sign-in*`
- TTL de chaves: `TTL ip:action`

## Troubleshooting

### Problema: "Muitas tentativas" em desenvolvimento

**Solução**: O cache em memória persiste durante a execução. Reinicie o servidor de desenvolvimento.

### Problema: Rate limiting não funciona

**Verificações**:
1. Verifique se o IP está sendo capturado corretamente
2. Confirme se a configuração `rateLimit` está presente
3. Verifique logs para erros de conexão Redis (em produção)

### Problema: Usuários legítimos sendo bloqueados

**Soluções**:
1. Ajuste os limites no código
2. Implemente allowlist para IPs confiáveis
3. Use identificadores de usuário ao invés de IP (para usuários autenticados)

## Extensões Futuras

### Allowlist de IPs

```typescript
const trustedIPs = ['192.168.1.1', '10.0.0.1'];

async check(identifier: string, action: string) {
  if (trustedIPs.includes(identifier)) {
    return; // Pula verificação
  }
  // Verificação normal...
}
```

### Rate Limiting por Usuário

```typescript
// Em ações autenticadas, use o ID do usuário
if (context.userId) {
  await rateLimiter.check(context.userId, action);
} else {
  await rateLimiter.check(ip, action);
}
```

### Diferentes Limites por Ação

```typescript
const actionLimits = {
  'sign-in': { limit: 5, window: '10m' },
  'sign-up': { limit: 3, window: '15m' },
  'api-create': { limit: 100, window: '1h' },
};
```

## Segurança

- ✅ IPs são sanitizados antes do uso
- ✅ Não armazena dados sensíveis no cache
- ✅ Timestamps são validados para prevenir manipulação
- ✅ Falhas de rate limiting não expõem informações do sistema
