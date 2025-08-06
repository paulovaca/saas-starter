'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalItems, proposalStatusHistory, proposalViews } from '@/lib/db/schema/clients';
import { bookings } from '@/lib/db/schema/bookings';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus } from '@/lib/types/proposals';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const deleteProposalSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
  hardDelete: z.boolean().optional()
});

export const deleteProposal = createPermissionAction(
  deleteProposalSchema,
  Permission.PROPOSAL_DELETE,
  async (input, user) => {
    const { proposalId, hardDelete = false } = input;

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
        throw new Error('Você não tem permissão para excluir esta proposta');
      }

      // Hard delete is only allowed for MASTER users
      const canHardDelete = hardDelete && (user.role === 'MASTER' || user.role === 'DEVELOPER');
      
      if (hardDelete && !canHardDelete) {
        throw new Error('Apenas usuários MASTER podem excluir propostas permanentemente');
      }

      // Check if proposal can be deleted based on status
      const currentStatus = currentProposal.status as ProposalStatus;
      const deletableStatuses: ProposalStatus[] = [
        ProposalStatus.DRAFT, 
        ProposalStatus.REJECTED, 
        ProposalStatus.EXPIRED
      ];

      if (!deletableStatuses.includes(currentStatus) && !canHardDelete) {
        throw new Error(`Não é possível excluir uma proposta com status ${currentProposal.status}`);
      }

      const now = new Date();

      if (canHardDelete) {
        console.log(`🗑️ Starting hard delete for proposal ${proposalId}`);
        
        try {
          // Test database connection first
          console.log('🔍 Testing database connection...');
          const testQuery = await db.query.proposals.findFirst({
            where: eq(proposals.id, proposalId)
          });
          console.log('✅ Database connection OK, proposal found:', !!testQuery);
          
          // Hard delete with individual try-catch for each operation
          await db.transaction(async (tx) => {
            // Delete bookings related to this proposal (if any)
            try {
              console.log('🗑️ Deleting related bookings...');
              const bookingResult = await tx
                .delete(bookings)
                .where(eq(bookings.proposalId, proposalId))
                .returning({ id: bookings.id });
              console.log(`✅ Deleted ${bookingResult.length} bookings`);
            } catch (error) {
              console.log('⚠️ Error deleting bookings (may not exist):', error instanceof Error ? error.message : error);
              // Continue anyway - bookings might not exist or table might not exist
            }
            
            // Delete proposal views (tracking data)
            try {
              console.log('🗑️ Deleting proposal views...');
              const viewsResult = await tx
                .delete(proposalViews)
                .where(eq(proposalViews.proposalId, proposalId))
                .returning({ id: proposalViews.id });
              console.log(`✅ Deleted ${viewsResult.length} proposal views`);
            } catch (error) {
              console.log('⚠️ Error deleting views:', error instanceof Error ? error.message : error);
              // Continue anyway
            }
            
            // Delete proposal status history
            try {
              console.log('🗑️ Deleting proposal status history...');
              const historyResult = await tx
                .delete(proposalStatusHistory)
                .where(eq(proposalStatusHistory.proposalId, proposalId))
                .returning({ id: proposalStatusHistory.id });
              console.log(`✅ Deleted ${historyResult.length} status history records`);
            } catch (error) {
              console.log('⚠️ Error deleting status history:', error instanceof Error ? error.message : error);
            }
            
            // Delete proposal items
            try {
              console.log('🗑️ Deleting proposal items...');
              const itemsResult = await tx
                .delete(proposalItems)
                .where(eq(proposalItems.proposalId, proposalId))
                .returning({ id: proposalItems.id });
              console.log(`✅ Deleted ${itemsResult.length} proposal items`);
            } catch (error) {
              console.log('⚠️ Error deleting items:', error instanceof Error ? error.message : error);
              throw error; // Items are critical, fail if this doesn't work
            }
            
            // Finally, delete proposal (parent record)
            try {
              console.log('🗑️ Deleting proposal...');
              const proposalResult = await tx
                .delete(proposals)
                .where(eq(proposals.id, proposalId))
                .returning({ id: proposals.id });
              console.log(`✅ Deleted ${proposalResult.length} proposal`);
            } catch (error) {
              console.log('❌ Error deleting proposal:', error instanceof Error ? error.message : error);
              throw error; // Main proposal delete is critical
            }
          });
            
          console.log(`✅ Hard delete completed for proposal ${proposalId}`);
        } catch (error) {
          console.error('❌ Hard delete failed:', error);
          throw error;
        }
      } else {
        console.log(`🗑️ Soft deleting proposal ${proposalId}`);
        // Soft delete: just mark as deleted
        await db
          .update(proposals)
          .set({
            deletedAt: now,
            updatedAt: now,
          })
          .where(eq(proposals.id, proposalId));
      }

      // Revalidate the proposals page
      revalidatePath('/proposals');

      return {
        success: true,
        message: canHardDelete ? 'Proposta excluída permanentemente' : 'Proposta excluída com sucesso',
        data: {
          proposalId,
          deletedType: canHardDelete ? 'hard' : 'soft'
        }
      };

    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao excluir proposta'
      );
    }
  },
  {
    rateLimitKey: 'delete-proposal',
    logActivity: true,
  }
);