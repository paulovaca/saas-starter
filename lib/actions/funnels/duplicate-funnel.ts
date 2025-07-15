'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and, asc } from 'drizzle-orm';

export async function duplicateFunnel(funnelId: string, newName?: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem duplicar funis)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para duplicar funis' };
    }

    // Buscar o funil original com suas etapas
    const originalFunnel = await db
      .select()
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.id, funnelId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!originalFunnel) {
      return { success: false, error: 'Funil não encontrado' };
    }

    // Buscar etapas do funil original
    const originalStages = await db
      .select()
      .from(salesFunnelStages)
      .where(eq(salesFunnelStages.funnelId, funnelId))
      .orderBy(asc(salesFunnelStages.order));

    // Gerar nome para a cópia
    const duplicateName = newName || `${originalFunnel.name} - Cópia`;

    // Verificar se nome já existe
    const nameExists = await db
      .select({ id: salesFunnels.id })
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.name, duplicateName),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (nameExists) {
      return { success: false, error: 'Já existe um funil com este nome' };
    }

    // Criar a cópia em transação
    return await db.transaction(async (tx) => {
      // Criar o novo funil
      const [newFunnel] = await tx
        .insert(salesFunnels)
        .values({
          name: duplicateName,
          description: originalFunnel.description ? `${originalFunnel.description} (Cópia)` : undefined,
          isDefault: false, // Cópia nunca é padrão
          agencyId: session.user.agencyId,
          createdBy: session.user.id,
        })
        .returning();

      // Duplicar as etapas
      if (originalStages.length > 0) {
        const stagesData = originalStages.map(stage => ({
          name: stage.name,
          description: stage.description,
          color: stage.color,
          order: stage.order,
          isActive: stage.isActive,
          funnelId: newFunnel.id,
          createdBy: session.user.id,
        }));

        const newStages = await tx
          .insert(salesFunnelStages)
          .values(stagesData)
          .returning();

        return {
          success: true,
          data: {
            ...newFunnel,
            stages: newStages,
          },
        };
      }

      return {
        success: true,
        data: {
          ...newFunnel,
          stages: [],
        },
      };
    });
  } catch (error) {
    console.error('Erro ao duplicar funil:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
