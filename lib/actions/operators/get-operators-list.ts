'use server';

import { z } from 'zod';
import { getOperatorsList } from '@/lib/db/queries/operators';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';

const getOperatorsListSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(50),
});

export const getOperatorsListAction = createPermissionAction(
  getOperatorsListSchema,
  Permission.OPERATOR_READ,
  async (input, user) => {
    const { search, page, limit } = input;

    try {
      const filters = {
        search,
        page,
        limit
      };

      // Get operators list with filters
      const operators = await getOperatorsList(
        user.agencyId,
        filters
      );

      // Transform to expected format
      const transformedOperators = operators.map(operator => ({
        id: operator.id,
        name: operator.name,
        logo: operator.logo,
      }));

      return {
        success: true,
        data: transformedOperators
      };

    } catch (error) {
      console.error('Error fetching operators list:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao carregar lista de operadoras'
      );
    }
  },
  {
    rateLimitKey: 'get-operators-list',
    logActivity: false, // Don't log read operations
  }
);