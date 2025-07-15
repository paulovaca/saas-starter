'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and, max } from 'drizzle-orm';
import { createStageSchema, type CreateStageInput } from '@/lib/validations/funnels';

export async function createStage(input: CreateStageInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem criar etapas)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para criar etapas' };
    }

    const validatedInput = createStageSchema.parse(input);

    // Verificar se o funil existe e pertence à agência
    const funnel = await db
      .select()
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.id, validatedInput.funnelId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!funnel) {
      return { success: false, error: 'Funil não encontrado' };
    }

    // Verificar se nome da etapa já existe no funil
    const existingStage = await db
      .select({ id: salesFunnelStages.id })
      .from(salesFunnelStages)
      .where(
        and(
          eq(salesFunnelStages.name, validatedInput.name),
          eq(salesFunnelStages.funnelId, validatedInput.funnelId)
        )
      )
      .then(rows => rows[0]);

    if (existingStage) {
      return { success: false, error: 'Já existe uma etapa com este nome neste funil' };
    }

    // Obter a próxima ordem se não fornecida
    let order = validatedInput.order;
    if (!order) {
      const maxOrder = await db
        .select({ max: max(salesFunnelStages.order) })
        .from(salesFunnelStages)
        .where(eq(salesFunnelStages.funnelId, validatedInput.funnelId))
        .then(rows => rows[0]?.max || 0);
      
      order = maxOrder + 1;
    }

    // Criar a etapa
    const [newStage] = await db
      .insert(salesFunnelStages)
      .values({
        name: validatedInput.name,
        description: validatedInput.description,
        color: validatedInput.color,
        order,
        funnelId: validatedInput.funnelId,
        createdBy: session.user.id,
      })
      .returning();

    return { success: true, data: newStage };
  } catch (error) {
    console.error('Erro ao criar etapa:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return { success: false, error: 'Dados inválidos fornecidos' };
    }
    
    return { success: false, error: 'Erro interno do servidor' };
  }
}
