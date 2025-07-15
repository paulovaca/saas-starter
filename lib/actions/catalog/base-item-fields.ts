'use server';

import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db/drizzle';
import { baseItemFields, type BaseItemField, type NewBaseItemField, type FieldType } from '@/lib/db/schema/catalog';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Get all fields for a specific base item
export async function getBaseItemFields(baseItemId: string): Promise<BaseItemField[]> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem visualizar campos de itens base.');
  }

  const fields = await db
    .select()
    .from(baseItemFields)
    .where(eq(baseItemFields.baseItemId, baseItemId))
    .orderBy(asc(baseItemFields.createdAt));

  return fields;
}

// Add a new custom field to a base item
export async function addBaseItemField(data: {
  baseItemId: string;
  name: string;
  type: FieldType;
  options?: string[];
  isRequired?: boolean;
}) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem gerenciar campos de itens base.');
  }

  const newField: NewBaseItemField = {
    baseItemId: data.baseItemId,
    name: data.name,
    type: data.type,
    options: data.options || null,
    isRequired: data.isRequired || false,
  };

  const [field] = await db.insert(baseItemFields).values(newField).returning();

  revalidatePath('/catalog');
  revalidatePath(`/catalog/${data.baseItemId}`);
  
  return field;
}

// Update an existing field
export async function updateBaseItemField(
  fieldId: string,
  data: {
    name?: string;
    type?: FieldType;
    options?: string[];
    isRequired?: boolean;
  }
) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem editar campos de itens base.');
  }

  const updateData: Partial<BaseItemField> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.options !== undefined) updateData.options = data.options;
  if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;

  const [field] = await db
    .update(baseItemFields)
    .set(updateData)
    .where(eq(baseItemFields.id, fieldId))
    .returning();

  if (!field) {
    throw new Error('Campo não encontrado');
  }

  revalidatePath('/catalog');
  revalidatePath(`/catalog/${field.baseItemId}`);
  
  return field;
}

// Remove a field from a base item
export async function removeBaseItemField(fieldId: string): Promise<void> {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Não autorizado');
  }

  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    throw new Error('Acesso negado. Apenas Master e Admin podem remover campos de itens base.');
  }

  // Get the field first to revalidate the correct path
  const [field] = await db
    .select()
    .from(baseItemFields)
    .where(eq(baseItemFields.id, fieldId));

  if (!field) {
    throw new Error('Campo não encontrado');
  }

  await db.delete(baseItemFields).where(eq(baseItemFields.id, fieldId));

  revalidatePath('/catalog');
  revalidatePath(`/catalog/${field.baseItemId}`);
}
