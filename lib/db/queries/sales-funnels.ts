import { eq, and, desc, asc } from 'drizzle-orm';
import { db } from '../drizzle';
import { salesFunnels, salesFunnelStages } from '../schema/funnels';

export interface SalesFunnelWithStages {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  agencyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  stages: Array<{
    id: string;
    name: string;
    description?: string | null;
    guidelines?: string | null;
    color: string;
    order: number;
    isActive: boolean;
    funnelId: string;
  }>;
}

// Buscar funil padrão da agência
export async function getDefaultFunnelForAgency(agencyId: string): Promise<SalesFunnelWithStages | null> {
  try {
    const funnel = await db
      .select()
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.agencyId, agencyId),
          eq(salesFunnels.isDefault, true)
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!funnel) {
      return null;
    }

    // Buscar estágios do funil
    const stages = await db
      .select()
      .from(salesFunnelStages)
      .where(
        and(
          eq(salesFunnelStages.funnelId, funnel.id),
          eq(salesFunnelStages.isActive, true)
        )
      )
      .orderBy(asc(salesFunnelStages.order));

    return {
      ...funnel,
      stages
    };
  } catch (error) {
    console.error('Erro ao buscar funil padrão:', error);
    return null;
  }
}

// Buscar todos os funis da agência
export async function getFunnelsForAgency(agencyId: string): Promise<SalesFunnelWithStages[]> {
  try {
    const funnels = await db
      .select()
      .from(salesFunnels)
      .where(eq(salesFunnels.agencyId, agencyId))
      .orderBy(desc(salesFunnels.isDefault), asc(salesFunnels.name));

    const funnelsWithStages = await Promise.all(
      funnels.map(async (funnel) => {
        const stages = await db
          .select()
          .from(salesFunnelStages)
          .where(
            and(
              eq(salesFunnelStages.funnelId, funnel.id),
              eq(salesFunnelStages.isActive, true)
            )
          )
          .orderBy(asc(salesFunnelStages.order));

        return {
          ...funnel,
          stages
        };
      })
    );

    return funnelsWithStages;
  } catch (error) {
    console.error('Erro ao buscar funis:', error);
    return [];
  }
}

// Buscar estágios de um funil específico
export async function getStagesForFunnel(funnelId: string): Promise<Array<{
  id: string;
  name: string;
  description?: string | null;
  guidelines?: string | null;
  color: string;
  order: number;
  isActive: boolean;
}>> {
  try {
    const stages = await db
      .select()
      .from(salesFunnelStages)
      .where(
        and(
          eq(salesFunnelStages.funnelId, funnelId),
          eq(salesFunnelStages.isActive, true)
        )
      )
      .orderBy(asc(salesFunnelStages.order));

    return stages;
  } catch (error) {
    console.error('Erro ao buscar estágios do funil:', error);
    return [];
  }
}

// Buscar primeiro estágio de um funil
export async function getFirstStageForFunnel(funnelId: string): Promise<{
  id: string;
  name: string;
  description?: string | null;
  guidelines?: string | null;
  color: string;
  order: number;
  isActive: boolean;
} | null> {
  try {
    const stage = await db
      .select()
      .from(salesFunnelStages)
      .where(
        and(
          eq(salesFunnelStages.funnelId, funnelId),
          eq(salesFunnelStages.isActive, true)
        )
      )
      .orderBy(asc(salesFunnelStages.order))
      .limit(1)
      .then(rows => rows[0]);

    return stage || null;
  } catch (error) {
    console.error('Erro ao buscar primeiro estágio do funil:', error);
    return null;
  }
}
