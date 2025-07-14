import { desc, and, eq } from 'drizzle-orm';
import { db } from './drizzle';
import { agencies, users, ActivityType } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// Type for activity log (placeholder until table is implemented)
type ActivityLog = {
  id: string;
  action: ActivityType;
  timestamp: string;
  ipAddress?: string;
};

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionData.user.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getAgencyByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(agencies)
    .where(eq(agencies.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateAgencySubscription(
  agencyId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(agencies)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(agencies.id, agencyId));
}

export async function getUserWithAgency(userId: string) {
  const result = await db
    .select({
      user: users,
      agency: agencies
    })
    .from(users)
    .leftJoin(agencies, eq(users.agencyId, agencies.id))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getAgencyForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db
    .select()
    .from(agencies)
    .where(eq(agencies.id, user.agencyId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Placeholder function for activity logging
export async function logActivity(agencyId: string, userId: string, type: string) {
  // TODO: Implement activity logging when activity logs table is added
  console.log(`Activity logged: ${type} for user ${userId} in agency ${agencyId}`);
}

// Placeholder function for getting activity logs
export async function getActivityLogs(): Promise<ActivityLog[]> {
  // TODO: Implement this when activity logs table is added
  // For now, return empty array to prevent build errors
  return [];
}
