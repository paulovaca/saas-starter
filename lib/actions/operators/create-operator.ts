'use server';

import { db } from '@/lib/db/drizzle';
import { operators } from '@/lib/db/schema';
import { createOperatorSchema, type CreateOperatorInput } from '@/lib/validations/operators/operator.schema';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';

export const createOperator = createPermissionAction(
  createOperatorSchema,
  Permission.OPERATOR_CREATE,
  async (input: CreateOperatorInput, user) => {
    // Convert address object to string if it exists
    let addressString = '';
    if (input.address) {
      const addr = input.address;
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
        name: input.name,
        logo: input.logo || null,
        cnpj: input.cnpj || null,
        description: input.description || null,
        contactName: input.contactName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        website: input.website || null,
        address: addressString || null,
        notes: input.notes || null,
        agencyId: user.agencyId,
      })
      .returning();

    // Revalidate the operators page
    revalidatePath('/operators');

    return newOperator;
  },
  {
    rateLimitKey: 'create-operator',
    rateLimitAttempts: 5,
    rateLimitWindow: 60000,
    logActivity: true,
    activityType: 'OPERATOR_CREATED'
  }
);
