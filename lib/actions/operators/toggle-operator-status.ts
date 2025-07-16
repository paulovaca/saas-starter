'use server';

import { db } from '@/lib/db/drizzle';
import { operators } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';
import { toggleOperatorStatusSchema, type ToggleOperatorStatusInput } from '@/lib/validations/operators/operator.schema';
import { revalidatePath } from 'next/cache';

export async function toggleOperatorStatus(data: ToggleOperatorStatusInput) {
  try {
    const user = await getUser();
    if (!user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions (only master and admin can toggle operator status)
    if (!['MASTER', 'ADMIN'].includes(user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem ativar/desativar operadoras.');
    }

    // Validate input data
    const validatedData = toggleOperatorStatusSchema.parse(data);
    const { id, isActive } = validatedData;

    // Check if operator exists and belongs to the agency
    const existingOperator = await db
      .select()
      .from(operators)
      .where(and(
        eq(operators.id, id),
        eq(operators.agencyId, user.agencyId)
      ))
      .limit(1);

    if (existingOperator.length === 0) {
      throw new Error('Operadora não encontrada ou você não tem permissão para modificá-la.');
    }

    // Update operator status
    const [updatedOperator] = await db
      .update(operators)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(and(
        eq(operators.id, id),
        eq(operators.agencyId, user.agencyId)
      ))
      .returning();

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${id}`);

    return {
      success: true,
      data: updatedOperator,
      message: `Operadora ${isActive ? 'ativada' : 'desativada'} com sucesso!`,
    };
  } catch (error) {
    console.error('Error toggling operator status:', error);
    
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
