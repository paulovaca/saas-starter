import { z } from 'zod';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título não pode exceder 255 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição não pode exceder 2000 caracteres')
    .optional(),
  priority: z.enum(['low', 'medium', 'high'] as const, {
    required_error: 'Prioridade é obrigatória',
  }),
  dueDate: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  assignedTo: z.string().uuid('ID do responsável inválido'),
  notifyAssignee: z.boolean(),
}).refine((data) => {
  // Data de vencimento não pode ser no passado
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Remove horas para comparar apenas a data
  
  const dueDate = new Date(data.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate >= now;
}, {
  message: 'Data de vencimento não pode ser no passado',
  path: ['dueDate'],
});

export const taskUpdateSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(255, 'Título não pode exceder 255 caracteres')
    .optional(),
  description: z
    .string()
    .max(2000, 'Descrição não pode exceder 2000 caracteres')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dueDate: z.date().optional(),
  assignedTo: z.string().uuid('ID do responsável inválido').optional(),
});

export const taskFiltersSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().uuid().optional(),
  overdue: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
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

export type TaskFormInput = z.infer<typeof taskFormSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
