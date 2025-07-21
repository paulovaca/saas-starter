'use server';

import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { roleHierarchySchema } from '@/lib/validations/users/user.schema';
import { updateUserActionSchema, type UpdateUserActionData } from '@/lib/validations/users/update-user.schema';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';
import { ConflictError, NotFoundError, AuthorizationError } from '@/lib/services/error-handler';

export const updateUser = createPermissionAction(
  updateUserActionSchema,
  Permission.USER_UPDATE,
  async (input: UpdateUserActionData, currentUser) => {
    const { userId, ...updateData } = input;

    // Buscar usuário existente para verificar permissões
    const existingUser = await db
      .select()
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
    const canEdit = (() => {
      // Usuário pode editar próprio perfil (exceto role)
      if (currentUser.id === userId) {
        return true;
      }

      // MASTER pode editar ADMIN e AGENT, mas não outros MASTER
      if (currentUser.role === 'MASTER') {
        return ['ADMIN', 'AGENT'].includes(existingUser.role);
      }

      // ADMIN pode editar apenas AGENT
      if (currentUser.role === 'ADMIN') {
        return existingUser.role === 'AGENT';
      }

      // AGENT não pode editar ninguém (além de si mesmo)
      return false;
    })();

    if (!canEdit) {
      throw new AuthorizationError('Sem permissão para editar este usuário');
    }

    // Verificar se é mudança de role e validar hierarquia
    if (updateData.role !== existingUser.role) {
      // Usuário não pode alterar próprio role
      if (currentUser.id === userId) {
        throw new AuthorizationError('Você não pode alterar seu próprio nível de acesso');
      }

      // Verificar permissões para alterar role
      const canChangeRole = (() => {
        // MASTER pode alterar role de ADMIN e AGENT
        if (currentUser.role === 'MASTER') {
          return ['ADMIN', 'AGENT'].includes(existingUser.role);
        }

        // ADMIN pode alterar role apenas de AGENT
        if (currentUser.role === 'ADMIN') {
          return existingUser.role === 'AGENT';
        }

        return false;
      })();

      if (!canChangeRole) {
        throw new AuthorizationError('Sem permissão para alterar o nível de acesso deste usuário');
      }

      // Validar hierarquia de roles
      roleHierarchySchema.parse({
        currentUserRole: currentUser.role,
        targetRole: updateData.role,
      });
    }

    // Verificar se email já existe (excluindo o próprio usuário)
    if (updateData.email !== existingUser.email) {
      const emailExists = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.email, updateData.email),
            eq(users.agencyId, currentUser.agencyId)
          )
        )
        .then(rows => rows[0]);

      if (emailExists && emailExists.id !== userId) {
        throw new ConflictError('Já existe um usuário com este email');
      }
    }

    // Atualizar usuário
    const updatedUser = await db
      .update(users)
      .set({
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone || null,
        role: updateData.role,
        isActive: updateData.isActive,
        avatar: updateData.avatar || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .then(rows => rows[0]);

    if (!updatedUser) {
      throw new Error('Erro ao atualizar usuário');
    }

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');
    revalidatePath(`/users/${userId}`);

    return updatedUser;
  },
  {
    rateLimitKey: 'update-user',
    rateLimitAttempts: 10,
    rateLimitWindow: 60000,
    logActivity: true,
    activityType: 'USER_UPDATED'
  }
);
