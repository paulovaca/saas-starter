'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels } from '@/lib/db/schema/funnels';
import { eq, and } from 'drizzle-orm';
import { updateFunnelSchema, type UpdateFunnelInput } from '@/lib/validations/funnels';

export async function updateFunnel(input: { id: string; name?: string; description?: string; isDefault?: boolean }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem atualizar funis)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para atualizar funis' };
    }

    const { id: funnelId, ...updateData } = input;

    // Verificar se o funil existe e pertence à agência
    const existingFunnel = await db
      .select()
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.id, funnelId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!existingFunnel) {
      return { success: false, error: 'Funil não encontrado' };
    }

    // Verificar se nome já existe em outro funil da agência (se nome foi fornecido)
    if (updateData.name && updateData.name !== existingFunnel.name) {
      const nameConflict = await db
        .select({ id: salesFunnels.id })
        .from(salesFunnels)
        .where(
          and(
            eq(salesFunnels.name, updateData.name),
            eq(salesFunnels.agencyId, session.user.agencyId)
          )
        )
        .then(rows => rows[0]);

      if (nameConflict) {
        return { success: false, error: 'Já existe um funil com este nome' };
      }
    }

    // Se for marcado como padrão, remover padrão dos outros
    if (updateData.isDefault) {
      await db
        .update(salesFunnels)
        .set({ isDefault: false })
        .where(
          and(
            eq(salesFunnels.agencyId, session.user.agencyId),
            eq(salesFunnels.isDefault, true)
          )
        );
    }

    // Atualizar o funil
    const [updatedFunnel] = await db
      .update(salesFunnels)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(salesFunnels.id, funnelId))
      .returning();

    return { success: true, data: updatedFunnel };
  } catch (error) {
    console.error('Erro ao atualizar funil:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
