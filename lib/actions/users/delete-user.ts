'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logActivity } from '@/lib/actions/activity/log-activity';
import { revalidatePath } from 'next/cache';

type DeleteUserResponse = {
  success: true;
  error?: never;
} | {
  success?: never;
  error: string;
};

export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Apenas MASTER pode deletar usuários
    if (session.user.role !== 'MASTER') {
      return { error: 'Apenas Master pode deletar usuários' };
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

    // Não permitir deletar o próprio usuário
    if (existingUser.id === session.user.id) {
      return { error: 'Você não pode deletar sua própria conta' };
    }

    // TODO: Verificar se usuário tem dados relacionados (propostas, clientes, etc.)
    // Por enquanto, vamos fazer um soft delete apenas desativando o usuário
    
    // Realizar soft delete (desativar usuário)
    await db
      .update(users)
      .set({
        isActive: false,
        email: `deleted_${Date.now()}_${existingUser.email}`, // Evitar conflito de email
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Log da atividade
    await logActivity({
      userId: session.user.id,
      agencyId: session.user.agencyId,
      type: 'DELETE_ACCOUNT' as any,
      description: `Deletou usuário ${existingUser.name}`,
      entityType: 'USER',
      entityId: userId,
      metadata: {
        targetUserName: existingUser.name,
        targetUserEmail: existingUser.email,
        targetUserRole: existingUser.role,
        deletionType: 'soft_delete',
      },
      ipAddress: null,
    });

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Erro interno do servidor' };
  }
}

export async function hardDeleteUser(userId: string): Promise<DeleteUserResponse> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Apenas MASTER pode fazer hard delete
    if (session.user.role !== 'MASTER') {
      return { error: 'Apenas Master pode deletar permanentemente usuários' };
    }

    // Buscar usuário existente
    const existingUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
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

    // Não permitir deletar o próprio usuário
    if (existingUser.id === session.user.id) {
      return { error: 'Você não pode deletar sua própria conta' };
    }

    // TODO: Verificar e transferir dados relacionados antes de deletar

    // Deletar usuário permanentemente
    await db
      .delete(users)
      .where(eq(users.id, userId));

    // Log da atividade
    await logActivity({
      userId: session.user.id,
      agencyId: session.user.agencyId,
      type: 'DELETE_ACCOUNT' as any,
      description: `Deletou permanentemente usuário ${existingUser.name}`,
      entityType: 'USER',
      entityId: userId,
      metadata: {
        targetUserName: existingUser.name,
        targetUserEmail: existingUser.email,
        targetUserRole: existingUser.role,
        deletionType: 'hard_delete',
      },
      ipAddress: null,
    });

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error hard deleting user:', error);
    return { error: 'Erro interno do servidor' };
  }
}
