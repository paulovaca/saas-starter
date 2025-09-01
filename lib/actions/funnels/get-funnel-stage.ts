'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { eq, and } from 'drizzle-orm';

const getFunnelStageSchema = z.object({
  funnelId: z.string().uuid('ID do funil inválido'),
  stageId: z.string().uuid('ID da etapa inválido').optional(),
});

export const getFunnelWithStage = createPermissionAction(
  getFunnelStageSchema,
  Permission.PROPOSAL_READ, // Usando PROPOSAL_READ pois quem pode ver proposta pode ver o funil
  async (input, user) => {
    const { funnelId, stageId } = input;

    console.log('🔍 getFunnelWithStage called with:', { funnelId, stageId, userId: user.id, agencyId: user.agencyId });

    try {
      // Buscar funil
      console.log('🔍 Searching for funnel with ID:', funnelId, 'in agency:', user.agencyId);
      const [funnel] = await db
        .select({
          id: salesFunnels.id,
          name: salesFunnels.name,
          description: salesFunnels.description,
        })
        .from(salesFunnels)
        .where(
          and(
            eq(salesFunnels.id, funnelId),
            eq(salesFunnels.agencyId, user.agencyId)
          )
        );

      console.log('🔍 Funnel query result:', funnel ? 'Found funnel' : 'No funnel found');
      if (funnel) {
        console.log('🔍 Found funnel:', { id: funnel.id, name: funnel.name });
      }

      if (!funnel) {
        console.log('❌ Funnel not found for ID:', funnelId, 'in agency:', user.agencyId);
        return {
          success: false,
          error: 'Funil não encontrado'
        };
      }

      // Buscar etapa específica ou primeira etapa
      let stage = null;
      if (stageId) {
        [stage] = await db
          .select({
            id: salesFunnelStages.id,
            name: salesFunnelStages.name,
            description: salesFunnelStages.description,
            guidelines: salesFunnelStages.guidelines,
            order: salesFunnelStages.order,
            color: salesFunnelStages.color,
          })
          .from(salesFunnelStages)
          .where(
            and(
              eq(salesFunnelStages.id, stageId),
              eq(salesFunnelStages.funnelId, funnelId)
            )
          );
      }

      // Buscar todas as etapas do funil
      const stages = await db
        .select({
          id: salesFunnelStages.id,
          name: salesFunnelStages.name,
          description: salesFunnelStages.description,
          guidelines: salesFunnelStages.guidelines,
          order: salesFunnelStages.order,
          color: salesFunnelStages.color,
        })
        .from(salesFunnelStages)
        .where(eq(salesFunnelStages.funnelId, funnelId))
        .orderBy(salesFunnelStages.order);

      console.log('✅ Returning funnel data:', {
        funnelName: funnel.name,
        currentStageName: stage?.name,
        totalStages: stages.length
      });

      return {
        success: true,
        data: {
          funnel,
          currentStage: stage,
          stages,
        }
      };
    } catch (error) {
      console.error('❌ Error fetching funnel with stage:', error);
      return {
        success: false,
        error: 'Erro ao buscar dados do funil'
      };
    }
  },
  {
    rateLimitKey: 'get-funnel-stage',
    logActivity: false,
  }
);