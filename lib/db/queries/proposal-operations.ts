import { db } from '@/lib/db/drizzle';
import { 
  proposals, 
  proposalItems, 
  proposalStatusHistory 
} from '@/lib/db/schema/clients';
import { operatorItems } from '@/lib/db/schema/operators';
import { eq, and, desc, ilike } from 'drizzle-orm';

interface CreateProposalData {
  agencyId: string;
  clientId: string;
  operatorId: string;
  userId: string;
  validUntil: Date;
  paymentMethod?: string;
  notes?: string;
  items: {
    operatorId: string;
    operatorName: string;
    baseItemId: string;
    baseItemName: string;
    name: string;
    quantity: number;
    unitPrice: number;
    customFields?: Record<string, any>;
  }[];
}

export async function createProposalInDatabase(data: CreateProposalData) {
  return await db.transaction(async (tx) => {
    try {
      // Generate proposal number
      const year = new Date().getFullYear();
      const lastProposal = await tx
        .select({ proposalNumber: proposals.proposalNumber })
        .from(proposals)
        .where(and(
          eq(proposals.agencyId, data.agencyId),
          ilike(proposals.proposalNumber, `${year}/%`)
        ))
        .orderBy(desc(proposals.proposalNumber))
        .limit(1);

      let nextNumber = 1;
      if (lastProposal.length > 0) {
        const lastNumber = parseInt(lastProposal[0].proposalNumber.split('/')[1]);
        nextNumber = lastNumber + 1;
      }

      const proposalNumber = `${year}/${String(nextNumber).padStart(4, '0')}`;

      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalAmount = subtotal; // No discount for now
      const commissionAmount = 0; // TODO: Calculate based on commission rules
      const commissionPercent = 0; // TODO: Calculate based on commission rules

      // Create the main proposal
      const [newProposal] = await tx
        .insert(proposals)
        .values({
          proposalNumber,
          agencyId: data.agencyId,
          clientId: data.clientId,
          userId: data.userId,
          operatorId: data.operatorId,
          status: 'draft',
          subtotal: subtotal.toString(),
          discountAmount: '0',
          discountPercent: '0',
          totalAmount: totalAmount.toString(),
          commissionAmount: commissionAmount.toString(),
          commissionPercent: commissionPercent.toString(),
          paymentMethod: data.paymentMethod,
          validUntil: data.validUntil.toISOString().split('T')[0], // Convert to date string
          notes: data.notes,
        })
        .returning();

      // Create proposal items
      const proposalItemsData = data.items.map((item, index) => ({
        proposalId: newProposal.id,
        operatorProductId: item.baseItemId, // TODO: This should be the actual operator product ID
        baseItemId: item.baseItemId,
        name: item.name,
        description: null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        subtotal: (item.unitPrice * item.quantity).toString(),
        customFields: item.customFields || {},
        sortOrder: index + 1,
      }));

      await tx.insert(proposalItems).values(proposalItemsData);

      // Create initial status history entry
      await tx.insert(proposalStatusHistory).values({
        proposalId: newProposal.id,
        fromStatus: null,
        toStatus: 'draft',
        changedBy: data.userId,
        reason: 'Proposta criada',
      });

      // Return the created proposal with calculated fields
      return {
        id: newProposal.id,
        proposalNumber: newProposal.proposalNumber,
        clientId: newProposal.clientId,
        operatorId: newProposal.operatorId,
        status: newProposal.status,
        totalAmount: parseFloat(newProposal.totalAmount),
        validUntil: newProposal.validUntil,
        paymentMethod: newProposal.paymentMethod,
        notes: newProposal.notes,
        createdAt: newProposal.createdAt,
        userId: newProposal.userId,
        agencyId: newProposal.agencyId,
      };
    } catch (error) {
      console.error('Error creating proposal in database:', error);
      throw new Error('Erro ao criar proposta no banco de dados');
    }
  });
}