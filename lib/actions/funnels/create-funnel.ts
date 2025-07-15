'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { salesFunnels, salesFunnelStages } from '@/lib/db/schema/funnels';
import { eq, and, inArray } from 'drizzle-orm';
import { createFunnelSchema, type CreateFunnelInput } from '@/lib/validations/funnels';

export async function createFunnel(input: CreateFunnelInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Não autorizado' };
    }

    // Verificar permissões (apenas Master e Admin podem criar funis)
    if (session.user.role === 'AGENT') {
      return { success: false, error: 'Sem permissão para criar funis' };
    }

    const validatedInput = createFunnelSchema.parse(input);

    // Verificar se nome já existe na agência
    const existingFunnel = await db
      .select({ id: salesFunnels.id })
      .from(salesFunnels)
      .where(
        and(
          eq(salesFunnels.name, validatedInput.name),
          eq(salesFunnels.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (existingFunnel) {
      return { success: false, error: 'Já existe um funil com este nome' };
    }

    // Se for marcado como padrão, remover padrão dos outros
    if (validatedInput.isDefault) {
      await db
        .update(salesFunnels)
        .set({ isDefault: false })
        .where(
          and(
            eq(salesFunnels.agencyId, session.user.agencyId),
            eq(salesFunnels.isDefault, true)
          )
        );
    }

    return await db.transaction(async (tx) => {
      // Criar o funil
      const [newFunnel] = await tx
        .insert(salesFunnels)
        .values({
          name: validatedInput.name,
          description: validatedInput.description,
          isDefault: validatedInput.isDefault || false,
          agencyId: session.user.agencyId,
          createdBy: session.user.id,
        })
        .returning();

      // Criar as etapas
      const stagesData = validatedInput.stages.map((stage, index) => ({
        name: stage.name,
        description: stage.description,
        color: stage.color,
        order: index + 1,
        funnelId: newFunnel.id,
        createdBy: session.user.id,
      }));

      const stages = await tx
        .insert(salesFunnelStages)
        .values(stagesData)
        .returning();

      return {
        success: true,
        data: {
          ...newFunnel,
          stages,
        },
      };
    });
  } catch (error) {
    console.error('Erro ao criar funil:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return { success: false, error: 'Dados inválidos fornecidos' };
    }
    
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function createFunnelFromTemplate(templateKey: 'b2c' | 'b2b' | 'support') {
  // Templates definidos localmente para evitar problemas com "use server"
  const templates = {
    b2c: {
      name: 'Funil B2C - Padrão',
      description: 'Funil otimizado para vendas diretas ao consumidor',
      isDefault: false,
      stages: [
        { name: 'Novo Lead', description: 'Cliente recém-captado', color: 'blue' as const },
        { name: 'Primeiro Contato', description: 'Primeiro contato realizado', color: 'purple' as const },
        { name: 'Proposta Enviada', description: 'Proposta comercial enviada', color: 'yellow' as const },
        { name: 'Negociação', description: 'Em processo de negociação', color: 'orange' as const },
        { name: 'Fechamento', description: 'Cliente fechou o negócio', color: 'green' as const },
        { name: 'Perdido', description: 'Cliente não converteu', color: 'red' as const },
      ],
    },
    b2b: {
      name: 'Funil B2B - Empresarial',
      description: 'Funil estruturado para vendas corporativas',
      isDefault: false,
      stages: [
        { name: 'Qualificação', description: 'Qualificação do lead empresarial', color: 'blue' as const },
        { name: 'Descoberta', description: 'Identificação de necessidades', color: 'purple' as const },
        { name: 'Apresentação', description: 'Apresentação da solução', color: 'yellow' as const },
        { name: 'Proposta Comercial', description: 'Proposta formal enviada', color: 'orange' as const },
        { name: 'Negociação', description: 'Ajustes e negociação final', color: 'orange' as const },
        { name: 'Contrato', description: 'Assinatura de contrato', color: 'green' as const },
        { name: 'Perdido', description: 'Oportunidade perdida', color: 'red' as const },
      ],
    },
    support: {
      name: 'Funil de Suporte',
      description: 'Gestão de tickets e atendimento ao cliente',
      isDefault: false,
      stages: [
        { name: 'Ticket Aberto', description: 'Solicitação recebida', color: 'blue' as const },
        { name: 'Em Análise', description: 'Analisando a solicitação', color: 'yellow' as const },
        { name: 'Em Andamento', description: 'Trabalhando na solução', color: 'orange' as const },
        { name: 'Aguardando Cliente', description: 'Aguardando retorno do cliente', color: 'purple' as const },
        { name: 'Resolvido', description: 'Problema solucionado', color: 'green' as const },
        { name: 'Fechado', description: 'Ticket encerrado', color: 'gray' as const },
      ],
    },
  };

  const template = templates[templateKey];
  if (!template) {
    return { success: false, error: 'Template não encontrado' };
  }

  return createFunnel(template);
}
