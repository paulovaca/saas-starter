'use server';

import { db } from '@/lib/db/drizzle';
import { activityLog, ActivityType } from '@/lib/db/schema';

type LogActivityData = {
  userId: string;
  agencyId: string;
  type: ActivityType;
  description?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
};

export async function logActivity(data: LogActivityData) {
  try {
    await db.insert(activityLog).values({
      type: data.type,
      description: data.description,
      userId: data.userId,
      agencyId: data.agencyId,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Não lançar erro para não quebrar a operação principal
  }
}
