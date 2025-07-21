import { db } from '@/lib/db/drizzle';
import { activeSessions, type NewActiveSession } from '@/lib/db/schema/auth';
import { eq, lt, ne, and, gt } from 'drizzle-orm';

export class SessionManager {
  static async createSession(userId: string, sessionToken: string, request: Request) {
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || '';

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

    const sessionData: NewActiveSession = {
      userId,
      sessionToken,
      userAgent,
      ipAddress,
      expiresAt,
      deviceInfo: {
        userAgent,
        timestamp: new Date().toISOString()
      }
    };

    const result = await db.insert(activeSessions).values(sessionData).returning();
    return result[0];
  }

  static async updateLastAccessed(sessionToken: string) {
    await db.update(activeSessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(activeSessions.sessionToken, sessionToken));
  }

  static async getUserSessions(userId: string) {
    return await db.select()
      .from(activeSessions)
      .where(eq(activeSessions.userId, userId))
      .orderBy(activeSessions.lastAccessedAt);
  }

  static async revokeSession(sessionId: string, userId: string) {
    await db.delete(activeSessions)
      .where(and(
        eq(activeSessions.id, sessionId),
        eq(activeSessions.userId, userId)
      ));
  }

  static async revokeSessionByToken(sessionToken: string) {
    await db.delete(activeSessions)
      .where(eq(activeSessions.sessionToken, sessionToken));
  }

  static async revokeAllUserSessions(userId: string, exceptToken?: string) {
    const conditions = [eq(activeSessions.userId, userId)];
    
    if (exceptToken) {
      conditions.push(ne(activeSessions.sessionToken, exceptToken));
    }

    await db.delete(activeSessions).where(and(...conditions));
  }

  static async cleanupExpiredSessions() {
    await db.delete(activeSessions)
      .where(lt(activeSessions.expiresAt, new Date()));
  }

  static async getActiveSession(sessionToken: string) {
    const result = await db.select()
      .from(activeSessions)
      .where(and(
        eq(activeSessions.sessionToken, sessionToken),
        gt(activeSessions.expiresAt, new Date())
      ))
      .limit(1);

    return result[0] || null;
  }

  static async isSessionValid(sessionToken: string): Promise<boolean> {
    const session = await this.getActiveSession(sessionToken);
    return session !== null;
  }
}