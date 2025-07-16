'use server';

import { db } from '@/lib/db/drizzle';
import { operators, operatorItems } from '@/lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';

export interface GetOperatorsFilters {
  search?: string;
  isActive?: boolean;
  hasProducts?: boolean;
  page?: number;
  limit?: number;
}

export interface OperatorWithStats {
  id: string;
  name: string;
  logo: string | null;
  cnpj: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  itemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getOperators(filters: GetOperatorsFilters = {}) {
  try {
    const user = await getUser();
    if (!user?.agencyId) {
      redirect('/sign-in');
    }

    const {
      search,
      isActive,
      hasProducts,
      page = 1,
      limit = 20
    } = filters;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [
      eq(operators.agencyId, user.agencyId)
    ];

    if (search) {
      whereConditions.push(
        sql`(
          ${operators.name} ILIKE ${`%${search}%`} OR 
          ${operators.cnpj} ILIKE ${`%${search}%`} OR
          ${operators.contactName} ILIKE ${`%${search}%`}
        )`
      );
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(operators.isActive, isActive));
    }

    // Get operators with item counts
    const operatorsQuery = db
      .select({
        id: operators.id,
        name: operators.name,
        logo: operators.logo,
        cnpj: operators.cnpj,
        contactName: operators.contactName,
        contactEmail: operators.contactEmail,
        contactPhone: operators.contactPhone,
        isActive: operators.isActive,
        createdAt: operators.createdAt,
        updatedAt: operators.updatedAt,
        itemsCount: sql<number>`COALESCE(${count(operatorItems.id)}, 0)`,
      })
      .from(operators)
      .leftJoin(operatorItems, eq(operators.id, operatorItems.operatorId))
      .where(and(...whereConditions))
      .groupBy(operators.id)
      .orderBy(desc(operators.createdAt))
      .limit(limit)
      .offset(offset);

    const operatorsData = await operatorsQuery;

    // Filter by hasProducts if specified
    let filteredOperators = operatorsData;
    if (hasProducts !== undefined) {
      filteredOperators = operatorsData.filter((op: any) => 
        hasProducts ? op.itemsCount > 0 : op.itemsCount === 0
      );
    }

    // Get total count for pagination
    const totalQuery = db
      .select({ count: count() })
      .from(operators)
      .where(and(...whereConditions));

    const [{ count: total }] = await totalQuery;

    return {
      data: filteredOperators as OperatorWithStats[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching operators:', error);
    throw new Error('Erro ao buscar operadoras');
  }
}
