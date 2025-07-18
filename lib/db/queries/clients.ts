import { eq, and, desc, count, ilike, or, asc, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { clientsNew, clientInteractions, clientTasks, clientTransfers, proposals } from '../schema/clients';
import { users } from '../schema/users';
import { salesFunnels, salesFunnelStages } from '../schema/funnels';
import { ClientFormData, ClientFilters, PaginationOptions } from '@/lib/types/clients';
import { getDefaultFunnelForAgency, getFirstStageForFunnel } from './sales-funnels';

export interface ClientWithRelations {
  id: string;
  agencyId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  birthDate: string | null;
  addressZipcode: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  funnelId: string;
  funnelStageId: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  
  // Relacionamentos
  user: {
    id: string;
    name: string;
    email: string;
  };
  funnel: {
    id: string;
    name: string;
  };
  funnelStage: {
    id: string;
    name: string;
    instructions: string | null;
    color: string;
  };
  totalProposals: number;
  totalValue: number;
  lastInteraction: Date | null;
}

// Buscar clientes com filtros e paginação
export async function getClientsWithFilters(
  agencyId: string, 
  filters: ClientFilters = {}, 
  pagination: PaginationOptions = { page: 1, limit: 10 }
) {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;
  
  // Construir condições WHERE
  let whereConditions = and(
    eq(clientsNew.agencyId, agencyId),
    eq(clientsNew.isActive, true),
    isNull(clientsNew.deletedAt)
  );
  
  // Aplicar filtros
  if (filters.search) {
    whereConditions = and(
      whereConditions,
      or(
        ilike(clientsNew.name, `%${filters.search}%`),
        ilike(clientsNew.email, `%${filters.search}%`),
        ilike(clientsNew.phone, `%${filters.search}%`),
        ilike(clientsNew.documentNumber, `%${filters.search}%`)
      )
    );
  }
  
  if (filters.userId) {
    whereConditions = and(whereConditions, eq(clientsNew.userId, filters.userId));
  }
  
  if (filters.funnelId) {
    whereConditions = and(whereConditions, eq(clientsNew.funnelId, filters.funnelId));
  }
  
  if (filters.funnelStageId) {
    whereConditions = and(whereConditions, eq(clientsNew.funnelStageId, filters.funnelStageId));
  }
  
  // Buscar clientes
  const clients = await db
    .select({
      id: clientsNew.id,
      agencyId: clientsNew.agencyId,
      userId: clientsNew.userId,
      name: clientsNew.name,
      email: clientsNew.email,
      phone: clientsNew.phone,
      documentType: clientsNew.documentType,
      documentNumber: clientsNew.documentNumber,
      birthDate: clientsNew.birthDate,
      addressZipcode: clientsNew.addressZipcode,
      addressStreet: clientsNew.addressStreet,
      addressNumber: clientsNew.addressNumber,
      addressComplement: clientsNew.addressComplement,
      addressNeighborhood: clientsNew.addressNeighborhood,
      addressCity: clientsNew.addressCity,
      addressState: clientsNew.addressState,
      funnelId: clientsNew.funnelId,
      funnelStageId: clientsNew.funnelStageId,
      notes: clientsNew.notes,
      isActive: clientsNew.isActive,
      createdAt: clientsNew.createdAt,
      updatedAt: clientsNew.updatedAt,
      deletedAt: clientsNew.deletedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      funnel: {
        id: salesFunnels.id,
        name: salesFunnels.name,
      },
      funnelStage: {
        id: salesFunnelStages.id,
        name: salesFunnelStages.name,
        instructions: salesFunnelStages.description,
        color: salesFunnelStages.color,
      },
    })
    .from(clientsNew)
    .leftJoin(users, eq(clientsNew.userId, users.id))
    .leftJoin(salesFunnels, eq(clientsNew.funnelId, salesFunnels.id))
    .leftJoin(salesFunnelStages, eq(clientsNew.funnelStageId, salesFunnelStages.id))
    .where(whereConditions)
    .orderBy(desc(clientsNew.createdAt))
    .limit(limit)
    .offset(offset);
  
  // Contar total de clientes
  const totalCount = await db
    .select({ count: count() })
    .from(clientsNew)
    .where(whereConditions)
    .then(results => results[0].count);
  
  return {
    clients,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPreviousPage: page > 1,
  };
}

// Buscar cliente por ID
export async function getClientWithDetails(clientId: string, agencyId: string) {
  const client = await db
    .select({
      id: clientsNew.id,
      agencyId: clientsNew.agencyId,
      userId: clientsNew.userId,
      name: clientsNew.name,
      email: clientsNew.email,
      phone: clientsNew.phone,
      documentType: clientsNew.documentType,
      documentNumber: clientsNew.documentNumber,
      birthDate: clientsNew.birthDate,
      addressZipcode: clientsNew.addressZipcode,
      addressStreet: clientsNew.addressStreet,
      addressNumber: clientsNew.addressNumber,
      addressComplement: clientsNew.addressComplement,
      addressNeighborhood: clientsNew.addressNeighborhood,
      addressCity: clientsNew.addressCity,
      addressState: clientsNew.addressState,
      funnelId: clientsNew.funnelId,
      funnelStageId: clientsNew.funnelStageId,
      notes: clientsNew.notes,
      isActive: clientsNew.isActive,
      createdAt: clientsNew.createdAt,
      updatedAt: clientsNew.updatedAt,
      deletedAt: clientsNew.deletedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      funnel: {
        id: salesFunnels.id,
        name: salesFunnels.name,
      },
      funnelStage: {
        id: salesFunnelStages.id,
        name: salesFunnelStages.name,
        instructions: salesFunnelStages.description,
        color: salesFunnelStages.color,
      },
    })
    .from(clientsNew)
    .leftJoin(users, eq(clientsNew.userId, users.id))
    .leftJoin(salesFunnels, eq(clientsNew.funnelId, salesFunnels.id))
    .leftJoin(salesFunnelStages, eq(clientsNew.funnelStageId, salesFunnelStages.id))
    .where(
      and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.agencyId, agencyId),
        eq(clientsNew.isActive, true),
        isNull(clientsNew.deletedAt)
      )
    )
    .then(results => results[0]);

  if (!client) {
    return null;
  }

  // Buscar interações
  const interactions = await db
    .select({
      id: clientInteractions.id,
      type: clientInteractions.type,
      description: clientInteractions.description,
      contactDate: clientInteractions.contactDate,
      durationMinutes: clientInteractions.durationMinutes,
      user: {
        name: users.name,
        email: users.email,
      },
    })
    .from(clientInteractions)
    .leftJoin(users, eq(clientInteractions.userId, users.id))
    .where(eq(clientInteractions.clientId, clientId))
    .orderBy(desc(clientInteractions.contactDate));

  // Buscar tarefas
  const tasks = await db
    .select({
      id: clientTasks.id,
      title: clientTasks.title,
      description: clientTasks.description,
      priority: clientTasks.priority,
      status: clientTasks.status,
      dueDate: clientTasks.dueDate,
      assignedUser: {
        name: users.name,
      },
    })
    .from(clientTasks)
    .leftJoin(users, eq(clientTasks.assignedTo, users.id))
    .where(eq(clientTasks.clientId, clientId))
    .orderBy(asc(clientTasks.dueDate));

  // Buscar propostas
  const clientProposals = await db
    .select({
      id: proposals.id,
      proposalNumber: proposals.proposalNumber,
      status: proposals.status,
      totalAmount: proposals.totalAmount,
      createdAt: proposals.createdAt,
    })
    .from(proposals)
    .where(eq(proposals.clientId, clientId))
    .orderBy(desc(proposals.createdAt));

  // Buscar transferências
  const transfers = await db
    .select({
      id: clientTransfers.id,
      reason: clientTransfers.reason,
      transferredAt: clientTransfers.transferredAt,
    })
    .from(clientTransfers)
    .where(eq(clientTransfers.clientId, clientId))
    .orderBy(desc(clientTransfers.transferredAt));

  return {
    ...client,
    interactions,
    tasks,
    proposals: clientProposals,
    transfers,
    totalProposals: clientProposals.length,
    totalValue: clientProposals.reduce((sum, p) => sum + Number(p.totalAmount), 0),
    lastInteraction: interactions[0]?.contactDate || null,
  };
}

// Criar cliente
export async function createNewClient(data: ClientFormData, agencyId: string, userId: string) {
  // Buscar funil padrão da agência
  const defaultFunnel = await getDefaultFunnelForAgency(agencyId);
  
  if (!defaultFunnel) {
    throw new Error('Nenhum funil padrão encontrado para a agência. Configure um funil como padrão nas configurações.');
  }

  // Buscar primeira etapa do funil padrão
  const defaultStage = await getFirstStageForFunnel(defaultFunnel.id);
  
  if (!defaultStage) {
    throw new Error('Nenhuma etapa encontrada para o funil padrão');
  }

  // Usar funil e estágio fornecidos nos dados ou usar os padrões
  const funnelId = data.funnelId || defaultFunnel.id;
  const funnelStageId = data.funnelStageId || defaultStage.id;

  // Criar cliente
  const [newClient] = await db
    .insert(clientsNew)
    .values({
      agencyId,
      userId,
      name: data.name,
      email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
      phone: data.phone,
      documentType: data.documentType || 'cpf',
      documentNumber: data.documentNumber && data.documentNumber.trim() !== '' ? data.documentNumber.trim() : null,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : null,
      addressZipcode: data.addressZipcode && data.addressZipcode.trim() !== '' ? data.addressZipcode.trim() : null,
      addressStreet: data.addressStreet && data.addressStreet.trim() !== '' ? data.addressStreet.trim() : null,
      addressNumber: data.addressNumber && data.addressNumber.trim() !== '' ? data.addressNumber.trim() : null,
      addressComplement: data.addressComplement && data.addressComplement.trim() !== '' ? data.addressComplement.trim() : null,
      addressNeighborhood: data.addressNeighborhood && data.addressNeighborhood.trim() !== '' ? data.addressNeighborhood.trim() : null,
      addressCity: data.addressCity && data.addressCity.trim() !== '' ? data.addressCity.trim() : null,
      addressState: data.addressState && data.addressState.trim() !== '' ? data.addressState.trim() : null,
      funnelId,
      funnelStageId,
      notes: data.notes && data.notes.trim() !== '' ? data.notes.trim() : null,
      isActive: data.isActive ?? true,
    })
    .returning();

  return newClient;
}

// Atualizar cliente
export async function updateClientData(clientId: string, data: Partial<ClientFormData>, agencyId: string) {
  // Verificar se o cliente existe e pertence à agência
  const existingClient = await db
    .select({ id: clientsNew.id })
    .from(clientsNew)
    .where(
      and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.agencyId, agencyId),
        eq(clientsNew.isActive, true),
        isNull(clientsNew.deletedAt)
      )
    )
    .then(results => results[0]);

  if (!existingClient) {
    throw new Error('Cliente não encontrado');
  }

  // Atualizar cliente
  const [updatedClient] = await db
    .update(clientsNew)
    .set({
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : undefined,
      updatedAt: new Date(),
    })
    .where(eq(clientsNew.id, clientId))
    .returning();

  return updatedClient;
}

// Deletar cliente (soft delete)
export async function deleteClientData(clientId: string, agencyId: string) {
  const [deletedClient] = await db
    .update(clientsNew)
    .set({
      isActive: false,
      deletedAt: new Date(),
    })
    .where(
      and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.agencyId, agencyId)
      )
    )
    .returning();

  return deletedClient;
}

// Verificar se email é único
export async function isEmailUnique(email: string, agencyId: string, excludeClientId?: string) {
  const conditions = [
    eq(clientsNew.agencyId, agencyId),
    eq(clientsNew.email, email),
    eq(clientsNew.isActive, true),
    isNull(clientsNew.deletedAt)
  ];

  if (excludeClientId) {
    conditions.push(eq(clientsNew.id, excludeClientId));
  }

  const existingClient = await db
    .select({ id: clientsNew.id })
    .from(clientsNew)
    .where(and(...conditions))
    .then(results => results[0]);

  return !existingClient;
}

// Verificar se documento é único
export async function isDocumentUnique(documentNumber: string, agencyId: string, excludeClientId?: string) {
  const conditions = [
    eq(clientsNew.agencyId, agencyId),
    eq(clientsNew.documentNumber, documentNumber),
    eq(clientsNew.isActive, true),
    isNull(clientsNew.deletedAt)
  ];

  if (excludeClientId) {
    conditions.push(eq(clientsNew.id, excludeClientId));
  }

  const existingClient = await db
    .select({ id: clientsNew.id })
    .from(clientsNew)
    .where(and(...conditions))
    .then(results => results[0]);

  return !existingClient;
}
