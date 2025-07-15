'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and, asc } from 'drizzle-orm';

export async function getFunnelById(funnelId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Buscar o funil com suas etapas
    const funnel = await db
      .select({
        id: salesFunnels.id,
        name: salesFunnels.name,
        description: salesFunnels.description,
        isDefault: salesFunnels.isDefault,
        agencyId: salesFunnels.agencyId,
        createdBy: salesFunnels.createdBy,
        createdAt: salesFunnels.createdAt,
        updatedAt: salesFunnels.updatedAt,
      })
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.id, funnelId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .limit(1);

    if (funnel.length === 0) {
      return { success: false, error: 'Funil não encontrado' };
    }

    // Buscar as etapas do funil
    const stages = await db
      .select({
        id: salesFunnelStages.id,
        name: salesFunnelStages.name,
        description: salesFunnelStages.description,
        color: salesFunnelStages.color,
        order: salesFunnelStages.order,
        isActive: salesFunnelStages.isActive,
        funnelId: salesFunnelStages.funnelId,
        createdBy: salesFunnelStages.createdBy,
        createdAt: salesFunnelStages.createdAt,
        updatedAt: salesFunnelStages.updatedAt,
      })
      .from(salesFunnelStages)
      .where(eq(salesFunnelStages.funnelId, funnelId))
      .orderBy(asc(salesFunnelStages.order));

    return {
      success: true,
      data: {
        ...funnel[0],
        stages: stages,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar funil:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
