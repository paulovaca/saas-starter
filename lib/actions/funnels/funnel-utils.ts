'use server';

import { db } from '@/lib/db/drizzle';
import { salesFunnelStages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Retorna a primeira etapa de um funil
 * @param funnelId - ID do funil
 * @returns ID da primeira etapa ou null se não encontrada
 */
export async function getFirstStage(funnelId: string): Promise<string | null> {
  const firstStage = await db.query.salesFunnelStages.findFirst({
    where: eq(salesFunnelStages.funnelId, funnelId),
    orderBy: (stages, { asc }) => [asc(stages.order)]
  });

  return firstStage?.id || null;
}

/**
 * Retorna a etapa de pós-venda de um funil
 * Primeiro procura por uma etapa com nome contendo "pós", "pos", "venda" ou "sale"
 * Se não encontrar, retorna a última etapa do funil
 * @param funnelId - ID do funil
 * @returns ID da etapa de pós-venda ou null se não encontrada
 */
export async function getPostSaleStage(funnelId: string): Promise<string | null> {
  // Primeiro, procurar por etapa com nome relacionado a pós-venda
  const postSaleStage = await db.execute(`
    SELECT id FROM sales_funnel_stages 
    WHERE funnel_id = $1 
    AND (
      LOWER(name) LIKE '%pós%venda%' 
      OR LOWER(name) LIKE '%pos%venda%' 
      OR LOWER(name) LIKE '%pós%sale%' 
      OR LOWER(name) LIKE '%pos%sale%'
      OR LOWER(name) LIKE '%post%sale%'
      OR LOWER(name) LIKE '%acompanhamento%'
      OR LOWER(name) LIKE '%follow%up%'
      OR LOWER(name) LIKE '%concluído%'
      OR LOWER(name) LIKE '%finalizado%'
    )
    ORDER BY "order" ASC 
    LIMIT 1
  `, [funnelId]);

  if (postSaleStage && postSaleStage.length > 0) {
    return (postSaleStage[0] as any).id;
  }

  // Se não encontrar, usar a última etapa do funil
  const lastStage = await db.query.salesFunnelStages.findFirst({
    where: eq(salesFunnelStages.funnelId, funnelId),
    orderBy: (stages, { desc }) => [desc(stages.order)]
  });

  return lastStage?.id || null;
}

/**
 * Gera número único de reserva por agência
 * Formato: YYYY-MM-NNNN (Ano-Mês-Número sequencial)
 * @param agencyId - ID da agência
 * @returns Número único de reserva
 */
export async function generateBookingNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-4); // Últimos 4 dígitos do timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  return `${year}${month}${timestamp}${random}`;
}

/**
 * Retorna o nome do cliente por ID
 * @param clientId - ID do cliente
 * @returns Nome do cliente ou null se não encontrado
 */
export async function getClientName(clientId: string): Promise<string | null> {
  const client = await db.execute(`
    SELECT name FROM clients_new WHERE id = $1 LIMIT 1
  `, [clientId]);

  if (client && client.length > 0) {
    return (client[0] as any).name;
  }

  return null;
}

/**
 * Consulta dados de funis para propostas e reservas
 * @param funnelId - ID do funil
 * @returns Array com propostas e reservas do funil
 */
export async function getFunnelData(funnelId: string) {
  const result = await db.execute(`
    SELECT 'proposal' AS entity_type, p.id, p.proposal_number as number, p.funnel_stage_id, p.status
    FROM proposals p
    WHERE p.funnel_id = $1
    UNION
    SELECT 'booking' AS entity_type, b.id, b.booking_number as number, b.funnel_stage_id, b.status
    FROM bookings b
    WHERE b.funnel_id = $1
    ORDER BY number DESC
  `, [funnelId]);

  return result || [];
}

/**
 * Verifica se uma etapa pertence a um funil específico
 * @param stageId - ID da etapa
 * @param funnelId - ID do funil
 * @returns true se a etapa pertence ao funil
 */
export async function validateStageInFunnel(stageId: string, funnelId: string): Promise<boolean> {
  const stage = await db.query.salesFunnelStages.findFirst({
    where: eq(salesFunnelStages.id, stageId)
  });

  return stage?.funnelId === funnelId;
}

/**
 * Lista todas as etapas de um funil em ordem
 * @param funnelId - ID do funil
 * @returns Array com as etapas ordenadas
 */
export async function getFunnelStages(funnelId: string) {
  return await db.query.salesFunnelStages.findMany({
    where: eq(salesFunnelStages.funnelId, funnelId),
    orderBy: (stages, { asc }) => [asc(stages.order)]
  });
}