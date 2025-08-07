import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { proposalStatusHistory, proposals, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { proposalId } = await params;

    // Verificar se a proposta existe e pertence à agência do usuário
    const [proposal] = await db
      .select({ id: proposals.id, agencyId: proposals.agencyId })
      .from(proposals)
      .where(eq(proposals.id, proposalId));

    if (!proposal) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
    }

    if (proposal.agencyId !== user.agencyId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar histórico de status com informações do usuário que fez a alteração
    const history = await db
      .select({
        id: proposalStatusHistory.id,
        fromStatus: proposalStatusHistory.fromStatus,
        toStatus: proposalStatusHistory.toStatus,
        changedBy: proposalStatusHistory.changedBy,
        changedByName: users.name,
        reason: proposalStatusHistory.reason,
        changedAt: proposalStatusHistory.changedAt,
      })
      .from(proposalStatusHistory)
      .leftJoin(users, eq(proposalStatusHistory.changedBy, users.id))
      .where(eq(proposalStatusHistory.proposalId, proposalId))
      .orderBy(desc(proposalStatusHistory.changedAt));

    return NextResponse.json({
      success: true,
      history: history.map(entry => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedBy: entry.changedBy,
        changedByName: entry.changedByName,
        reason: entry.reason,
        changedAt: entry.changedAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}