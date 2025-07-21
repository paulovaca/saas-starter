'use server';

import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteUserSchema, type DeleteUserData } from '@/lib/validations/users/delete-user.schema';
import { createPermissionAction, createAction } from '@/lib/actions/action-wrapper';
import { Permission, UserRole } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';
import { NotFoundError, AuthorizationError } from '@/lib/services/error-handler';

export const deleteUser = createPermissionAction(
  deleteUserSchema,
  Permission.USER_DELETE,
  async (input: DeleteUserData, currentUser) => {
    const { userId } = input;

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
          eq(users.agencyId, currentUser.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!existingUser) {
      throw new NotFoundError('Usuário');
    }

    // Verificar permissões baseadas no role
    const canDelete = (() => {
      // MASTER pode deletar ADMIN e AGENT, mas não outros MASTER
      if (currentUser.role === 'MASTER') {
        return ['ADMIN', 'AGENT'].includes(existingUser.role);
      }

      // ADMIN pode deletar apenas AGENT
      if (currentUser.role === 'ADMIN') {
        return existingUser.role === 'AGENT';
      }

      // AGENT não pode deletar ninguém
      return false;
    })();

    if (!canDelete) {
      throw new AuthorizationError('Sem permissão para deletar este usuário');
    }

    // Não permitir deletar o próprio usuário
    if (existingUser.id === currentUser.id) {
      throw new AuthorizationError('Você não pode deletar sua própria conta');
    }

    // Realizar hard delete (remoção completa do banco de dados)
    await db
      .delete(users)
      .where(eq(users.id, userId));

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return { deleted: true };
  },
  {
    rateLimitKey: 'delete-user',
    rateLimitAttempts: 3,
    rateLimitWindow: 60000,
    logActivity: true,
    activityType: 'USER_DELETED'
  }
);

export const hardDeleteUser = createAction(
  deleteUserSchema,
  async (input: DeleteUserData, currentUser) => {
    const { userId } = input;

    if (!currentUser) {
      throw new AuthorizationError('Usuário não autenticado');
    }

    // Apenas MASTER pode fazer hard delete
    if (currentUser.role !== UserRole.MASTER) {
      throw new AuthorizationError('Apenas Master pode deletar permanentemente usuários');
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
          eq(users.agencyId, currentUser.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!existingUser) {
      throw new NotFoundError('Usuário');
    }

    // Não permitir deletar o próprio usuário
    if (existingUser.id === currentUser.id) {
      throw new AuthorizationError('Você não pode deletar sua própria conta');
    }

    // TODO: Verificar e transferir dados relacionados antes de deletar

    // Deletar usuário permanentemente
    await db
      .delete(users)
      .where(eq(users.id, userId));

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return { deleted: true };
  },
  {
    requireAuth: true,
    rateLimitKey: 'hard-delete-user',
    rateLimitAttempts: 2,
    rateLimitWindow: 300000, // 5 minutes
    logActivity: true,
    activityType: 'USER_HARD_DELETED'
  }
);
