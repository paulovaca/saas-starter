import { z } from 'zod';

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (parseInt(cleanCPF[9]) !== firstDigit) return false;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  return parseInt(cleanCPF[10]) === secondDigit;
}

// Função para validar CNPJ
function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (parseInt(cleanCNPJ[12]) !== firstDigit) return false;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  return parseInt(cleanCNPJ[13]) === secondDigit;
}

// Função para validar telefone brasileiro
function validateBrazilianPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;
  
  // Verifica se o DDD é válido (11 a 99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Para números de 11 dígitos, verifica se o primeiro dígito do número é 9 (celular)
  if (cleanPhone.length === 11) {
    const firstDigit = parseInt(cleanPhone[2]);
    if (firstDigit !== 9) return false;
  }
  
  return true;
}

// Função para validar CEP brasileiro
function validateBrazilianCEP(cep: string): boolean {
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (cleanCEP.length !== 8) return false;
  
  // Verifica se não são todos zeros
  if (cleanCEP === '00000000') return false;
  
  return true;
}

// Função para formatar CPF
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length === 0) return '';
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar CNPJ
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return '';
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length === 0) return '';
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Função para formatar telefone
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'Não informado';
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// Função para formatar CEP
export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return 'Não informado';
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Schema para validação de CPF
export const cpfSchema = z.string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF deve ter no máximo 14 caracteres')
  .refine((value) => validateCPF(value), {
    message: 'CPF inválido'
  })
  .transform((value) => value.replace(/\D/g, ''));

// Schema para validação de CNPJ
export const cnpjSchema = z.string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ deve ter no máximo 18 caracteres')
  .refine((value) => validateCNPJ(value), {
    message: 'CNPJ inválido'
  })
  .transform((value) => value.replace(/\D/g, ''));

// Schema para validação de documento (CPF ou CNPJ)
export const documentSchema = z.object({
  type: z.enum(['cpf', 'cnpj'], {
    required_error: 'Tipo de documento é obrigatório',
    invalid_type_error: 'Tipo de documento deve ser CPF ou CNPJ'
  }),
  number: z.string().min(1, 'Número do documento é obrigatório')
}).refine((data) => {
  if (data.type === 'cpf') {
    return validateCPF(data.number);
  } else {
    return validateCNPJ(data.number);
  }
}, {
  message: 'Número do documento inválido',
  path: ['number']
});

// Schema para validação de telefone brasileiro
export const brazilianPhoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 caracteres')
  .refine((value) => validateBrazilianPhone(value), {
    message: 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
  })
  .transform((value) => value.replace(/\D/g, ''));

// Schema para validação de CEP brasileiro (aceita vazio)
export const brazilianCEPSchema = z.string()
  .refine((value) => {
    if (!value || value.trim() === '') return true; // Aceita vazio
    return value.replace(/\D/g, '').length === 8;
  }, {
    message: 'CEP deve ter 8 dígitos'
  })
  .refine((value) => {
    if (!value || value.trim() === '') return true; // Aceita vazio
    return validateBrazilianCEP(value);
  }, {
    message: 'CEP deve estar no formato XXXXX-XXX'
  })
  .transform((value) => value ? value.replace(/\D/g, '') : '');

// Schema para validação de UF (estado) (aceita vazio)
export const ufSchema = z.string()
  .refine((value) => {
    if (!value || value.trim() === '') return true; // Aceita vazio
    return value.length === 2;
  }, {
    message: 'UF deve ter 2 caracteres'
  })
  .refine((value) => {
    if (!value || value.trim() === '') return true; // Aceita vazio
    return /^[A-Z]{2}$/.test(value);
  }, {
    message: 'UF deve conter apenas letras maiúsculas'
  })
  .refine((value) => {
    if (!value || value.trim() === '') return true; // Aceita vazio
    const validUFs = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    return validUFs.includes(value);
  }, {
    message: 'UF inválida'
  });

// Schema para validação de cliente
export const clientSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .transform((value) => value.trim()),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .transform((value) => value.toLowerCase().trim())
    .optional()
    .or(z.literal('')),
  
  phone: brazilianPhoneSchema,
  
  documentType: z.enum(['cpf', 'cnpj'], {
    required_error: 'Tipo de documento é obrigatório',
    invalid_type_error: 'Tipo de documento deve ser CPF ou CNPJ'
  }).optional().transform((value) => {
    // Se não há documento, não precisa de tipo
    return value;
  }),
  
  documentNumber: z.string().optional().or(z.literal('')).transform((value) => {
    return value === '' ? undefined : value;
  }),
  
  birthDate: z.string().optional().or(z.literal('')).transform((value) => {
    if (!value || value === '') return undefined;
    // Criar data no fuso horário local (meio-dia para evitar problemas de fuso)
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return isNaN(date.getTime()) ? undefined : date;
  }),
  
  // Campos de endereço
  addressZipcode: z.string().optional().or(z.literal('')),
  addressStreet: z.string().max(255, 'Logradouro deve ter no máximo 255 caracteres').optional().or(z.literal('')),
  addressNumber: z.string().max(10, 'Número deve ter no máximo 10 caracteres').optional().or(z.literal('')),
  addressComplement: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional().or(z.literal('')),
  addressNeighborhood: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').optional().or(z.literal('')),
  addressCity: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional().or(z.literal('')),
  addressState: z.string().optional().or(z.literal('')),
  
  // Campos de funil
  funnelId: z.string().uuid('ID do funil deve ser um UUID válido').optional().or(z.literal('')),
  funnelStageId: z.string().uuid('ID da etapa do funil deve ser um UUID válido').optional().or(z.literal('')),
  
  notes: z.string().max(2000, 'Observações devem ter no máximo 2000 caracteres').optional().or(z.literal('')),
  
  isActive: z.boolean().default(true)
});

// Schema para interações com cliente
export const clientInteractionSchema = z.object({
  clientId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note'], {
    required_error: 'Tipo de interação é obrigatório'
  }),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  contactDate: z.string().transform((value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error('Data de contato inválida');
    return date;
  }),
  durationMinutes: z.number().min(0, 'Duração não pode ser negativa').max(1440, 'Duração não pode ser maior que 24 horas').optional()
});

// Schema para tarefas de cliente
export const clientTaskSchema = z.object({
  clientId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  assignedTo: z.string().uuid('ID do responsável deve ser um UUID válido'),
  title: z.string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z.string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Prioridade é obrigatória'
  }),
  dueDate: z.string().transform((value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error('Data de vencimento inválida');
    return date;
  }).refine((date) => {
    return date > new Date();
  }, {
    message: 'Data de vencimento deve ser futura'
  })
});

// Schema para transferência de cliente
export const clientTransferSchema = z.object({
  clientId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  toUserId: z.string().uuid('ID do novo responsável deve ser um UUID válido'),
  reason: z.string()
    .min(20, 'Justificativa deve ter pelo menos 20 caracteres')
    .max(1000, 'Justificativa deve ter no máximo 1000 caracteres')
});

// Schema para filtros de cliente
export const clientFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'lost']).optional(),
  funnelId: z.string().uuid().optional(),
  funnelStageId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  documentType: z.enum(['cpf', 'cnpj']).optional(),
  city: z.string().max(100).optional(),
  state: ufSchema.optional(),
  hasInteractions: z.boolean().optional(),
  hasTasks: z.boolean().optional(),
  hasProposals: z.boolean().optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
  lastInteractionFrom: z.date().optional(),
  lastInteractionTo: z.date().optional()
});

// Schema para paginação
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  orderBy: z.string().max(50).default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).default('desc')
});

// Tipos inferidos dos schemas
export type ClientFormData = z.infer<typeof clientSchema>;
export type ClientInteractionFormData = z.infer<typeof clientInteractionSchema>;
export type ClientTaskFormData = z.infer<typeof clientTaskSchema>;
export type ClientTransferFormData = z.infer<typeof clientTransferSchema>;
export type ClientFilters = z.infer<typeof clientFiltersSchema>;
export type PaginationOptions = z.infer<typeof paginationSchema>;

// Schema para atualizações parciais (sem transformações)
export const clientUpdateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  documentType: z.enum(['cpf', 'cnpj']).optional(),
  documentNumber: z.string().optional(),
  birthDate: z.string().optional().transform((value) => {
    if (!value || value === '') return undefined;
    // Criar data no fuso horário local (meio-dia para evitar problemas de fuso)
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return isNaN(date.getTime()) ? undefined : date;
  }),
  addressZipcode: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  funnelId: z.string().uuid().optional(),
  funnelStageId: z.string().uuid().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
});

// Função para validar e limpar dados do cliente
export function validateAndCleanClientData(data: unknown): { success: boolean; data?: ClientFormData; errors?: string[] } {
  try {
    const result = clientSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

// Função para validar email único na agência
export function createUniqueEmailValidator(existingEmails: string[], currentEmail?: string) {
  return z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .refine((email) => {
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedCurrentEmail = currentEmail?.toLowerCase().trim();
      
      // Se é o mesmo email atual, permite
      if (normalizedCurrentEmail && normalizedEmail === normalizedCurrentEmail) {
        return true;
      }
      
      // Verifica se o email já existe
      return !existingEmails.some(existing => 
        existing.toLowerCase().trim() === normalizedEmail
      );
    }, {
      message: 'Este email já está sendo usado por outro cliente'
    });
}

// Função para validar documento único na agência
export function createUniqueDocumentValidator(existingDocuments: string[], currentDocument?: string) {
  return z.string()
    .min(1, 'Número do documento é obrigatório')
    .refine((document) => {
      const normalizedDocument = document.replace(/\D/g, '');
      const normalizedCurrentDocument = currentDocument?.replace(/\D/g, '');
      
      // Se é o mesmo documento atual, permite
      if (normalizedCurrentDocument && normalizedDocument === normalizedCurrentDocument) {
        return true;
      }
      
      // Verifica se o documento já existe
      return !existingDocuments.some(existing => 
        existing.replace(/\D/g, '') === normalizedDocument
      );
    }, {
      message: 'Este documento já está sendo usado por outro cliente'
    });
}
