import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  categoryId: z.string()
    .uuid('Categoria inválida'),
  isActive: z.boolean()
    .default(true),
});

export const updateItemSchema = createItemSchema.partial();

export const toggleItemStatusSchema = z.object({
  id: z.string().uuid('ID inválido'),
  isActive: z.boolean(),
});

export const cloneItemSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
});

export type CreateItemData = z.infer<typeof createItemSchema>;
export type UpdateItemData = z.infer<typeof updateItemSchema>;
export type ToggleItemStatusData = z.infer<typeof toggleItemStatusSchema>;
export type CloneItemData = z.infer<typeof cloneItemSchema>;
