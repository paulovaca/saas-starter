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
    ProposalStatus.EXPIRED,
    ProposalStatus.AWAITING_PAYMENT,
    ProposalStatus.ACTIVE_TRAVEL
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
      
      if (newStatus === ProposalStatus.AWAITING_PAYMENT) {
        updateData.paymentDueAt = now;
      }
      
      if (newStatus === ProposalStatus.ACTIVE_TRAVEL) {
        updateData.activatedAt = now;
      }

      await db.transaction(async (tx) => {
        // Special handling for rejection: save rejection in history and immediately set back to draft
        if (newStatus === ProposalStatus.REJECTED) {
          // First, create history record for the rejection
          await tx.insert(proposalStatusHistory).values({
            proposalId,
            fromStatus: currentProposal.status,
            toStatus: ProposalStatus.REJECTED,
            changedBy: user.id,
            reason: reason || 'Proposta recusada pelo cliente',
            changedAt: now,
          });

          // Then update proposal back to draft status
          const draftUpdateData = {
            status: ProposalStatus.DRAFT,
            updatedAt: now,
            decidedAt: now, // Mark when it was decided (rejected)
          };

          await tx
            .update(proposals)
            .set(draftUpdateData)
            .where(eq(proposals.id, proposalId));

          // Create another history record for the automatic transition back to draft
          await tx.insert(proposalStatusHistory).values({
            proposalId,
            fromStatus: ProposalStatus.REJECTED,
            toStatus: ProposalStatus.DRAFT,
            changedBy: user.id,
            reason: 'Retorno automático para rascunho após recusa',
            changedAt: now,
          });
        } else {
          // Normal status change
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
        }
      });

      // TODO: Execute status-specific automations
      await executeStatusAutomations(proposalId, newStatus, currentProposal, user);

      // Determine final status for return (rejection goes back to draft)
      const finalStatus = newStatus === ProposalStatus.REJECTED ? ProposalStatus.DRAFT : newStatus;
      
      return {
        success: true,
        message: newStatus === ProposalStatus.REJECTED 
          ? 'Proposta recusada e retornada para rascunho com sucesso'
          : `Status alterado para ${getStatusLabel(newStatus)} com sucesso`,
        data: {
          proposalId,
          newStatus: finalStatus,
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
        
      case ProposalStatus.AWAITING_PAYMENT:
        // TODO: Set up payment tracking
        console.log(`Setting up payment tracking for proposal ${proposalId}`);
        break;
        
      case ProposalStatus.ACTIVE_TRAVEL:
        // TODO: Move to active business/travel management
        console.log(`Activating travel/business for proposal ${proposalId}`);
        break;
        
      case ProposalStatus.REJECTED:
        // TODO: Move client to appropriate funnel stage
        // Note: Proposal automatically returns to draft after rejection
        console.log(`Processing rejection for proposal ${proposalId} - returned to draft`);
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
    [ProposalStatus.EXPIRED]: 'Expirada',
    [ProposalStatus.AWAITING_PAYMENT]: 'Aguardando Pagamento',
    [ProposalStatus.ACTIVE_TRAVEL]: 'Negócio/Viagem Ativo'
  };
  return labels[status];
}