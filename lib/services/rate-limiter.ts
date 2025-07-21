// lib/services/rate-limiter.ts

interface RateLimiterConfig {
  keyPrefix: string;
  attempts: number;
  window: number; // in milliseconds
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private static store: Map<string, RateLimitEntry> = new Map();

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Check if the rate limit is exceeded
   * @param identifier - User ID, IP address, or other identifier
   * @returns true if allowed, false if rate limit exceeded
   */
  async check(identifier: string): Promise<boolean> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    
    const entry = RateLimiter.store.get(key);

    if (!entry) {
      // First request for this key
      RateLimiter.store.set(key, {
        count: 1,
        resetTime: now + this.config.window
      });
      return true;
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      RateLimiter.store.set(key, {
        count: 1,
        resetTime: now + this.config.window
      });
      return true;
    }

    // Check if limit is exceeded
    if (entry.count >= this.config.attempts) {
      return false;
    }

    // Increment counter
    entry.count++;
    RateLimiter.store.set(key, entry);
    return true;
  }

  /**
   * Get remaining attempts for an identifier
   */
  async getRemainingAttempts(identifier: string): Promise<{
    remaining: number;
    resetTime: number;
  }> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const entry = RateLimiter.store.get(key);

    if (!entry || now > entry.resetTime) {
      return {
        remaining: this.config.attempts,
        resetTime: now + this.config.window
      };
    }

    return {
      remaining: Math.max(0, this.config.attempts - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    RateLimiter.store.delete(key);
  }

  /**
   * Clean up expired entries (should be called periodically)
   */
  static cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    RateLimiter.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      RateLimiter.store.delete(key);
    });
  }

  /**
   * Start automatic cleanup timer
   */
  static startCleanupTimer(intervalMs: number = 60000): void {
    setInterval(() => {
      RateLimiter.cleanup();
    }, intervalMs);
  }
}

// Predefined rate limiters for common scenarios
export const CommonRateLimiters = {
  createUser: new RateLimiter({
    keyPrefix: 'create-user',
    attempts: 5,
    window: 60000 // 1 minute
  }),

  createClient: new RateLimiter({
    keyPrefix: 'create-client',
    attempts: 10,
    window: 60000 // 1 minute
  }),

  updateUser: new RateLimiter({
    keyPrefix: 'update-user',
    attempts: 20,
    window: 60000 // 1 minute
  }),

  deleteAction: new RateLimiter({
    keyPrefix: 'delete-action',
    attempts: 5,
    window: 60000 // 1 minute
  }),

  apiRequest: new RateLimiter({
    keyPrefix: 'api-request',
    attempts: 100,
    window: 60000 // 1 minute
  }),

  login: new RateLimiter({
    keyPrefix: 'login-attempt',
    attempts: 5,
    window: 300000 // 5 minutes
  }),

  passwordReset: new RateLimiter({
    keyPrefix: 'password-reset',
    attempts: 3,
    window: 3600000 // 1 hour
  }),
};

// Start cleanup timer when the module is loaded
RateLimiter.startCleanupTimer();

// Create and export a default rate limiter instance for backward compatibility
export const rateLimiter = {
  check: async (identifier: string, keyPrefix: string = 'default') => {
    const limiter = new RateLimiter({
      keyPrefix,
      attempts: 10,
      window: 60000
    });
    return limiter.check(identifier);
  }
};