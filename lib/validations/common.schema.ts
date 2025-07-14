import { z } from 'zod';

/**
 * Validação de CPF
 */
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Validação de CNPJ
 */
function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return digit2 === parseInt(cleanCNPJ.charAt(13));
}

/**
 * Validação de CEP
 */
function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return /^\d{8}$/.test(cleanCEP);
}

/**
 * Validação de telefone brasileiro
 */
function isValidBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Aceita formatos: (11) 98765-4321, 11987654321, +5511987654321
  // Celular: 11 dígitos (com DDD) ou 13 dígitos (com código do país)
  // Fixo: 10 dígitos (com DDD) ou 12 dígitos (com código do país)
  
  if (cleanPhone.length === 10) {
    // Telefone fixo: DDD + 8 dígitos
    return /^[1-9]{2}[2-5]\d{7}$/.test(cleanPhone);
  } else if (cleanPhone.length === 11) {
    // Celular: DDD + 9 dígitos
    return /^[1-9]{2}9[6-9]\d{7}$/.test(cleanPhone);
  } else if (cleanPhone.length === 12) {
    // Telefone fixo com código do país: 55 + DDD + 8 dígitos
    return /^55[1-9]{2}[2-5]\d{7}$/.test(cleanPhone);
  } else if (cleanPhone.length === 13) {
    // Celular com código do país: 55 + DDD + 9 dígitos
    return /^55[1-9]{2}9[6-9]\d{7}$/.test(cleanPhone);
  }
  
  return false;
}

// Schemas Zod para validação

export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine(isValidCPF, 'CPF inválido');

export const cnpjSchema = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .refine(isValidCNPJ, 'CNPJ inválido');

export const cepSchema = z
  .string()
  .min(1, 'CEP é obrigatório')
  .refine(isValidCEP, 'CEP deve ter 8 dígitos');

export const brazilianPhoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine(isValidBrazilianPhone, 'Telefone brasileiro inválido');

export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .max(255, 'Email muito longo');

export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(255, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços');

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número');

// Schemas para endereços brasileiros
export const brazilianAddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória').max(255),
  number: z.string().min(1, 'Número é obrigatório').max(10),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório').max(100),
  city: z.string().min(1, 'Cidade é obrigatória').max(100),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').regex(/^[A-Z]{2}$/, 'Estado deve estar em maiúsculas'),
  cep: cepSchema,
});

// Estados brasileiros válidos
export const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export const brazilianStateSchema = z.enum(brazilianStates, {
  errorMap: () => ({ message: 'Estado brasileiro inválido' })
});

// Helpers para formatação
export const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatCEP = (cep: string): string => {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatBrazilianPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};
