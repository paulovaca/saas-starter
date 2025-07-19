import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { users, agencies, baseItems, operators } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Cache para usuários (5 minutos)
export const getCachedUser = unstable_cache(
  async (userId: string) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return user;
  },
  ['user'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user'],
  }
);

// Cache para agências (10 minutos)
export const getCachedAgency = unstable_cache(
  async (agencyId: string) => {
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);
    
    return agency;
  },
  ['agency'],
  {
    revalidate: 600, // 10 minutos
    tags: ['agency'],
  }
);

// Cache para contagem de usuários por agência (5 minutos)
export const getCachedUserCount = unstable_cache(
  async (agencyId: string) => {
    const count = await db
      .select({ count: users.id })
      .from(users)
      .where(and(
        eq(users.agencyId, agencyId),
        eq(users.isActive, true)
      ));
    
    return count.length;
  },
  ['user-count'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-count'],
  }
);

// Cache para contagem de itens base por agência (10 minutos)
export const getCachedBaseItemCount = unstable_cache(
  async (agencyId: string) => {
    const count = await db
      .select({ count: baseItems.id })
      .from(baseItems)
      .where(and(
        eq(baseItems.agencyId, agencyId),
        eq(baseItems.isActive, true)
      ));
    
    return count.length;
  },
  ['base-item-count'],
  {
    revalidate: 600, // 10 minutos
    tags: ['base-item-count'],
  }
);

// Cache para contagem de operadoras por agência (10 minutos)
export const getCachedOperatorCount = unstable_cache(
  async (agencyId: string) => {
    const count = await db
      .select({ count: operators.id })
      .from(operators)
      .where(and(
        eq(operators.agencyId, agencyId),
        eq(operators.isActive, true)
      ));
    
    return count.length;
  },
  ['operator-count'],
  {
    revalidate: 600, // 10 minutos
    tags: ['operator-count'],
  }
);

// Funções para invalidar cache
export async function invalidateUserCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('user');
  revalidateTag('user-count');
}

export async function invalidateAgencyCache(agencyId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('agency');
}

export async function invalidateBaseItemCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('base-item-count');
}

export async function invalidateOperatorCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('operator-count');
}
