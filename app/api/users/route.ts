import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active users from the same agency
    const agencyUsers = await db.query.users.findMany({
      where: and(
        eq(users.agencyId, currentUser.agencyId),
        eq(users.isActive, true)
      ),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: (users, { asc }) => [asc(users.name)],
    });

    return Response.json(agencyUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}