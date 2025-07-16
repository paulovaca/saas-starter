import cacheManager, { CacheKeys, CacheTTL, CacheUtils } from '@/lib/services/cache/manager';
import * as authQueries from './queries/auth';
import * as agencyQueries from './queries/agency';
import * as activityQueries from './queries/activity';
import { ActivityLogger } from '@/lib/services/activity-logger';

/**
 * Cached version of auth queries
 */
export const cachedAuthQueries = {
  /**
   * Get user by email with caching
   */
  async getUserByEmail(email: string) {
    const cacheKey = CacheKeys.userByEmail(email);
    
    return await cacheManager.remember(
      cacheKey,
      () => authQueries.getUserByEmail(email),
      CacheTTL.MEDIUM
    );
  },

  /**
   * Get user by ID with caching
   */
  async getUserById(id: string) {
    const cacheKey = CacheKeys.user(id);
    
    return await cacheManager.remember(
      cacheKey,
      () => authQueries.getUserById(id),
      CacheTTL.MEDIUM
    );
  },

  /**
   * Get users by agency with caching
   */
  async getUsersByAgency(agencyId: string) {
    const cacheKey = CacheKeys.usersByAgency(agencyId);
    
    return await cacheManager.remember(
      cacheKey,
      () => authQueries.getUsersByAgency(agencyId),
      CacheTTL.MEDIUM
    );
  },

  /**
   * Create user and invalidate cache
   */
  async createUser(userData: any) {
    const user = await authQueries.createUser(userData);
    
    // Invalidate relevant caches
    CacheUtils.invalidateAgency(userData.agencyId);
    CacheUtils.invalidateUser(user.id);
    
    return user;
  },

  /**
   * Update user and invalidate cache
   */
  async updateUser(id: string, updates: any) {
    const user = await authQueries.updateUser(id, updates);
    
    if (user) {
      // Invalidate user cache
      CacheUtils.invalidateUser(id);
      CacheUtils.invalidateAgency(user.agencyId);
    }
    
    return user;
  },
};

/**
 * Cached version of agency queries
 */
export const cachedAgencyQueries = {
  /**
   * Get agency by ID with caching
   */
  async getAgencyById(id: string) {
    const cacheKey = CacheKeys.agency(id);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.getAgencyById(id),
      CacheTTL.LONG
    );
  },

  /**
   * Get agency settings with caching
   */
  async getAgencySettings(agencyId: string) {
    const cacheKey = CacheKeys.agencySettings(agencyId);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.getAgencySettings(agencyId),
      CacheTTL.LONG
    );
  },

  /**
   * Get sales funnels with caching
   */
  async getSalesFunnelsByAgency(agencyId: string) {
    const cacheKey = CacheKeys.salesFunnels(agencyId);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.getSalesFunnelsByAgency(agencyId),
      CacheTTL.MEDIUM
    );
  },

  /**
   * Get funnel stages with caching
   */
  async getSalesFunnelStages(funnelId: string) {
    const cacheKey = CacheKeys.funnelStages(funnelId);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.getSalesFunnelStages(funnelId),
      CacheTTL.MEDIUM
    );
  },

  /**
   * Get operators with caching
   */
  async getOperatorsByAgency(agencyId: string) {
    const cacheKey = CacheKeys.operators(agencyId);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.getOperatorsByAgency(agencyId),
      CacheTTL.MEDIUM
    );
  },

  /**
   * Get clients with caching (paginated)
   */
  async getClientsByAgency(agencyId: string, limit = 50, offset = 0) {
    const page = Math.floor(offset / limit) + 1;
    const cacheKey = CacheKeys.clients(agencyId, page);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.getClientsByAgency(agencyId, limit, offset),
      CacheTTL.SHORT // Shorter TTL for frequently changing data
    );
  },

  /**
   * Search clients with caching
   */
  async searchClients(agencyId: string, searchTerm: string) {
    const cacheKey = CacheKeys.clientSearch(agencyId, searchTerm);
    
    return await cacheManager.remember(
      cacheKey,
      () => agencyQueries.searchClients(agencyId, searchTerm),
      CacheTTL.SHORT
    );
  },

  /**
   * Create agency and invalidate cache
   */
  async createAgency(agencyData: any) {
    const agency = await agencyQueries.createAgency(agencyData);
    
    // No need to invalidate cache for new agency
    return agency;
  },

  /**
   * Update agency and invalidate cache
   */
  async updateAgency(id: string, updates: any) {
    const agency = await agencyQueries.updateAgency(id, updates);
    
    if (agency) {
      CacheUtils.invalidateAgency(id);
    }
    
    return agency;
  },

  /**
   * Create client and invalidate cache
   */
  async createClient(clientData: any) {
    const client = await agencyQueries.createClient(clientData);
    
    // Invalidate clients cache
    CacheUtils.invalidateClients(clientData.agencyId);
    
    // Log activity
    await ActivityLogger.logClientActivity(
      clientData.agencyId,
      clientData.createdById,
      client.id,
      'CREATE_CLIENT'
    );
    
    return client;
  },

  /**
   * Update client and invalidate cache
   */
  async updateClient(id: string, updates: any, userId: string) {
    const client = await agencyQueries.updateClient(id, updates);
    
    if (client) {
      // Invalidate clients cache
      CacheUtils.invalidateClients(client.agencyId);
      
      // Log activity
      await ActivityLogger.logClientActivity(
        client.agencyId,
        userId,
        client.id,
        'UPDATE_CLIENT'
      );
    }
    
    return client;
  },

  /**
   * Delete client and invalidate cache
   */
  async deleteClient(id: string, agencyId: string, userId: string) {
    await agencyQueries.deleteClient(id);
    
    // Invalidate clients cache
    CacheUtils.invalidateClients(agencyId);
    
    // Log activity
    await ActivityLogger.logClientActivity(
      agencyId,
      userId,
      id,
      'DELETE_CLIENT'
    );
  },
};

/**
 * Cached version of activity queries
 */
export const cachedActivityQueries = {
  /**
   * Get recent activities with caching
   */
  async getRecentActivities(agencyId: string, limit = 10) {
    const cacheKey = CacheKeys.recentActivities(agencyId);
    
    return await cacheManager.remember(
      cacheKey,
      () => activityQueries.getRecentActivities(agencyId, limit),
      CacheTTL.SHORT // Very short TTL for recent activities
    );
  },

  /**
   * Get notifications with caching
   */
  async getNotificationsByUser(userId: string, agencyId?: string, unreadOnly = false, limit = 20) {
    const cacheKey = CacheKeys.notifications(userId);
    
    return await cacheManager.remember(
      cacheKey,
      () => activityQueries.getNotificationsByUser(userId, agencyId, unreadOnly, limit),
      CacheTTL.SHORT
    );
  },

  /**
   * Create activity log (no caching, but invalidate relevant caches)
   */
  async logActivity(
    agencyId: string,
    userId: string | null,
    type: any,
    description?: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) {
    const result = await activityQueries.logActivity(
      agencyId,
      userId,
      type,
      description,
      entityType,
      entityId,
      metadata
    );
    
    // Invalidate recent activities cache
    cacheManager.delete(CacheKeys.recentActivities(agencyId));
    
    return result;
  },
};

// Export cache utilities for manual cache management
export { CacheUtils };

// Export common cache operations
export const CacheOperations = {
  /**
   * Warm up common caches for a user session
   */
  async warmUpUserCaches(userId: string, agencyId: string) {
    // Pre-load common data
    await Promise.all([
      cachedAuthQueries.getUserById(userId),
      cachedAgencyQueries.getAgencyById(agencyId),
      cachedAgencyQueries.getAgencySettings(agencyId),
      cachedAgencyQueries.getSalesFunnelsByAgency(agencyId),
      cachedActivityQueries.getRecentActivities(agencyId),
    ]);
  },

  /**
   * Clear all caches for an agency (useful during maintenance)
   */
  clearAgencyCaches(agencyId: string) {
    CacheUtils.invalidateAgency(agencyId);
  },

  /**
   * Get overall cache health
   */
  getCacheHealth() {
    const stats = CacheUtils.getStats();
    
    if (!stats) {
      return {
        health: 'unknown',
        expiredRatio: 0,
        totalEntries: 0,
        hitRate: 0,
        memoryUsage: 0,
      };
    }
    
    const expiredRatio = stats.expiredEntries / stats.totalEntries;
    
    return {
      ...stats,
      health: expiredRatio < 0.1 ? 'good' : expiredRatio < 0.3 ? 'fair' : 'poor',
      expiredRatio,
    };
  },
};
