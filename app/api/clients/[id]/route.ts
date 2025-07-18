import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  getClientWithDetails, 
  updateClientData, 
  deleteClientData,
  isEmailUnique,
  isDocumentUnique
} from '@/lib/db/queries/clients';
import { clientUpdateSchema } from '@/lib/validations/clients/client.schema';
import { z } from 'zod';

// GET /api/clients/[id] - Buscar cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { id } = await params;
    const client = await getClientWithDetails(id, session.user.agencyId);

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Buscar cliente atual para verificar permissões
    const currentClient = await getClientWithDetails(id, session.user.agencyId);
    
    if (!currentClient) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    
    // Verificar se o usuário pode editar este cliente
    const canEditClient = session.user.role === 'MASTER' || 
                         session.user.role === 'ADMIN' || 
                         (session.user.role === 'AGENT' && currentClient.userId === session.user.id);
    
    if (!canEditClient) {
      return NextResponse.json({ error: 'Você não tem permissão para editar este cliente' }, { status: 403 });
    }
    
    // Verificar se está tentando alterar funil/etapa
    const isChangingFunnelStage = body.funnelId !== undefined || body.funnelStageId !== undefined;
    
    if (isChangingFunnelStage) {
      // Apenas Master, Admin, ou o dono do cliente podem alterar funil/etapa
      const canChangeFunnelStage = session.user.role === 'MASTER' || 
                                   session.user.role === 'ADMIN' || 
                                   (session.user.role === 'AGENT' && currentClient.userId === session.user.id);
      
      if (!canChangeFunnelStage) {
        return NextResponse.json({ error: 'Você não tem permissão para alterar o funil ou etapa deste cliente' }, { status: 403 });
      }
    }
    
    // Validar dados (parcial)
    const validatedData = clientUpdateSchema.parse(body);

    // Verificar se email é único (se fornecido e diferente do atual)
    if (validatedData.email) {
      const emailIsUnique = await isEmailUnique(validatedData.email, session.user.agencyId, id);
      if (!emailIsUnique) {
        return NextResponse.json(
          { error: 'Email já está sendo usado por outro cliente' },
          { status: 400 }
        );
      }
    }

    // Verificar se documento é único (se fornecido e diferente do atual)
    if (validatedData.documentNumber) {
      const documentIsUnique = await isDocumentUnique(validatedData.documentNumber, session.user.agencyId, id);
      if (!documentIsUnique) {
        return NextResponse.json(
          { error: 'Documento já está sendo usado por outro cliente' },
          { status: 400 }
        );
      }
    }

    // Atualizar cliente
    const updatedClient = await updateClientData(
      id,
      validatedData,
      session.user.agencyId
    );

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Cliente não encontrado') {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Deletar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (!session.user.agencyId) {
      return NextResponse.json({ error: 'Usuário não pertence a nenhuma agência' }, { status: 403 });
    }

    const { id } = await params;
    // Deletar cliente (soft delete)
    const deletedClient = await deleteClientData(id, session.user.agencyId);

    return NextResponse.json(deletedClient);
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
