/**
 * Interface base para provedores de cache
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Opções para operações de cache
 */
export interface CacheOptions {
  /** Tempo de vida em segundos */
  ttl?: number;
  /** Tags para invalidação em grupo */
  tags?: string[];
  /** Prefixo para a chave */
  prefix?: string;
}

/**
 * Configuração de cache com tags
 */
export interface TaggedCacheOptions {
  /** Tempo de vida em segundos */
  ttl?: number;
  /** Tags para invalidação em grupo */
  tags?: string[];
}

/**
 * Resultado de operação de cache
 */
export interface CacheResult<T> {
  /** Indica se o valor foi encontrado no cache */
  hit: boolean;
  /** O valor do cache (null se não encontrado) */
  data: T | null;
  /** Tempo restante em segundos (se aplicável) */
  ttl?: number;
}

/**
 * Estatísticas do cache
 */
export interface CacheStats {
  /** Total de entradas no cache */
  totalEntries: number;
  /** Entradas expiradas */
  expiredEntries: number;
  /** Entradas ativas */
  activeEntries: number;
  /** Taxa de acerto (hit rate) */
  hitRate?: number;
  /** Total de operações get */
  totalGets?: number;
  /** Total de hits */
  totalHits?: number;
}
