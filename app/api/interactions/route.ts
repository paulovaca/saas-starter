import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createInteraction } from '@/lib/db/queries/interactions';
import { interactionFormSchema } from '@/lib/validations/interactions';
import { z } from 'zod';

// Schema para validar o body da requisição (inclui clientId)
const createInteractionSchema = z.object({
  clientId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note'], {
    required_error: 'Tipo de interação é obrigatório',
  }),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição não pode exceder 2000 caracteres'),
  contactDate: z.coerce.date({
    required_error: 'Data/hora da interação é obrigatória',
  }),
  durationMinutes: z
    .number()
    .int()
    .positive('Duração deve ser positiva')
    .max(600, 'Duração não pode exceder 10 horas')
    .optional(),
}).refine((data) => {
  // Duração é obrigatória para calls e meetings
  if ((data.type === 'call' || data.type === 'meeting') && !data.durationMinutes) {
    return false;
  }
  return true;
}, {
  message: 'Duração é obrigatória para ligações e reuniões',
  path: ['durationMinutes'],
});

// POST /api/interactions - Criar nova interação
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
    const validatedData = createInteractionSchema.parse(body);

    // Criar interação
    const newInteraction = await createInteraction(
      {
        type: validatedData.type,
        description: validatedData.description,
        contactDate: validatedData.contactDate,
        durationMinutes: validatedData.durationMinutes,
      },
      validatedData.clientId,
      session.user.id,
      session.user.agencyId
    );

    return NextResponse.json(newInteraction, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Erros específicos da aplicação (ex: cliente não encontrado)
      if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
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