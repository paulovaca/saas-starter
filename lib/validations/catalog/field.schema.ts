import { z } from 'zod';

const fieldTypeEnum = z.enum([
  'text',
  'number', 
  'date',
  'select',
  'multiselect',
  'boolean',
  'currency'
]);

export const createCustomFieldSchema = z.object({
  itemId: z.string().uuid('Item ID inválido'),
  fieldName: z.string()
    .min(2, 'Nome do campo deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do campo deve ter no máximo 255 caracteres')
    .trim(),
  fieldType: fieldTypeEnum,
  fieldOptions: z.array(z.string().trim().min(1))
    .optional(),
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  placeholder: z.string().max(255).optional(),
  helpText: z.string().max(500).optional(),
  defaultValue: z.string().max(500).optional(),
  validations: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

export const updateCustomFieldSchema = z.object({
  fieldName: z.string()
    .min(2, 'Nome do campo deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do campo deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  fieldType: fieldTypeEnum.optional(),
  fieldOptions: z.array(z.string().trim().min(1))
    .optional(),
  required: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  placeholder: z.string().max(255).optional(),
  helpText: z.string().max(500).optional(),
  defaultValue: z.string().max(500).optional(),
  validations: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

export const removeCustomFieldSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const reorderFieldsSchema = z.object({
  itemId: z.string().uuid('Item ID inválido'),
  fields: z.array(z.object({
    id: z.string().uuid('Field ID inválido'),
    order: z.number().int().min(0),
  })),
});

export type CreateCustomFieldData = z.infer<typeof createCustomFieldSchema>;
export type UpdateCustomFieldData = z.infer<typeof updateCustomFieldSchema>;
export type RemoveCustomFieldData = z.infer<typeof removeCustomFieldSchema>;
export type ReorderFieldsData = z.infer<typeof reorderFieldsSchema>;
