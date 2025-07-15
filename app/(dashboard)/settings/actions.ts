'use server';

import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { updateAgency } from '@/lib/db/queries/agency';

// Schema de validação para atualização da agência
const updateAgencySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  address: z.string().optional(),
  description: z.string().optional(),
});

export async function updateAgencyData(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return { error: 'Usuário não autenticado' };
    }

    // Apenas MASTER pode alterar dados da agência
    if (session.user.role !== 'MASTER') {
      return { error: 'Apenas o usuário MASTER pode alterar dados da agência' };
    }

    if (!session.user.agencyId) {
      return { error: 'Usuário não está associado a uma agência' };
    }

    // Validar dados do formulário
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      website: formData.get('website') as string || undefined,
      address: formData.get('address') as string || undefined,
      description: formData.get('description') as string || undefined,
    };

    const validatedData = updateAgencySchema.parse(rawData);

    // Atualizar dados da agência
    await updateAgency(session.user.agencyId, validatedData);

    revalidatePath('/settings');
    revalidatePath('/profile');
    
    return { success: 'Dados da agência atualizados com sucesso!' };
  } catch (error) {
    console.error('Erro ao atualizar dados da agência:', error);
    
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
