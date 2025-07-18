// Tipos para o módulo de clientes
export type DocumentType = 'cpf' | 'cnpj';

export type InteractionType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'lost';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

// Interface completa do cliente
export interface Client {
  id: string;
  agencyId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate?: Date;
  addressZipcode?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  funnelId: string;
  funnelStageId: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Campos relacionados
  funnel?: {
    id: string;
    name: string;
  };
  funnelStage?: {
    id: string;
    name: string;
    instructions?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Estatísticas
  totalProposals?: number;
  totalValue?: number;
  lastInteraction?: Date;
}

// Dados do formulário de cliente (sem IDs e timestamps)
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

// Interface para interações com clientes
export interface ClientInteraction {
  id: string;
  clientId: string;
  userId: string;
  type: InteractionType;
  description: string;
  contactDate: Date;
  durationMinutes?: number;
  createdAt: Date;
  
  // Campos relacionados
  user?: {
    id: string;
    name: string;
    email: string;
  };
  client?: {
    id: string;
    name: string;
  };
}

// Interface para tarefas de clientes
export interface ClientTask {
  id: string;
  clientId: string;
  assignedTo: string;
  createdBy: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos relacionados
  client?: {
    id: string;
    name: string;
  };
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

// Interface para transferências de clientes
export interface ClientTransfer {
  id: string;
  clientId: string;
  fromUserId: string;
  toUserId: string;
  transferredBy: string;
  reason: string;
  transferredAt: Date;
  
  // Campos relacionados
  client?: {
    id: string;
    name: string;
  };
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

// Interface para propostas
export interface Proposal {
  id: string;
  proposalNumber: string;
  agencyId: string;
  clientId: string;
  userId: string;
  operatorId: string;
  status: ProposalStatus;
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  totalAmount: number;
  commissionAmount: number;
  commissionPercent: number;
  paymentMethod?: string;
  validUntil: Date;
  notes?: string;
  internalNotes?: string;
  sentAt?: Date;
  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos relacionados
  client?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  operator?: {
    id: string;
    name: string;
  };
  items?: ProposalItem[];
  statusHistory?: ProposalStatusHistory[];
}

// Interface para itens de propostas
export interface ProposalItem {
  id: string;
  proposalId: string;
  operatorProductId: string;
  baseItemId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customFields?: Record<string, any>;
  sortOrder: number;
  createdAt: Date;
  
  // Campos relacionados
  operatorProduct?: {
    id: string;
    name: string;
  };
  baseItem?: {
    id: string;
    name: string;
  };
}

// Interface para histórico de status de propostas
export interface ProposalStatusHistory {
  id: string;
  proposalId: string;
  fromStatus?: ProposalStatus;
  toStatus: ProposalStatus;
  changedBy: string;
  reason?: string;
  changedAt: Date;
  
  // Campos relacionados
  changedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Interface para visualizações de propostas
export interface ProposalView {
  id: string;
  proposalId: string;
  ipAddress?: string;
  userAgent?: string;
  viewedAt: Date;
}

// Tipos para filtros e pesquisa
export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  funnelId?: string;
  funnelStageId?: string;
  userId?: string;
  documentType?: DocumentType;
  city?: string;
  state?: string;
  hasInteractions?: boolean;
  hasTasks?: boolean;
  hasProposals?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  lastInteractionFrom?: Date;
  lastInteractionTo?: Date;
}

export interface ProposalFilters {
  search?: string;
  status?: ProposalStatus;
  clientId?: string;
  userId?: string;
  operatorId?: string;
  validFrom?: Date;
  validTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}

// Tipos para estatísticas
export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientsWithProposals: number;
  clientsWithTasks: number;
  averageProposalValue: number;
  conversionRate: number;
}

export interface ProposalStats {
  totalProposals: number;
  draftProposals: number;
  sentProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  expiredProposals: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
}

// Tipos para formulários
export interface ClientInteractionFormData {
  clientId: string;
  type: InteractionType;
  description: string;
  contactDate: Date;
  durationMinutes?: number;
}

export interface ClientTaskFormData {
  clientId: string;
  assignedTo: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: Date;
}

export interface ClientTransferFormData {
  clientId: string;
  toUserId: string;
  reason: string;
}

export interface ProposalFormData {
  clientId: string;
  operatorId: string;
  validUntil: Date;
  notes?: string;
  internalNotes?: string;
  items: ProposalItemFormData[];
}

export interface ProposalItemFormData {
  operatorProductId: string;
  baseItemId: string;
  quantity: number;
  unitPrice: number;
  customFields?: Record<string, any>;
}

// Tipos para validação
export interface ValidationErrors {
  [key: string]: string[];
}

export interface ValidationResult {
  success: boolean;
  errors?: ValidationErrors;
  data?: any;
}

// Tipos para paginação
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para exports
export interface ClientExportData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  documentType: string;
  documentNumber: string;
  city?: string;
  state?: string;
  funnelName: string;
  funnelStageName: string;
  userResponsible: string;
  totalProposals: number;
  totalValue: number;
  lastInteraction?: Date;
  createdAt: Date;
}

export interface ProposalExportData {
  id: string;
  proposalNumber: string;
  clientName: string;
  operatorName: string;
  userResponsible: string;
  status: string;
  totalAmount: number;
  commissionAmount: number;
  validUntil: Date;
  createdAt: Date;
  decidedAt?: Date;
}
