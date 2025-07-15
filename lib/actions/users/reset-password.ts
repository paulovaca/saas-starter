'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getUser, updateUser, getUserById } from '@/lib/db/queries/auth';

// Schema para validação da confirmação de reset
const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  confirmText: z.string().refine(
    (val) => val === 'resetar',
    { message: 'Digite "resetar" para confirmar' }
  ),
});

type ResetPasswordResponse = {
  success: string;
  error?: never;
} | {
  success?: never;
  error: string;
};

export async function resetUserPassword(formData: FormData): Promise<ResetPasswordResponse> {
  try {
    // Verificar autenticação
    const currentUser = await getUser();
    if (!currentUser) {
      return { error: 'Usuário não autenticado' };
    }

    // Validar dados do formulário
    const rawData = {
      userId: formData.get('userId') as string,
      confirmText: formData.get('confirmText') as string,
    };

    const validatedData = resetPasswordSchema.parse(rawData);

    // Verificar permissões baseadas no role
    const currentUserRole = currentUser.role;
    
    // MASTER pode resetar ADMIN e AGENT
    // ADMIN pode resetar apenas AGENT
    const allowedRoles = currentUserRole === 'MASTER' 
      ? ['ADMIN', 'AGENT'] 
      : currentUserRole === 'ADMIN' 
      ? ['AGENT'] 
      : [];

    if (allowedRoles.length === 0) {
      return { error: 'Você não tem permissão para resetar senhas' };
    }

    // Verificar se o usuário alvo existe e tem um role permitido
    const targetUser = await getUserById(validatedData.userId);
    if (!targetUser) {
      return { error: 'Usuário não encontrado' };
    }

    if (!allowedRoles.includes(targetUser.user.role)) {
      return { error: 'Você não tem permissão para resetar a senha deste usuário' };
    }

    // Verificar se não está tentando resetar a própria senha
    if (currentUser.id === targetUser.user.id) {
      return { error: 'Você não pode resetar sua própria senha através desta funcionalidade' };
    }

    // Gerar hash da nova senha padrão
    const defaultPassword = 'User123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Atualizar senha
    await updateUser(validatedData.userId, {
      password: hashedPassword
    });

    // Revalidar a página de usuários
    revalidatePath('/dashboard/users');

    return { 
      success: `Senha do usuário ${targetUser.user.name} foi resetada com sucesso! A senha padrão é: ${defaultPassword}. O usuário deve alterar a senha no próximo login.` 
    };

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
