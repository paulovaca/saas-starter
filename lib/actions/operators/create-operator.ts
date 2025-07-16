'use server';

import { db } from '@/lib/db/drizzle';
import { operators } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';
import { createOperatorSchema, type CreateOperatorInput } from '@/lib/validations/operators/operator.schema';
import { revalidatePath } from 'next/cache';

export async function createOperator(data: CreateOperatorInput) {
  try {
    const user = await getUser();
    if (!user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions (only master and admin can create operators)
    if (!['MASTER', 'ADMIN'].includes(user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem criar operadoras.');
    }

    // Validate input data
    const validatedData = createOperatorSchema.parse(data);

    // Convert address object to string if it exists
    let addressString = '';
    if (validatedData.address) {
      const addr = validatedData.address;
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

    // Create operator
    const [newOperator] = await db
      .insert(operators)
      .values({
        name: validatedData.name,
        logo: validatedData.logo || null,
        cnpj: validatedData.cnpj || null,
        description: validatedData.description || null,
        contactName: validatedData.contactName || null,
        contactEmail: validatedData.contactEmail || null,
        contactPhone: validatedData.contactPhone || null,
        website: validatedData.website || null,
        address: addressString || null,
        notes: validatedData.notes || null,
        agencyId: user.agencyId,
      })
      .returning();

    // Revalidate the operators page
    revalidatePath('/operators');

    return {
      success: true,
      data: newOperator,
      message: 'Operadora criada com sucesso!',
    };
  } catch (error) {
    console.error('Error creating operator:', error);
    
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
