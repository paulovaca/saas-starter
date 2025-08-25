import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// GET /api/funnels - Buscar funis de vendas com suas etapas
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    // Buscar funis da agência
    const funnels = await db
      .select({
        id: salesFunnels.id,
        name: salesFunnels.name,
        description: salesFunnels.description,
        isDefault: salesFunnels.isDefault,
      })
      .from(salesFunnels)
      .where(eq(salesFunnels.agencyId, session.user.agencyId))
      .orderBy(asc(salesFunnels.name));

    // Buscar etapas para cada funil
    const funnelsWithStages = await Promise.all(
      funnels.map(async (funnel) => {
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
          .where(eq(salesFunnelStages.funnelId, funnel.id))
          .orderBy(asc(salesFunnelStages.order));

        return {
          ...funnel,
          stages,
        };
      })
    );

    return NextResponse.json({
      funnels: funnelsWithStages,
      total: funnelsWithStages.length,
    });
  } catch (error) {
    console.error('Erro ao buscar funis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}