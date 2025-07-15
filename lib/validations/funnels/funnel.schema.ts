import { z } from 'zod';

// Schema para criação de funil
export const createFunnelSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim()
    .optional(),
  isDefault: z.boolean().optional().default(false),
  stages: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, 'Nome da etapa deve ter pelo menos 2 caracteres')
          .max(255, 'Nome da etapa deve ter no máximo 255 caracteres')
          .trim(),
        description: z
          .string()
          .max(500, 'Descrição da etapa deve ter no máximo 500 caracteres')
          .trim()
          .optional(),
        color: z
          .enum(['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'orange', 'pink'])
          .default('blue'),
      })
    )
    .min(2, 'Um funil deve ter pelo menos 2 etapas')
    .max(10, 'Um funil pode ter no máximo 10 etapas'),
});

// Schema para atualização de funil
export const updateFunnelSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim()
    .optional(),
  isDefault: z.boolean().optional(),
});

// Schema para filtros de busca
export const funnelFiltersSchema = z.object({
  search: z.string().optional(),
  isDefault: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Tipos TypeScript derivados dos schemas
export type CreateFunnelInput = z.infer<typeof createFunnelSchema>;
export type UpdateFunnelInput = z.infer<typeof updateFunnelSchema>;
export type FunnelFiltersInput = z.infer<typeof funnelFiltersSchema>;
