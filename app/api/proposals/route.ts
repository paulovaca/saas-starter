import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getProposalsList } from '@/lib/db/queries/proposals';
import { z } from 'zod';

// GET /api/proposals - Buscar propostas
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
      status: searchParams.get('status') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      operatorId: searchParams.get('operatorId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const proposals = await getProposalsList(
      session.user.agencyId,
      session.user.role === 'AGENT' ? session.user.id : undefined,
      filters
    );

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Schema para validação de criação de proposta
const createProposalSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  operatorId: z.string().uuid('ID da operadora inválido'), 
  validUntil: z.string().datetime('Data de validade inválida').refine((dateString) => {
    const selectedDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Reset time to start of day
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= tomorrow;
  }, {
    message: 'A data de validade deve ser a partir de amanhã'
  }),
  items: z.array(z.object({
    operatorId: z.string(),
    operatorName: z.string(),
    baseItemId: z.string(),
    baseItemName: z.string(),
    name: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    customFields: z.record(z.any()).optional()
  })).min(1, 'Deve ter pelo menos um item'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional()
});

// POST /api/proposals - Criar nova proposta
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
    console.log('📥 Received proposal data:', JSON.stringify(body, null, 2));
    
    // Validar dados
    try {
      const validatedData = createProposalSchema.parse(body);
      console.log('✅ Validated proposal data:', JSON.stringify(validatedData, null, 2));
    } catch (validationError) {
      console.error('❌ Validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        console.error('📋 Validation details:', JSON.stringify(validationError.errors, null, 2));
      }
      throw validationError;
    }
    
    const validatedData = createProposalSchema.parse(body);

    // Criar proposta no banco de dados
    const { createProposalInDatabase } = await import('@/lib/db/queries/proposal-operations');
    
    const newProposal = await createProposalInDatabase({
      agencyId: session.user.agencyId,
      clientId: validatedData.clientId,
      operatorId: validatedData.operatorId,
      userId: session.user.id,
      validUntil: new Date(validatedData.validUntil),
      paymentMethod: validatedData.paymentMethod,
      notes: validatedData.notes,
      items: validatedData.items.map(item => ({
        operatorId: item.operatorId,
        operatorName: item.operatorName,
        baseItemId: item.baseItemId,
        baseItemName: item.baseItemName,
        name: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        customFields: item.customFields || {}
      }))
    });

    console.log('🎉 Created proposal in database:', newProposal);

    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    
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