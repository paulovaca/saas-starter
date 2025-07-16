'use server';

import { db } from '@/lib/db/drizzle';
import { operatorItems } from '@/lib/db/schema';
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

    // Delete association (hard delete)
    await db
      .delete(operatorItems)
      .where(eq(operatorItems.id, validatedData.operatorItemId));

    // Revalidate pages
    revalidatePath('/dashboard/operators');
    revalidatePath(`/dashboard/operators/${validatedData.operatorId}`);

    return {
      success: true,
      message: 'Item removido da operadora com sucesso!',
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
