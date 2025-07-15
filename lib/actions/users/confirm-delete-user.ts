'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { deleteUser } from './delete-user';

// Schema para validação da confirmação de deleção
const confirmDeleteSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  confirmText: z.string().refine(
    (val) => val === 'deletar',
    { message: 'Digite "deletar" para confirmar' }
  ),
});

type ConfirmDeleteResponse = {
  success: string;
  error?: never;
} | {
  success?: never;
  error: string;
};

export async function confirmDeleteUser(formData: FormData): Promise<ConfirmDeleteResponse> {
  try {
    // Validar dados do formulário
    const rawData = {
      userId: formData.get('userId') as string,
      confirmText: formData.get('confirmText') as string,
    };

    const validatedData = confirmDeleteSchema.parse(rawData);

    // Executar a deleção
    const result = await deleteUser(validatedData.userId);

    if (result.error) {
      return { error: result.error };
    }

    // Revalidar a página de usuários
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return {
      success: 'Usuário deletado com sucesso'
    };
  } catch (error) {
    console.error('Error confirming user deletion:', error);
    
    // Se for erro de validação, retornar mensagem específica
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { error: firstError.message };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
