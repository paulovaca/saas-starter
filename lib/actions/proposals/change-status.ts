'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalStatusHistory } from '@/lib/db/schema/clients';
import { getCurrentUser } from '@/lib/auth/session';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus, canTransitionToStatus } from '@/lib/types/proposals';
import { eq, and } from 'drizzle-orm';

const changeStatusSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
  newStatus: z.enum([
    ProposalStatus.DRAFT,
    ProposalStatus.SENT,
    ProposalStatus.ACCEPTED,
    ProposalStatus.REJECTED,
    ProposalStatus.EXPIRED
  ] as const),
  reason: z.string().optional(),
});

export const changeProposalStatus = createPermissionAction(
  changeStatusSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId, newStatus, reason } = input;

    try {
      // Get current proposal
      const currentProposal = await db.query.proposals.findFirst({
        where: and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        ),
      });

      if (!currentProposal) {
        throw new Error('Proposta não encontrada');
      }

      // Check if user can access this proposal (agents can only access their own)
      if (user.role === 'AGENT' && currentProposal.userId !== user.id) {
        throw new Error('Você não tem permissão para alterar esta proposta');
      }

      // Validate status transition
      if (!canTransitionToStatus(currentProposal.status as ProposalStatus, newStatus)) {
        throw new Error(`Não é possível alterar o status de ${currentProposal.status} para ${newStatus}`);
      }

      const now = new Date();
      
      // Update proposal status
      const updateData: any = {
        status: newStatus,
        updatedAt: now,
      };

      // Set timestamp fields based on status
      if (newStatus === ProposalStatus.SENT && !currentProposal.sentAt) {
        updateData.sentAt = now;
      }
      
      if (newStatus === ProposalStatus.ACCEPTED || newStatus === ProposalStatus.REJECTED) {
        updateData.decidedAt = now;
      }

      await db.transaction(async (tx) => {
        // Update proposal
        await tx
          .update(proposals)
          .set(updateData)
          .where(eq(proposals.id, proposalId));

        // Create status history record
        await tx.insert(proposalStatusHistory).values({
          proposalId,
          fromStatus: currentProposal.status,
          toStatus: newStatus,
          changedBy: user.id,
          reason: reason || null,
          changedAt: now,
        });
      });

      // TODO: Execute status-specific automations
      await executeStatusAutomations(proposalId, newStatus, currentProposal, user);

      return {
        success: true,
        message: `Status alterado para ${getStatusLabel(newStatus)} com sucesso`,
        data: {
          proposalId,
          newStatus,
          timestamp: now,
        }
      };

    } catch (error) {
      console.error('Error changing proposal status:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao alterar status da proposta'
      );
    }
  },
  {
    rateLimitKey: 'change-proposal-status',
    logActivity: true,
  }
);

// Helper function to execute automations based on status
async function executeStatusAutomations(
  proposalId: string,
  newStatus: ProposalStatus,
  currentProposal: any,
  user: any
) {
  try {
    switch (newStatus) {
      case ProposalStatus.SENT:
        // TODO: Send email notification to client
        console.log(`Sending proposal ${proposalId} to client via email`);
        break;
        
      case ProposalStatus.ACCEPTED:
        // TODO: Create reservation/booking
        // TODO: Move client to next funnel stage
        console.log(`Creating reservation for accepted proposal ${proposalId}`);
        break;
        
      case ProposalStatus.REJECTED:
        // TODO: Move client to appropriate funnel stage
        console.log(`Processing rejection for proposal ${proposalId}`);
        break;
        
      case ProposalStatus.EXPIRED:
        // TODO: Archive proposal and update client status
        console.log(`Archiving expired proposal ${proposalId}`);
        break;
    }
  } catch (error) {
    console.error('Error executing status automations:', error);
    // Don't throw error here to avoid breaking the main status change
  }
}

// Helper function to get status label
function getStatusLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    [ProposalStatus.DRAFT]: 'Rascunho',
    [ProposalStatus.SENT]: 'Enviada',
    [ProposalStatus.ACCEPTED]: 'Aceita',
    [ProposalStatus.REJECTED]: 'Recusada',
    [ProposalStatus.EXPIRED]: 'Expirada'
  };
  return labels[status];
}