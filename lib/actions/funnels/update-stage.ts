'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnelStages } from '@/lib/db/schema/funnels';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';

// Schema de validação para atualização de stage
const updateStageSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  guidelines: z.string().max(1000, 'Diretrizes muito longas').optional(),
  color: z.enum(['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'orange', 'pink']).optional(),
  order: z.number().int().positive().optional(),
});

export type UpdateStageInput = z.infer<typeof updateStageSchema>;

interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function updateStage(
  stageId: string,
  data: UpdateStageInput
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Não autorizado' };
    }

    // Validar entrada
    const validatedData = updateStageSchema.parse(data);

    // Verificar se a stage existe e pertence à agência do usuário
    const existingStage = await db.query.salesFunnelStages.findFirst({
      where: eq(salesFunnelStages.id, stageId),
      with: {
        funnel: {
          columns: { agencyId: true }
        }
      }
    });

    if (!existingStage) {
      return { success: false, error: 'Etapa não encontrada' };
    }

    if (existingStage.funnel.agencyId !== session.user.agencyId) {
      return { success: false, error: 'Sem permissão para atualizar esta etapa' };
    }

    // Se está atualizando o nome, verificar se não existe outro com o mesmo nome no funil
    if (validatedData.name) {
      const duplicateName = await db.query.salesFunnelStages.findFirst({
        where: and(
          eq(salesFunnelStages.funnelId, existingStage.funnelId),
          eq(salesFunnelStages.name, validatedData.name),
          ne(salesFunnelStages.id, stageId)
        )
      });

      if (duplicateName) {
        return { success: false, error: 'Já existe uma etapa com este nome neste funil' };
      }
    }

    // Atualizar a stage
    const [updatedStage] = await db
      .update(salesFunnelStages)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(salesFunnelStages.id, stageId))
      .returning();

    return { 
      success: true, 
      data: updatedStage,
      message: 'Etapa atualizada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao atualizar stage:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Dados inválidos: ' + error.errors.map(e => e.message).join(', ')
      };
    }

    return { 
      success: false, 
      error: 'Erro interno do servidor'
    };
  }
}
