'use server';

import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';
import { createUserActionSchema, type CreateUserActionData } from '@/lib/validations/users/create-user-action.schema';
import { roleHierarchySchema } from '@/lib/validations/users/user.schema';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';
import { ConflictError } from '@/lib/services/error-handler';

export const createUser = createPermissionAction(
  createUserActionSchema,
  Permission.USER_CREATE,
  async (input: CreateUserActionData, user) => {
    // Validar hierarquia de roles
    const roleValidation = roleHierarchySchema.parse({
      currentUserRole: user.role,
      targetRole: input.role,
    });

    // Verificar se email já existe GLOBALMENTE (não apenas na agência)
    const existingUser = await db
      .select({ id: users.id, agencyId: users.agencyId })
      .from(users)
      .where(eq(users.email, input.email))
      .then(rows => rows[0]);

    if (existingUser) {
      throw new ConflictError('Este email já está em uso no sistema');
    }

    // Se está tentando criar um MASTER, verificar se já existe um na agência
    if (input.role === 'MASTER') {
      const existingMaster = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.role, 'MASTER'),
            eq(users.agencyId, user.agencyId)
          )
        )
        .then(rows => rows[0]);

      if (existingMaster) {
        throw new ConflictError('Esta agência já possui um usuário Master. Apenas um Master é permitido por agência.');
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(input.password);

    // Criar usuário
    const newUser = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        password: hashedPassword,
        role: input.role,
        isActive: input.isActive,
        avatar: input.avatar || null,
        agencyId: user.agencyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .then(rows => rows[0]);

    if (!newUser) {
      throw new Error('Erro ao criar usuário');
    }

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return newUser;
  },
  {
    rateLimitKey: 'create-user',
    rateLimitAttempts: 5,
    rateLimitWindow: 60000,
    logActivity: true,
    activityType: 'USER_CREATED'
  }
);
