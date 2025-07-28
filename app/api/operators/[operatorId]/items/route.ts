import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getBaseItemsByOperator } from '@/lib/db/queries/catalog';

// GET /api/operators/[operatorId]/items - Buscar itens base de uma operadora
export async function GET(
  request: NextRequest,
  { params }: { params: { operatorId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { operatorId } = params;

    if (!operatorId) {
      return NextResponse.json({ error: 'ID da operadora é obrigatório' }, { status: 400 });
    }

    const items = await getBaseItemsByOperator(operatorId, session.user.agencyId);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Erro ao buscar itens da operadora:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}