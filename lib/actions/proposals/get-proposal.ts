'use server';

import { z } from 'zod';
import { getProposalWithRelations, getProposalTimeline } from '@/lib/db/queries/proposals';
import { getCurrentUser } from '@/lib/auth/session';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';

const getProposalSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
});

export const getProposal = createPermissionAction(
  getProposalSchema,
  Permission.PROPOSAL_READ,
  async (input, user) => {
    const { proposalId } = input;

    console.log('🚀 getProposal called with:', { proposalId, userId: user.id, agencyId: user.agencyId, role: user.role });

    try {
      // Get proposal with all relations
      const proposal = await getProposalWithRelations(
        proposalId,
        user.agencyId,
        user.role === 'AGENT' ? user.id : undefined
      );

      console.log('📊 getProposalWithRelations result:', proposal ? 'Found proposal' : 'No proposal found');
      if (proposal) {
        console.log('📋 Proposal data:', {
          id: proposal.id,
          clientName: proposal.client?.name,
          operatorName: proposal.operator?.name,
          userName: proposal.user?.name,
          itemsCount: proposal.items?.length
        });
      }

      if (!proposal) {
        console.error('❌ Proposal not found for:', { proposalId, agencyId: user.agencyId });
        throw new Error('Proposta não encontrada');
      }

      // Check if user can access this proposal
      if (user.role === 'AGENT' && proposal.userId !== user.id) {
        console.error('❌ Access denied for agent:', { userId: user.id, proposalUserId: proposal.userId });
        throw new Error('Você não tem permissão para acessar esta proposta');
      }

      console.log('✅ Returning proposal data successfully');
      return proposal;

    } catch (error) {
      console.error('❌ Error fetching proposal:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao carregar proposta'
      );
    }
  },
  {
    rateLimitKey: 'get-proposal',
    logActivity: false, // Don't log read operations
  }
);

const getProposalTimelineSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
});

export const getProposalTimelineAction = createPermissionAction(
  getProposalTimelineSchema,
  Permission.PROPOSAL_READ,
  async (input, user) => {
    const { proposalId } = input;

    try {
      // First check if user can access this proposal
      const proposal = await getProposalWithRelations(
        proposalId,
        user.agencyId,
        user.role === 'AGENT' ? user.id : undefined
      );

      if (!proposal) {
        throw new Error('Proposta não encontrada');
      }

      if (user.role === 'AGENT' && proposal.userId !== user.id) {
        throw new Error('Você não tem permissão para acessar esta proposta');
      }

      // Get timeline
      const timeline = await getProposalTimeline(proposalId, user.agencyId);

      return timeline;

    } catch (error) {
      console.error('Error fetching proposal timeline:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao carregar histórico da proposta'
      );
    }
  },
  {
    rateLimitKey: 'get-proposal-timeline',
    logActivity: false,
  }
);