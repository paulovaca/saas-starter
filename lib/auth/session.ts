import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser, users } from '@/lib/db/schema';
import { SessionManager } from './session-manager';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: string };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  
  const sessionData = await verifyToken(session);
  return sessionData;
}

export async function setSession(user: NewUser, request?: Request) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  
  // Store session in the database for tracking
  // If no request is provided (server actions), create a minimal request-like object
  if (request) {
    try {
      await SessionManager.createSession(user.id!, encryptedSession, request);
    } catch (error) {
      console.error('Failed to create database session:', error);
      // Continue with cookie-only session if database fails
    }
  } else {
    // For server actions without request context, we'll create the DB session later in middleware
    console.log('Session created without database tracking - will be handled by middleware');
  }
  
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function clearSession() {
  const session = (await cookies()).get('session')?.value;
  
  if (session) {
    // Remove from database
    await SessionManager.revokeSessionByToken(session);
  }
  
  // Clear the cookie
  (await cookies()).delete('session');
}

export async function getCurrentUser() {
  try {
    const sessionData = await getSession();
    if (!sessionData) return null;

    // Get full user data from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionData.user.id),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        agencyId: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Update last accessed time in database
    const session = (await cookies()).get('session')?.value;
    if (session) {
      await SessionManager.updateLastAccessed(session);
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
