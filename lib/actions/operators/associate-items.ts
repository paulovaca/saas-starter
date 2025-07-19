'use server';

import { db } from '@/lib/db/drizzle';
import { operatorItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { associateItemsSchema, type AssociateItemsInput } from '@/lib/validations/operators/association.schema';
import { revalidatePath } from 'next/cache';

export async function associateItems(data: AssociateItemsInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions (only master and admin can associate items)
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem associar itens.');
    }

    // Validate input data
    let validatedData;
    try {
      validatedData = associateItemsSchema.parse(data);
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: `Dados inválidos: ${error.message}`,
        };
      }
      return {
        success: false,
        error: 'Dados fornecidos são inválidos.',
      };
    }

    // Check for duplicate custom names within the same operator
    if (validatedData.customName && validatedData.customName.trim()) {
      const existingItems = await db
        .select()
        .from(operatorItems)
        .where(
          and(
            eq(operatorItems.operatorId, validatedData.operatorId),
            eq(operatorItems.customName, validatedData.customName.trim())
          )
        );

      if (existingItems.length > 0) {
        throw new Error(`Já existe um item com o nome "${validatedData.customName}" associado a esta operadora.`);
      }
    }

    // Create association (permitindo múltiplas associações do mesmo item com regras diferentes)
    const [newAssociation] = await db
      .insert(operatorItems)
      .values(validatedData)
      .returning();

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${validatedData.operatorId}`);

    return {
      success: true,
      data: newAssociation,
      message: 'Item associado com sucesso!',
    };
  } catch (error) {
    console.error('Error associating item:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as any;
      const errorMessage = zodError.issues?.[0]?.message || 'Dados inválidos';
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    // Handle regular errors
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
