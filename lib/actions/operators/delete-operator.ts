'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/db/queries/auth';
import { db } from '@/lib/db/drizzle';
import { operators } from '@/lib/db/schema';
import { z } from 'zod';

const deleteOperatorSchema = z.object({
  operatorId: z.string().min(1, 'ID da operadora é obrigatório'),
});

type DeleteOperatorInput = z.infer<typeof deleteOperatorSchema>;

interface DeleteOperatorResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function deleteOperator(input: DeleteOperatorInput): Promise<DeleteOperatorResult> {
  try {
    // Validar entrada
    const validation = deleteOperatorSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: 'Dados inválidos',
        error: validation.error.errors[0]?.message,
      };
    }

    const { operatorId } = validation.data;

    // Verificar autenticação
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado',
        error: 'Você precisa estar logado para excluir uma operadora',
      };
    }

    // Verificar permissão - apenas MASTER pode fazer hard delete
    if (user.role !== 'MASTER') {
      return {
        success: false,
        message: 'Permissão negada',
        error: 'Apenas usuários MASTER podem excluir operadoras permanentemente',
      };
    }

    // Verificar se a operadora existe
    const existingOperator = await db
      .select()
      .from(operators)
      .where(eq(operators.id, operatorId))
      .limit(1);

    if (existingOperator.length === 0) {
      return {
        success: false,
        message: 'Operadora não encontrada',
        error: 'A operadora especificada não existe',
      };
    }

    // Verificar se a operadora pertence à mesma agência do usuário
    if (existingOperator[0].agencyId !== user.agencyId) {
      return {
        success: false,
        message: 'Permissão negada',
        error: 'Você só pode excluir operadoras da sua agência',
      };
    }

    // TODO: Verificar dependências antes da exclusão
    // Aqui seria ideal verificar se a operadora tem:
    // - Propostas ativas
    // - Reservas pendentes
    // - Itens associados
    // Por enquanto, vamos permitir a exclusão

    // Executar hard delete
    await db
      .delete(operators)
      .where(eq(operators.id, operatorId));

    // Revalidar cache
    revalidatePath('/operators');
    revalidatePath(`/operators/${operatorId}`);

    return {
      success: true,
      message: 'Operadora excluída com sucesso',
    };

  } catch (error) {
    console.error('Erro ao excluir operadora:', error);
    return {
      success: false,
      message: 'Erro interno do servidor',
      error: 'Ocorreu um erro inesperado ao excluir a operadora',
    };
  }
}
