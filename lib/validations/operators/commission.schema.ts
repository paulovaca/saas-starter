import { z } from 'zod';

// Base commission rule schema
const baseCommissionRuleSchema = z.object({
  operatorItemId: z.string().uuid('ID do item da operadora inválido'),
  ruleType: z.enum(['percentage_fixed', 'value_fixed', 'tiered', 'custom'], {
    errorMap: () => ({ message: 'Tipo de regra deve ser: percentage_fixed, value_fixed, tiered ou custom' }),
  }),
  minValue: z.number()
    .min(0, 'Valor mínimo deve ser maior ou igual a 0')
    .optional(),
  maxValue: z.number()
    .min(0, 'Valor máximo deve ser maior ou igual a 0')
    .optional(),
  percentage: z.number()
    .min(0, 'Percentual deve ser maior ou igual a 0')
    .max(100, 'Percentual deve ser menor ou igual a 100')
    .optional(),
  fixedValue: z.number()
    .min(0, 'Valor fixo deve ser maior ou igual a 0')
    .optional(),
  conditions: z.record(z.any()).optional(),
  // Campos para escalonamento
  tiers: z.array(z.object({
    minAmount: z.number().min(0),
    maxAmount: z.number().min(0),
    percentage: z.number().min(0).max(100).optional(),
    fixedValue: z.number().min(0).optional(),
  })).optional(),
});

// Validation for commission rules
export const createCommissionRuleSchema = baseCommissionRuleSchema.refine((data) => {
  // Must have either percentage or fixedValue
  return data.percentage !== undefined || data.fixedValue !== undefined;
}, {
  message: 'Deve ter percentual ou valor fixo definido',
}).refine((data) => {
  // If tiered, must have min and max values
  if (data.ruleType === 'tiered') {
    return data.minValue !== undefined && data.maxValue !== undefined;
  }
  return true;
}, {
  message: 'Regras escalonadas devem ter valores mínimo e máximo definidos',
}).refine((data) => {
  // MaxValue must be greater than minValue
  if (data.minValue !== undefined && data.maxValue !== undefined) {
    return data.maxValue > data.minValue;
  }
  return true;
}, {
  message: 'Valor máximo deve ser maior que o valor mínimo',
});

export const updateCommissionRuleSchema = baseCommissionRuleSchema.omit({
  operatorItemId: true,
}).extend({
  id: z.string().uuid('ID inválido'),
}).refine((data) => {
  return data.percentage !== undefined || data.fixedValue !== undefined;
}, {
  message: 'Deve ter percentual ou valor fixo definido',
}).refine((data) => {
  if (data.ruleType === 'tiered') {
    return data.minValue !== undefined && data.maxValue !== undefined;
  }
  return true;
}, {
  message: 'Regras escalonadas devem ter valores mínimo e máximo definidos',
}).refine((data) => {
  if (data.minValue !== undefined && data.maxValue !== undefined) {
    return data.maxValue > data.minValue;
  }
  return true;
}, {
  message: 'Valor máximo deve ser maior que o valor mínimo',
});

export const deleteCommissionRuleSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Validation for commission calculation
export const calculateCommissionSchema = z.object({
  operatorItemId: z.string().uuid('ID do item da operadora inválido'),
  saleValue: z.number().min(0, 'Valor da venda deve ser maior que 0'),
  paymentMethod: z.string().optional(),
  conditions: z.record(z.any()).optional(),
});

export type CreateCommissionRuleInput = z.infer<typeof createCommissionRuleSchema>;
export type UpdateCommissionRuleInput = z.infer<typeof updateCommissionRuleSchema>;
export type DeleteCommissionRuleInput = z.infer<typeof deleteCommissionRuleSchema>;
export type CalculateCommissionInput = z.infer<typeof calculateCommissionSchema>;
