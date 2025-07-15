'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { users, agencies } from '@/lib/db/schema';
import { eq, and, or, ilike, desc, sql, count } from 'drizzle-orm';
import { userFiltersSchema, type UserFiltersData } from '@/lib/validations/users/user.schema';
import type { UserListItem } from '@/lib/db/schema/users';

type GetUsersResponse = {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: never;
} | {
  users?: never;
  pagination?: never;
  error: string;
};

export async function getUsersWithPagination(
  filters: UserFiltersData
): Promise<GetUsersResponse> {
  try {
    // Verificar autenticação e permissões
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Apenas MASTER e ADMIN podem listar usuários
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      return { error: 'Sem permissão para listar usuários' };
    }

    // Validar filtros
    const validatedFilters = userFiltersSchema.parse(filters);
    const { search, role, isActive, page, limit } = validatedFilters;

    // Construir condições de filtro
    const conditions = [
      eq(users.agencyId, session.user.agencyId), // Filtrar pela agência do usuário
    ];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (typeof isActive === 'boolean') {
      conditions.push(eq(users.isActive, isActive));
    }

    const whereCondition = and(...conditions);

    // Contar total de registros
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereCondition);
    
    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Buscar usuários com paginação
    const offset = (page - 1) * limit;
    
    const usersData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        avatar: users.avatar,
      })
      .from(users)
      .where(whereCondition)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: usersData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'Erro interno do servidor' };
  }
}

export async function getUserById(userId: string) {
  try {
    const session = await auth();
    if (!session) {
      return { error: 'Não autorizado' };
    }

    // Verificar se o usuário pode acessar este dado
    const canAccess = 
      ['MASTER', 'ADMIN'].includes(session.user.role) || 
      session.user.id === userId;

    if (!canAccess) {
      return { error: 'Sem permissão para acessar este usuário' };
    }

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        avatar: users.avatar,
        agencyId: users.agencyId,
        agency: {
          id: agencies.id,
          name: agencies.name,
        },
      })
      .from(users)
      .leftJoin(agencies, eq(users.agencyId, agencies.id))
      .where(
        and(
          eq(users.id, userId),
          eq(users.agencyId, session.user.agencyId)
        )
      )
      .then(rows => rows[0]);

    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    return { user };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return { error: 'Erro interno do servidor' };
  }
}
