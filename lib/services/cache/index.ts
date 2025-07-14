/**
 * Sistema de Cache Inteligente
 * 
 * Exporta todas as funcionalidades do sistema de cache:
 * - CacheManager: Cache manager principal
 * - TaggedCache: Cache com suporte a tags
 * - Types: Interfaces e tipos
 * - Utilities: Funções utilitárias
 */

// Core classes
export { CacheManager } from './manager';
export { TaggedCache, taggedCache } from './tagged-cache';
export { RedisCache } from './redis-cache';
export { MemoryCache } from './memory-cache';

// Types
export type {
  CacheProvider,
  CacheOptions,
  TaggedCacheOptions,
  CacheResult,
  CacheStats
} from './types';

// Utilities and constants
export { CacheKeys, CacheTTL, CacheUtils } from './manager';

// Default exports for convenience
import { CacheManager } from './manager';

// Instance para uso direto
export const cache = CacheManager.getInstance();

// Default export do cache manager
export default CacheManager.getInstance();
