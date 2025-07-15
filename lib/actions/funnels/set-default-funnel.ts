'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels } from '@/lib/db/schema/funnels';
import { eq, and } from 'drizzle-orm';

export async function setDefaultFunnel(funnelId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem definir funil padrão)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para definir funil padrão' };
    }

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

    // Se já é padrão, não fazer nada
    if (existingFunnel.isDefault) {
      return { success: true, message: 'Funil já é o padrão' };
    }

    // Atualizar em transação
    await db.transaction(async (tx) => {
      // Remover padrão de todos os funis da agência
      await tx
        .update(salesFunnels)
        .set({ isDefault: false })
        .where(
          and(
            eq(salesFunnels.agencyId, session.user.agencyId),
            eq(salesFunnels.isDefault, true)
          )
        );

      // Definir o novo funil como padrão
      await tx
        .update(salesFunnels)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(salesFunnels.id, funnelId));
    });

    return { success: true, message: 'Funil definido como padrão com sucesso' };
  } catch (error) {
    console.error('Erro ao definir funil padrão:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
