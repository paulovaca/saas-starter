import { Redis } from '@upstash/redis';
import { CacheProvider } from './types';

/**
 * Provider de cache usando Redis via Upstash
 * 
 * @example
 * ```typescript
 * const redisCache = new RedisCache();
 * await redisCache.set('user:123', userData, 300); // 5 minutos
 * const user = await redisCache.get<User>('user:123');
 * ```
 */
export class RedisCache implements CacheProvider {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis credentials not found. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    this.isConnected = true;
  }

  /**
   * Obtém um valor do cache Redis
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const data = await this.redis.get(key);
      
      if (data === null || data === undefined) {
        return null;
      }

      // Se for string, tenta fazer parse JSON
      if (typeof data === 'string') {
        try {
          return JSON.parse(data) as T;
        } catch {
          // Se não conseguir fazer parse, retorna como está
          return data as T;
        }
      }

      return data as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Define um valor no cache Redis
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isConnected) return;

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttl && ttl > 0) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  /**
   * Remove uma chave do cache Redis
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  /**
   * Limpa todo o cache Redis
   */
  async clear(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  /**
   * Verifica se uma chave existe no cache Redis
   */
  async has(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis has error:', error);
      return false;
    }
  }

  /**
   * Remove múltiplas chaves por padrão
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      // Busca chaves que correspondem ao padrão
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) return 0;

      // Remove as chaves em lote
      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Redis deleteByPattern error:', error);
      return 0;
    }
  }

  /**
   * Obtém TTL de uma chave
   */
  async getTTL(key: string): Promise<number> {
    if (!this.isConnected) return -1;

    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error('Redis getTTL error:', error);
      return -1;
    }
  }

  /**
   * Verifica se está conectado ao Redis
   */
  isHealthy(): boolean {
    return this.isConnected;
  }
}
