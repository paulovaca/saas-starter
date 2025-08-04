'use server';

import { db } from '@/lib/db/drizzle';
import { operatorDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';
import { OperatorQueryBuilder } from '@/lib/db/query-builders/operators';

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

    // OPTIMIZED: Single query to get operator with all items and commission rules
    console.log(`Buscando detalhes da operadora ${operatorId} em ${new Date().toISOString()}`);
    const operatorWithItemsQuery = await OperatorQueryBuilder.withItemsAndRules(operatorId, user.agencyId);
    console.log(`Encontrados ${operatorWithItemsQuery.length} registros na query`);
    
    if (operatorWithItemsQuery.length === 0) {
      throw new Error('Operadora não encontrada.');
    }

    // Group flat results into nested structure
    const grouped = OperatorQueryBuilder.groupOperatorWithItems(operatorWithItemsQuery);
    
    if (!grouped.operator) {
      throw new Error('Operadora não encontrada.');
    }

    // Get operator documents
    const documents = await db
      .select()
      .from(operatorDocuments)
      .where(eq(operatorDocuments.operatorId, operatorId));

    const operatorDetails: OperatorDetails = {
      ...grouped.operator,
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
