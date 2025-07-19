// Tipos para o módulo de clientes
export type DocumentType = 'cpf' | 'cnpj';
export type InteractionType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Interface principal do cliente
export interface Client {
  id: string;
  agencyId: string;
  userId: string; // Agente responsável
  name: string;
  email: string;
  phone?: string | null;
  documentType: DocumentType;
  documentNumber: string;
  birthDate?: Date | null;
  
  // Endereço
  addressZipcode?: string | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  
  // Funil de vendas
  funnelId: string;
  funnelStageId: string;
  
  // Metadados
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Cliente com dados relacionados
export interface ClientWithRelations extends Client {
  user: {
    id: string;
    name: string;
    email: string;
  };
  funnel: {
    id: string;
    name: string;
  };
  funnelStage: {
    id: string;
    name: string;
    color: string;
    order: number;
  };
  _count?: {
    interactions: number;
    tasks: number;
    proposals: number;
  };
  lastInteraction?: {
    id: string;
    type: InteractionType;
    contactDate: Date;
  } | null;
  totalProposals?: number;
  totalValue?: number;
}

// Dados do formulário de cliente
export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  birthDate?: Date;
  addressZipcode?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  funnelId?: string;
  funnelStageId?: string;
  notes?: string;
  isActive?: boolean;
}

// Interface de interação com cliente
export interface ClientInteraction {
  id: string;
  clientId: string;
  userId: string;
  type: InteractionType;
  description: string;
  contactDate: Date;
  durationMinutes?: number | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Dados do formulário de interação
export interface InteractionFormData {
  type: InteractionType;
  description: string;
  contactDate: Date;
  durationMinutes?: number;
}

// Interface de tarefa do cliente
export interface ClientTask {
  id: string;
  clientId: string;
  assignedTo: string;
  createdBy: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Dados do formulário de tarefa
export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: Date;
  assignedTo: string;
  notifyAssignee: boolean;
}

// Interface de transferência de cliente
export interface ClientTransfer {
  id: string;
  clientId: string;
  fromUserId: string;
  toUserId: string;
  transferredBy: string;
  reason: string;
  transferredAt: Date;
  fromUser?: {
    id: string;
    name: string;
    email: string;
  };
  toUser?: {
    id: string;
    name: string;
    email: string;
  };
  transferredByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Dados do formulário de transferência
export interface TransferFormData {
  toUserId: string;
  reason: string;
  notifyUser: boolean;
}

// Filtros para busca de clientes
export interface ClientFilters {
  search?: string; // Nome, email, CPF/CNPJ
  userId?: string; // Agente responsável
  funnelId?: string;
  funnelStageId?: string;
  isActive?: boolean;
  documentType?: DocumentType;
  createdFrom?: Date;
  createdTo?: Date;
  hasInteractions?: boolean;
  hasTasks?: boolean;
  hasProposals?: boolean;
}

// Filtros para interações
export interface InteractionFilters {
  type?: InteractionType;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string; // Buscar na descrição
}

// Filtros para tarefas
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  overdue?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// Constantes de configuração
export const INTERACTION_TYPES = {
  call: {
    label: 'Ligação',
    icon: '📞',
    color: 'blue',
    requiresDuration: true,
  },
  email: {
    label: 'Email',
    icon: '✉️',
    color: 'green',
    requiresDuration: false,
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: '💬',
    color: 'green',
    requiresDuration: false,
  },
  meeting: {
    label: 'Reunião',
    icon: '👥',
    color: 'purple',
    requiresDuration: true,
  },
  note: {
    label: 'Observação',
    icon: '📝',
    color: 'gray',
    requiresDuration: false,
  },
} as const;

export const TASK_PRIORITIES = {
  low: {
    label: 'Baixa',
    color: 'green',
    icon: '🟢',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  medium: {
    label: 'Média',
    color: 'yellow',
    icon: '🟡',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  high: {
    label: 'Alta',
    color: 'red',
    icon: '🔴',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
} as const;

export const TASK_STATUS = {
  pending: {
    label: 'Pendente',
    color: 'gray',
    icon: '⏳',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  in_progress: {
    label: 'Em progresso',
    color: 'blue',
    icon: '🔄',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  completed: {
    label: 'Concluída',
    color: 'green',
    icon: '✅',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'red',
    icon: '❌',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
} as const;

// Estados do Brasil para validação
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type BrazilianState = typeof BRAZILIAN_STATES[number];

// Opções de paginação
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Resultado paginado
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
