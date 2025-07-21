import { z } from 'zod';

// Simple schema for the action wrapper (without refine transformations)
export const createUserActionSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(255).trim(),
  email: z.string().email('Email inválido').max(255).toLowerCase().trim(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT']),
  isActive: z.boolean(),
  avatar: z.string().url().optional().or(z.literal(''))
});

export type CreateUserActionData = z.infer<typeof createUserActionSchema>;