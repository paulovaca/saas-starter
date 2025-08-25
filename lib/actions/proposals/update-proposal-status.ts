'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, clientsNew, bookings } from '@/lib/db/schema';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus } from '@/lib/types/proposal';
import { eq, and } from 'drizzle-orm';
import { getPostSaleStage, generateBookingNumber, getClientName } from '@/lib/actions/funnels/funnel-utils';

const updateProposalStatusSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
  newStatus: z.nativeEnum(ProposalStatus, { message: 'Status inválido' }),
  reason: z.string().optional(),
});

export const updateProposalStatus = createPermissionAction(
  updateProposalStatusSchema,
  Permission.PROPOSAL_EDIT,
  async (input, user) => {
    const { proposalId, newStatus, reason } = input;

    try {
      // Buscar proposta atual
      const currentProposal = await db
        .select()
        .from(proposals)
        .where(and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        ))
        .then(results => results[0]);

      if (!currentProposal) {
        throw new Error('Proposta não encontrada');
      }

      // Atualizar status da proposta
      await db
        .update(proposals)
        .set({
          status: newStatus,
          updatedAt: new Date(),
          notes: reason ? `${currentProposal.notes || ''}\n\nMudança de status: ${reason}` : currentProposal.notes,
        })
        .where(eq(proposals.id, proposalId));

      let bookingId: string | null = null;

      // AUTOMAÇÃO: Se mudou para 'active_booking', criar reserva e atualizar cliente
      if (newStatus === ProposalStatus.APPROVED || newStatus === ProposalStatus.ACTIVE_BOOKING) {
        // Atualizar cliente para 'reserva_ativa' na Jornada Geral
        await db
          .update(clientsNew)
          .set({
            jornadaStage: 'reserva_ativa',
            dealStatus: 'active',
            updatedAt: new Date(),
          })
          .where(and(
            eq(clientsNew.id, currentProposal.clientId),
            eq(clientsNew.agencyId, user.agencyId)
          ));

        // Criar reserva automaticamente
        if (newStatus === ProposalStatus.ACTIVE_BOOKING) {
          // Buscar etapa de pós-venda do funil
          const postSaleStageId = await getPostSaleStage(currentProposal.funnelId);
          const clientName = await getClientName(currentProposal.clientId);
          const bookingNumber = await generateBookingNumber();

          bookingId = crypto.randomUUID();

          await db.insert(bookings).values({
            id: bookingId,
            bookingNumber,
            agencyId: user.agencyId,
            proposalId: currentProposal.id,
            clientId: currentProposal.clientId,
            userId: currentProposal.userId,
            operatorId: currentProposal.operatorId,
            funnelId: currentProposal.funnelId,
            funnelStageId: postSaleStageId,
            status: 'pending_documents',
            totalAmount: currentProposal.totalAmount,
            paidAmount: '0',
            metadata: {
              proposalNumber: currentProposal.proposalNumber,
              clientName,
              totalAmount: currentProposal.totalAmount,
              createdFromProposal: true,
            },
          });

          console.log(`✅ Reserva criada automaticamente: ${bookingNumber} para proposta ${currentProposal.proposalNumber}`);
        }
      }

      // Se foi rejeitada ou expirou, verificar se deve mover cliente para dormente
      if (newStatus === ProposalStatus.REJECTED || newStatus === ProposalStatus.EXPIRED) {
        // Verificar se o cliente tem outras propostas ativas
        const otherActiveProposals = await db
          .select({ id: proposals.id })
          .from(proposals)
          .where(and(
            eq(proposals.clientId, currentProposal.clientId),
            eq(proposals.agencyId, user.agencyId),
            proposals.id.ne(proposalId),
            proposals.status.notIn([ProposalStatus.REJECTED, ProposalStatus.EXPIRED, ProposalStatus.CANCELLED])
          ));

        // Se não há outras propostas ativas, voltar para qualificação
        if (otherActiveProposals.length === 0) {
          await db
            .update(clientsNew)
            .set({
              jornadaStage: 'em_qualificacao',
              updatedAt: new Date(),
            })
            .where(and(
              eq(clientsNew.id, currentProposal.clientId),
              eq(clientsNew.agencyId, user.agencyId)
            ));
        }
      }

      return {
        success: true,
        message: `Status da proposta atualizado para ${newStatus}`,
        data: {
          proposalId,
          previousStatus: currentProposal.status,
          newStatus,
          bookingId,
          clientUpdated: [ProposalStatus.APPROVED, ProposalStatus.ACTIVE_BOOKING].includes(newStatus),
        }
      };

    } catch (error) {
      console.error('Error updating proposal status:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao atualizar status da proposta'
      );
    }
  },
  {
    rateLimitKey: 'update-proposal-status',
    logActivity: true,
  }
);