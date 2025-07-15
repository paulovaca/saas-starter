'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnelStages, salesFunnels } from '@/lib/db/schema/funnels';
import { eq, and, asc } from 'drizzle-orm';

export async function getStages(funnelId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar se o funil pertence à agência do usuário
    const funnel = await db
      .select({ id: salesFunnels.id })
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
      data: stages,
    };
  } catch (error) {
    console.error('Erro ao buscar etapas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function getStageById(stageId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Buscar a etapa com verificação de agência
    const stage = await db
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
      .innerJoin(salesFunnels, eq(salesFunnelStages.funnelId, salesFunnels.id))
      .where(
        and(
          eq(salesFunnelStages.id, stageId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .limit(1);

    if (stage.length === 0) {
      return { success: false, error: 'Etapa não encontrada' };
    }

    return {
      success: true,
      data: stage[0],
    };
  } catch (error) {
    console.error('Erro ao buscar etapa:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
