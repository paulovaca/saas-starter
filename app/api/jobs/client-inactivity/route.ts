import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  detectInactiveClients, 
  reactivateClient, 
  markClientInactive 
} from '@/lib/services/client-inactivity-job';

// GET /api/jobs/client-inactivity - Executar job de detecção de clientes inativos
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas usuários MASTER e ADMIN podem executar jobs
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissão para executar jobs' }, { status: 403 });
    }

    const result = await detectInactiveClients();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao executar job de inatividade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/client-inactivity - Reativar ou marcar cliente como inativo
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { action, clientId, reason } = body;

    if (!action || !clientId) {
      return NextResponse.json({ error: 'Ação e ID do cliente são obrigatórios' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'reactivate':
        result = await reactivateClient(clientId, session.user.id);
        break;
        
      case 'mark_inactive':
        if (!reason) {
          return NextResponse.json({ error: 'Motivo é obrigatório para marcar como inativo' }, { status: 400 });
        }
        result = await markClientInactive(clientId, session.user.id, reason);
        break;
        
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao processar ação de inatividade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}