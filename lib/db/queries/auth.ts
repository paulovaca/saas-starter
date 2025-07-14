import { eq, and, gt, lt, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { 
  users, 
  passwordResetTokens, 
  emailVerificationTokens, 
  userInvitations, 
  userSessions,
  type User,
  type NewUser,
  type NewPasswordResetToken,
  type NewEmailVerificationToken,
  type NewUserInvitation,
  type NewUserSession
} from '../schema/auth';
import { agencies } from '../schema/agency';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

/**
 * Get user by email with agency information
 */
export async function getUserByEmail(email: string) {
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
}

/**
 * Get user by ID with agency information
 */
export async function getUserById(id: string) {
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
}

/**
 * Create a new user
 */
export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

/**
 * Update user information
 */
export async function updateUser(id: string, updates: Partial<NewUser>) {
  const result = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Deactivate user account
 */
export async function deactivateUser(id: string) {
  const result = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Delete user account
 */
export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id));
}

/**
 * Get all users for an agency
 */
export async function getUsersByAgency(agencyId: string) {
  return await db
    .select()
    .from(users)
    .where(and(eq(users.agencyId, agencyId), eq(users.isActive, true)))
    .orderBy(users.name);
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

// User Session functions

/**
 * Create user session
 */
export async function createUserSession(sessionData: NewUserSession) {
  const result = await db.insert(userSessions).values(sessionData).returning();
  return result[0];
}

/**
 * Get valid user session
 */
export async function getValidUserSession(sessionToken: string) {
  const result = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.sessionToken, sessionToken),
        gt(userSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Update session last active time
 */
export async function updateSessionLastActive(sessionToken: string) {
  await db
    .update(userSessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(userSessions.sessionToken, sessionToken));
}

/**
 * Delete user session
 */
export async function deleteUserSession(sessionToken: string) {
  await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
}

/**
 * Delete all sessions for user
 */
export async function deleteAllUserSessions(userId: string) {
  await db.delete(userSessions).where(eq(userSessions.userId, userId));
}

/**
 * Clean expired sessions
 */
export async function cleanExpiredSessions() {
  await db.delete(userSessions).where(lt(userSessions.expiresAt, new Date()));
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
