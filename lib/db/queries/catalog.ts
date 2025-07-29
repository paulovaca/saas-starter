import { db } from '@/lib/db/drizzle';
import { baseItems } from '@/lib/db/schema/catalog';
import { operators, operatorItems } from '@/lib/db/schema/operators';
import { eq, and, count } from 'drizzle-orm';

/**
 * Get base items available for a specific operator
 */
export async function getBaseItemsByOperator(
  operatorId: string,
  agencyId: string
) {
  try {
    // Get operator items that link this operator to base items
    const operatorItemsList = await db.query.operatorItems.findMany({
      where: and(
        eq(operatorItems.operatorId, operatorId),
        eq(operatorItems.isActive, true)
      ),
      with: {
        catalogItem: {
          with: {
            customFields: true
          }
        },
        commissionRules: true
      }
    });

    // If no operator items exist, return empty array
    if (operatorItemsList.length === 0) {
      return [];
    }

    // Transform the data to match the expected format
    return operatorItemsList.map(opItem => {
      const baseItem = opItem.catalogItem;
      
      // Find the default commission rule (if any)
      const defaultCommission = opItem.commissionRules.find(rule => rule.ruleType === 'default');
      
      return {
        id: baseItem.id,
        name: opItem.customName || baseItem.name, // Use custom name if available
        description: baseItem.description,
        basePrice: defaultCommission?.fixedValue || undefined,
        allowPriceEdit: opItem.commissionType !== 'fixed',
        customFields: baseItem.customFields.map(field => ({
          id: field.id,
          name: field.name,
          type: field.type as 'text' | 'number' | 'select' | 'date' | 'boolean',
          required: field.isRequired,
          options: field.options || undefined
        }))
      };
    });

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

/**
 * Check if an operator has any configured items
 */
export async function operatorHasItems(operatorId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ count: count() })
      .from(operatorItems)
      .where(
        and(
          eq(operatorItems.operatorId, operatorId),
          eq(operatorItems.isActive, true)
        )
      );
    
    return result[0]?.count > 0;
  } catch (error) {
    console.error('Error checking if operator has items:', error);
    return false;
  }
}