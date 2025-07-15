import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  icon: z.string()
    .min(1, 'Ícone é obrigatório')
    .default('Package'),
  order: z.number()
    .int('Ordem deve ser um número inteiro')
    .min(0, 'Ordem deve ser um valor positivo')
    .default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const deleteCategorySchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const reorderCategoriesSchema = z.object({
  categories: z.array(z.object({
    id: z.string().uuid('ID inválido'),
    order: z.number().int().min(0),
  })),
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryData = z.infer<typeof deleteCategorySchema>;
export type ReorderCategoriesData = z.infer<typeof reorderCategoriesSchema>;
