import { z } from 'zod';
import type { 
  Proposal as DbProposal, 
  ProposalItem as DbProposalItem,
  ProposalStatusHistory as DbProposalStatusHistory,
  ProposalView as DbProposalView
} from '@/lib/db/schema/clients';

// Enum types
export const ProposalStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
} as const;

export type ProposalStatus = typeof ProposalStatus[keyof typeof ProposalStatus];

// Main proposal interface extending database type
export interface Proposal extends DbProposal {
  status: ProposalStatus;
}

// Proposal item interface extending database type
export interface ProposalItem extends DbProposalItem {}

// Status history interface extending database type
export interface ProposalStatusHistory extends DbProposalStatusHistory {
  fromStatus: ProposalStatus | null;
  toStatus: ProposalStatus;
}

// Proposal view tracking extending database type
export interface ProposalView extends DbProposalView {}

// Calculation types
export interface ProposalCalculation {
  subtotal: number;
  discount: number;
  total: number;
  commission: number;
}

// Form data types (without IDs and timestamps)
export interface ProposalFormData {
  clientId: string;
  operatorId: string;
  items: ProposalItemFormData[];
  discountAmount?: number;
  discountPercent?: number;
  paymentMethod?: string;
  validUntil: Date;
  notes?: string;
  internalNotes?: string;
}

export interface ProposalItemFormData {
  operatorProductId: string;
  baseItemId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  customFields?: Record<string, any>;
}

// Extended types with relations
export interface ProposalWithRelations extends Proposal {
  client: {
    id: string;
    name: string;
    email: string;
    documentNumber: string;
  };
  operator: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  items: ProposalItem[];
}

// List view types
export interface ProposalListItem {
  id: string;
  proposalNumber: string;
  clientName: string;
  operatorName: string;
  totalAmount: number;
  status: ProposalStatus;
  createdAt: Date;
  validUntil: Date;
  userName: string;
}

// Filter types
export interface ProposalFilters {
  status?: ProposalStatus[];
  clientId?: string;
  operatorId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minValue?: number;
  maxValue?: number;
}

// Validation schemas
export const proposalItemSchema = z.object({
  operatorProductId: z.string().uuid(),
  baseItemId: z.string().uuid(),
  name: z.string().min(1, 'Nome do item é obrigatório'),
  description: z.string().optional(),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
  unitPrice: z.number().positive('Valor unitário deve ser maior que zero'),
  customFields: z.record(z.any()).optional()
});

export const proposalFormSchema = z.object({
  clientId: z.string().uuid('Cliente é obrigatório'),
  operatorId: z.string().uuid('Operadora é obrigatória'),
  items: z.array(proposalItemSchema).min(1, 'Adicione pelo menos um item'),
  discountAmount: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  paymentMethod: z.string().optional(),
  validUntil: z.date(),
  notes: z.string().optional(),
  internalNotes: z.string().optional()
}).refine(
  (data) => {
    // Can't have both discount amount and percent
    if (data.discountAmount && data.discountPercent) {
      return false;
    }
    return true;
  },
  {
    message: 'Use apenas valor ou percentual de desconto, não ambos',
    path: ['discountAmount']
  }
);

// Status transition rules
export const ALLOWED_STATUS_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  [ProposalStatus.DRAFT]: [ProposalStatus.SENT],
  [ProposalStatus.SENT]: [ProposalStatus.ACCEPTED, ProposalStatus.REJECTED, ProposalStatus.EXPIRED],
  [ProposalStatus.ACCEPTED]: [],
  [ProposalStatus.REJECTED]: [],
  [ProposalStatus.EXPIRED]: []
};

// Helper functions
export function canTransitionToStatus(
  currentStatus: ProposalStatus,
  newStatus: ProposalStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

export function getStatusLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    [ProposalStatus.DRAFT]: 'Rascunho',
    [ProposalStatus.SENT]: 'Enviada',
    [ProposalStatus.ACCEPTED]: 'Aceita',
    [ProposalStatus.REJECTED]: 'Recusada',
    [ProposalStatus.EXPIRED]: 'Expirada'
  };
  return labels[status] || 'Status Desconhecido'; // Default label if status is invalid
}

export function getStatusColor(status: ProposalStatus): string {
  const colors: Record<ProposalStatus, string> = {
    [ProposalStatus.DRAFT]: 'gray',
    [ProposalStatus.SENT]: 'blue',
    [ProposalStatus.ACCEPTED]: 'green',
    [ProposalStatus.REJECTED]: 'red',
    [ProposalStatus.EXPIRED]: 'orange'
  };
  return colors[status] || 'gray'; // Default to gray if status is invalid
}