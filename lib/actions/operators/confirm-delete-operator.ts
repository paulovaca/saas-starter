'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { deleteOperator } from './delete-operator';

// Schema para validação da confirmação de deleção
const confirmDeleteSchema = z.object({
  operatorId: z.string().min(1, 'ID da operadora é obrigatório'),
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

export async function confirmDeleteOperator(formData: FormData): Promise<ConfirmDeleteResponse> {
  try {
    // Validar dados do formulário
    const rawData = {
      operatorId: formData.get('operatorId') as string,
      confirmText: formData.get('confirmText') as string,
    };

    const validatedData = confirmDeleteSchema.parse(rawData);

    // Executar a deleção
    const result = await deleteOperator({ operatorId: validatedData.operatorId });

    if (result.error) {
      return { error: result.error };
    }

    if (!result.success) {
      return { error: result.message || 'Falha ao excluir operadora' };
    }

    // Revalidar as páginas de operadoras
    revalidatePath('/operators');
    revalidatePath('/dashboard/operators');

    return {
      success: 'Operadora deletada com sucesso'
    };
  } catch (error) {
    console.error('Error confirming operator deletion:', error);
    
    // Se for erro de validação, retornar mensagem específica
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { error: firstError.message };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
