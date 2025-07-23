import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { updateTaskStatus } from '@/lib/db/queries/tasks';
import { z } from 'zod';

const updateTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
});

// PUT /api/tasks/[id] - Update task status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!currentUser.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    
    const validatedData = updateTaskSchema.parse(body);

    const updatedTask = await updateTaskStatus(
      taskId,
      validatedData.status,
      currentUser.id,
      currentUser.agencyId
    );

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('não encontrada') || error.message.includes('não pertence') || error.message.includes('permissão')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}