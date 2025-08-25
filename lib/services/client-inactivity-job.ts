'use server';

import { db } from '@/lib/db/drizzle';
import { clientsNew, clientInteractions } from '@/lib/db/schema';
import { eq, and, lt, isNull, ne } from 'drizzle-orm';
import { addDays, subDays } from 'date-fns';

/**
 * Job para detectar clientes inativos (30 dias sem interação)
 * Este job deve ser executado diariamente via cron job ou scheduler
 */
export async function detectInactiveClients() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  try {
    console.log('🔍 Iniciando detecção de clientes inativos...');

    // Buscar clientes que:
    // 1. Estão ativos (dealStatus != 'inactive')
    // 2. Não têm interação nos últimos 30 dias
    // 3. Não estão em 'reserva_ativa' (estes devem continuar ativos)
    const inactiveClients = await db
      .select({
        id: clientsNew.id,
        name: clientsNew.name,
        email: clientsNew.email,
        agencyId: clientsNew.agencyId,
        userId: clientsNew.userId,
        jornadaStage: clientsNew.jornadaStage,
        dealStatus: clientsNew.dealStatus,
        updatedAt: clientsNew.updatedAt,
      })
      .from(clientsNew)
      .leftJoin(
        clientInteractions, 
        eq(clientsNew.id, clientInteractions.clientId)
      )
      .where(
        and(
          eq(clientsNew.isActive, true),
          isNull(clientsNew.deletedAt),
          ne(clientsNew.dealStatus, 'inactive'),
          ne(clientsNew.jornadaStage, 'reserva_ativa'), // Clientes com reserva ativa não devem ser marcados como inativos
          // Cliente sem interações OU última interação há mais de 30 dias
          // Note: Esta query pode precisar de ajuste dependendo da estrutura exata
        )
      )
      .groupBy(
        clientsNew.id,
        clientsNew.name,
        clientsNew.email,
        clientsNew.agencyId,
        clientsNew.userId,
        clientsNew.jornadaStage,
        clientsNew.dealStatus,
        clientsNew.updatedAt
      );

    console.log(`📊 Encontrados ${inactiveClients.length} clientes para análise de inatividade`);

    const clientsToUpdate: string[] = [];

    // Verificar cada cliente individualmente para confirmar inatividade
    for (const client of inactiveClients) {
      // Buscar a última interação do cliente
      const lastInteraction = await db
        .select({ contactDate: clientInteractions.contactDate })
        .from(clientInteractions)
        .where(eq(clientInteractions.clientId, client.id))
        .orderBy((interactions, { desc }) => [desc(interactions.contactDate)])
        .limit(1);

      const hasRecentInteraction = lastInteraction.length > 0 && 
        lastInteraction[0].contactDate > thirtyDaysAgo;

      // Se não há interação recente E o cliente não foi atualizado recentemente
      if (!hasRecentInteraction && client.updatedAt < thirtyDaysAgo) {
        clientsToUpdate.push(client.id);
        console.log(`⚠️  Cliente inativo detectado: ${client.name} (ID: ${client.id})`);
      }
    }

    if (clientsToUpdate.length > 0) {
      // Atualizar clientes para status dormente
      const updatedCount = await db
        .update(clientsNew)
        .set({
          jornadaStage: 'lead_dormente',
          dealStatus: 'dormant',
          updatedAt: new Date(),
        })
        .where(and(
          clientsNew.id.in(clientsToUpdate)
        ));

      console.log(`✅ ${clientsToUpdate.length} clientes marcados como dormentes`);
      
      return {
        success: true,
        processed: inactiveClients.length,
        updated: clientsToUpdate.length,
        clientIds: clientsToUpdate,
      };
    } else {
      console.log('✅ Nenhum cliente inativo encontrado');
      return {
        success: true,
        processed: inactiveClients.length,
        updated: 0,
        clientIds: [],
      };
    }

  } catch (error) {
    console.error('❌ Erro ao detectar clientes inativos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      processed: 0,
      updated: 0,
      clientIds: [],
    };
  }
}

/**
 * Reativar um cliente que estava dormente
 */
export async function reactivateClient(clientId: string, userId: string) {
  try {
    const client = await db
      .select()
      .from(clientsNew)
      .where(and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.isActive, true),
        isNull(clientsNew.deletedAt)
      ))
      .then(results => results[0]);

    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    if (client.dealStatus !== 'dormant') {
      throw new Error('Cliente não está dormente');
    }

    // Reativar cliente
    await db
      .update(clientsNew)
      .set({
        jornadaStage: 'em_qualificacao',
        dealStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(clientsNew.id, clientId));

    console.log(`✅ Cliente reativado: ${client.name} (ID: ${clientId})`);

    return {
      success: true,
      client: {
        id: clientId,
        name: client.name,
        previousStage: client.jornadaStage,
        newStage: 'em_qualificacao',
      },
    };

  } catch (error) {
    console.error('❌ Erro ao reativar cliente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Marcar cliente como definitivamente inativo
 */
export async function markClientInactive(clientId: string, userId: string, reason?: string) {
  try {
    const client = await db
      .select()
      .from(clientsNew)
      .where(and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.isActive, true),
        isNull(clientsNew.deletedAt)
      ))
      .then(results => results[0]);

    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // Marcar como inativo
    await db
      .update(clientsNew)
      .set({
        jornadaStage: 'inativo',
        dealStatus: 'inactive',
        notes: reason ? `${client.notes || ''}\n\nMarcado como inativo: ${reason}` : client.notes,
        updatedAt: new Date(),
      })
      .where(eq(clientsNew.id, clientId));

    console.log(`✅ Cliente marcado como inativo: ${client.name} (ID: ${clientId})`);

    return {
      success: true,
      client: {
        id: clientId,
        name: client.name,
        previousStage: client.jornadaStage,
        newStage: 'inativo',
        reason,
      },
    };

  } catch (error) {
    console.error('❌ Erro ao marcar cliente como inativo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}