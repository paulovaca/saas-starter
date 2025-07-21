// lib/services/activity-logger.ts
import { db } from '@/lib/db/drizzle';
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Create activity logs table schema (this would normally be in schema files)
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  agencyId: uuid('agency_id').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export interface ActivityLogInput {
  userId: string;
  agencyId: string;
  type: string;
  description: string;
  metadata?: Record<string, any>;
}

export class ActivityLogger {
  /**
   * Log an activity with structured data
   */
  static async log(input: ActivityLogInput): Promise<void> {
    try {
      await db.insert(activityLogs).values({
        userId: input.userId,
        agencyId: input.agencyId,
        type: input.type,
        description: input.description,
        metadata: input.metadata || null,
      });
    } catch (error) {
      // Log to console but don't throw - activity logging shouldn't break the main flow
      console.error('Failed to log activity:', error, input);
    }
  }

  /**
   * Get activity logs for a user
   */
  static async getUserActivity(
    userId: string,
    agencyId: string,
    limit: number = 50
  ): Promise<ActivityLogEntry[]> {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.userId, userId),
          eq(activityLogs.agencyId, agencyId)
        )
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return logs;
  }

  /**
   * Get activity logs for an agency
   */
  static async getAgencyActivity(
    agencyId: string,
    limit: number = 100
  ): Promise<ActivityLogEntry[]> {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.agencyId, agencyId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return logs;
  }

  /**
   * Clean up old activity logs (older than specified days)
   */
  static async cleanup(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db
      .delete(activityLogs)
      .where(lt(activityLogs.createdAt, cutoffDate));

    return result.length;
  }

  /**
   * Log authentication activity (legacy method for compatibility)
   */
  static async logAuth(
    agencyId: string,
    userId: string,
    type: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return ActivityLogger.log({
      userId,
      agencyId,
      type,
      description: `Authentication activity: ${type}`,
      metadata
    });
  }

  /**
   * Log user activity (legacy method for compatibility)
   */
  static async logUserActivity(
    agencyId: string,
    userId: string,
    type: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return ActivityLogger.log({
      userId,
      agencyId,
      type,
      description: `User activity: ${type}`,
      metadata
    });
  }

  /**
   * Log agency activity (legacy method for compatibility)
   */
  static async logAgencyActivity(
    agencyId: string,
    userId: string,
    type: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return ActivityLogger.log({
      userId,
      agencyId,
      type,
      description: `Agency activity: ${type}`,
      metadata
    });
  }

  /**
   * Log client activity (legacy method for compatibility)
   */
  static async logClientActivity(
    agencyId: string,
    userId: string,
    clientId: string,
    type: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return ActivityLogger.log({
      userId,
      agencyId,
      type,
      description: `Client activity: ${type}`,
      metadata: {
        clientId,
        ...metadata
      }
    });
  }
}

export type ActivityLogEntry = typeof activityLogs.$inferSelect;

// Import dependencies for the queries
import { eq, and, desc, lt } from 'drizzle-orm';