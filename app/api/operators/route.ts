import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getOperatorsList } from '@/lib/db/queries/operators';

// GET /api/operators - Buscar operadoras
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parâmetros de filtro
    const filters = {
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    const operators = await getOperatorsList(session.user.agencyId, filters);

    return NextResponse.json({ operators });
  } catch (error) {
    console.error('Erro ao buscar operadoras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}