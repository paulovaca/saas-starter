'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateUserSchema, type UpdateUserData, roleHierarchySchema } from '@/lib/validations/users/user.schema';
import { logActivity } from '@/lib/actions/activity/log-activity';
import { revalidatePath } from 'next/cache';

type UpdateUserResponse = {
  success: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  error?: never;
} | {
  success?: never;
  user?: never;
  error: string;
};

export async function updateUser(userId: string, data: UpdateUserData): Promise<UpdateUserResponse> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Buscar usuário existente para verificar permissões
    const existingUser = await db
      .select()
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

    // Verificar permissões baseadas no role
    const canEdit = (() => {
      // Usuário pode editar próprio perfil (exceto role)
      if (session.user.id === userId) {
        return true;
      }

      // MASTER pode editar ADMIN e AGENT, mas não outros MASTER
      if (session.user.role === 'MASTER') {
        return ['ADMIN', 'AGENT'].includes(existingUser.role);
      }

      // ADMIN pode editar apenas AGENT
      if (session.user.role === 'ADMIN') {
        return existingUser.role === 'AGENT';
      }

      // AGENT não pode editar ninguém
      return false;
    })();

    if (!canEdit) {
      return { error: 'Sem permissão para editar este usuário' };
    }

    // Validar dados de entrada
    const validatedData = updateUserSchema.parse(data);

    // Verificar se é mudança de role e validar hierarquia
    if (validatedData.role !== existingUser.role) {
      // Usuário não pode alterar próprio role
      if (session.user.id === userId) {
        return { error: 'Você não pode alterar seu próprio nível de acesso' };
      }

      // Verificar permissões para alterar role
      const canChangeRole = (() => {
        // MASTER pode alterar role de ADMIN e AGENT
        if (session.user.role === 'MASTER') {
          return ['ADMIN', 'AGENT'].includes(existingUser.role);
        }

        // ADMIN pode alterar role apenas de AGENT
        if (session.user.role === 'ADMIN') {
          return existingUser.role === 'AGENT';
        }

        return false;
      })();

      if (!canChangeRole) {
        return { error: 'Sem permissão para alterar o nível de acesso deste usuário' };
      }

      // Validar hierarquia de roles
      try {
        roleHierarchySchema.parse({
          currentUserRole: session.user.role,
          targetRole: validatedData.role,
        });
      } catch (error) {
        return { error: 'Não é possível atribuir este nível de acesso' };
      }
    }

    // Verificar se email já existe (excluindo o próprio usuário)
    if (validatedData.email !== existingUser.email) {
      const emailExists = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.email, validatedData.email),
            eq(users.agencyId, session.user.agencyId)
          )
        )
        .then(rows => rows[0]);

      if (emailExists && emailExists.id !== userId) {
        return { error: 'Já existe um usuário com este email' };
      }
    }

    // Atualizar usuário
    const updatedUser = await db
      .update(users)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        role: validatedData.role,
        isActive: validatedData.isActive,
        avatar: validatedData.avatar || null,
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
      return { error: 'Erro ao atualizar usuário' };
    }

    // Log da atividade
    const changes: string[] = [];
    if (validatedData.name !== existingUser.name) changes.push('nome');
    if (validatedData.email !== existingUser.email) changes.push('email');
    if (validatedData.phone !== existingUser.phone) changes.push('telefone');
    if (validatedData.role !== existingUser.role) changes.push('role');
    if (validatedData.isActive !== existingUser.isActive) changes.push('status');

    await logActivity({
      userId: session.user.id,
      agencyId: session.user.agencyId,
      type: 'UPDATE_ACCOUNT' as any,
      description: `Atualizou usuário ${updatedUser.name}: ${changes.join(', ')}`,
      entityType: 'USER',
      entityId: updatedUser.id,
      metadata: {
        targetUserName: updatedUser.name,
        targetUserEmail: updatedUser.email,
        changedFields: changes,
        oldValues: {
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role,
          isActive: existingUser.isActive,
        },
        newValues: validatedData,
      },
      ipAddress: null,
    });

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');
    revalidatePath(`/users/${userId}`);

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Se for erro de validação, retornar mensagem específica
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: 'Dados inválidos fornecidos' };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
