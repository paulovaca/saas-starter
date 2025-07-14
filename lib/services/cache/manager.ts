import { CacheProvider, CacheStats } from './types';
import { MemoryCache } from './memory-cache';
import { RedisCache } from './redis-cache';

/**
 * Gerenciador de cache inteligente que escolhe automaticamente entre Redis e memória
 * 
 * @example
 * ```typescript
 * const cache = CacheManager.getInstance();
 * await cache.set('user:123', userData, 300); // 5 minutos
 * const user = await cache.get<User>('user:123');
 * ```
 */
export class CacheManager implements CacheProvider {
  private static instance: CacheManager;
  private provider!: CacheProvider;
  private isRedisAvailable: boolean = false;

  private constructor() {
    this.initializeProvider();
  }

  /**
   * Singleton - obtém a instância única do CacheManager
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Inicializa o provider de cache (Redis ou Memória)
   */
  private initializeProvider(): void {
    try {
      // Tenta usar Redis se as credenciais estão disponíveis
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.provider = new RedisCache();
        this.isRedisAvailable = true;
        console.log('✅ Cache Manager: Using Redis provider');
      } else {
        this.provider = new MemoryCache();
        this.isRedisAvailable = false;
        console.log('⚠️ Cache Manager: Using Memory provider (Redis not configured)');
      }
    } catch (error: any) {
      // Se Redis falhar, volta para memória
      console.warn('⚠️ Cache Manager: Redis failed, falling back to Memory provider', error?.message || error);
      this.provider = new MemoryCache();
      this.isRedisAvailable = false;
    }
  }

  /**
   * Obtém um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.provider.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Define um valor no cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.provider.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Remove uma chave do cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.provider.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    try {
      await this.provider.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Verifica se uma chave existe no cache
   */
  async has(key: string): Promise<boolean> {
    try {
      return await this.provider.has(key);
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  /**
   * Padrão remember: obtém do cache ou executa função
   */
  async remember<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Remove múltiplas chaves por padrão
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      if (this.provider instanceof RedisCache) {
        return await this.provider.deleteByPattern(pattern);
      } else if (this.provider instanceof MemoryCache) {
        return await this.provider.deleteByPattern(pattern);
      }
      return 0;
    } catch (error) {
      console.error('Cache deleteByPattern error:', error);
      return 0;
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats | null {
    try {
      if (this.provider instanceof MemoryCache) {
        return this.provider.getStats();
      }
      // Redis não tem estatísticas implementadas ainda
      return null;
    } catch (error) {
      console.error('Cache getStats error:', error);
      return null;
    }
  }

  /**
   * Obtém TTL de uma chave
   */
  async getTTL(key: string): Promise<number> {
    try {
      if (this.provider instanceof RedisCache) {
        return await this.provider.getTTL(key);
      } else if (this.provider instanceof MemoryCache) {
        return await this.provider.getTTL(key);
      }
      return -1;
    } catch (error) {
      console.error('Cache getTTL error:', error);
      return -1;
    }
  }

  /**
   * Verifica se o cache está funcionando
   */
  isHealthy(): boolean {
    if (this.provider instanceof RedisCache) {
      return this.provider.isHealthy();
    } else if (this.provider instanceof MemoryCache) {
      return this.provider.isHealthy();
    }
    return false;
  }

  /**
   * Retorna informações sobre o provider atual
   */
  getProviderInfo() {
    return {
      type: this.isRedisAvailable ? 'redis' : 'memory',
      isHealthy: this.isHealthy(),
      stats: this.getStats(),
    };
  }
}

// Criar instância singleton
const cacheManager = CacheManager.getInstance();

// TTL constants (em segundos - convertido do sistema anterior)
export const CacheTTL = {
  SHORT: 60,           // 1 minuto
  MEDIUM: 5 * 60,      // 5 minutos
  LONG: 15 * 60,       // 15 minutos
  HOUR: 60 * 60,       // 1 hora
  DAY: 24 * 60 * 60,   // 24 horas
};

// Cache key builders for common patterns
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,
  agency: (agencyId: string) => `agency:${agencyId}`,
  agencySettings: (agencyId: string) => `agency:settings:${agencyId}`,
  salesFunnels: (agencyId: string) => `sales-funnels:${agencyId}`,
  funnelStages: (funnelId: string) => `funnel-stages:${funnelId}`,
  baseItems: (agencyId: string) => `base-items:${agencyId}`,
  operators: (agencyId: string) => `operators:${agencyId}`,
  clients: (agencyId: string, page: number = 1) => `clients:${agencyId}:page:${page}`,
  clientSearch: (agencyId: string, searchTerm: string) => `clients:search:${agencyId}:${searchTerm}`,
  usersByAgency: (agencyId: string) => `users:agency:${agencyId}`,
  recentActivities: (agencyId: string) => `activities:recent:${agencyId}`,
  notifications: (userId: string) => `notifications:${userId}`,
};

// Export the cache manager
export default cacheManager;

// Helper functions for common cache operations
export const CacheUtils = {
  /**
   * Invalidate all user-related cache entries
   */
  async invalidateUser(userId: string) {
    await cacheManager.deleteByPattern(`user:${userId}*`);
    await cacheManager.deleteByPattern(`notifications:${userId}*`);
  },

  /**
   * Invalidate all agency-related cache entries
   */
  async invalidateAgency(agencyId: string) {
    await cacheManager.deleteByPattern(`agency:${agencyId}*`);
    await cacheManager.deleteByPattern(`sales-funnels:${agencyId}*`);
    await cacheManager.deleteByPattern(`base-items:${agencyId}*`);
    await cacheManager.deleteByPattern(`operators:${agencyId}*`);
    await cacheManager.deleteByPattern(`clients:${agencyId}*`);
    await cacheManager.deleteByPattern(`users:agency:${agencyId}*`);
    await cacheManager.deleteByPattern(`activities:recent:${agencyId}*`);
  },

  /**
   * Invalidate client-related cache entries
   */
  async invalidateClients(agencyId: string) {
    await cacheManager.deleteByPattern(`clients:${agencyId}*`);
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return cacheManager.getStats();
  },

  /**
   * Get provider info
   */
  getProviderInfo() {
    return cacheManager.getProviderInfo();
  },

  /**
   * Check if cache is healthy
   */
  isHealthy() {
    return cacheManager.isHealthy();
  },
};
