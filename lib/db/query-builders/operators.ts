import { db } from '@/lib/db/drizzle';
import { operators, operatorItems, commissionRules, operatorDocuments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export class OperatorQueryBuilder {
  /**
   * Get operator with items and commission rules in a single optimized query
   */
  static withItemsAndRules(operatorId: string, agencyId: string) {
    return db
      .select({
        // Operator fields
        operatorId: operators.id,
        operatorName: operators.name,
        operatorDescription: operators.description,
        operatorLogo: operators.logo,
        operatorCnpj: operators.cnpj,
        operatorContactName: operators.contactName,
        operatorContactEmail: operators.contactEmail,
        operatorContactPhone: operators.contactPhone,
        operatorWebsite: operators.website,
        operatorAddress: operators.address,
        operatorNotes: operators.notes,
        operatorIsActive: operators.isActive,
        operatorAgencyId: operators.agencyId,
        operatorCreatedAt: operators.createdAt,
        operatorUpdatedAt: operators.updatedAt,
        
        // Item fields
        itemId: operatorItems.id,
        itemCatalogItemId: operatorItems.catalogItemId,
        itemCustomName: operatorItems.customName,
        itemCustomValues: operatorItems.customValues,
        itemCommissionType: operatorItems.commissionType,
        itemIsActive: operatorItems.isActive,
        
        // Commission rule fields
        ruleId: commissionRules.id,
        ruleType: commissionRules.ruleType,
        ruleMinValue: commissionRules.minValue,
        ruleMaxValue: commissionRules.maxValue,
        rulePercentage: commissionRules.percentage,
        ruleFixedValue: commissionRules.fixedValue,
        ruleConditions: commissionRules.conditions
      })
      .from(operators)
      .leftJoin(operatorItems, eq(operators.id, operatorItems.operatorId))
      .leftJoin(commissionRules, eq(operatorItems.id, commissionRules.operatorItemId))
      .where(and(
        eq(operators.id, operatorId),
        eq(operators.agencyId, agencyId)
      ));
  }

  /**
   * Get operator with documents in a single query
   */
  static withDocuments(operatorId: string, agencyId: string) {
    return db
      .select({
        // Operator fields
        operatorId: operators.id,
        operatorName: operators.name,
        operatorDescription: operators.description,
        operatorLogo: operators.logo,
        operatorIsActive: operators.isActive,
        
        // Document fields
        documentId: operatorDocuments.id,
        documentType: operatorDocuments.documentType,
        documentFileName: operatorDocuments.fileName,
        documentUrl: operatorDocuments.documentUrl,
        documentUploadedAt: operatorDocuments.uploadedAt
      })
      .from(operators)
      .leftJoin(operatorDocuments, eq(operators.id, operatorDocuments.operatorId))
      .where(and(
        eq(operators.id, operatorId),
        eq(operators.agencyId, agencyId)
      ));
  }

  /**
   * Get all operators for an agency with item counts (no N+1)
   */
  static allWithItemCounts(agencyId: string) {
    return db
      .select({
        operatorId: operators.id,
        operatorName: operators.name,
        operatorDescription: operators.description,
        operatorLogo: operators.logo,
        operatorIsActive: operators.isActive,
        operatorCreatedAt: operators.createdAt,
        operatorUpdatedAt: operators.updatedAt,
        itemCount: operatorItems.id // Will count items when grouped
      })
      .from(operators)
      .leftJoin(operatorItems, eq(operators.id, operatorItems.operatorId))
      .where(eq(operators.agencyId, agencyId));
  }

  /**
   * Helper method to group flat results into nested structure
   */
  static groupOperatorWithItems(flatResults: any[]) {
    return flatResults.reduce((acc, row) => {
      if (!acc.operator) {
        acc.operator = {
          id: row.operatorId,
          name: row.operatorName,
          description: row.operatorDescription,
          logo: row.operatorLogo,
          cnpj: row.operatorCnpj,
          contactName: row.operatorContactName,
          contactEmail: row.operatorContactEmail,
          contactPhone: row.operatorContactPhone,
          website: row.operatorWebsite,
          address: row.operatorAddress,
          notes: row.operatorNotes,
          isActive: row.operatorIsActive,
          createdAt: row.operatorCreatedAt,
          updatedAt: row.operatorUpdatedAt,
          agencyId: row.operatorAgencyId,
          items: []
        };
      }

      if (row.itemId) {
        let item = acc.operator.items.find((i: any) => i.id === row.itemId);
        if (!item) {
          item = {
            id: row.itemId,
            catalogItemId: row.itemCatalogItemId,
            customName: row.itemCustomName,
            customValues: row.itemCustomValues,
            commissionType: row.itemCommissionType,
            isActive: row.itemIsActive,
            commissionRules: []
          };
          acc.operator.items.push(item);
        }

        if (row.ruleId) {
          item.commissionRules.push({
            id: row.ruleId,
            ruleType: row.ruleType,
            minValue: row.ruleMinValue,
            maxValue: row.ruleMaxValue,
            percentage: row.rulePercentage,
            fixedValue: row.ruleFixedValue,
            conditions: row.ruleConditions
          });
        }
      }

      return acc;
    }, { operator: null });
  }

  /**
   * Group documents results
   */
  static groupOperatorWithDocuments(flatResults: any[]) {
    return flatResults.reduce((acc, row) => {
      if (!acc.operator) {
        acc.operator = {
          id: row.operatorId,
          name: row.operatorName,
          description: row.operatorDescription,
          logo: row.operatorLogo,
          isActive: row.operatorIsActive,
          documents: []
        };
      }

      if (row.documentId) {
        acc.operator.documents.push({
          id: row.documentId,
          documentType: row.documentType,
          fileName: row.documentFileName,
          documentUrl: row.documentUrl,
          uploadedAt: row.documentUploadedAt
        });
      }

      return acc;
    }, { operator: null });
  }
}