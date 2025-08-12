import { db } from '@/lib/db/drizzle';
import { 
  proposals, 
  proposalItems, 
  proposalStatusHistory, 
  proposalViews,
  clientsNew 
} from '@/lib/db/schema/clients';
import { users } from '@/lib/db/schema/users';
import { operators } from '@/lib/db/schema/operators';
import { baseItems } from '@/lib/db/schema/catalog';
import { operatorItems } from '@/lib/db/schema/operators';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { ProposalWithRelations } from '@/lib/types/proposals';

/**
 * Get proposal by ID with all related data
 */
export async function getProposalWithRelations(
  proposalId: string,
  agencyId: string,
  userId?: string
): Promise<ProposalWithRelations | null> {
  try {
    console.log('🔍 getProposalWithRelations called with:', { proposalId, agencyId, userId });
    
    // Get proposal with basic relations using manual joins
    const proposalQuery = db
      .select({
        // Proposal fields
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        agencyId: proposals.agencyId,
        clientId: proposals.clientId,
        userId: proposals.userId,
        operatorId: proposals.operatorId,
        status: proposals.status,
        subtotal: proposals.subtotal,
        discountAmount: proposals.discountAmount,
        discountPercent: proposals.discountPercent,
        totalAmount: proposals.totalAmount,
        commissionAmount: proposals.commissionAmount,
        commissionPercent: proposals.commissionPercent,
        paymentMethod: proposals.paymentMethod,
        validUntil: proposals.validUntil,
        notes: proposals.notes,
        internalNotes: proposals.internalNotes,
        sentAt: proposals.sentAt,
        decidedAt: proposals.decidedAt,
        paymentDueAt: proposals.paymentDueAt,
        activatedAt: proposals.activatedAt,
        createdAt: proposals.createdAt,
        updatedAt: proposals.updatedAt,
        deletedAt: proposals.deletedAt,
        // Client fields
        clientName: clientsNew.name,
        clientEmail: clientsNew.email,
        clientDocumentNumber: clientsNew.documentNumber,
        // Operator fields
        operatorName: operators.name,
        // User fields
        userName: users.name,
      })
      .from(proposals)
      .innerJoin(clientsNew, eq(proposals.clientId, clientsNew.id))
      .innerJoin(operators, eq(proposals.operatorId, operators.id))
      .innerJoin(users, eq(proposals.userId, users.id))
      .where(and(
        eq(proposals.id, proposalId),
        eq(proposals.agencyId, agencyId),
        userId ? eq(proposals.userId, userId) : undefined
      ))
      .limit(1);

    const [proposalData] = await proposalQuery;

    console.log('📊 Raw proposal data:', proposalData ? 'Found' : 'Not found');
    if (proposalData) {
      console.log('📋 Raw data preview:', {
        id: proposalData.id,
        clientName: proposalData.clientName,
        operatorName: proposalData.operatorName,
        userName: proposalData.userName
      });
    }

    if (!proposalData) {
      console.log('❌ No proposal found in database');
      return null;
    }

    // Get proposal items
    const items = await db
      .select()
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, proposalId))
      .orderBy(proposalItems.sortOrder);

    // Transform the data to match our interface
    const transformedProposal: ProposalWithRelations = {
      id: proposalData.id,
      proposalNumber: proposalData.proposalNumber,
      agencyId: proposalData.agencyId,
      clientId: proposalData.clientId,
      userId: proposalData.userId,
      operatorId: proposalData.operatorId,
      status: proposalData.status,
      subtotal: proposalData.subtotal,
      discountAmount: proposalData.discountAmount,
      discountPercent: proposalData.discountPercent,
      totalAmount: proposalData.totalAmount,
      commissionAmount: proposalData.commissionAmount,
      commissionPercent: proposalData.commissionPercent,
      paymentMethod: proposalData.paymentMethod,
      validUntil: proposalData.validUntil,
      notes: proposalData.notes,
      internalNotes: proposalData.internalNotes,
      sentAt: proposalData.sentAt,
      decidedAt: proposalData.decidedAt,
      paymentDueAt: proposalData.paymentDueAt,
      activatedAt: proposalData.activatedAt,
      approvedAt: null,
      contractAt: null,
      cancelledAt: null,
      contractData: null,
      contractUrl: null,
      approvalEvidence: null,
      rejectionReason: null,
      cancellationReason: null,
      createdAt: proposalData.createdAt,
      updatedAt: proposalData.updatedAt,
      deletedAt: proposalData.deletedAt,
      client: {
        id: proposalData.clientId,
        name: proposalData.clientName,
        email: proposalData.clientEmail || '',
        documentNumber: proposalData.clientDocumentNumber || '',
      },
      operator: {
        id: proposalData.operatorId,
        name: proposalData.operatorName,
      },
      user: {
        id: proposalData.userId,
        name: proposalData.userName,
      },
      items: items.map(item => ({
        id: item.id,
        proposalId: item.proposalId,
        operatorProductId: item.operatorProductId,
        baseItemId: item.baseItemId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        customFields: item.customFields as Record<string, any> || {},
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
      }))
    };

    console.log('✅ Returning transformed proposal:', {
      id: transformedProposal.id,
      clientName: transformedProposal.client?.name,
      operatorName: transformedProposal.operator?.name,
      userName: transformedProposal.user?.name,
      keys: Object.keys(transformedProposal)
    });
    return transformedProposal;

  } catch (error) {
    console.error('❌ Error fetching proposal with relations:', error);
    return null;
  }
}

/**
 * Get proposal timeline events
 */
export async function getProposalTimeline(proposalId: string, agencyId: string) {
  try {
    // Get status history
    const statusHistory = await db.query.proposalStatusHistory.findMany({
      where: eq(proposalStatusHistory.proposalId, proposalId),
      orderBy: [desc(proposalStatusHistory.changedAt)],
      with: {
        changedByUser: {
          columns: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Get views
    const views = await db.query.proposalViews.findMany({
      where: eq(proposalViews.proposalId, proposalId),
      orderBy: [desc(proposalViews.viewedAt)],
      limit: 10 // Only get recent views
    });

    // Combine and sort events
    const events = [
      // Status changes
      ...statusHistory.map(history => ({
        id: `status-${history.id}`,
        type: 'status_change' as const,
        title: getStatusChangeTitle(history.fromStatus, history.toStatus),
        description: history.reason || undefined,
        timestamp: history.changedAt,
        user: {
          name: history.changedByUser?.name || 'Sistema',
          role: 'Agente' // TODO: Get actual role
        },
        status: history.toStatus,
        metadata: {
          fromStatus: history.fromStatus,
          toStatus: history.toStatus
        }
      })),
      // Views (simplified - we don't have user info for views)
      ...views.map(view => ({
        id: `view-${view.id}`,
        type: 'view' as const,
        title: 'Proposta visualizada',
        description: 'Cliente visualizou a proposta pelo link',
        timestamp: view.viewedAt,
        user: {
          name: 'Cliente',
          role: 'Cliente'
        },
        metadata: {
          ipAddress: view.ipAddress,
          userAgent: view.userAgent
        }
      }))
    ];

    // Sort by timestamp (most recent first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return events;

  } catch (error) {
    console.error('Error fetching proposal timeline:', error);
    return [];
  }
}

/**
 * Get proposals list with pagination and filters
 */
export async function getProposalsList(
  agencyId: string,
  userId?: string,
  filters?: {
    status?: string;
    clientId?: string;
    operatorId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(proposals.agencyId, agencyId)];

    // If user is an agent, only show their proposals
    if (userId) {
      // TODO: Check user role and apply filter accordingly
      // For now, we'll show all proposals
    }

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      whereConditions.push(eq(proposals.status, filters.status as any));
    }

    if (filters?.clientId) {
      whereConditions.push(eq(proposals.clientId, filters.clientId));
    }

    if (filters?.operatorId) {
      whereConditions.push(eq(proposals.operatorId, filters.operatorId));
    }

    // Use manual joins instead of query builder with relations
    const proposalsList = await db
      .select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        totalAmount: proposals.totalAmount,
        status: proposals.status,
        createdAt: proposals.createdAt,
        validUntil: proposals.validUntil,
        clientName: clientsNew.name,
        operatorName: operators.name,
        userName: users.name,
      })
      .from(proposals)
      .innerJoin(clientsNew, eq(proposals.clientId, clientsNew.id))
      .innerJoin(operators, eq(proposals.operatorId, operators.id))
      .innerJoin(users, eq(proposals.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(proposals.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to list format
    const transformedProposals = proposalsList.map(proposal => ({
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      clientName: proposal.clientName,
      operatorName: proposal.operatorName,
      totalAmount: parseFloat(proposal.totalAmount),
      status: proposal.status,
      createdAt: proposal.createdAt,
      validUntil: proposal.validUntil,
      userName: proposal.userName,
    }));

    return transformedProposals;

  } catch (error) {
    console.error('Error fetching proposals list:', error);
    return [];
  }
}

/**
 * Helper function to get status change title
 */
function getStatusChangeTitle(fromStatus: string | null, toStatus: string): string {
  if (!fromStatus) {
    return 'Proposta criada';
  }

  const statusTitles: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Proposta enviada',
    accepted: 'Proposta aceita',
    rejected: 'Proposta recusada',
    expired: 'Proposta expirada'
  };

  return statusTitles[toStatus] || `Status alterado para ${toStatus}`;
}

/**
 * Check if user can access proposal
 */
export async function canUserAccessProposal(proposalId: string, userId: string, userRole: string): Promise<boolean> {
  try {
    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId),
      columns: {
        userId: true,
        agencyId: true,
      }
    });

    if (!proposal) {
      return false;
    }

    // Agents can only access their own proposals
    if (userRole === 'AGENT') {
      return proposal.userId === userId;
    }

    // Admin and Master can access all proposals in their agency
    return true;

  } catch (error) {
    console.error('Error checking proposal access:', error);
    return false;
  }
}