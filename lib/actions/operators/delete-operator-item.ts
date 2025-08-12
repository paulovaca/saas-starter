'use server';

import { db } from '@/lib/db/drizzle';
import { operatorItems, commissionRules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const deleteOperatorItemSchema = z.object({
  operatorItemId: z.string().uuid('ID da associação inválido'),
  operatorId: z.string().uuid('ID da operadora inválido'),
});

export type DeleteOperatorItemInput = z.infer<typeof deleteOperatorItemSchema>;

export async function deleteOperatorItem(data: DeleteOperatorItemInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions (only master and admin can hard delete items)
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem excluir itens definitivamente.');
    }

    // Validate input data
    const validatedData = deleteOperatorItemSchema.parse(data);

    // Verificar se a associação existe
    const existingAssociation = await db
      .select()
      .from(operatorItems)
      .where(eq(operatorItems.id, validatedData.operatorItemId))
      .limit(1);

    if (existingAssociation.length === 0) {
      throw new Error('Associação não encontrada.');
    }

    console.log('Deletando associação item-operadora:', validatedData.operatorItemId);
    
    // Use transaction to delete commission rules first, then operator item
    await db.transaction(async (tx) => {
      // First delete all commission rules associated with this operator item
      await tx
        .delete(commissionRules)
        .where(eq(commissionRules.operatorItemId, validatedData.operatorItemId));
      
      console.log('Regras de comissão deletadas');
      
      // Then delete the operator item association
      await tx
        .delete(operatorItems)
        .where(eq(operatorItems.id, validatedData.operatorItemId));
      
      console.log('Associação item-operadora deletada');
    });

    // Verificar se a deleção realmente aconteceu
    const remainingItems = await db
      .select()
      .from(operatorItems)
      .where(eq(operatorItems.id, validatedData.operatorItemId));
    
    console.log('Itens restantes após deleção:', remainingItems.length);

    // Revalidate pages com timestamp para forçar refresh
    const timestamp = Date.now();
    revalidatePath('/operators', 'page');
    revalidatePath(`/operators/${validatedData.operatorId}`, 'page');
    
    console.log(`Páginas revalidadas em ${timestamp}`);

    return {
      success: true,
      message: 'Item e suas regras de comissão foram removidos da operadora com sucesso!',
    };
  } catch (error) {
    console.error('Error deleting operator item:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.',
    };
  }
}
