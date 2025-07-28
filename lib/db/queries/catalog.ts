import { db } from '@/lib/db/drizzle';
import { baseItems } from '@/lib/db/schema/catalog';
import { operators, operatorItems } from '@/lib/db/schema/operators';
import { eq, and } from 'drizzle-orm';

/**
 * Get base items available for a specific operator
 */
export async function getBaseItemsByOperator(
  operatorId: string,
  agencyId: string
) {
  try {
    // For now, return all base items for the agency with their custom fields
    const items = await db.query.baseItems.findMany({
      where: eq(baseItems.agencyId, agencyId),
      with: {
        customFields: true
      }
    });

    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      basePrice: undefined, // Would come from operator pricing
      allowPriceEdit: true, // Default for now
      customFields: item.customFields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type as 'text' | 'number' | 'select' | 'date' | 'boolean',
        required: field.isRequired,
        options: field.options || undefined
      }))
    }));

  } catch (error) {
    console.error('Error fetching base items by operator:', error);
    return [];
  }
}

/**
 * Get all base items for an agency
 */
export async function getBaseItemsList(
  agencyId: string,
  filters?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }
) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(baseItems.agencyId, agencyId)];

    // Apply search filter
    if (filters?.search) {
      // Note: This is a simplified search, you might want to use full-text search
      // For now, we'll just filter by name containing the search term
    }

    const items = await db.query.baseItems.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: [baseItems.name]
    });

    return items;

  } catch (error) {
    console.error('Error fetching base items list:', error);
    return [];
  }
}