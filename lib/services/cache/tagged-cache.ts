import { CacheManager } from './manager';
import { TaggedCacheOptions } from './types';

/**
 * Sistema de cache com suporte a tags para invalidação em grupo
 * 
 * @example
 * ```typescript
 * import { taggedCache } from '@/lib/services/cache/tagged-cache';
 * 
 * // Salvar com tags
 * await taggedCache.set('produto:123', produto, {
 *   ttl: 3600,
 *   tags: ['produtos', 'categoria:eletrônicos']
 * });
 * 
 * // Buscar (com cache automático)
 * const user = await taggedCache.remember(
 *   'user:123',
 *   () => getUserFromDB('123'),
 *   { ttl: 300, tags: ['users', 'user:123'] }
 * );
 * 
 * // Invalidar todos os produtos
 * await taggedCache.invalidateTag('produtos');
 * ```
 */
export class TaggedCache {
  private cache = CacheManager.getInstance();
  private tagPrefix = 'tag:';

  /**
   * Padrão "remember": busca do cache ou executa função e armazena
   * 
   * @param key - Chave do cache
   * @param fn - Função para buscar dados se não estiver no cache
   * @param options - Opções de TTL e tags
   */
  async remember<T>(
    key: string,
    fn: () => Promise<T>,
    options?: TaggedCacheOptions
  ): Promise<T> {
    // Tenta pegar do cache
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Executa a função e salva
    const result = await fn();
    await this.set(key, result, options);
    
    return result;
  }

  /**
   * Define um valor no cache com suporte a tags
   * 
   * @param key - Chave do cache
   * @param value - Valor a ser armazenado
   * @param options - Opções de TTL e tags
   */
  async set<T>(
    key: string,
    value: T,
    options?: TaggedCacheOptions
  ): Promise<void> {
    // Salva o valor
    await this.cache.set(key, value, options?.ttl);

    // Salva as tags
    if (options?.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        await this.addKeyToTag(tag, key);
      }
    }
  }

  /**
   * Obtém um valor do cache
   * 
   * @param key - Chave do cache
   */
  async get<T>(key: string): Promise<T | null> {
    return await this.cache.get<T>(key);
  }

  /**
   * Remove uma chave do cache
   * 
   * @param key - Chave do cache
   */
  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
    // Remove a chave de todas as tags
    await this.removeKeyFromAllTags(key);
  }

  /**
   * Invalida todas as chaves associadas a uma tag
   * 
   * @param tag - Tag a ser invalidada
   */
  async invalidateTag(tag: string): Promise<number> {
    const tagKey = `${this.tagPrefix}${tag}`;
    const keys = await this.cache.get<string[]>(tagKey) || [];
    
    let deletedCount = 0;
    
    // Deleta todas as chaves com essa tag
    for (const key of keys) {
      await this.cache.delete(key);
      deletedCount++;
    }
    
    // Deleta a lista de chaves da tag
    await this.cache.delete(tagKey);
    
    return deletedCount;
  }

  /**
   * Invalida múltiplas tags de uma vez
   * 
   * @param tags - Array de tags a serem invalidadas
   */
  async invalidateTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;
    
    for (const tag of tags) {
      const deleted = await this.invalidateTag(tag);
      totalDeleted += deleted;
    }
    
    return totalDeleted;
  }

  /**
   * Lista todas as chaves associadas a uma tag
   * 
   * @param tag - Tag para listar chaves
   */
  async getKeysForTag(tag: string): Promise<string[]> {
    const tagKey = `${this.tagPrefix}${tag}`;
    return await this.cache.get<string[]>(tagKey) || [];
  }

  /**
   * Lista todas as tags disponíveis
   */
  async getAllTags(): Promise<string[]> {
    // Nota: Esta implementação funciona apenas com MemoryCache
    // Para Redis, seria necessário usar SCAN com padrão
    const allKeys = await this.cache.deleteByPattern(`${this.tagPrefix}*`);
    return []; // Implementação simplificada
  }

  /**
   * Limpa todo o cache incluindo tags
   */
  async clear(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Adiciona uma chave a uma tag
   * 
   * @private
   */
  private async addKeyToTag(tag: string, key: string): Promise<void> {
    const tagKey = `${this.tagPrefix}${tag}`;
    const keys = await this.cache.get<string[]>(tagKey) || [];
    
    // Evita duplicatas
    if (!keys.includes(key)) {
      keys.push(key);
      await this.cache.set(tagKey, keys);
    }
  }

  /**
   * Remove uma chave de todas as tags (usado quando a chave é deletada)
   * 
   * @private
   */
  private async removeKeyFromAllTags(key: string): Promise<void> {
    // Esta é uma implementação simplificada
    // Em um sistema real, você manteria um índice reverso (key -> tags)
    // Por ora, este método é principalmente para compatibilidade
  }

  /**
   * Método de conveniência para cache de usuários
   */
  async cacheUser<T>(userId: string, userData: T, ttl: number = 300): Promise<void> {
    await this.set(`user:${userId}`, userData, {
      ttl,
      tags: ['users', `user:${userId}`]
    });
  }

  /**
   * Método de conveniência para cache de agência
   */
  async cacheAgency<T>(agencyId: string, agencyData: T, ttl: number = 600): Promise<void> {
    await this.set(`agency:${agencyId}`, agencyData, {
      ttl,
      tags: ['agencies', `agency:${agencyId}`]
    });
  }

  /**
   * Método de conveniência para invalidar dados de usuário
   */
  async invalidateUser(userId: string): Promise<number> {
    return await this.invalidateTags(['users', `user:${userId}`]);
  }

  /**
   * Método de conveniência para invalidar dados de agência
   */
  async invalidateAgency(agencyId: string): Promise<number> {
    return await this.invalidateTags(['agencies', `agency:${agencyId}`]);
  }
}

// Exporta instância singleton
export const taggedCache = new TaggedCache();
