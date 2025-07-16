'use server';

import { db } from '@/lib/db/drizzle';
import { operatorItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const toggleItemStatusSchema = z.object({
  operatorItemId: z.string().uuid('ID do item inválido'),
  operatorId: z.string().uuid('ID da operadora inválido'),
  isActive: z.boolean(),
});

export async function toggleOperatorItemStatus(data: {
  operatorItemId: string;
  operatorId: string;
  isActive: boolean;
}) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Check permissions (only master and admin can toggle item status)
    if (!['MASTER', 'ADMIN'].includes(user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem alterar status de itens.');
    }

    // Validate input data
    const validatedData = toggleItemStatusSchema.parse(data);

    // Update item status
    const [updatedItem] = await db
      .update(operatorItems)
      .set({ 
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      })
      .where(eq(operatorItems.id, validatedData.operatorItemId))
      .returning();

    if (!updatedItem) {
      throw new Error('Item da operadora não encontrado');
    }

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${validatedData.operatorId}`);

    return {
      success: true,
      data: updatedItem,
      message: `Item ${validatedData.isActive ? 'ativado' : 'desativado'} com sucesso!`,
    };
  } catch (error) {
    console.error('Error toggling operator item status:', error);
    
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
