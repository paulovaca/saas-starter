import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';

/**
 * Valida se um email é único dentro de uma agência
 */
export async function validateUniqueEmail(
  email: string, 
  agencyId: string, 
  excludeUserId?: string
): Promise<boolean> {
  try {
    const conditions = [
      eq(users.email, email.toLowerCase().trim()),
      eq(users.agencyId, agencyId)
    ];

    // Se estamos editando um usuário, excluir ele da busca
    if (excludeUserId) {
      conditions.push(ne(users.id, excludeUserId));
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(and(...conditions))
      .limit(1);

    return existingUser.length === 0;
  } catch (error) {
    console.error('Erro ao validar email único:', error);
    throw new Error('Erro interno ao validar email');
  }
}

/**
 * Schema Zod customizado para validação de email único
 */
export const uniqueEmailSchema = (agencyId: string, excludeUserId?: string) => 
  z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim()
    .refine(
      async (email) => {
        return await validateUniqueEmail(email, agencyId, excludeUserId);
      },
      {
        message: 'Este email já está cadastrado nesta agência'
      }
    );

/**
 * Valida email único de forma síncrona para uso em server actions
 */
export async function checkEmailAvailability(
  email: string, 
  agencyId: string, 
  excludeUserId?: string
): Promise<{ isAvailable: boolean; message?: string }> {
  try {
    const isUnique = await validateUniqueEmail(email, agencyId, excludeUserId);
    
    return {
      isAvailable: isUnique,
      message: isUnique ? undefined : 'Este email já está cadastrado nesta agência'
    };
  } catch (error) {
    return {
      isAvailable: false,
      message: 'Erro interno ao validar email'
    };
  }
}
