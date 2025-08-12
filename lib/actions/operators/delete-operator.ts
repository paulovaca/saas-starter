'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/db/queries/auth';
import { db } from '@/lib/db/drizzle';
import { operators, operatorItems, operatorDocuments, commissionRules } from '@/lib/db/schema';
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

    // Verificar permissão - apenas MASTER e DEVELOPER podem fazer hard delete
    if (user.role !== 'MASTER' && user.role !== 'DEVELOPER') {
      return {
        success: false,
        message: 'Permissão negada',
        error: 'Apenas usuários MASTER ou DEVELOPER podem excluir operadoras permanentemente',
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

    // Iniciar transação para deletar em cascata
    await db.transaction(async (tx) => {
      // 1. Primeiro, buscar todos os operator_items desta operadora
      const operatorItemsList = await tx
        .select({ id: operatorItems.id })
        .from(operatorItems)
        .where(eq(operatorItems.operatorId, operatorId));

      // 2. Deletar commission_rules associadas aos operator_items
      if (operatorItemsList.length > 0) {
        for (const item of operatorItemsList) {
          await tx
            .delete(commissionRules)
            .where(eq(commissionRules.operatorItemId, item.id));
        }
      }

      // 3. Deletar operator_items
      await tx
        .delete(operatorItems)
        .where(eq(operatorItems.operatorId, operatorId));

      // 4. Deletar operator_documents
      await tx
        .delete(operatorDocuments)
        .where(eq(operatorDocuments.operatorId, operatorId));

      // 5. Finalmente, deletar a operadora
      await tx
        .delete(operators)
        .where(eq(operators.id, operatorId));
    });

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
