'use server';

import { db } from '@/lib/db/drizzle';
import { operators, operatorItems, commissionRules, operatorDocuments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';

export interface OperatorDetails {
  id: string;
  name: string;
  agencyId: string;
  logo: string | null;
  cnpj: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    catalogItemId: string;
    customName: string | null;
    customValues: Record<string, any> | null;
    commissionType: 'percentage' | 'fixed' | 'tiered';
    isActive: boolean;
    commissionRules: Array<{
      id: string;
      ruleType: string;
      minValue: number | null;
      maxValue: number | null;
      percentage: number | null;
      fixedValue: number | null;
      conditions: Record<string, any> | null;
    }>;
  }>;
  documents: Array<{
    id: string;
    documentType: 'contract' | 'price_table' | 'marketing_material' | 'other';
    fileName: string;
    documentUrl: string;
    uploadedAt: Date;
  }>;
}

export async function getOperatorDetails(operatorId: string) {
  try {
    const user = await getUser();
    if (!user?.agencyId) {
      redirect('/sign-in');
    }

    // Get operator basic info
    const operator = await db
      .select()
      .from(operators)
      .where(and(
        eq(operators.id, operatorId),
        eq(operators.agencyId, user.agencyId)
      ))
      .limit(1);

    if (operator.length === 0) {
      throw new Error('Operadora não encontrada.');
    }

    // Get operator items with commission rules
    const items = await db
      .select({
        id: operatorItems.id,
        catalogItemId: operatorItems.catalogItemId,
        customName: operatorItems.customName,
        customValues: operatorItems.customValues,
        commissionType: operatorItems.commissionType,
        isActive: operatorItems.isActive,
      })
      .from(operatorItems)
      .where(eq(operatorItems.operatorId, operatorId));

    // Get commission rules for each item
    const itemsWithRules = await Promise.all(
      items.map(async (item) => {
        const rules = await db
          .select()
          .from(commissionRules)
          .where(eq(commissionRules.operatorItemId, item.id));

        return {
          ...item,
          commissionRules: rules,
        };
      })
    );

    // Get operator documents
    const documents = await db
      .select()
      .from(operatorDocuments)
      .where(eq(operatorDocuments.operatorId, operatorId));

    const operatorDetails: OperatorDetails = {
      ...operator[0],
      items: itemsWithRules,
      documents,
    };

    return {
      success: true,
      data: operatorDetails,
    };
  } catch (error) {
    console.error('Error fetching operator details:', error);
    
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
