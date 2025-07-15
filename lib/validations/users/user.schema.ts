import { z } from 'zod';

// Schema para criação de usuário
export const createUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .trim(),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email não pode exceder 255 caracteres')
    .toLowerCase()
    .trim(),
  
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      // Regex para formato brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      return phoneRegex.test(phone);
    }, 'Formato de telefone inválido. Use: (11) 99999-9999'),
  
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/\d/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
  
  confirmPassword: z.string(),
  
  role: z.enum(['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT'], {
    errorMap: () => ({ message: 'Role inválido' })
  }),
  
  isActive: z.boolean().default(true),
  
  avatar: z.string().url().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// Schema para atualização de usuário (senha opcional)
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .trim(),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email não pode exceder 255 caracteres')
    .toLowerCase()
    .trim(),
  
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      return phoneRegex.test(phone);
    }, 'Formato de telefone inválido. Use: (11) 99999-9999'),
  
  role: z.enum(['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT'], {
    errorMap: () => ({ message: 'Role inválido' })
  }),
  
  isActive: z.boolean(),
  
  avatar: z.string().url().optional().or(z.literal('')),
});

// Schema para mudança de senha
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/\d/, 'Nova senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Nova senha deve conter pelo menos um caractere especial'),
  
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'A nova senha deve ser diferente da atual',
  path: ['newPassword'],
});

// Schema para filtros de busca
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT'])
    .optional()
    .or(z.literal('').transform(() => undefined)),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Types inferred from schemas
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UserFiltersData = z.infer<typeof userFiltersSchema>;

// Schema específico para validação de email único
export const emailUniqueSchema = z.object({
  email: z.string().email(),
  excludeUserId: z.string().uuid().optional(), // Para excluir o próprio usuário na edição
});

// Schema para validação de role hierarchy
export const roleHierarchySchema = z.object({
  currentUserRole: z.enum(['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT']),
  targetRole: z.enum(['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT']),
}).refine((data) => {
  // Define hierarchy conforme as diretrizes:
  // DEVELOPER: Pode criar MASTER (apenas 1 por agência), ADMIN e AGENT
  // MASTER: Pode criar ADMIN e AGENT (NÃO pode criar outro MASTER)
  // ADMIN: Pode criar apenas AGENT (NÃO pode criar MASTER ou outro ADMIN)
  // AGENT: Não pode criar nenhum usuário
  
  const { currentUserRole, targetRole } = data;
  
  // DEVELOPER pode criar qualquer role
  if (currentUserRole === 'DEVELOPER') {
    return true;
  }
  
  // MASTER pode criar ADMIN e AGENT, mas NÃO outro MASTER
  if (currentUserRole === 'MASTER') {
    return ['ADMIN', 'AGENT'].includes(targetRole);
  }
  
  // ADMIN pode criar apenas AGENT
  if (currentUserRole === 'ADMIN') {
    return targetRole === 'AGENT';
  }
  
  // AGENT não pode criar nenhum usuário
  if (currentUserRole === 'AGENT') {
    return false;
  }
  
  return false;
}, {
  message: 'Você não tem permissão para atribuir este nível de acesso',
  path: ['targetRole'],
});

// Schema para validação de avatar upload
export const avatarUploadSchema = z.object({
  file: z.object({
    size: z.number().max(5 * 1024 * 1024, 'Arquivo deve ter no máximo 5MB'),
    type: z.string().refine((type) => {
      return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
    }, 'Apenas arquivos JPEG, PNG ou WebP são permitidos'),
  }),
});

export type AvatarUploadData = z.infer<typeof avatarUploadSchema>;
