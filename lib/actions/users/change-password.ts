'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, comparePasswords } from '@/lib/auth/session';
import { changePasswordSchema, type ChangePasswordData } from '@/lib/validations/users/user.schema';
import { logActivity } from '@/lib/actions/activity/log-activity';
import { revalidatePath } from 'next/cache';

type ChangePasswordResponse = {
  success: true;
  error?: never;
} | {
  success?: never;
  error: string;
};

export async function changePassword(userId: string, data: ChangePasswordData): Promise<ChangePasswordResponse> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Verificar permissões - usuário só pode alterar própria senha
    if (session.user.id !== userId) {
      return { error: 'Você só pode alterar sua própria senha' };
    }

    // Validar dados de entrada
    const validatedData = changePasswordSchema.parse(data);

    // Buscar usuário existente
    const existingUser = await db
      .select({
        id: users.id,
        password: users.password,
        name: users.name,
      })
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!existingUser) {
      return { error: 'Usuário não encontrado' };
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await comparePasswords(
      validatedData.currentPassword,
      existingUser.password
    );

    if (!isCurrentPasswordValid) {
      return { error: 'Senha atual incorreta' };
    }

    // Hash da nova senha
    const hashedNewPassword = await hashPassword(validatedData.newPassword);

    // Atualizar senha
    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Log da atividade
    await logActivity({
      userId: session.user.id,
      agencyId: session.user.agencyId,
      type: 'UPDATE_PASSWORD' as any,
      description: 'Alterou a senha',
      entityType: 'USER',
      entityId: userId,
      metadata: {
        userName: existingUser.name,
      },
      ipAddress: null,
    });

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');
    revalidatePath(`/users/${userId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error changing password:', error);
    
    // Se for erro de validação, retornar mensagem específica
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: 'Dados inválidos fornecidos' };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
