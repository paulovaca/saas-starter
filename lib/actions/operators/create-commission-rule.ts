'use server';

import { db } from '@/lib/db/drizzle';
import { commissionRules, operatorItems, operators } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { 
  createCommissionRuleSchema, 
  updateCommissionRuleSchema,
  deleteCommissionRuleSchema,
  type CreateCommissionRuleInput,
  type UpdateCommissionRuleInput,
  type DeleteCommissionRuleInput
} from '@/lib/validations/operators/commission.schema';
import { revalidatePath } from 'next/cache';

export async function createCommissionRule(data: CreateCommissionRuleInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem criar regras de comissão.');
    }

    // Validate input data
    const validatedData = createCommissionRuleSchema.parse(data);

    // Verify that the operator item belongs to the agency
    const operatorItem = await db
      .select({
        operatorId: operatorItems.operatorId,
      })
      .from(operatorItems)
      .innerJoin(operators, eq(operators.id, operatorItems.operatorId))
      .where(
        and(
          eq(operatorItems.id, validatedData.operatorItemId),
          eq(operators.agencyId, session.user.agencyId)
        )
      )
      .limit(1);

    if (operatorItem.length === 0) {
      throw new Error('Item da operadora não encontrado ou você não tem permissão para modificá-lo.');
    }

    // Create commission rule
    const [newRule] = await db
      .insert(commissionRules)
      .values(validatedData)
      .returning();

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${operatorItem[0].operatorId}`);

    return {
      success: true,
      data: newRule,
      message: 'Regra de comissão criada com sucesso!',
    };
  } catch (error) {
    console.error('Error creating commission rule:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.',
    };
  }
}

export async function updateCommissionRule(data: UpdateCommissionRuleInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem atualizar regras de comissão.');
    }

    // Validate input data
    const validatedData = updateCommissionRuleSchema.parse(data);
    const { id, ...updateData } = validatedData;

    // Verify that the commission rule belongs to the agency
    const existingRule = await db
      .select({
        operatorId: operators.id,
      })
      .from(commissionRules)
      .innerJoin(operatorItems, eq(operatorItems.id, commissionRules.operatorItemId))
      .innerJoin(operators, eq(operators.id, operatorItems.operatorId))
      .where(
        and(
          eq(commissionRules.id, id),
          eq(operators.agencyId, session.user.agencyId)
        )
      )
      .limit(1);

    if (existingRule.length === 0) {
      throw new Error('Regra de comissão não encontrada ou você não tem permissão para modificá-la.');
    }

    // Update commission rule
    const [updatedRule] = await db
      .update(commissionRules)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(commissionRules.id, id))
      .returning();

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${existingRule[0].operatorId}`);

    return {
      success: true,
      data: updatedRule,
      message: 'Regra de comissão atualizada com sucesso!',
    };
  } catch (error) {
    console.error('Error updating commission rule:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.',
    };
  }
}

export async function deleteCommissionRule(data: DeleteCommissionRuleInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Check permissions
    if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
      throw new Error('Permissão negada. Apenas Master e Admin podem excluir regras de comissão.');
    }

    // Validate input data
    const validatedData = deleteCommissionRuleSchema.parse(data);

    // Verify that the commission rule belongs to the agency
    const existingRule = await db
      .select({
        operatorId: operators.id,
      })
      .from(commissionRules)
      .innerJoin(operatorItems, eq(operatorItems.id, commissionRules.operatorItemId))
      .innerJoin(operators, eq(operators.id, operatorItems.operatorId))
      .where(
        and(
          eq(commissionRules.id, validatedData.id),
          eq(operators.agencyId, session.user.agencyId)
        )
      )
      .limit(1);

    if (existingRule.length === 0) {
      throw new Error('Regra de comissão não encontrada ou você não tem permissão para excluí-la.');
    }

    // Delete commission rule
    await db
      .delete(commissionRules)
      .where(eq(commissionRules.id, validatedData.id));

    // Revalidate pages
    revalidatePath('/operators');
    revalidatePath(`/operators/${existingRule[0].operatorId}`);

    return {
      success: true,
      message: 'Regra de comissão excluída com sucesso!',
    };
  } catch (error) {
    console.error('Error deleting commission rule:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.',
    };
  }
}
