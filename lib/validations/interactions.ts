import { z } from 'zod';

export const interactionFormSchema = z.object({
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note'], {
    required_error: 'Tipo de interação é obrigatório',
  }),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição não pode exceder 2000 caracteres'),
  contactDate: z.date({
    required_error: 'Data/hora da interação é obrigatória',
  }),
  durationMinutes: z
    .number()
    .int()
    .positive('Duração deve ser positiva')
    .max(600, 'Duração não pode exceder 10 horas')
    .optional(),
}).refine((data) => {
  // Duração é obrigatória para calls e meetings
  if ((data.type === 'call' || data.type === 'meeting') && !data.durationMinutes) {
    return false;
  }
  return true;
}, {
  message: 'Duração é obrigatória para ligações e reuniões',
  path: ['durationMinutes'],
});

export const interactionFiltersSchema = z.object({
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note']).optional(),
  search: z.string().max(100).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  userId: z.string().uuid().optional(),
}).refine((data) => {
  // Se dateFrom e dateTo existem, dateTo deve ser >= dateFrom
  if (data.dateFrom && data.dateTo && data.dateTo < data.dateFrom) {
    return false;
  }
  return true;
}, {
  message: 'Data final deve ser posterior à data inicial',
  path: ['dateTo'],
});

export type InteractionFormInput = z.infer<typeof interactionFormSchema>;
export type InteractionFiltersInput = z.infer<typeof interactionFiltersSchema>;
