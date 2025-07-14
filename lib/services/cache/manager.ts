/**
 * Simple in-memory cache manager for application data
 */

interface CacheItem<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

type CacheKey = string;

class InMemoryCache {
  private cache = new Map<CacheKey, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: CacheKey, data: T, ttlMs?: number): void {
    const now = Date.now();
    const ttl = ttlMs || this.defaultTTL;
    
    this.cache.set(key, {
      data,
      expiresAt: now + ttl,
      createdAt: now,
    });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: CacheKey): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: CacheKey): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Delete expired entries
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
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      totalSize++;
      if (now > item.expiresAt) {
        expiredCount++;
      }
    }

    return {
      totalEntries: totalSize,
      expiredEntries: expiredCount,
      activeEntries: totalSize - expiredCount,
    };
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: CacheKey): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set pattern - execute function if not in cache
   */
  async getOrSet<T>(
    key: CacheKey,
    fetchFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttlMs);
    
    return data;
  }

  /**
   * Invalidate cache entries by prefix
   */
  invalidateByPrefix(prefix: string): number {
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

// Create singleton instance
const cacheManager = new InMemoryCache();

// Auto cleanup every 10 minutes
setInterval(() => {
  const deleted = cacheManager.cleanup();
  if (deleted > 0) {
    console.log(`Cache cleanup: removed ${deleted} expired entries`);
  }
}, 10 * 60 * 1000);

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

// TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  HOUR: 60 * 60 * 1000,      // 1 hour
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
};

// Export the cache manager
export default cacheManager;

// Helper functions for common cache operations
export const CacheUtils = {
  /**
   * Invalidate all user-related cache entries
   */
  invalidateUser(userId: string) {
    cacheManager.invalidateByPrefix(`user:${userId}`);
    cacheManager.invalidateByPrefix(`notifications:${userId}`);
  },

  /**
   * Invalidate all agency-related cache entries
   */
  invalidateAgency(agencyId: string) {
    cacheManager.invalidateByPrefix(`agency:${agencyId}`);
    cacheManager.invalidateByPrefix(`sales-funnels:${agencyId}`);
    cacheManager.invalidateByPrefix(`base-items:${agencyId}`);
    cacheManager.invalidateByPrefix(`operators:${agencyId}`);
    cacheManager.invalidateByPrefix(`clients:${agencyId}`);
    cacheManager.invalidateByPrefix(`users:agency:${agencyId}`);
    cacheManager.invalidateByPrefix(`activities:recent:${agencyId}`);
  },

  /**
   * Invalidate client-related cache entries
   */
  invalidateClients(agencyId: string) {
    cacheManager.invalidateByPrefix(`clients:${agencyId}`);
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return cacheManager.getStats();
  },

  /**
   * Force cleanup of expired entries
   */
  cleanup() {
    return cacheManager.cleanup();
  },
};
