'use server';

import { z } from 'zod';
import { getClientsWithFilters } from '@/lib/db/queries/clients';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';

const getClientsListSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(50),
});

export const getClientsListAction = createPermissionAction(
  getClientsListSchema,
  Permission.CLIENT_READ,
  async (input, user) => {
    const { search, page, limit } = input;

    try {
      // Get clients list with filters
      const result = await getClientsWithFilters(
        user.agencyId,
        {
          search,
          userId: user.role === 'AGENT' ? user.id : undefined,
        },
        { page, limit }
      );

      // Transform to expected format
      const transformedClients = result.clients.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email || '',
        documentNumber: client.documentNumber || '',
        documentType: client.documentType || 'cpf',
      }));

      return {
        success: true,
        data: transformedClients
      };

    } catch (error) {
      console.error('Error fetching clients list:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao carregar lista de clientes'
      );
    }
  },
  {
    rateLimitKey: 'get-clients-list',
    logActivity: false, // Don't log read operations
  }
);