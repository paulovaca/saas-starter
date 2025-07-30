'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalStatusHistory } from '@/lib/db/schema/clients';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus, canTransitionToStatus } from '@/lib/types/proposals';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const updateProposalSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
  validUntil: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const updateProposal = createPermissionAction(
  updateProposalSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId, validUntil, paymentMethod, notes, internalNotes } = input;

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

      const now = new Date();
      // Check if proposal can still be edited
      const fullEditableStatuses = [ProposalStatus.DRAFT, ProposalStatus.REJECTED, ProposalStatus.EXPIRED];
      const currentStatus = currentProposal.status as ProposalStatus;
      
      // For AWAITING_PAYMENT, only allow editing validUntil
      if (currentStatus === ProposalStatus.AWAITING_PAYMENT) {
        // Check if trying to edit fields other than validUntil
        const isEditingOtherFields = paymentMethod !== undefined || notes !== undefined || internalNotes !== undefined;
        if (isEditingOtherFields) {
          throw new Error('Para propostas aguardando pagamento, apenas a data de expiração pode ser editada');
        }
      } else if (!fullEditableStatuses.includes(currentStatus)) {
        throw new Error(`Não é possível editar uma proposta com status ${currentProposal.status}`);
      }

      const updateData: any = {
        updatedAt: now,
      };

      // Update other fields if provided
      if (validUntil !== undefined) {
        updateData.validUntil = validUntil || null;
      }
      
      if (paymentMethod !== undefined) {
        updateData.paymentMethod = paymentMethod || null;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes || null;
      }
      
      if (internalNotes !== undefined) {
        updateData.internalNotes = internalNotes || null;
      }

      await db.transaction(async (tx) => {
        // Update proposal
        await tx
          .update(proposals)
          .set(updateData)
          .where(eq(proposals.id, proposalId));

        // No status change logic needed - status is handled separately
      });

      // Revalidate the proposal page
      revalidatePath(`/proposals/${proposalId}`);
      revalidatePath('/proposals');

      return {
        success: true,
        message: 'Proposta atualizada com sucesso',
        data: {
          proposalId,
          updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt'),
        }
      };

    } catch (error) {
      console.error('Error updating proposal:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao atualizar proposta'
      );
    }
  },
  {
    rateLimitKey: 'update-proposal',
    logActivity: true,
  }
);