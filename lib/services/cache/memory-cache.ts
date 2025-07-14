import { CacheProvider, CacheStats } from './types';

/**
 * Provider de cache em memória para desenvolvimento
 * 
 * @example
 * ```typescript
 * const memoryCache = new MemoryCache();
 * await memoryCache.set('user:123', userData, 300); // 5 minutos
 * const user = await memoryCache.get<User>('user:123');
 * ```
 */
export class MemoryCache implements CacheProvider {
  private cache = new Map<string, { data: any; expiresAt: number; createdAt: number }>();
  private defaultTTL = 5 * 60; // 5 minutos em segundos
  private stats = {
    totalGets: 0,
    totalHits: 0,
  };

  constructor(defaultTTLSeconds?: number) {
    if (defaultTTLSeconds) {
      this.defaultTTL = defaultTTLSeconds;
    }

    // Cleanup automático a cada 10 minutos
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Obtém um valor do cache em memória
   */
  async get<T>(key: string): Promise<T | null> {
    this.stats.totalGets++;

    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verifica se expirou
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    this.stats.totalHits++;
    return item.data as T;
  }

  /**
   * Define um valor no cache em memória
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const ttlMs = (ttl || this.defaultTTL) * 1000; // Converte para milissegundos
    
    this.cache.set(key, {
      data: value,
      expiresAt: now + ttlMs,
      createdAt: now,
    });
  }

  /**
   * Remove uma chave do cache em memória
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache em memória
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.totalGets = 0;
    this.stats.totalHits = 0;
  }

  /**
   * Verifica se uma chave existe no cache em memória
   */
  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Verifica se expirou
    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove múltiplas chaves por padrão
   */
  async deleteByPattern(pattern: string): Promise<number> {
    let deletedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      totalSize++;
      if (now > item.expiresAt) {
        expiredCount++;
      }
    }

    const hitRate = this.stats.totalGets > 0 
      ? (this.stats.totalHits / this.stats.totalGets) * 100 
      : 0;

    return {
      totalEntries: totalSize,
      expiredEntries: expiredCount,
      activeEntries: totalSize - expiredCount,
      hitRate: Math.round(hitRate * 100) / 100,
      totalGets: this.stats.totalGets,
      totalHits: this.stats.totalHits,
    };
  }

  /**
   * Obtém TTL de uma chave em segundos
   */
  async getTTL(key: string): Promise<number> {
    const item = this.cache.get(key);
    
    if (!item) {
      return -2; // Chave não existe
    }

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return -2; // Chave expirou
    }

    return Math.floor((item.expiresAt - now) / 1000); // Retorna em segundos
  }

  /**
   * Verifica se o cache está funcionando
   */
  isHealthy(): boolean {
    return true; // Cache em memória sempre está "saudável"
  }
}
