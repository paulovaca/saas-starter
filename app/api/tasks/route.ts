import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

// POST /api/tasks - Criar nova tarefa
export async function POST(request: NextRequest) {
  console.log('=== API /api/tasks POST called ===');
  
  try {
    console.log('Step 1: Getting current user...');
    const currentUser = await getCurrentUser();
    console.log('Current user result:', currentUser ? 'User found' : 'No user');
    
    if (!currentUser) {
      console.log('ERROR: No current user found');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('Step 2: Parsing request body...');
    const body = await request.json();
    console.log('Request body parsed successfully');
    
    console.log('Step 3: Creating validation schema...');
    const createTaskSchema = z.object({
      title: z.string().min(3).max(255),
      description: z.string().optional(),
      clientId: z.string().uuid(),
      assignedTo: z.string().uuid(),
      priority: z.enum(['low', 'medium', 'high']),
      dueDate: z.string().transform(str => new Date(str)),
      notifyAssignee: z.boolean().optional()
    });
    
    const validatedData = createTaskSchema.parse(body);
    console.log('Validation successful');
    
    console.log('Step 4: Importing createTask...');
    const { createTask } = await import('@/lib/db/queries/tasks');
    
    console.log('Step 5: Creating task in database...');
    const newTask = await createTask(
      {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate,
        assignedTo: validatedData.assignedTo,
        notifyAssignee: validatedData.notifyAssignee || false,
      },
      validatedData.clientId,
      currentUser.id,
      currentUser.agencyId
    );
    
    console.log('SUCCESS: Task created:', newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      // Erros específicos da aplicação (ex: cliente não encontrado)
      if (error.message.includes('não encontrado') || error.message.includes('não pertence') || error.message.includes('permissão')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}