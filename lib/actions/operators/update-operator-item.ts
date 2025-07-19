'use server';

import { db } from '@/lib/db/drizzle';
import { operatorItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateOperatorItemSchema = z.object({
  operatorItemId: z.string().uuid('ID do item inválido'),
  operatorId: z.string().uuid('ID da operadora inválido'),
  customName: z.string()
    .min(2, 'Nome customizado deve ter pelo menos 2 caracteres')
    .max(255, 'Nome customizado deve ter no máximo 255 caracteres')
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateOperatorItemInput = z.infer<typeof updateOperatorItemSchema>;

export async function updateOperatorItem(data: UpdateOperatorItemInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions (only master and admin can update operator items)
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem atualizar itens de operadora.');
    }

    // Validate input data
    const validatedData = updateOperatorItemSchema.parse(data);

    // Check if operator item exists
    const existingItem = await db
      .select()
      .from(operatorItems)
      .where(eq(operatorItems.id, validatedData.operatorItemId))
      .limit(1);

    if (existingItem.length === 0) {
      throw new Error('Item da operadora não encontrado.');
    }

    // Check for duplicate custom names within the same operator (if customName is being updated)
    if (validatedData.customName && validatedData.customName.trim()) {
      const duplicateItems = await db
        .select()
        .from(operatorItems)
        .where(
          and(
            eq(operatorItems.operatorId, validatedData.operatorId),
            eq(operatorItems.customName, validatedData.customName.trim())
          )
        );

      // Filter out the current item being updated
      const hasDuplicate = duplicateItems.some(item => item.id !== validatedData.operatorItemId);
      
      if (hasDuplicate) {
        throw new Error(`Já existe um item com o nome "${validatedData.customName}" associado a esta operadora.`);
      }
    }

    // Prepare update data
    const updateData: Partial<typeof operatorItems.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validatedData.customName !== undefined) {
      updateData.customName = validatedData.customName.trim() || null;
    }

    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }

    // Update operator item
    const [updatedItem] = await db
      .update(operatorItems)
      .set(updateData)
      .where(eq(operatorItems.id, validatedData.operatorItemId))
      .returning();

    if (!updatedItem) {
      throw new Error('Erro ao atualizar item da operadora.');
    }

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${validatedData.operatorId}`);

    return {
      success: true,
      data: updatedItem,
      message: 'Item da operadora atualizado com sucesso!',
    };
  } catch (error) {
    console.error('Error updating operator item:', error);
    
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
