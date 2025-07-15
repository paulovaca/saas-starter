import { getSession } from './session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function auth() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then(rows => rows[0]);

    if (!user || !user.isActive) {
      return null;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    };
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

export type AuthSession = Awaited<ReturnType<typeof auth>>;
export type AuthUser = NonNullable<AuthSession>['user'];
