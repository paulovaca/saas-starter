import { eq, and, gt, lt, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { 
  users, 
  passwordResetTokens, 
  emailVerificationTokens, 
  userInvitations, 
  activeSessions,
  type User,
  type NewUser,
  type NewPasswordResetToken,
  type NewEmailVerificationToken,
  type NewUserInvitation,
  type NewActiveSession
} from '../schema/auth';
import { agencies } from '../schema/agency';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { taggedCache } from '@/lib/services/cache/tagged-cache';
import { CacheKeys, CacheTTL } from '@/lib/services/cache/manager';

/**
 * Get user by email with agency information
 * Uses cache to improve performance
 */
export async function getUserByEmail(email: string) {
  return taggedCache.remember(
    CacheKeys.userByEmail(email),
    async () => {
      const result = await db
        .select({
          user: users,
          agency: agencies,
        })
        .from(users)
        .leftJoin(agencies, eq(users.agencyId, agencies.id))
        .where(eq(users.email, email))
        .limit(1);

      return result[0] || null;
    },
    {
      ttl: CacheTTL.MEDIUM,
      tags: ['users', 'user-by-email']
    }
  );
}

/**
 * Get user by ID with agency information
 * Uses cache to improve performance
 */
export async function getUserById(id: string) {
  return taggedCache.remember(
    CacheKeys.user(id),
    async () => {
      const result = await db
        .select({
          user: users,
          agency: agencies,
        })
        .from(users)
        .leftJoin(agencies, eq(users.agencyId, agencies.id))
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    },
    {
      ttl: CacheTTL.MEDIUM,
      tags: ['users', `user:${id}`]
    }
  );
}
/**
 * Create a new user
 * Invalidates user-related cache
 */
export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  
  // Invalida cache relacionado
  await taggedCache.invalidateTags(['users', 'user-by-email']);
  
  return result[0];
}

/**
 * Update user information
 * Invalidates user-related cache
 */
export async function updateUser(id: string, updates: Partial<NewUser>) {
  const result = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  // Invalida cache do usuário específico e relacionados
  await taggedCache.invalidateTags(['users', `user:${id}`, 'user-by-email']);

  return result[0] || null;
}

/**
 * Deactivate user account
 * Invalidates user-related cache
 */
export async function deactivateUser(id: string) {
  const result = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  // Invalida cache do usuário
  await taggedCache.invalidateTags(['users', `user:${id}`, 'user-by-email']);

  return result[0] || null;
}

/**
 * Delete user account
 * Invalidates user-related cache
 */
export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id));
  
  // Invalida cache do usuário
  await taggedCache.invalidateTags(['users', `user:${id}`, 'user-by-email']);
}

/**
 * Get all users for an agency
 * Uses cache to improve performance
 */
export async function getUsersByAgency(agencyId: string) {
  return taggedCache.remember(
    CacheKeys.usersByAgency(agencyId),
    async () => {
      return await db
        .select()
        .from(users)
        .where(eq(users.agencyId, agencyId))
        .orderBy(users.createdAt);
    },
    {
      ttl: CacheTTL.MEDIUM,
      tags: ['users', `agency:${agencyId}`]
    }
  );
}

// Password Reset Token functions

/**
 * Create password reset token
 */
export async function createPasswordResetToken(tokenData: NewPasswordResetToken) {
  const result = await db.insert(passwordResetTokens).values(tokenData).returning();
  return result[0];
}

/**
 * Get valid password reset token
 */
export async function getValidPasswordResetToken(token: string) {
  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Mark password reset token as used
 */
export async function markPasswordResetTokenAsUsed(token: string) {
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.token, token));
}

/**
 * Clean expired password reset tokens
 */
export async function cleanExpiredPasswordResetTokens() {
  await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));
}

// Email Verification Token functions

/**
 * Create email verification token
 */
export async function createEmailVerificationToken(tokenData: NewEmailVerificationToken) {
  const result = await db.insert(emailVerificationTokens).values(tokenData).returning();
  return result[0];
}

/**
 * Get valid email verification token
 */
export async function getValidEmailVerificationToken(token: string) {
  const result = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date()),
        isNull(emailVerificationTokens.usedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Mark email verification token as used
 */
export async function markEmailVerificationTokenAsUsed(token: string) {
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationTokens.token, token));
}

// User Invitation functions

/**
 * Create user invitation
 */
export async function createUserInvitation(invitationData: NewUserInvitation) {
  const result = await db.insert(userInvitations).values(invitationData).returning();
  return result[0];
}

/**
 * Get valid user invitation
 */
export async function getValidUserInvitation(token: string) {
  const result = await db
    .select()
    .from(userInvitations)
    .where(
      and(
        eq(userInvitations.token, token),
        gt(userInvitations.expiresAt, new Date()),
        isNull(userInvitations.acceptedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Mark invitation as accepted
 */
export async function markInvitationAsAccepted(token: string) {
  const result = await db
    .update(userInvitations)
    .set({ acceptedAt: new Date() })
    .where(eq(userInvitations.token, token))
    .returning();

  return result[0] || null;
}

/**
 * Get pending invitations for agency
 */
export async function getPendingInvitationsByAgency(agencyId: string) {
  return await db
    .select()
    .from(userInvitations)
    .where(
      and(
        eq(userInvitations.agencyId, agencyId),
        gt(userInvitations.expiresAt, new Date()),
        isNull(userInvitations.acceptedAt)
      )
    )
    .orderBy(userInvitations.createdAt);
}

// Active Session functions

/**
 * Create active session
 */
export async function createActiveSession(sessionData: NewActiveSession) {
  const result = await db.insert(activeSessions).values(sessionData).returning();
  return result[0];
}

/**
 * Get valid active session
 */
export async function getValidActiveSession(sessionToken: string) {
  const result = await db
    .select()
    .from(activeSessions)
    .where(
      and(
        eq(activeSessions.sessionToken, sessionToken),
        gt(activeSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Update session last accessed time
 */
export async function updateSessionLastAccessed(sessionToken: string) {
  await db
    .update(activeSessions)
    .set({ lastAccessedAt: new Date() })
    .where(eq(activeSessions.sessionToken, sessionToken));
}

/**
 * Delete active session
 */
export async function deleteActiveSession(sessionToken: string) {
  await db.delete(activeSessions).where(eq(activeSessions.sessionToken, sessionToken));
}

/**
 * Delete all sessions for user
 */
export async function deleteAllUserActiveSessions(userId: string) {
  await db.delete(activeSessions).where(eq(activeSessions.userId, userId));
}

/**
 * Clean expired sessions
 */
export async function cleanExpiredActiveSessions() {
  await db.delete(activeSessions).where(lt(activeSessions.expiresAt, new Date()));
}

/**
 * Get current user from session
 */
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
    .leftJoin(agencies, eq(users.agencyId, agencies.id))
    .where(eq(users.id, sessionData.user.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return {
    ...user[0].users,
    agency: user[0].agencies || null,
  };
}
