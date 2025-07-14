# Sistema de Cache Inteligente

## Visão Geral

Este módulo fornece um sistema de cache flexível e inteligente com suporte a múltiplos providers, cache com tags para invalidação em grupo, e funcionalidades avançadas para melhorar significativamente a performance da aplicação.

## Funcionalidades

- ✅ **Múltiplos Providers**: Redis para produção, memória para desenvolvimento
- ✅ **Cache com Tags**: Invalidação inteligente em grupo
- ✅ **Padrão Remember**: Busca do cache ou executa função automaticamente
- ✅ **Auto-Failover**: Se Redis falhar, volta automaticamente para memória
- ✅ **Singleton Pattern**: Uma instância única em toda a aplicação
- ✅ **TypeScript**: Totalmente tipado para melhor DX
- ✅ **Estatísticas**: Monitoramento de hit rate e performance

## Arquitetura

```
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐
│   TaggedCache   │───▶│ CacheManager │───▶│   Provider   │
│                 │    │              │    │              │
│ • remember()    │    │ • getInstance│    │ • Redis      │
│ • invalidateTag │    │ • set/get    │    │ • Memory     │
│ • cacheUser()   │    │ • remember() │    │ • Interface  │
└─────────────────┘    └──────────────┘    └──────────────┘
```

## Configuração

### Desenvolvimento (Automático)
Por padrão usa cache em memória - nenhuma configuração necessária.

### Produção (Opcional)
Configure as variáveis de ambiente para usar Redis:

```env
# Redis via Upstash (opcional)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

Se as variáveis não estiverem configuradas, o sistema automaticamente usará cache em memória.

## Como Usar

### 1. Cache Simples

```typescript
import { CacheManager } from '@/lib/services/cache/manager';

const cache = CacheManager.getInstance();

// Armazenar
await cache.set('minha-chave', { nome: 'João' }, 300); // 5 minutos

// Buscar
const dados = await cache.get('minha-chave');

// Verificar se existe
const existe = await cache.has('minha-chave');

// Deletar
await cache.delete('minha-chave');
```

### 2. Padrão Remember (Recomendado)

```typescript
import { CacheManager } from '@/lib/services/cache/manager';

const cache = CacheManager.getInstance();

// Busca do cache ou executa função
const user = await cache.remember(
  'user:123',
  async () => {
    // Esta função só executa se não estiver no cache
    return await getUserFromDatabase('123');
  },
  300 // TTL em segundos
);
```

### 3. Cache com Tags (Mais Poderoso)

```typescript
import { taggedCache } from '@/lib/services/cache/tagged-cache';

// Salvar com tags
await taggedCache.set('produto:123', produto, {
  ttl: 3600,
  tags: ['produtos', 'categoria:eletrônicos', 'loja:sp']
});

// Remember com tags
const user = await taggedCache.remember(
  'user:123',
  () => getUserFromDB('123'),
  {
    ttl: 300,
    tags: ['users', 'user:123', 'agency:456']
  }
);

// Invalidar todos os produtos
await taggedCache.invalidateTag('produtos');

// Invalidar múltiplas tags
await taggedCache.invalidateTags(['users', 'agency:456']);
```

### 4. Uso em Queries do Banco

```typescript
import { taggedCache } from '@/lib/services/cache/tagged-cache';
import { CacheKeys, CacheTTL } from '@/lib/services/cache/manager';

export async function getUserById(id: string) {
  return taggedCache.remember(
    CacheKeys.user(id),
    async () => {
      // Busca real no banco
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return result[0] || null;
    },
    {
      ttl: CacheTTL.MEDIUM, // 5 minutos
      tags: ['users', `user:${id}`]
    }
  );
}

export async function updateUser(id: string, data: any) {
  // Atualiza no banco
  const result = await db.update(users)...;
  
  // Invalida cache relacionado
  await taggedCache.invalidateTags(['users', `user:${id}`]);
  
  return result;
}
```

## Cache Keys Padronizadas

```typescript
import { CacheKeys } from '@/lib/services/cache/manager';

// Chaves pré-definidas para consistência
CacheKeys.user('123')                    // 'user:123'
CacheKeys.userByEmail('test@test.com')   // 'user:email:test@test.com'
CacheKeys.agency('456')                  // 'agency:456'
CacheKeys.clients('456', 2)              // 'clients:456:page:2'
CacheKeys.usersByAgency('456')           // 'users:agency:456'
```

## TTL Padronizados

```typescript
import { CacheTTL } from '@/lib/services/cache/manager';

CacheTTL.SHORT  // 1 minuto
CacheTTL.MEDIUM // 5 minutos  
CacheTTL.LONG   // 15 minutos
CacheTTL.HOUR   // 1 hora
CacheTTL.DAY    // 24 horas
```

## Métodos de Conveniência

```typescript
import { taggedCache } from '@/lib/services/cache/tagged-cache';

// Cache de usuário
await taggedCache.cacheUser('123', userData, 300);
await taggedCache.invalidateUser('123');

// Cache de agência  
await taggedCache.cacheAgency('456', agencyData, 600);
await taggedCache.invalidateAgency('456');
```

## Utilitários para Invalidação

```typescript
import { CacheUtils } from '@/lib/services/cache/manager';

// Invalida dados de usuário
await CacheUtils.invalidateUser('123');

// Invalida dados de agência
await CacheUtils.invalidateAgency('456');

// Invalida dados de clientes
await CacheUtils.invalidateClients('456');

// Verifica saúde do cache
const isHealthy = CacheUtils.isHealthy();

// Obtém estatísticas
const stats = CacheUtils.getStats();

// Informações do provider
const info = CacheUtils.getProviderInfo();
```

## Estratégias de Cache

### 1. Cache de Leitura (Read-Through)

```typescript
// Para dados que mudam raramente
export async function getAgencySettings(agencyId: string) {
  return taggedCache.remember(
    `settings:${agencyId}`,
    () => getSettingsFromDB(agencyId),
    {
      ttl: CacheTTL.HOUR, // 1 hora
      tags: ['settings', `agency:${agencyId}`]
    }
  );
}
```

### 2. Cache de Escrita (Write-Through)

```typescript
// Atualiza banco e cache simultaneamente
export async function updateAgencySettings(agencyId: string, settings: any) {
  // 1. Atualiza no banco
  const result = await updateSettingsInDB(agencyId, settings);
  
  // 2. Atualiza no cache
  await taggedCache.set(`settings:${agencyId}`, result, {
    ttl: CacheTTL.HOUR,
    tags: ['settings', `agency:${agencyId}`]
  });
  
  return result;
}
```

### 3. Cache com Invalidação

```typescript
// Invalida cache quando dados mudam
export async function createClient(agencyId: string, clientData: any) {
  const result = await createClientInDB(clientData);
  
  // Invalida listas de clientes
  await taggedCache.invalidateTags([
    'clients',
    `agency:${agencyId}`,
    `clients:${agencyId}`
  ]);
  
  return result;
}
```

## Monitoramento e Debug

### Verificar Status

```typescript
import { CacheUtils } from '@/lib/services/cache/manager';

// Informações do provider atual
const info = CacheUtils.getProviderInfo();
console.log('Provider:', info.type); // 'redis' ou 'memory'
console.log('Saudável:', info.isHealthy);
console.log('Estatísticas:', info.stats);
```

### Estatísticas (Memory Cache)

```typescript
const stats = CacheUtils.getStats();
if (stats) {
  console.log('Entradas ativas:', stats.activeEntries);
  console.log('Taxa de acerto:', stats.hitRate + '%');
  console.log('Total de buscas:', stats.totalGets);
  console.log('Total de hits:', stats.totalHits);
}
```

### Logs Automáticos

O sistema automaticamente loga:
- Qual provider está sendo usado (Redis vs Memory)
- Fallback de Redis para Memory em caso de erro
- Estatísticas de limpeza (apenas Memory)

## Performance

### Benchmarks Esperados

| Operação | Memory Cache | Redis Cache |
|----------|--------------|-------------|
| GET | ~0.1ms | ~10-50ms |
| SET | ~0.1ms | ~10-50ms |
| Invalidação | ~1ms | ~10-100ms |

### Otimizações

1. **Use TTL apropriado**: Dados que mudam frequentemente = TTL menor
2. **Tags inteligentes**: Use tags específicas para invalidação precisa
3. **Batch operations**: Invalide múltiplas tags de uma vez
4. **Monitor hit rate**: Mantenha acima de 80% para boa performance

## Troubleshooting

### Problema: Cache não está funcionando

**Verificações**:
```typescript
const info = CacheUtils.getProviderInfo();
console.log('Provider info:', info);
```

### Problema: Dados desatualizados

**Solução**: Verificar invalidação de cache
```typescript
// Após mudanças no banco, sempre invalide
await taggedCache.invalidateTags(['tag-relacionada']);
```

### Problema: Memory usage alto

**Solução**: Ajustar TTL ou usar Redis
```typescript
// TTL mais baixo para dados menos importantes
{ ttl: CacheTTL.SHORT } // 1 minuto
```

### Problema: Redis connection failed

**Comportamento**: Sistema automaticamente volta para memory cache
**Verificação**: Checar variáveis de ambiente e conectividade

## Exemplos Avançados

### Cache de Busca

```typescript
export async function searchClients(agencyId: string, term: string) {
  return taggedCache.remember(
    `search:clients:${agencyId}:${term}`,
    () => searchClientsInDB(agencyId, term),
    {
      ttl: CacheTTL.SHORT, // Resultados de busca mudam
      tags: ['clients', 'search', `agency:${agencyId}`]
    }
  );
}
```

### Cache de Agregações

```typescript
export async function getAgencyStats(agencyId: string) {
  return taggedCache.remember(
    `stats:${agencyId}`,
    async () => {
      const [userCount, clientCount, activityCount] = await Promise.all([
        getUserCount(agencyId),
        getClientCount(agencyId),
        getActivityCount(agencyId)
      ]);
      
      return { userCount, clientCount, activityCount };
    },
    {
      ttl: CacheTTL.MEDIUM,
      tags: ['stats', `agency:${agencyId}`]
    }
  );
}
```

### Cache com Dependências

```typescript
export async function getUserWithAgency(userId: string) {
  return taggedCache.remember(
    `user-with-agency:${userId}`,
    async () => {
      const user = await getUserFromDB(userId);
      const agency = await getAgencyFromDB(user.agencyId);
      return { user, agency };
    },
    {
      ttl: CacheTTL.MEDIUM,
      tags: ['users', 'agencies', `user:${userId}`, `agency:${user.agencyId}`]
    }
  );
}
```

## Migração do Sistema Antigo

Se você tem código usando o cache antigo:

```typescript
// Antigo
import cacheManager from '@/lib/services/cache/manager';
const data = cacheManager.get('key');

// Novo
import { CacheManager } from '@/lib/services/cache/manager';
const cache = CacheManager.getInstance();
const data = await cache.get('key');
```

O sistema é compatível com as chaves antigas, mas recomenda-se migrar para o novo padrão async/await.

## Roadmap

- [ ] Cache distribuído para múltiplas instâncias
- [ ] Compressão automática para valores grandes
- [ ] Métricas avançadas e dashboard
- [ ] Cache warming strategies
- [ ] TTL dinâmico baseado em usage patterns
