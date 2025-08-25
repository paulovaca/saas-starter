'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, stageTransitions } from '@/lib/db/schema';
import { bookings } from '@/lib/db/schema/bookings';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { eq, and } from 'drizzle-orm';
import { AppError } from '@/lib/services/error-handler';
import { validateStageInFunnel } from './funnel-utils';

// Schema para mudança manual de etapa de proposta
const updateProposalFunnelStageSchema = z.object({
  proposalId: z.string().uuid('ID da proposta inválido'),
  newFunnelStageId: z.string().uuid('ID da nova etapa inválido'),
  reason: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres')
});

// Schema para mudança manual de etapa de reserva
const updateBookingFunnelStageSchema = z.object({
  bookingId: z.string().uuid('ID da reserva inválido'),
  newFunnelStageId: z.string().uuid('ID da nova etapa inválido'),
  reason: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres')
});

/**
 * Atualiza manualmente a etapa do funil de uma proposta
 */
export const updateProposalFunnelStage = createPermissionAction(
  updateProposalFunnelStageSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId, newFunnelStageId, reason } = input;

    try {
      // Buscar a proposta
      const proposal = await db.query.proposals.findFirst({
        where: and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        )
      });

      if (!proposal) {
        throw new AppError('Proposta não encontrada', 'NOT_FOUND');
      }

      // Verificar permissões - agentes só podem alterar suas próprias propostas
      if (user.role === 'AGENT' && proposal.userId !== user.id) {
        throw new AppError('Você só pode alterar suas próprias propostas', 'FORBIDDEN');
      }

      // Validar se a nova etapa pertence ao mesmo funil da proposta
      if (!(await validateStageInFunnel(newFunnelStageId, proposal.funnelId!))) {
        throw new AppError('A etapa selecionada não pertence ao funil desta proposta', 'INVALID_INPUT');
      }

      // Se já está na mesma etapa, não fazer nada
      if (proposal.funnelStageId === newFunnelStageId) {
        throw new AppError('A proposta já está nesta etapa', 'INVALID_INPUT');
      }

      const oldStageId = proposal.funnelStageId;

      await db.transaction(async (tx) => {
        // Atualizar a etapa da proposta
        await tx
          .update(proposals)
          .set({
            funnelStageId: newFunnelStageId,
            updatedAt: new Date()
          })
          .where(eq(proposals.id, proposalId));

        // Registrar a transição no histórico
        await tx.insert(stageTransitions).values({
          entityType: 'proposal',
          entityId: proposalId,
          fromStageId: oldStageId,
          toStageId: newFunnelStageId,
          userId: user.id,
          reason: reason
        });
      });

      return {
        success: true,
        message: 'Etapa da proposta atualizada com sucesso',
        data: {
          proposalId,
          newFunnelStageId,
          previousStageId: oldStageId
        }
      };

    } catch (error) {
      console.error('Error updating proposal funnel stage:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar etapa da proposta', 'INTERNAL_ERROR');
    }
  },
  {
    rateLimitKey: 'update-proposal-stage',
    logActivity: true,
    activityType: 'proposal.stage_updated'
  }
);

/**
 * Atualiza manualmente a etapa do funil de uma reserva
 */
export const updateBookingFunnelStage = createPermissionAction(
  updateBookingFunnelStageSchema,
  Permission.BOOKING_UPDATE,
  async (input, user) => {
    const { bookingId, newFunnelStageId, reason } = input;

    try {
      // Buscar a reserva
      const booking = await db.query.bookings.findFirst({
        where: and(
          eq(bookings.id, bookingId),
          eq(bookings.agencyId, user.agencyId)
        )
      });

      if (!booking) {
        throw new AppError('Reserva não encontrada', 'NOT_FOUND');
      }

      // Validar se a nova etapa pertence ao mesmo funil da reserva
      if (booking.funnelId && !(await validateStageInFunnel(newFunnelStageId, booking.funnelId))) {
        throw new AppError('A etapa selecionada não pertence ao funil desta reserva', 'INVALID_INPUT');
      }

      // Se já está na mesma etapa, não fazer nada
      if (booking.funnelStageId === newFunnelStageId) {
        throw new AppError('A reserva já está nesta etapa', 'INVALID_INPUT');
      }

      const oldStageId = booking.funnelStageId;

      await db.transaction(async (tx) => {
        // Atualizar a etapa da reserva
        await tx
          .update(bookings)
          .set({
            funnelStageId: newFunnelStageId,
            updatedAt: new Date()
          })
          .where(eq(bookings.id, bookingId));

        // Registrar a transição no histórico
        await tx.insert(stageTransitions).values({
          entityType: 'booking',
          entityId: bookingId,
          fromStageId: oldStageId,
          toStageId: newFunnelStageId,
          userId: user.id,
          reason: reason
        });
      });

      return {
        success: true,
        message: 'Etapa da reserva atualizada com sucesso',
        data: {
          bookingId,
          newFunnelStageId,
          previousStageId: oldStageId
        }
      };

    } catch (error) {
      console.error('Error updating booking funnel stage:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar etapa da reserva', 'INTERNAL_ERROR');
    }
  },
  {
    rateLimitKey: 'update-booking-stage',
    logActivity: true,
    activityType: 'booking.stage_updated'
  }
);

/**
 * Lista o histórico de transições de etapas para uma entidade
 */
const getStageTransitionsSchema = z.object({
  entityType: z.enum(['proposal', 'booking']),
  entityId: z.string().uuid('ID da entidade inválido')
});

export const getStageTransitions = createPermissionAction(
  getStageTransitionsSchema,
  Permission.FUNNEL_VIEW,
  async (input, user) => {
    const { entityType, entityId } = input;

    try {
      const transitions = await db.query.stageTransitions.findMany({
        where: and(
          eq(stageTransitions.entityType, entityType),
          eq(stageTransitions.entityId, entityId)
        ),
        orderBy: (transitions, { desc }) => [desc(transitions.createdAt)],
        with: {
          fromStage: true,
          toStage: true,
          user: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return {
        success: true,
        data: transitions
      };

    } catch (error) {
      console.error('Error getting stage transitions:', error);
      throw new AppError('Erro ao buscar histórico de transições', 'INTERNAL_ERROR');
    }
  },
  {
    rateLimitKey: 'get-stage-transitions',
    logActivity: false
  }
);