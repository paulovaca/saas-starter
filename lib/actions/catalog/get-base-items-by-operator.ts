'use server';

import { z } from 'zod';
import { getBaseItemsByOperator } from '@/lib/db/queries/catalog';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';

const getBaseItemsByOperatorSchema = z.object({
  operatorId: z.string().uuid('ID da operadora inválido'),
});

export const getBaseItemsByOperatorAction = createPermissionAction(
  getBaseItemsByOperatorSchema,
  Permission.CATALOG_READ,
  async (input, user) => {
    const { operatorId } = input;

    try {
      // Get base items for the operator
      const baseItems = await getBaseItemsByOperator(
        operatorId,
        user.agencyId
      );

      // Transform to expected format
      const transformedItems = baseItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        allowPriceEdit: item.allowPriceEdit,
        customFields: item.customFields || [],
      }));

      return transformedItems;

    } catch (error) {
      console.error('Error fetching base items:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao carregar itens base'
      );
    }
  },
  {
    rateLimitKey: 'get-base-items',
    logActivity: false, // Don't log read operations
  }
);