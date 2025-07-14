import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { db } from '../drizzle';
import { 
  activityLog,
  systemNotifications,
  ActivityType,
  type ActivityLogEntry,
  type NewActivityLogEntry,
  type SystemNotification,
  type NewSystemNotification
} from '../schema/activity';
import { users } from '../schema/auth';
import { getUser } from './auth';

// Activity Log functions

/**
 * Log an activity
 */
export async function logActivity(
  agencyId: string,
  userId: string | null,
  type: ActivityType,
  description?: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  const activityData: NewActivityLogEntry = {
    type,
    description: description || null,
    userId,
    agencyId,
    entityType: entityType || null,
    entityId: entityId || null,
    metadata: metadata || null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  };

  const result = await db.insert(activityLog).values(activityData).returning();
  return result[0];
}

/**
 * Get activities for an agency
 */
export async function getActivitiesByAgency(
  agencyId: string,
  limit = 50,
  offset = 0,
  activityType?: ActivityType,
  userId?: string,
  startDate?: Date,
  endDate?: Date
) {
  let whereConditions = [eq(activityLog.agencyId, agencyId)];

  if (activityType) {
    whereConditions.push(eq(activityLog.type, activityType));
  }

  if (userId) {
    whereConditions.push(eq(activityLog.userId, userId));
  }

  if (startDate) {
    whereConditions.push(gte(activityLog.createdAt, startDate));
  }

  if (endDate) {
    whereConditions.push(lte(activityLog.createdAt, endDate));
  }

  return await db
    .select({
      activity: activityLog,
      user: users,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get recent activities for dashboard
 */
export async function getRecentActivities(agencyId: string, limit = 10) {
  return await db
    .select({
      activity: activityLog,
      user: users,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .where(eq(activityLog.agencyId, agencyId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

/**
 * Create a system notification
 */
export async function createSystemNotification(notificationData: NewSystemNotification) {
  const result = await db.insert(systemNotifications).values(notificationData).returning();
  return result[0];
}

/**
 * Get notifications for a user
 */
export async function getNotificationsByUser(
  userId: string,
  agencyId?: string,
  unreadOnly = false,
  limit = 20
) {
  let whereConditions = [eq(systemNotifications.userId, userId)];

  if (agencyId) {
    whereConditions.push(eq(systemNotifications.agencyId, agencyId));
  }

  if (unreadOnly) {
    whereConditions.push(eq(systemNotifications.isRead, false));
  }

  return await db
    .select()
    .from(systemNotifications)
    .where(and(...whereConditions))
    .orderBy(desc(systemNotifications.createdAt))
    .limit(limit);
}

/**
 * Get activity logs for current user's agency (wrapper function)
 */
export async function getActivityLogs() {
  // Get current user and their agency
  const user = await getUser();
  if (!user || !user.agencyId) {
    return [];
  }

  // Get activity logs for the user's agency
  return await getActivityLogsForAgency(user.agencyId);
}

/**
 * Get activity logs for a specific agency with pagination  
 */
export async function getActivityLogsForAgency(
  agencyId: string,
  page: number = 1,
  limit: number = 10
) {
  const offset = (page - 1) * limit;
  
  const result = await db
    .select({
      id: activityLog.id,
      type: activityLog.type,
      description: activityLog.description,
      userId: activityLog.userId,
      entityType: activityLog.entityType,
      entityId: activityLog.entityId,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      // User info if available
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .where(eq(activityLog.agencyId, agencyId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Get total count of activity logs for an agency
 */
export async function getActivityLogsCount(agencyId: string) {
  const result = await db
    .select({ count: count() })
    .from(activityLog)
    .where(eq(activityLog.agencyId, agencyId));

  return result[0]?.count || 0;
}
