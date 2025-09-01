import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// GET /api/funnels/[funnelId]/stages - Buscar etapas de um funil específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { funnelId } = await params;

    // Verificar se o funil pertence à agência do usuário
    const funnel = await db
      .select({ id: salesFunnels.id })
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.id, funnelId),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(results => results[0]);

    if (!funnel) {
      return NextResponse.json({ error: 'Funil não encontrado' }, { status: 404 });
    }

    // Buscar etapas do funil
    const stages = await db
      .select({
        id: salesFunnelStages.id,
        name: salesFunnelStages.name,
        description: salesFunnelStages.description,
        guidelines: salesFunnelStages.guidelines,
        order: salesFunnelStages.order,
        color: salesFunnelStages.color,
        isActive: salesFunnelStages.isActive,
      })
      .from(salesFunnelStages)
      .where(
        and(
          eq(salesFunnelStages.funnelId, funnelId),
          eq(salesFunnelStages.isActive, true)
        )
      )
      .orderBy(asc(salesFunnelStages.order));

    return NextResponse.json({
      stages,
      total: stages.length,
    });
  } catch (error) {
    console.error('Erro ao buscar etapas do funil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}