import { z } from 'zod';

// Schema for address
const addressSchema = z.object({
  street: z.string().optional().or(z.literal('')),
  number: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
}).optional();

// Validation for creating a new operator
export const createOperatorSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  logo: z.string().url('URL da logo inválida').optional().or(z.literal('')),
  cnpj: z.string()
    .optional().or(z.literal('')),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional().or(z.literal('')),
  contactName: z.string()
    .min(2, 'Nome do contato deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do contato deve ter no máximo 255 caracteres')
    .optional().or(z.literal('')),
  contactEmail: z.string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Email inválido'
    }),
  contactPhone: z.string()
    .optional().or(z.literal('')),
  website: z.string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Website inválido'
    }),
  address: addressSchema,
  notes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional().or(z.literal('')),
});

// Validation for updating an operator
export const updateOperatorSchema = createOperatorSchema.extend({
  id: z.string().uuid('ID inválido'),
});

// Validation for operator status toggle
export const toggleOperatorStatusSchema = z.object({
  id: z.string().uuid('ID inválido'),
  isActive: z.boolean(),
});

// Validation for logo upload
export const uploadLogoSchema = z.object({
  operatorId: z.string().uuid('ID da operadora inválido'),
  logoUrl: z.string().url('URL da logo inválida'),
});

export type CreateOperatorInput = z.infer<typeof createOperatorSchema>;
export type UpdateOperatorInput = z.infer<typeof updateOperatorSchema>;
export type ToggleOperatorStatusInput = z.infer<typeof toggleOperatorStatusSchema>;
export type UploadLogoInput = z.infer<typeof uploadLogoSchema>;
