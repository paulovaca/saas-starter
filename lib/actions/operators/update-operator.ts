'use server';

import { db } from '@/lib/db/drizzle';
import { operators } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';
import { updateOperatorSchema, type UpdateOperatorInput } from '@/lib/validations/operators/operator.schema';
import { revalidatePath } from 'next/cache';

export async function updateOperator(data: UpdateOperatorInput) {
  try {
    const user = await getUser();
    if (!user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions (only master and admin can update operators)
    if (!['MASTER', 'ADMIN'].includes(user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem atualizar operadoras.');
    }

    // Validate input data
    const validatedData = updateOperatorSchema.parse(data);
    const { id, ...updateData } = validatedData;

    // Convert address object to string if it exists
    let addressString = '';
    if (updateData.address) {
      const addr = updateData.address;
      const parts = [
        addr.street,
        addr.number,
        addr.city,
        addr.state,
        addr.zipCode,
        addr.country
      ].filter(Boolean);
      addressString = parts.join(', ');
    }

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
      throw new Error('Operadora não encontrada ou você não tem permissão para editá-la.');
    }

    // Update operator
    const [updatedOperator] = await db
      .update(operators)
      .set({
        name: updateData.name,
        logo: updateData.logo || null,
        cnpj: updateData.cnpj || null,
        description: updateData.description || null,
        contactName: updateData.contactName || null,
        contactEmail: updateData.contactEmail || null,
        contactPhone: updateData.contactPhone || null,
        website: updateData.website || null,
        address: addressString || null,
        notes: updateData.notes || null,
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
      message: 'Operadora atualizada com sucesso!',
    };
  } catch (error) {
    console.error('Error updating operator:', error);
    
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
