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
    const validatedData = associateItemsSchema.parse(data);

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
