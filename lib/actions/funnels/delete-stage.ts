'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and, count } from 'drizzle-orm';

interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function deleteStage(stageId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar se a stage existe e pertence à agência do usuário
    const existingStage = await db.query.salesFunnelStages.findFirst({
      where: eq(salesFunnelStages.id, stageId),
      with: {
        funnel: {
          columns: { agencyId: true, id: true }
        }
      }
    });

    if (!existingStage) {
      return { success: false, error: 'Etapa não encontrada' };
    }

    if (existingStage.funnel.agencyId !== session.user.agencyId) {
      return { success: false, error: 'Sem permissão para excluir esta etapa' };
    }

    // Verificar se o funil terá pelo menos 2 etapas após a exclusão
    const [stageCountResult] = await db
      .select({ count: count() })
      .from(salesFunnelStages)
      .where(eq(salesFunnelStages.funnelId, existingStage.funnelId));

    if (stageCountResult.count <= 2) {
      return { 
        success: false, 
        error: 'Não é possível excluir. O funil deve ter pelo menos 2 etapas' 
      };
    }

    // Excluir a stage
    await db
      .delete(salesFunnelStages)
      .where(eq(salesFunnelStages.id, stageId));

    return { 
      success: true, 
      message: 'Etapa excluída com sucesso'
    };
  } catch (error) {
    console.error('Erro ao excluir stage:', error);
    return { 
      success: false, 
      error: 'Erro interno do servidor'
    };
  }
}
