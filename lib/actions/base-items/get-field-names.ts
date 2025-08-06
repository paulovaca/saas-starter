'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { baseItemFields } from '@/lib/db/schema/catalog';
import { createPermissionAction } from '@/lib/actions/action-wrapper';
import { Permission } from '@/lib/auth/permissions';
import { eq, inArray } from 'drizzle-orm';

const getFieldNamesSchema = z.object({
  fieldIds: z.array(z.string().uuid('ID do campo inválido')),
});

export const getFieldNames = createPermissionAction(
  getFieldNamesSchema,
  Permission.CATALOG_READ,
  async (input) => {
    const { fieldIds } = input;

    try {
      if (fieldIds.length === 0) {
        return {};
      }

      const fields = await db
        .select({
          id: baseItemFields.id,
          name: baseItemFields.name,
          type: baseItemFields.type,
          createdAt: baseItemFields.createdAt,
        })
        .from(baseItemFields)
        .where(inArray(baseItemFields.id, fieldIds))
        .orderBy(baseItemFields.createdAt);

      // Convert to map for easy lookup, preserving order information
      const fieldNameMap: Record<string, { name: string; type: string; createdAt: Date }> = {};
      fields.forEach(field => {
        fieldNameMap[field.id] = {
          name: field.name,
          type: field.type,
          createdAt: field.createdAt
        };
      });

      return fieldNameMap;

    } catch (error) {
      console.error('Error fetching field names:', error);
      return {};
    }
  },
  {
    rateLimitKey: 'get-field-names',
    logActivity: false,
  }
);