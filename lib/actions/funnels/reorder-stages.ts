'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and } from 'drizzle-orm';
import { reorderStagesSchema, type ReorderStagesInput } from '@/lib/validations/funnels';

export async function reorderStages(funnelId: string, input: ReorderStagesInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem reordenar etapas)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para reordenar etapas' };
    }

    const validatedInput = reorderStagesSchema.parse(input);

    // Verificar se o funil existe e pertence à agência
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

    // Verificar se todas as etapas pertencem ao funil
    const stageIds = validatedInput.stages.map(s => s.id);
    const existingStages = await db
      .select({ id: salesFunnelStages.id })
      .from(salesFunnelStages)
      .where(
        and(
          eq(salesFunnelStages.funnelId, funnelId),
          // TODO: Usar inArray quando disponível no Drizzle
        )
      );

    const existingStageIds = existingStages.map(s => s.id);
    const invalidStages = stageIds.filter(id => !existingStageIds.includes(id));

    if (invalidStages.length > 0) {
      return { success: false, error: 'Algumas etapas não pertencem a este funil' };
    }

    // Verificar se as ordens são sequenciais e únicas
    const orders = validatedInput.stages.map(s => s.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        return { success: false, error: 'As ordens devem ser sequenciais começando em 1' };
      }
    }

    // Atualizar as ordens em transação
    await db.transaction(async (tx) => {
      for (const stage of validatedInput.stages) {
        await tx
          .update(salesFunnelStages)
          .set({ 
            order: stage.order,
            updatedAt: new Date(),
          })
          .where(eq(salesFunnelStages.id, stage.id));
      }
    });

    return { success: true, message: 'Ordem das etapas atualizada com sucesso' };
  } catch (error) {
    console.error('Erro ao reordenar etapas:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return { success: false, error: 'Dados inválidos fornecidos' };
    }
    
    return { success: false, error: 'Erro interno do servidor' };
  }
}
