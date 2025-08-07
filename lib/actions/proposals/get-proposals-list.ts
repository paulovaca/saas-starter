'use server';

import { z } from 'zod';
import { getProposalsList } from '@/lib/db/queries/proposals';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus } from '@/lib/types/proposals';

const getProposalsListSchema = z.object({
  search: z.string().optional(),
  status: z.enum([
    ProposalStatus.DRAFT,
    ProposalStatus.SENT,
    ProposalStatus.APPROVED,
    ProposalStatus.REJECTED,
    ProposalStatus.EXPIRED,
    'all'
  ] as const).optional(),
  clientId: z.string().uuid().optional(),
  operatorId: z.string().uuid().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const getProposalsListAction = createPermissionAction(
  getProposalsListSchema,
  Permission.PROPOSAL_READ,
  async (input, user) => {
    const { search, status, clientId, operatorId, page, limit } = input;

    try {
      const filters = {
        search,
        status: status === 'all' ? undefined : status,
        clientId,
        operatorId,
        page,
        limit
      };

      // Get proposals list with filters
      const proposals = await getProposalsList(
        user.agencyId,
        user.role === 'AGENT' ? user.id : undefined,
        filters
      );

      return {
        success: true,
        data: proposals
      };

    } catch (error) {
      console.error('Error fetching proposals list:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao carregar lista de propostas'
      );
    }
  },
  {
    rateLimitKey: 'get-proposals-list',
    logActivity: false, // Don't log read operations
  }
);