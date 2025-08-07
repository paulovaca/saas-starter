import { eq, and, lte, gte } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalStatusHistory } from '@/lib/db/schema/clients';
import { ProposalStatus } from '@/lib/types/proposal';

/**
 * Serviço para expirar propostas automaticamente
 * Deve ser executado diariamente via cron job
 */
export class ProposalExpirationService {
  /**
   * Executa a verificação e expiração de propostas
   */
  static async expireProposals(): Promise<{
    success: boolean;
    expiredCount: number;
    errors: Array<{ proposalId: string; error: string }>;
  }> {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final do dia
    
    const errors: Array<{ proposalId: string; error: string }> = [];
    let expiredCount = 0;

    try {
      console.log(`🕐 [EXPIRE-SERVICE] Iniciando verificação de propostas - ${today.toISOString()}`);

      // Buscar propostas enviadas que passaram da validade
      const expiredProposals = await db
        .select({
          id: proposals.id,
          proposalNumber: proposals.proposalNumber,
          validUntil: proposals.validUntil,
          agencyId: proposals.agencyId,
        })
        .from(proposals)
        .where(
          and(
            eq(proposals.status, ProposalStatus.SENT),
            lte(proposals.validUntil, today.toISOString().split('T')[0])
          )
        );

      console.log(`📋 [EXPIRE-SERVICE] Encontradas ${expiredProposals.length} propostas para expirar`);

      // Expirar cada proposta em uma transação
      for (const proposal of expiredProposals) {
        try {
          await db.transaction(async (tx) => {
            // Atualizar status da proposta
            await tx
              .update(proposals)
              .set({
                status: ProposalStatus.EXPIRED,
                updatedAt: new Date(),
              })
              .where(eq(proposals.id, proposal.id));

            // Registrar no histórico
            await tx.insert(proposalStatusHistory).values({
              proposalId: proposal.id,
              fromStatus: ProposalStatus.SENT,
              toStatus: ProposalStatus.EXPIRED,
              changedBy: 'system', // ID especial para ações do sistema
              reason: 'Expirada automaticamente por prazo de validade',
              changedAt: new Date(),
            });
          });

          expiredCount++;
          console.log(`✅ [EXPIRE-SERVICE] Proposta ${proposal.proposalNumber} expirada com sucesso`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`❌ [EXPIRE-SERVICE] Erro ao expirar proposta ${proposal.proposalNumber}:`, error);
          
          errors.push({
            proposalId: proposal.id,
            error: errorMessage,
          });
        }
      }

      console.log(`🎯 [EXPIRE-SERVICE] Processamento concluído: ${expiredCount} expiradas, ${errors.length} erros`);

      return {
        success: true,
        expiredCount,
        errors,
      };
    } catch (error) {
      console.error('❌ [EXPIRE-SERVICE] Erro geral no serviço de expiração:', error);
      
      return {
        success: false,
        expiredCount: 0,
        errors: [{
          proposalId: 'general',
          error: error instanceof Error ? error.message : 'Erro interno do serviço',
        }],
      };
    }
  }

  /**
   * Verifica quais propostas estão prestes a expirar (nos próximos N dias)
   */
  static async getProposalsNearExpiration(daysAhead: number = 3): Promise<Array<{
    id: string;
    proposalNumber: string;
    validUntil: string;
    daysUntilExpiration: number;
    agencyId: string;
    clientId: string;
  }>> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    const nearExpirationProposals = await db
      .select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        validUntil: proposals.validUntil,
        agencyId: proposals.agencyId,
        clientId: proposals.clientId,
      })
      .from(proposals)
      .where(
        and(
          eq(proposals.status, ProposalStatus.SENT),
          lte(proposals.validUntil, futureDate.toISOString().split('T')[0])
        )
      );

    return nearExpirationProposals.map(proposal => {
      const validUntil = new Date(proposal.validUntil + 'T23:59:59');
      const daysUntilExpiration = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...proposal,
        daysUntilExpiration: Math.max(0, daysUntilExpiration),
      };
    });
  }

  /**
   * Obtém estatísticas de propostas expiradas
   */
  static async getExpirationStats(agencyId?: string): Promise<{
    totalExpired: number;
    expiredThisMonth: number;
    expiredToday: number;
  }> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const baseFilter = eq(proposals.status, ProposalStatus.EXPIRED);
    const agencyFilter = agencyId ? eq(proposals.agencyId, agencyId) : undefined;

    const whereClause = agencyFilter 
      ? and(baseFilter, agencyFilter)
      : baseFilter;

    // Total de propostas expiradas
    const totalExpiredResult = await db
      .select({ count: proposals.id })
      .from(proposals)
      .where(whereClause);

    // Expiradas neste mês
    const expiredThisMonthResult = await db
      .select({ count: proposals.id })
      .from(proposals)
      .where(
        agencyFilter
          ? and(baseFilter, agencyFilter, lte(proposals.updatedAt, endOfDay))
          : and(baseFilter, lte(proposals.updatedAt, endOfDay))
      );

    // Expiradas hoje
    const expiredTodayResult = await db
      .select({ count: proposals.id })
      .from(proposals)
      .where(
        agencyFilter
          ? and(
              baseFilter,
              agencyFilter,
              lte(proposals.updatedAt, endOfDay),
              gte(proposals.updatedAt, startOfDay)
            )
          : and(
              baseFilter,
              lte(proposals.updatedAt, endOfDay),
              gte(proposals.updatedAt, startOfDay)
            )
      );

    return {
      totalExpired: totalExpiredResult.length,
      expiredThisMonth: expiredThisMonthResult.length,
      expiredToday: expiredTodayResult.length,
    };
  }
}

// Função de conveniência para uso direto
export const expireProposals = ProposalExpirationService.expireProposals;
export const getProposalsNearExpiration = ProposalExpirationService.getProposalsNearExpiration;
export const getExpirationStats = ProposalExpirationService.getExpirationStats;