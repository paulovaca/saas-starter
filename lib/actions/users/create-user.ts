'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';
import { createUserSchema, type CreateUserData, roleHierarchySchema } from '@/lib/validations/users/user.schema';
import { logActivity } from '@/lib/actions/activity/log-activity';
import { revalidatePath } from 'next/cache';

type CreateUserResponse = {
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

export async function createUser(data: CreateUserData): Promise<CreateUserResponse> {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Verificar permissões conforme hierarquia
    if (!['DEVELOPER', 'MASTER', 'ADMIN'].includes(session.user.role)) {
      return { error: 'Sem permissão para criar usuários' };
    }

    // Validar dados de entrada
    const validatedData = createUserSchema.parse(data);

    // Validar hierarquia de roles
    const roleValidation = roleHierarchySchema.parse({
      currentUserRole: session.user.role,
      targetRole: validatedData.role,
    });

    // Verificar se email já existe GLOBALMENTE (não apenas na agência)
    const existingUser = await db
      .select({ id: users.id, agencyId: users.agencyId })
      .from(users)
      .where(eq(users.email, validatedData.email))
      .then(rows => rows[0]);

    if (existingUser) {
      return { error: 'Este email já está em uso no sistema' };
    }

    // Se está tentando criar um MASTER, verificar se já existe um na agência
    if (validatedData.role === 'MASTER') {
      const existingMaster = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.role, 'MASTER'),
            eq(users.agencyId, session.user.agencyId)
          )
        )
        .then(rows => rows[0]);

      if (existingMaster) {
        return { error: 'Esta agência já possui um usuário Master. Apenas um Master é permitido por agência.' };
      }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password);

    // Criar usuário
    const newUser = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        password: hashedPassword,
        role: validatedData.role,
        isActive: validatedData.isActive,
        avatar: validatedData.avatar || null,
        agencyId: session.user.agencyId,
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
      return { error: 'Erro ao criar usuário' };
    }

    // Log da atividade
    await logActivity({
      userId: session.user.id,
      agencyId: session.user.agencyId,
      type: 'INVITE_USER' as any,
      description: `Criou usuário ${newUser.name} (${newUser.email}) com role ${newUser.role}`,
      entityType: 'USER',
      entityId: newUser.id,
      metadata: {
        targetUserName: newUser.name,
        targetUserEmail: newUser.email,
        targetUserRole: newUser.role,
      },
      ipAddress: null, // TODO: Implementar captura de IP
    });

    // Revalidar cache das páginas relacionadas
    revalidatePath('/users');
    revalidatePath('/dashboard/users');

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Se for erro de validação, retornar mensagem específica
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: 'Dados inválidos fornecidos' };
    }
    
    return { error: 'Erro interno do servidor' };
  }
}
