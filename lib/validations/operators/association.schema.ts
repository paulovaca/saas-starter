import { z } from 'zod';

// Validation for associating items with operators
export const associateItemsSchema = z.object({
  operatorId: z.string().uuid('ID da operadora inválido'),
  catalogItemId: z.string().uuid('ID do item do catálogo inválido'),
  customName: z.string()
    .min(2, 'Nome customizado deve ter pelo menos 2 caracteres')
    .max(255, 'Nome customizado deve ter no máximo 255 caracteres')
    .optional().or(z.literal('')),
  customValues: z.record(z.any()).optional(),
  commissionType: z.enum(['percentage', 'fixed', 'tiered'], {
    errorMap: () => ({ message: 'Tipo de comissão deve ser: percentage, fixed ou tiered' }),
  }).default('percentage').optional(),
  isActive: z.boolean().default(true),
});

// Validation for updating item association
export const updateItemAssociationSchema = associateItemsSchema.extend({
  id: z.string().uuid('ID inválido'),
});

// Validation for removing item association
export const removeItemAssociationSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Validation for toggling item status
export const toggleItemStatusSchema = z.object({
  id: z.string().uuid('ID inválido'),
  isActive: z.boolean(),
});

// Validation for bulk association
export const bulkAssociateItemsSchema = z.object({
  operatorId: z.string().uuid('ID da operadora inválido'),
  items: z.array(z.object({
    catalogItemId: z.string().uuid('ID do item do catálogo inválido'),
    customName: z.string().optional(),
    commissionType: z.enum(['percentage', 'fixed', 'tiered']).default('percentage'),
  })).min(1, 'Deve selecionar pelo menos um item'),
});

export type AssociateItemsInput = z.infer<typeof associateItemsSchema>;
export type UpdateItemAssociationInput = z.infer<typeof updateItemAssociationSchema>;
export type RemoveItemAssociationInput = z.infer<typeof removeItemAssociationSchema>;
export type ToggleItemStatusInput = z.infer<typeof toggleItemStatusSchema>;
export type BulkAssociateItemsInput = z.infer<typeof bulkAssociateItemsSchema>;
