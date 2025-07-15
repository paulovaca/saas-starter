import { z } from 'zod';

// Schema para criação de etapa
export const createStageSchema = z.object({
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
  order: z.number().int().positive(),
  funnelId: z.string().uuid('ID do funil inválido'),
});

// Schema para atualização de etapa
export const updateStageSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome da etapa deve ter pelo menos 2 caracteres')
    .max(255, 'Nome da etapa deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição da etapa deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
  color: z
    .enum(['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'orange', 'pink'])
    .optional(),
  isActive: z.boolean().optional(),
});

// Schema para reordenação de etapas
export const reorderStagesSchema = z.object({
  stages: z.array(
    z.object({
      id: z.string().uuid('ID da etapa inválido'),
      order: z.number().int().positive(),
    })
  ).min(1, 'Deve haver pelo menos uma etapa'),
});

// Schema para transição de etapa
export const stageTransitionSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  fromStageId: z.string().uuid('ID da etapa de origem inválido').optional(),
  toStageId: z.string().uuid('ID da etapa de destino inválido'),
  reason: z
    .string()
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .trim()
    .optional(),
});

// Tipos TypeScript derivados dos schemas
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>;
export type StageTransitionInput = z.infer<typeof stageTransitionSchema>;
