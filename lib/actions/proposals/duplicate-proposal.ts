'use server';

import { eq, and, desc, sql } from 'drizzle-orm';
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

    // Gerar novo número de proposta (mesmo formato da criação)
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Buscar último número da proposta do ano/mês atual
    const lastProposal = await db.execute(sql`
      SELECT proposal_number FROM proposals 
      WHERE agency_id = ${user.agencyId} AND proposal_number LIKE ${`${currentYear}/${currentMonth}%`}
      ORDER BY proposal_number DESC LIMIT 1
    `);

    let nextNumber = 1;
    if (lastProposal && lastProposal.length > 0) {
      const lastNumber = (lastProposal[0] as any).proposal_number.split('/')[2];
      nextNumber = parseInt(lastNumber) + 1;
    }

    const newProposalNumber = `${currentYear}/${currentMonth.padStart(2, '0')}/${String(nextNumber).padStart(4, '0')}`;

    // Calcular nova data de validade (30 dias a partir de hoje)
    const newValidUntil = new Date();
    newValidUntil.setDate(newValidUntil.getDate() + 30);

    // Criar nova proposta duplicada usando SQL direto (mesmo padrão da criação)
    const proposalId = crypto.randomUUID();
    const targetClientId = clientId || originalProposal.clientId;
    
    await db.execute(sql`
      INSERT INTO proposals (
        id, proposal_number, agency_id, client_id, user_id, operator_id, 
        funnel_id, funnel_stage_id, status, subtotal, discount_amount, discount_percent,
        total_amount, commission_amount, commission_percent, payment_method, valid_until, 
        notes, internal_notes, created_at, updated_at
      ) VALUES (
        ${proposalId}, ${newProposalNumber}, ${user.agencyId}, ${targetClientId}, ${user.id}, ${originalProposal.operatorId},
        ${originalProposal.funnelId}, ${originalProposal.funnelStageId}, ${ProposalStatus.DRAFT}, 
        ${originalProposal.subtotal?.toString() || '0'}, ${originalProposal.discountAmount?.toString() || '0'}, 
        ${originalProposal.discountPercent?.toString() || '0'}, ${originalProposal.totalAmount?.toString() || '0'}, 
        ${originalProposal.commissionAmount?.toString() || '0'}, ${originalProposal.commissionPercent?.toString() || '0'}, 
        ${originalProposal.paymentMethod || null}, ${newValidUntil.toISOString().split('T')[0]}, 
        ${originalProposal.notes || null}, 
        ${`Duplicada da proposta ${originalProposal.proposalNumber}. ${originalProposal.internalNotes || ''}`.trim()},
        NOW(), NOW()
      )
    `);

    const newProposal = { 
      id: proposalId, 
      proposalNumber: newProposalNumber 
    };

    // Duplicar itens da proposta usando SQL direto
    for (const item of originalItems) {
      await db.execute(sql`
        INSERT INTO proposal_items (
          id, proposal_id, operator_product_id, base_item_id, name, description,
          quantity, unit_price, subtotal, custom_fields, sort_order, created_at
        ) VALUES (
          ${crypto.randomUUID()}, ${proposalId}, ${item.operatorProductId || null}, 
          ${item.baseItemId || null}, ${item.name}, ${item.description || null},
          ${item.quantity}, ${item.unitPrice?.toString() || '0'}, 
          ${item.subtotal?.toString() || '0'}, ${JSON.stringify(item.customFields || {})}, 
          ${item.sortOrder}, NOW()
        )
      `);
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