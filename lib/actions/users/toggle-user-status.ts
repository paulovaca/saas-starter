'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logActivity } from '@/lib/actions/activity/log-activity';
import { revalidatePath } from 'next/cache';

type ToggleUserStatusResponse = {
  success: true;
  isActive: boolean;
  error?: never;
} | {
  success?: never;
  isActive?: never;
  error: string;
};

export async function toggleUserStatus(userId: string): Promise<ToggleUserStatusResponse> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Apenas MASTER e ADMIN podem alterar status de usuários
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      return { error: 'Sem permissão para alterar status de usuários' };
    }

    // Buscar usuário existente
    const existingUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
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

    // Não permitir desativar o próprio usuário
    if (existingUser.id === session.user.id) {
      return { error: 'Você não pode desativar sua própria conta' };
    }

    // Não permitir que ADMIN desative MASTER
    if (session.user.role === 'ADMIN' && existingUser.role === 'MASTER') {
      return { error: 'Administrador não pode alterar status de Master' };
    }

    // Calcular novo status
    const newStatus = !existingUser.isActive;

    // Atualizar status
    await db
      .update(users)
      .set({
        isActive: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Log da atividade
    await logActivity({
      userId: session.user.id,
      agencyId: session.user.agencyId,
      type: newStatus ? ('ACTIVATE_USER' as any) : ('DEACTIVATE_USER' as any),
      description: `${newStatus ? 'Ativou' : 'Desativou'} usuário ${existingUser.name}`,
      entityType: 'USER',
      entityId: userId,
      metadata: {
        targetUserName: existingUser.name,
        targetUserEmail: existingUser.email,
        targetUserRole: existingUser.role,
        newStatus,
        previousStatus: existingUser.isActive,
      },
      ipAddress: null,
    });

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');
    revalidatePath(`/users/${userId}`);

    return {
      success: true,
      isActive: newStatus,
    };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { error: 'Erro interno do servidor' };
  }
}
