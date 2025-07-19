import { z } from 'zod';
import type { DocumentType, InteractionType, TaskPriority, TaskStatus } from '../types/clients';

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 2 ? 0 : remainder;
  
  // Verifica primeiro dígito
  if (parseInt(cleanCPF.charAt(9)) !== digit1) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 2 ? 0 : remainder;
  
  // Verifica segundo dígito
  return parseInt(cleanCPF.charAt(10)) === digit2;
}

// Função para validar CNPJ
function validateCNPJ(cnpj: string): boolean {
  // Remove formatação
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica primeiro dígito
  if (parseInt(cleanCNPJ.charAt(12)) !== digit1) return false;
  
  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica segundo dígito
  return parseInt(cleanCNPJ.charAt(13)) === digit2;
}

// Função para validar telefone brasileiro
function validatePhoneBR(phone: string): boolean {
  // Remove formatação
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Verifica se tem 10 ou 11 dígitos
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica se começa com código de área válido (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  
  // Se tem 11 dígitos, o terceiro deve ser 9 (celular)
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;
  
  return true;
}

// Função para validar CEP
function validateCEP(cep: string): boolean {
  // Remove formatação
  const cleanCEP = cep.replace(/[^\d]/g, '');
  
  // Verifica se tem 8 dígitos
  return cleanCEP.length === 8;
}

// Schema base para documento
const documentSchema = z.object({
  documentType: z.enum(['cpf', 'cnpj'] as const, {
    required_error: 'Tipo de documento é obrigatório',
  }),
  documentNumber: z.string()
    .min(1, 'Número do documento é obrigatório')
    .max(18, 'Número do documento muito longo'),
}).refine((data) => {
  if (data.documentType === 'cpf') {
    return validateCPF(data.documentNumber);
  } else {
    return validateCNPJ(data.documentNumber);
  }
}, {
  message: 'Documento inválido',
  path: ['documentNumber'],
});

// Schema para cliente
export const clientFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email não pode exceder 255 caracteres')
    .toLowerCase()
    .optional(),
  
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return validatePhoneBR(phone);
    }, {
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
    }),
  
  documentType: z.enum(['cpf', 'cnpj'] as const, {
    required_error: 'Tipo de documento é obrigatório',
  }),
  
  documentNumber: z
    .string()
    .min(1, 'Número do documento é obrigatório'),
  
  birthDate: z
    .date()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 0 && age <= 120;
    }, {
      message: 'Data de nascimento inválida',
    }),
  
  // Endereço
  addressZipcode: z
    .string()
    .optional()
    .refine((cep) => {
      if (!cep || cep.trim() === '') return true;
      return validateCEP(cep);
    }, {
      message: 'CEP deve estar no formato XXXXX-XXX',
    }),
  
  addressStreet: z
    .string()
    .max(255, 'Logradouro não pode exceder 255 caracteres')
    .optional(),
  
  addressNumber: z
    .string()
    .max(10, 'Número não pode exceder 10 caracteres')
    .optional(),
  
  addressComplement: z
    .string()
    .max(100, 'Complemento não pode exceder 100 caracteres')
    .optional(),
  
  addressNeighborhood: z
    .string()
    .max(100, 'Bairro não pode exceder 100 caracteres')
    .optional(),
  
  addressCity: z
    .string()
    .max(100, 'Cidade não pode exceder 100 caracteres')
    .optional(),
  
  addressState: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser uma UF válida')
    .optional(),
  
  // Funil
  funnelId: z
    .string()
    .uuid('ID do funil inválido'),
  
  funnelStageId: z
    .string()
    .uuid('ID da etapa inválido'),
  
  notes: z
    .string()
    .max(2000, 'Observações não podem exceder 2000 caracteres')
    .optional(),
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
}).refine((data) => {
  // Validação cruzada de documento
  if (data.documentType === 'cpf') {
    return validateCPF(data.documentNumber);
  } else {
    return validateCNPJ(data.documentNumber);
  }
}, {
  message: 'Número do documento inválido para o tipo selecionado',
  path: ['documentNumber'],
});

// Schema para atualização de cliente (campos opcionais exceto ID)
export const clientUpdateSchema = z.object({
  id: z.string().uuid('ID do cliente inválido'),
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .optional(),
  
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email não pode exceder 255 caracteres')
    .toLowerCase()
    .optional(),
  
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true;
      return validatePhoneBR(phone);
    }, {
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
    }),
  
  documentType: z.enum(['cpf', 'cnpj'] as const).optional(),
  documentNumber: z.string().optional(),
  birthDate: z.date().optional(),
  
  // Endereço (todos opcionais)
  addressZipcode: z.string().optional(),
  addressStreet: z.string().max(255).optional(),
  addressNumber: z.string().max(10).optional(),
  addressComplement: z.string().max(100).optional(),
  addressNeighborhood: z.string().max(100).optional(),
  addressCity: z.string().max(100).optional(),
  addressState: z.string().length(2).optional(),
  
  // Funil
  funnelId: z.string().uuid().optional(),
  funnelStageId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

// Schema para interação
export const interactionFormSchema = z.object({
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note'] as const, {
    required_error: 'Tipo de interação é obrigatório',
  }),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição não pode exceder 2000 caracteres'),
  contactDate: z
    .date({
      required_error: 'Data de contato é obrigatória',
    })
    .refine((date) => {
      // Não pode ser mais de 1 ano no passado nem mais de 1 dia no futuro
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      return date >= oneYearAgo && date <= tomorrow;
    }, {
      message: 'Data deve estar entre 1 ano atrás e amanhã',
    }),
  durationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(1, 'Duração deve ser pelo menos 1 minuto')
    .max(480, 'Duração não pode exceder 8 horas')
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

// Schema para tarefa
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

// Schema para filtros de cliente
export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  funnelId: z.string().uuid().optional(),
  funnelStageId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  documentType: z.enum(['cpf', 'cnpj']).optional(),
  createdFrom: z.date().optional(),
  createdTo: z.date().optional(),
  hasInteractions: z.boolean().optional(),
  hasTasks: z.boolean().optional(),
  hasProposals: z.boolean().optional(),
}).refine((data) => {
  // Se createdFrom e createdTo existem, createdTo deve ser >= createdFrom
  if (data.createdFrom && data.createdTo && data.createdTo < data.createdFrom) {
    return false;
  }
  return true;
}, {
  message: 'Data final deve ser posterior à data inicial',
  path: ['createdTo'],
});

// Schema para filtros de interação
export const interactionFiltersSchema = z.object({
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note']).optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
}).refine((data) => {
  if (data.dateFrom && data.dateTo && data.dateTo < data.dateFrom) {
    return false;
  }
  return true;
}, {
  message: 'Data final deve ser posterior à data inicial',
  path: ['dateTo'],
});

// Schema para filtros de tarefa
export const taskFiltersSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().uuid().optional(),
  overdue: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
}).refine((data) => {
  if (data.dateFrom && data.dateTo && data.dateTo < data.dateFrom) {
    return false;
  }
  return true;
}, {
  message: 'Data final deve ser posterior à data inicial',
  path: ['dateTo'],
});

// Tipos inferidos dos schemas
export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type InteractionFormInput = z.infer<typeof interactionFormSchema>;
export type TaskFormInput = z.infer<typeof taskFormSchema>;
export type ClientFiltersInput = z.infer<typeof clientFiltersSchema>;
export type InteractionFiltersInput = z.infer<typeof interactionFiltersSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;

// Funções utilitárias para formatação
export const formatCPF = (cpf: string): string => {
  const clean = cpf.replace(/[^\d]/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  const clean = cnpj.replace(/[^\d]/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone: string): string => {
  const clean = phone.replace(/[^\d]/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const formatCEP = (cep: string): string => {
  const clean = cep.replace(/[^\d]/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Função para limpar formatação
export const cleanDocument = (document: string): string => {
  return document.replace(/[^\d]/g, '');
};

// Schema para transferência de cliente
export const transferFormSchema = z.object({
  toUserId: z.string().min(1, 'Selecione o novo responsável'),
  reason: z.string()
    .min(20, 'A justificativa deve ter pelo menos 20 caracteres')
    .max(500, 'A justificativa deve ter no máximo 500 caracteres'),
  notifyUser: z.boolean().default(true),
});

export type TransferFormInput = z.infer<typeof transferFormSchema>;
