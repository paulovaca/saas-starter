import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from './common.schema';

// Schema para login
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para registro
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  name: nameSchema,
  agencyName: z.string()
    .min(1, 'Nome da agência é obrigatório')
    .min(2, 'Nome da agência deve ter pelo menos 2 caracteres')
    .max(255, 'Nome da agência muito longo'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }
);

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Confirmação da nova senha é obrigatória'),
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  {
    message: 'Senhas não coincidem',
    path: ['confirmNewPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'A nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  }
);

// Schema para redefinição de senha (esqueci minha senha)
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }
);

// Schema para atualização de perfil
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

// Schema para verificação de email
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
});

// Schema para convite de usuário
export const inviteUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  role: z.enum(['ADMIN', 'AGENT'], {
    errorMap: () => ({ message: 'Tipo de usuário inválido' })
  }),
});

// Schema para aceitar convite
export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token de convite é obrigatório'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  }
);

// Schema para deletar conta
export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória para deletar a conta'),
  confirmation: z.string().refine(
    (val) => val === 'DELETAR',
    'Digite "DELETAR" para confirmar'
  ),
});

// Schema para configurações de segurança
export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
});

// Types derivados dos schemas
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type SecuritySettingsInput = z.infer<typeof securitySettingsSchema>;
