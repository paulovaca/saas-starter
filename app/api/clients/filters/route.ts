import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getFunnelsForAgency } from '@/lib/db/queries/sales-funnels';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';

// GET /api/clients/filters - Buscar dados para filtros
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    // Buscar funis e usuários da agência
    const [funnels, agencyUsers] = await Promise.all([
      getFunnelsForAgency(session.user.agencyId),
      db.select({
        id: users.id,
        name: users.name
      }).from(users).where(eq(users.agencyId, session.user.agencyId))
    ]);

    // Extrair estágios dos funis
    const funnelStages = funnels.flatMap(funnel => 
      funnel.stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        funnelId: funnel.id,
        color: stage.color,
        instructions: stage.description
      }))
    );

    return NextResponse.json({
      funnels: funnels.map(funnel => ({
        id: funnel.id,
        name: funnel.name,
        isDefault: funnel.isDefault
      })),
      funnelStages,
      users: agencyUsers.map(user => ({
        id: user.id,
        name: user.name
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar dados de filtro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
