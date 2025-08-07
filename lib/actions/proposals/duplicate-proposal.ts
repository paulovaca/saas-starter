'use server';

import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalItems, proposalStatusHistory } from '@/lib/db/schema/clients';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus } from '@/lib/types/proposal';

const duplicateProposalSchema = z.object({
  proposalId: z.string().uuid(),
  clientId: z.string().uuid().optional(), // Opcionalmente pode ser para outro cliente
});

export const duplicateProposal = createPermissionAction(
  duplicateProposalSchema,
  Permission.PROPOSAL_CREATE,
  async (input, user) => {
    const { proposalId, clientId } = input;

    // Buscar proposta original
    const [originalProposal] = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.id, proposalId),
          eq(proposals.agencyId, user.agencyId)
        )
      );

    if (!originalProposal) {
      throw new Error('Proposta não encontrada');
    }

    // Buscar itens da proposta original
    const originalItems = await db
      .select()
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, proposalId))
      .orderBy(proposalItems.sortOrder);

    // Gerar novo número de proposta
    const lastProposal = await db
      .select({ proposalNumber: proposals.proposalNumber })
      .from(proposals)
      .where(eq(proposals.agencyId, user.agencyId))
      .orderBy(desc(proposals.createdAt))
      .limit(1);

    let newProposalNumber = 'PROP-0001';
    if (lastProposal.length > 0 && lastProposal[0].proposalNumber) {
      const lastNumber = parseInt(lastProposal[0].proposalNumber.split('-')[1] || '0');
      newProposalNumber = `PROP-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Calcular nova data de validade (30 dias a partir de hoje)
    const newValidUntil = new Date();
    newValidUntil.setDate(newValidUntil.getDate() + 30);

    // Criar nova proposta duplicada
    const [newProposal] = await db
      .insert(proposals)
      .values({
        proposalNumber: newProposalNumber,
        agencyId: user.agencyId,
        clientId: clientId || originalProposal.clientId, // Usar cliente especificado ou o original
        userId: user.id, // Usuário atual como responsável
        operatorId: originalProposal.operatorId,
        status: ProposalStatus.DRAFT, // Sempre começa como rascunho
        subtotal: originalProposal.subtotal,
        discountAmount: originalProposal.discountAmount,
        discountPercent: originalProposal.discountPercent,
        totalAmount: originalProposal.totalAmount,
        commissionAmount: originalProposal.commissionAmount,
        commissionPercent: originalProposal.commissionPercent,
        paymentMethod: originalProposal.paymentMethod,
        validUntil: newValidUntil.toISOString().split('T')[0],
        notes: originalProposal.notes,
        internalNotes: `Duplicada da proposta ${originalProposal.proposalNumber}. ${originalProposal.internalNotes || ''}`.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newProposal) {
      throw new Error('Erro ao criar proposta duplicada');
    }

    // Duplicar itens da proposta
    if (originalItems.length > 0) {
      const newItems = originalItems.map(item => ({
        proposalId: newProposal.id,
        operatorProductId: item.operatorProductId,
        baseItemId: item.baseItemId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        customFields: item.customFields,
        sortOrder: item.sortOrder,
        createdAt: new Date(),
      }));

      await db.insert(proposalItems).values(newItems);
    }

    // Registrar no histórico
    await db.insert(proposalStatusHistory).values({
      proposalId: newProposal.id,
      fromStatus: null,
      toStatus: ProposalStatus.DRAFT,
      changedBy: user.id,
      reason: `Proposta duplicada de ${originalProposal.proposalNumber}`,
      changedAt: new Date(),
    });

    return {
      success: true,
      newProposalId: newProposal.id,
      newProposalNumber: newProposal.proposalNumber,
      message: `Proposta duplicada com sucesso! Nova proposta: ${newProposal.proposalNumber}`,
    };
  },
  {
    rateLimitKey: 'duplicate-proposal',
    logActivity: true,
  }
);

// Ação para buscar dados da proposta para duplicação
export const getProposalForDuplication = createPermissionAction(
  z.object({ proposalId: z.string().uuid() }),
  Permission.PROPOSAL_READ,
  async (input, user) => {
    const { proposalId } = input;

    // Buscar proposta com itens
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

    // Buscar itens
    const items = await db
      .select()
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, proposalId))
      .orderBy(proposalItems.sortOrder);

    return {
      success: true,
      proposal: {
        ...proposal,
        items,
      },
    };
  },
  {
    rateLimitKey: 'get-proposal-duplication',
    logActivity: false,
  }
);