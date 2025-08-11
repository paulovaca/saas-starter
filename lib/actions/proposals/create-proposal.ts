'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalItems } from '@/lib/db/schema/clients';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { ProposalStatus } from '@/lib/types/proposal';
import { sql } from 'drizzle-orm';

// Schema para validar os dados de criação da proposta
const createProposalSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  operatorId: z.string().uuid('ID da operadora inválido'),
  validUntil: z.string().refine(date => !isNaN(Date.parse(date)), 'Data inválida'),
  items: z.array(z.object({
    baseItemId: z.string().uuid().optional(),
    operatorProductId: z.string().uuid().optional(),
    name: z.string().min(1, 'Nome do item é obrigatório'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    unitPrice: z.number().min(0, 'Preço unitário deve ser positivo'),
    customFields: z.record(z.any()).optional(),
  })).min(1, 'Pelo menos um item é obrigatório'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const createProposal = createPermissionAction(
  createProposalSchema,
  Permission.PROPOSAL_CREATE,
  async (input, user) => {
    const { clientId, operatorId, validUntil, items, paymentMethod, notes } = input;

    try {
      // Calcular totais
      let subtotal = 0;
      const processedItems = items.map((item, index) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        subtotal += itemSubtotal;
        
        return {
          ...item,
          subtotal: itemSubtotal,
          sortOrder: index + 1,
        };
      });

      // Gerar número da proposta
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Buscar último número da proposta do ano/mês atual usando sql
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

      const proposalNumber = `${currentYear}/${currentMonth.padStart(2, '0')}/${String(nextNumber).padStart(4, '0')}`;

      // Inserir proposta usando SQL direto
      const proposalId = crypto.randomUUID();
      
      await db.execute(sql`
        INSERT INTO proposals (
          id, proposal_number, agency_id, client_id, user_id, operator_id, 
          status, subtotal, total_amount, commission_amount, commission_percent,
          payment_method, valid_until, notes, created_at, updated_at
        ) VALUES (
          ${proposalId}, ${proposalNumber}, ${user.agencyId}, ${clientId}, ${user.id}, ${operatorId},
          ${ProposalStatus.DRAFT}, ${subtotal.toString()}, ${subtotal.toString()}, ${'0'}, ${'0'},
          ${paymentMethod || null}, ${validUntil}, ${notes || null}, NOW(), NOW()
        )
      `);

      // Inserir itens da proposta
      for (const item of processedItems) {
        await db.execute(sql`
          INSERT INTO proposal_items (
            id, proposal_id, base_item_id, name, quantity, unit_price, 
            subtotal, custom_fields, sort_order, created_at
          ) VALUES (
            ${crypto.randomUUID()}, ${proposalId}, ${item.baseItemId || null}, 
            ${item.name}, ${item.quantity}, ${item.unitPrice.toString()}, 
            ${item.subtotal.toString()}, ${JSON.stringify(item.customFields || {})}, 
            ${item.sortOrder}, NOW()
          )
        `);
      }

      const result = { id: proposalId, proposalNumber };

      return {
        success: true,
        message: `Proposta ${proposalNumber} criada com sucesso`,
        data: {
          proposalId: result.id,
          proposalNumber: result.proposalNumber,
          totalAmount: subtotal,
        }
      };

    } catch (error) {
      console.error('Error creating proposal:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao criar proposta'
      );
    }
  },
  {
    rateLimitKey: 'create-proposal',
    logActivity: true,
  }
);