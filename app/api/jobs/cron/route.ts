import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { runDailyJobs, runWeeklyJobs } from '@/lib/services/cron-scheduler';

// GET /api/jobs/cron?type=daily|weekly - Executar jobs de manutenção
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas usuários MASTER podem executar jobs de sistema
    if (session.user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Apenas usuários MASTER podem executar jobs de sistema' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get('type') || 'daily';

    let result;

    switch (jobType) {
      case 'daily':
        result = await runDailyJobs();
        break;
        
      case 'weekly':
        result = await runWeeklyJobs();
        break;
        
      default:
        return NextResponse.json({ error: 'Tipo de job inválido. Use "daily" ou "weekly"' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      jobType,
      executedBy: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      result,
    });

  } catch (error) {
    console.error('Erro ao executar jobs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}