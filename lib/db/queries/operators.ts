import { db } from '@/lib/db/drizzle';
import { operators } from '@/lib/db/schema/operators';
import { eq, and, ilike } from 'drizzle-orm';

/**
 * Get operators list with pagination and filters
 */
export async function getOperatorsList(
  agencyId: string,
  filters?: {
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(operators.agencyId, agencyId)];

    // Apply search filter
    if (filters?.search) {
      whereConditions.push(
        ilike(operators.name, `%${filters.search}%`)
      );
    }

    const operatorsList = await db.query.operators.findMany({
      where: and(...whereConditions),
      columns: {
        id: true,
        name: true,
        logo: true,
      },
      orderBy: [operators.name],
      limit,
      offset
    });

    return operatorsList;

  } catch (error) {
    console.error('Error fetching operators list:', error);
    return [];
  }
}

/**
 * Get operator by ID
 */
export async function getOperatorById(
  operatorId: string,
  agencyId: string
) {
  try {
    const operator = await db.query.operators.findFirst({
      where: and(
        eq(operators.id, operatorId),
        eq(operators.agencyId, agencyId)
      )
    });

    return operator;

  } catch (error) {
    console.error('Error fetching operator:', error);
    return null;
  }
}