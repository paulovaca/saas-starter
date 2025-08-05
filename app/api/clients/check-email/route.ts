import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isEmailUnique } from '@/lib/db/queries/clients';

// POST /api/clients/check-email - Verificar se email é único
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const body = await request.json();
    const { email, excludeId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const isUnique = await isEmailUnique(email, session.user.agencyId, excludeId);

    return NextResponse.json({ isUnique });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}