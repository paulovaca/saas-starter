import { eq, and, desc } from 'drizzle-orm';
import { db } from '../drizzle';
import { clientInteractions, clientsNew } from '../schema/clients';
import { users } from '../schema/users';
import { InteractionFormInput } from '@/lib/validations/interactions';

export interface InteractionWithUser {
  id: string;
  clientId: string;
  userId: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
  description: string;
  contactDate: Date;
  durationMinutes: number | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Cria uma nova interação para um cliente
 */
export async function createInteraction(
  data: InteractionFormInput,
  clientId: string,
  userId: string,
  agencyId: string
): Promise<InteractionWithUser> {
  // Verificar se o cliente pertence à agência do usuário
  const client = await db
    .select({
      id: clientsNew.id,
      agencyId: clientsNew.agencyId,
    })
    .from(clientsNew)
    .where(
      and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.agencyId, agencyId),
        eq(clientsNew.isActive, true)
      )
    )
    .limit(1);

  if (client.length === 0) {
    throw new Error('Cliente não encontrado ou não pertence à sua agência');
  }

  // Criar a interação
  const [newInteraction] = await db
    .insert(clientInteractions)
    .values({
      clientId,
      userId,
      type: data.type,
      description: data.description,
      contactDate: data.contactDate,
      durationMinutes: data.durationMinutes || null,
    })
    .returning();

  // Buscar a interação com dados do usuário
  const [interactionWithUser] = await db
    .select({
      id: clientInteractions.id,
      clientId: clientInteractions.clientId,
      userId: clientInteractions.userId,
      type: clientInteractions.type,
      description: clientInteractions.description,
      contactDate: clientInteractions.contactDate,
      durationMinutes: clientInteractions.durationMinutes,
      createdAt: clientInteractions.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(clientInteractions)
    .leftJoin(users, eq(clientInteractions.userId, users.id))
    .where(eq(clientInteractions.id, newInteraction.id))
    .limit(1);

  if (!interactionWithUser) {
    throw new Error('Erro ao buscar a interação criada');
  }

  return interactionWithUser;
}

/**
 * Busca interações de um cliente
 */
export async function getClientInteractions(
  clientId: string,
  agencyId: string
): Promise<InteractionWithUser[]> {
  // Verificar se o cliente pertence à agência
  const client = await db
    .select({
      id: clientsNew.id,
    })
    .from(clientsNew)
    .where(
      and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.agencyId, agencyId),
        eq(clientsNew.isActive, true)
      )
    )
    .limit(1);

  if (client.length === 0) {
    throw new Error('Cliente não encontrado ou não pertence à sua agência');
  }

  // Buscar interações
  const interactions = await db
    .select({
      id: clientInteractions.id,
      clientId: clientInteractions.clientId,
      userId: clientInteractions.userId,
      type: clientInteractions.type,
      description: clientInteractions.description,
      contactDate: clientInteractions.contactDate,
      durationMinutes: clientInteractions.durationMinutes,
      createdAt: clientInteractions.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(clientInteractions)
    .leftJoin(users, eq(clientInteractions.userId, users.id))
    .where(eq(clientInteractions.clientId, clientId))
    .orderBy(desc(clientInteractions.contactDate));

  return interactions;
}