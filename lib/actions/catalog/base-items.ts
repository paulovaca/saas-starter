'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { baseItems, baseItemFields, type BaseItem, type BaseItemField } from '@/lib/db/schema/catalog';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Get all base items for the current agency
export async function getBaseItems(): Promise<(BaseItem & { customFields: BaseItemField[] })[]> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem gerenciar itens base.');
  }

  if (!session.user.agencyId) {
    throw new Error('Agência não encontrada');
  }

  // OPTIMIZED: Single query with JOIN to avoid N+1 problem
  const itemsWithFieldsQuery = await db
    .select({
      // Base item fields
      itemId: baseItems.id,
      itemName: baseItems.name,
      itemDescription: baseItems.description,
      itemAgencyId: baseItems.agencyId,
      itemCreatedAt: baseItems.createdAt,
      itemUpdatedAt: baseItems.updatedAt,
      
      // Custom field fields
      fieldId: baseItemFields.id,
      fieldName: baseItemFields.name,
      fieldType: baseItemFields.type,
      fieldOptions: baseItemFields.options,
      fieldIsRequired: baseItemFields.isRequired,
      fieldCreatedAt: baseItemFields.createdAt,
      fieldUpdatedAt: baseItemFields.updatedAt
    })
    .from(baseItems)
    .leftJoin(baseItemFields, eq(baseItems.id, baseItemFields.baseItemId))
    .where(eq(baseItems.agencyId, session.user.agencyId))
    .orderBy(desc(baseItems.createdAt));

  // Group results to reconstruct the nested structure
  const itemsWithFields = itemsWithFieldsQuery.reduce((acc: any[], row) => {
    let item = acc.find(i => i.id === row.itemId);
    
    if (!item) {
      item = {
        id: row.itemId,
        name: row.itemName,
        description: row.itemDescription,
        agencyId: row.itemAgencyId,
        createdAt: row.itemCreatedAt,
        updatedAt: row.itemUpdatedAt,
        customFields: []
      };
      acc.push(item);
    }

    // Add custom field if it exists
    if (row.fieldId) {
      item.customFields.push({
        id: row.fieldId,
        name: row.fieldName,
        type: row.fieldType,
        options: row.fieldOptions,
        isRequired: row.fieldIsRequired,
        createdAt: row.fieldCreatedAt,
        baseItemId: row.itemId,
        updatedAt: row.fieldUpdatedAt
      });
    }

    return acc;
  }, []);

  return itemsWithFields;
}

// Get a specific base item by ID
export async function getBaseItemById(itemId: string): Promise<(BaseItem & { customFields: BaseItemField[] }) | null> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem gerenciar itens base.');
  }

  if (!session.user.agencyId) {
    throw new Error('Agência não encontrada');
  }

  const [item] = await db
    .select()
    .from(baseItems)
    .where(and(
      eq(baseItems.id, itemId),
      eq(baseItems.agencyId, session.user.agencyId)
    ));

  if (!item) {
    return null;
  }

  const customFields = await db
    .select()
    .from(baseItemFields)
    .where(eq(baseItemFields.baseItemId, item.id));

  return {
    ...item,
    customFields,
  };
}

// Create a new base item
export async function createBaseItem(data: {
  name: string;
  description?: string;
}) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem criar itens base.');
  }

  if (!session.user.agencyId) {
    throw new Error('Agência não encontrada');
  }

  const [newItem] = await db
    .insert(baseItems)
    .values({
      name: data.name,
      description: data.description,
      agencyId: session.user.agencyId,
    })
    .returning();

  revalidatePath('/catalog');
  return newItem;
}

// Update a base item
export async function updateBaseItem(itemId: string, data: {
  name?: string;
  description?: string;
}) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem editar itens base.');
  }

  if (!session.user.agencyId) {
    throw new Error('Agência não encontrada');
  }

  const [updatedItem] = await db
    .update(baseItems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(
      eq(baseItems.id, itemId),
      eq(baseItems.agencyId, session.user.agencyId)
    ))
    .returning();

  revalidatePath('/catalog');
  return updatedItem;
}

// Delete a base item
export async function deleteBaseItem(itemId: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem excluir itens base.');
  }

  if (!session.user.agencyId) {
    throw new Error('Agência não encontrada');
  }

  // First delete all custom fields
  await db
    .delete(baseItemFields)
    .where(eq(baseItemFields.baseItemId, itemId));

  // Then delete the item
  await db
    .delete(baseItems)
    .where(and(
      eq(baseItems.id, itemId),
      eq(baseItems.agencyId, session.user.agencyId)
    ));

  revalidatePath('/catalog');
}
