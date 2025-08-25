import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { 
  getClientsWithFilters, 
  createNewClient, 
  isEmailUnique, 
  isDocumentUnique 
} from '@/lib/db/queries/clients';
import { clientSchema } from '@/lib/validations/clients/client.schema';
import { z } from 'zod';

// GET /api/clients - Buscar clientes com filtros
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
      userId: searchParams.get('userId') || undefined,
      jornadaStage: searchParams.get('jornadaStage') || undefined,
      dealStatus: searchParams.get('dealStatus') || undefined,
    };

    // Parâmetros de paginação
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const result = await getClientsWithFilters(
      session.user.agencyId,
      {
        ...filters,
        // Agents can only see their own clients
        userId: session.user.role === 'AGENT' 
          ? session.user.id 
          : filters.userId
      },
      pagination
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Criar novo cliente
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
    
    // Validar dados
    const validatedData = clientSchema.parse(body);

    // Verificar se email é único (se fornecido)
    if (validatedData.email) {
      const emailIsUnique = await isEmailUnique(validatedData.email, session.user.agencyId);
      if (!emailIsUnique) {
        return NextResponse.json(
          { error: 'Email já está sendo usado por outro cliente' },
          { status: 400 }
        );
      }
    }

    // Verificar se documento é único (se fornecido)
    if (validatedData.documentNumber) {
      const documentIsUnique = await isDocumentUnique(validatedData.documentNumber, session.user.agencyId);
      if (!documentIsUnique) {
        return NextResponse.json(
          { error: 'Documento já está sendo usado por outro cliente' },
          { status: 400 }
        );
      }
    }

    // Converter birthDate string para Date se necessário
    const dataToCreate: any = { ...validatedData };
    if (dataToCreate.birthDate && typeof dataToCreate.birthDate === 'string') {
      dataToCreate.birthDate = new Date(dataToCreate.birthDate);
    }

    // Criar cliente
    const newClient = await createNewClient(
      dataToCreate,
      session.user.agencyId,
      session.user.id
    );

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
