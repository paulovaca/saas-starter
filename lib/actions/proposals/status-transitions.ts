'use server';

import { eq, and, lte } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalStatusHistory } from '@/lib/db/schema/clients';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { 
  ProposalStatus, 
  isValidTransition, 
  requiresReason,
  type ProposalStatusType,
  type ContractData
} from '@/lib/types/proposal';

// Schema para transição de status
const transitionStatusSchema = z.object({
  proposalId: z.string().uuid(),
  toStatus: z.enum([
    ProposalStatus.DRAFT,
    ProposalStatus.SENT,
    ProposalStatus.APPROVED,
    ProposalStatus.CONTRACT,
    ProposalStatus.REJECTED,
    ProposalStatus.EXPIRED,
    ProposalStatus.AWAITING_PAYMENT,
    ProposalStatus.ACTIVE_BOOKING,
    ProposalStatus.CANCELLED,
  ] as const),
  reason: z.string().optional(),
});

// Schema para aprovar proposta
const approveProposalSchema = z.object({
  proposalId: z.string().uuid(),
});

// Schema para rejeitar proposta
const rejectProposalSchema = z.object({
  proposalId: z.string().uuid(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

// Schema para cancelar proposta
const cancelProposalSchema = z.object({
  proposalId: z.string().uuid(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

// Schema para enviar proposta
const sendProposalSchema = z.object({
  proposalId: z.string().uuid(),
});

// Schema para reativar proposta
const reactivateProposalSchema = z.object({
  proposalId: z.string().uuid(),
});

// Schema para atualizar dados do contrato
const updateContractDataSchema = z.object({
  proposalId: z.string().uuid(),
  contractData: z.object({
    fullName: z.string().optional(),
    documentNumber: z.string().optional(),
    documentType: z.enum(['cpf', 'cnpj']).optional(),
    birthDate: z.string().optional(),
    address: z.object({
      zipcode: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    }).optional(),
    travelDetails: z.object({
      departureDate: z.string().optional(),
      returnDate: z.string().optional(),
      destination: z.string().optional(),
      numberOfPassengers: z.number().optional(),
      specialRequests: z.string().optional(),
    }).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    }).optional(),
  }).passthrough(),
  contractUrl: z.string().optional(),
  approvalEvidence: z.string().optional(),
});

// Schema para confirmar pagamento
const confirmPaymentSchema = z.object({
  proposalId: z.string().uuid(),
  paymentMethod: z.string().optional(),
});

// Função genérica para transição de status
export const transitionProposalStatus = createPermissionAction(
  transitionStatusSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId, toStatus, reason } = input;

    // Se for transição para ACTIVE_BOOKING, usar changeProposalStatus que tem a trigger
    if (toStatus === ProposalStatus.ACTIVE_BOOKING) {
      const { changeProposalStatus } = await import('./change-status');
      return changeProposalStatus({
        proposalId,
        newStatus: ProposalStatus.ACTIVE_BOOKING,
        reason: reason || 'Transição para reserva ativa',
      });
    }

    // Buscar proposta atual
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        )
      );

    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    const fromStatus = proposal.status as ProposalStatusType;

    // Verificar se a transição é válida
    if (!isValidTransition(fromStatus, toStatus)) {
      throw new Error(`Transição inválida de ${fromStatus} para ${toStatus}`);
    }

    // Verificar se precisa de motivo
    if (requiresReason(toStatus) && !reason) {
      throw new Error(`Motivo é obrigatório para o status ${toStatus}`);
    }

    // Preparar dados de atualização
    const updateData: any = {
      status: toStatus,
      updatedAt: new Date(),
    };

    // Adicionar campos específicos baseados no status
    switch (toStatus) {
      case ProposalStatus.SENT:
        updateData.sentAt = new Date();
        break;
      case ProposalStatus.APPROVED:
        updateData.approvedAt = new Date();
        break;
      case ProposalStatus.CONTRACT:
        updateData.contractAt = new Date();
        break;
      case ProposalStatus.REJECTED:
        updateData.decidedAt = new Date();
        updateData.rejectionReason = reason;
        break;
      case ProposalStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = reason;
        break;
    }

    // Atualizar proposta
    await db
      .update(proposals)
      .set(updateData)
      .where(eq(proposals.id, proposalId));

    // Registrar no histórico
    await db.insert(proposalStatusHistory).values({
      proposalId,
      fromStatus,
      toStatus,
      changedBy: user.id,
      reason,
      changedAt: new Date(),
    });

    return { success: true, newStatus: toStatus };
  },
  {
    rateLimitKey: 'transition-proposal-status',
    logActivity: true,
  }
);

// Ação para enviar proposta
export const sendProposal = createPermissionAction(
  sendProposalSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    return transitionProposalStatus({
      proposalId: input.proposalId,
      toStatus: ProposalStatus.SENT,
    });
  },
  {
    rateLimitKey: 'send-proposal',
    logActivity: true,
  }
);

// Ação para aprovar proposta
export const approveProposal = createPermissionAction(
  approveProposalSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const result = await transitionProposalStatus({
      proposalId: input.proposalId,
      toStatus: ProposalStatus.APPROVED,
    });
    
    // Automaticamente transicionar para contrato
    if (result.success) {
      await transitionProposalStatus({
        proposalId: input.proposalId,
        toStatus: ProposalStatus.CONTRACT,
      });
    }
    
    return { success: true, newStatus: ProposalStatus.CONTRACT };
  },
  {
    rateLimitKey: 'approve-proposal',
    logActivity: true,
  }
);

// Ação para rejeitar proposta
export const rejectProposal = createPermissionAction(
  rejectProposalSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    return transitionProposalStatus({
      proposalId: input.proposalId,
      toStatus: ProposalStatus.REJECTED,
      reason: input.reason,
    });
  },
  {
    rateLimitKey: 'reject-proposal',
    logActivity: true,
  }
);

// Ação para cancelar proposta
export const cancelProposal = createPermissionAction(
  cancelProposalSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    return transitionProposalStatus({
      proposalId: input.proposalId,
      toStatus: ProposalStatus.CANCELLED,
      reason: input.reason,
    });
  },
  {
    rateLimitKey: 'cancel-proposal',
    logActivity: true,
  }
);

// Ação para reativar proposta (de expirada ou recusada)
export const reactivateProposal = createPermissionAction(
  reactivateProposalSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId } = input;

    // Buscar proposta atual
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        )
      );

    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    const currentStatus = proposal.status as ProposalStatusType;

    // Verificar se pode ser reativada
    if (currentStatus !== ProposalStatus.EXPIRED && currentStatus !== ProposalStatus.REJECTED) {
      throw new Error('Apenas propostas expiradas ou recusadas podem ser reativadas');
    }

    return transitionProposalStatus({
      proposalId,
      toStatus: ProposalStatus.DRAFT,
      reason: 'Proposta reativada',
    });
  },
  {
    rateLimitKey: 'reactivate-proposal',
    logActivity: true,
  }
);

// Ação para atualizar dados do contrato
export const updateContractData = createPermissionAction(
  updateContractDataSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId, contractData, contractUrl, approvalEvidence } = input;

    // Buscar proposta atual
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        )
      );

    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    // Verificar se está no status correto
    if (proposal.status !== ProposalStatus.CONTRACT) {
      throw new Error('Proposta precisa estar no status Contrato para atualizar dados');
    }

    // Atualizar dados do contrato
    await db
      .update(proposals)
      .set({
        contractData,
        contractUrl,
        approvalEvidence,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, proposalId));

    return { success: true };
  },
  {
    rateLimitKey: 'update-contract-data',
    logActivity: true,
  }
);

// Ação para confirmar pagamento e ativar reserva
export const confirmPayment = createPermissionAction(
  confirmPaymentSchema,
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    const { proposalId, paymentMethod } = input;

    // Buscar proposta atual
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        )
      );

    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    // Verificar se está aguardando pagamento
    if (proposal.status !== ProposalStatus.AWAITING_PAYMENT) {
      throw new Error('Proposta precisa estar aguardando pagamento');
    }

    // Atualizar método de pagamento se fornecido
    if (paymentMethod) {
      await db
        .update(proposals)
        .set({ paymentMethod })
        .where(eq(proposals.id, proposalId));
    }

    // Transicionar para reserva ativa usando change-status que tem a trigger
    const { changeProposalStatus } = await import('./change-status');
    
    // Usar a função que tem a trigger de criação de booking
    const result = await changeProposalStatus({
      proposalId,
      newStatus: ProposalStatus.ACTIVE_BOOKING,
      reason: 'Pagamento confirmado',
    });

    return result;
  },
  {
    rateLimitKey: 'confirm-payment',
    logActivity: true,
  }
);

// Ação para marcar proposta como aguardando pagamento
export const setAwaitingPayment = createPermissionAction(
  z.object({ proposalId: z.string().uuid() }),
  Permission.PROPOSAL_UPDATE,
  async (input, user) => {
    return transitionProposalStatus({
      proposalId: input.proposalId,
      toStatus: ProposalStatus.AWAITING_PAYMENT,
    });
  },
  {
    rateLimitKey: 'set-awaiting-payment',
    logActivity: true,
  }
);

// Função para verificar e expirar propostas automaticamente
export async function expireProposals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Buscar propostas enviadas que passaram da validade
  const expiredProposals = await db
    .select()
    .from(proposals)
    .where(
      and(
        eq(proposals.status, ProposalStatus.SENT),
        lte(proposals.validUntil, today.toISOString().split('T')[0])
      )
    );

  // Expirar cada proposta
  for (const proposal of expiredProposals) {
    await db
      .update(proposals)
      .set({
        status: ProposalStatus.EXPIRED,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, proposal.id));

    // Registrar no histórico
    await db.insert(proposalStatusHistory).values({
      proposalId: proposal.id,
      fromStatus: ProposalStatus.SENT,
      toStatus: ProposalStatus.EXPIRED,
      changedBy: 'system', // ID especial para ações do sistema
      reason: 'Expirado automaticamente por prazo de validade',
      changedAt: new Date(),
    });
  }

  return { expiredCount: expiredProposals.length };
}