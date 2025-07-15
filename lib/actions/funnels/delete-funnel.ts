'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and } from 'drizzle-orm';

export async function deleteFunnel(funnelId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem deletar funis)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para deletar funis' };
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

    // Verificar se não é o funil padrão
    if (existingFunnel.isDefault) {
      return { 
        success: false, 
        error: 'Não é possível excluir o funil padrão. Defina outro funil como padrão primeiro.' 
      };
    }

    // TODO: Verificar se há clientes neste funil
    // Quando implementarmos a tabela de clientes, adicionar verificação aqui

    // Deletar em transação (as etapas serão deletadas automaticamente por CASCADE)
    await db.transaction(async (tx) => {
      // Deletar etapas primeiro (se não tiver CASCADE)
      await tx
        .delete(salesFunnelStages)
        .where(eq(salesFunnelStages.funnelId, funnelId));

      // Deletar o funil
      await tx
        .delete(salesFunnels)
        .where(eq(salesFunnels.id, funnelId));
    });

    return { success: true, message: 'Funil excluído com sucesso' };
  } catch (error) {
    console.error('Erro ao deletar funil:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
