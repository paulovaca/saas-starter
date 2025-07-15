'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and, like, desc, asc, count } from 'drizzle-orm';
import { funnelFiltersSchema, type FunnelFiltersInput } from '@/lib/validations/funnels';

export async function getFunnels(input?: FunnelFiltersInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    const { search, isDefault, page, limit } = funnelFiltersSchema.parse(input || {});

    // Construir condições de filtro
    const conditions = [eq(salesFunnels.agencyId, session.user.agencyId)];

    if (search) {
      conditions.push(like(salesFunnels.name, `%${search}%`));
    }

    if (isDefault !== undefined) {
      conditions.push(eq(salesFunnels.isDefault, isDefault));
    }

    // Buscar funis com contagem de etapas
    const funnels = await db
      .select({
        id: salesFunnels.id,
        name: salesFunnels.name,
        description: salesFunnels.description,
        isDefault: salesFunnels.isDefault,
        createdAt: salesFunnels.createdAt,
        updatedAt: salesFunnels.updatedAt,
        stagesCount: count(salesFunnelStages.id),
      })
      .from(salesFunnels)
      .leftJoin(salesFunnelStages, eq(salesFunnels.id, salesFunnelStages.funnelId))
      .where(and(...conditions))
      .groupBy(salesFunnels.id, salesFunnels.name, salesFunnels.description, 
               salesFunnels.isDefault, salesFunnels.createdAt, salesFunnels.updatedAt)
      .orderBy(desc(salesFunnels.isDefault), asc(salesFunnels.name))
      .limit(limit)
      .offset((page - 1) * limit);

    // Buscar total de registros para paginação
    const totalRecords = await db
      .select({ count: count() })
      .from(salesFunnels)
      .where(and(...conditions))
      .then(result => result[0]?.count || 0);

    return {
      success: true,
      data: {
        funnels,
        pagination: {
          page,
          limit,
          total: totalRecords,
          pages: Math.ceil(totalRecords / limit),
        },
      },
    };
  } catch (error) {
    console.error('Erro ao buscar funis:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getFunnelById(funnelId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Buscar funil com suas etapas
    const funnel = await db
      .select()
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.id, funnelId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!funnel) {
      return { success: false, error: 'Funil não encontrado' };
    }

    // Buscar etapas do funil
    const stages = await db
      .select()
      .from(salesFunnelStages)
      .where(eq(salesFunnelStages.funnelId, funnelId))
      .orderBy(asc(salesFunnelStages.order));

    return {
      success: true,
      data: {
        ...funnel,
        stages,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar funil:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getFunnelOptions() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    const funnels = await db
      .select({
        id: salesFunnels.id,
        name: salesFunnels.name,
        isDefault: salesFunnels.isDefault,
      })
      .from(salesFunnels)
      .where(eq(salesFunnels.agencyId, session.user.agencyId))
      .orderBy(desc(salesFunnels.isDefault), asc(salesFunnels.name));

    return { success: true, data: funnels };
  } catch (error) {
    console.error('Erro ao buscar opções de funis:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
