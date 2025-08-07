import { Proposal, ProposalStatusHistory } from '@/lib/db/schema/clients';

// Enum dos status de propostas
export const ProposalStatus = {
  DRAFT: 'draft',
  SENT: 'sent', 
  APPROVED: 'approved',
  CONTRACT: 'contract',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  AWAITING_PAYMENT: 'awaiting_payment',
  ACTIVE_BOOKING: 'active_booking',
  CANCELLED: 'cancelled',
} as const;

export type ProposalStatusType = typeof ProposalStatus[keyof typeof ProposalStatus];

// Labels para exibição
export const ProposalStatusLabels: Record<ProposalStatusType, string> = {
  [ProposalStatus.DRAFT]: 'Rascunho',
  [ProposalStatus.SENT]: 'Enviada',
  [ProposalStatus.APPROVED]: 'Aprovada',
  [ProposalStatus.CONTRACT]: 'Contrato',
  [ProposalStatus.REJECTED]: 'Recusada',
  [ProposalStatus.EXPIRED]: 'Expirada',
  [ProposalStatus.AWAITING_PAYMENT]: 'Aguardando Pagamento',
  [ProposalStatus.ACTIVE_BOOKING]: 'Reserva Ativa',
  [ProposalStatus.CANCELLED]: 'Cancelada',
};

// Cores para cada status
export const ProposalStatusColors: Record<ProposalStatusType, string> = {
  [ProposalStatus.DRAFT]: 'gray',
  [ProposalStatus.SENT]: 'blue',
  [ProposalStatus.APPROVED]: 'green',
  [ProposalStatus.CONTRACT]: 'purple',
  [ProposalStatus.REJECTED]: 'red',
  [ProposalStatus.EXPIRED]: 'orange',
  [ProposalStatus.AWAITING_PAYMENT]: 'yellow',
  [ProposalStatus.ACTIVE_BOOKING]: 'green',
  [ProposalStatus.CANCELLED]: 'red',
};

// Transições permitidas entre status
export const ProposalStatusTransitions: Record<ProposalStatusType, ProposalStatusType[]> = {
  [ProposalStatus.DRAFT]: [ProposalStatus.SENT, ProposalStatus.CANCELLED],
  [ProposalStatus.SENT]: [ProposalStatus.APPROVED, ProposalStatus.REJECTED, ProposalStatus.EXPIRED, ProposalStatus.CANCELLED],
  [ProposalStatus.APPROVED]: [ProposalStatus.CONTRACT],
  [ProposalStatus.CONTRACT]: [ProposalStatus.AWAITING_PAYMENT, ProposalStatus.CANCELLED],
  [ProposalStatus.REJECTED]: [ProposalStatus.DRAFT, ProposalStatus.CANCELLED], // Reativar volta para rascunho
  [ProposalStatus.EXPIRED]: [ProposalStatus.DRAFT], // Reativar volta para rascunho
  [ProposalStatus.AWAITING_PAYMENT]: [ProposalStatus.ACTIVE_BOOKING, ProposalStatus.CANCELLED],
  [ProposalStatus.ACTIVE_BOOKING]: [ProposalStatus.CANCELLED],
  [ProposalStatus.CANCELLED]: [], // Estado final
};

// Status que podem ser reativados
export const ReactivableStatuses: ProposalStatusType[] = [
  ProposalStatus.EXPIRED,
  ProposalStatus.REJECTED,
];

// Status finais (não podem mais transicionar, exceto para cancelado)
export const FinalStatuses: ProposalStatusType[] = [
  ProposalStatus.ACTIVE_BOOKING,
  ProposalStatus.CANCELLED,
];

// Status que requerem motivo ao transicionar
export const StatusesRequiringReason: Record<ProposalStatusType, boolean> = {
  [ProposalStatus.DRAFT]: false,
  [ProposalStatus.SENT]: false,
  [ProposalStatus.APPROVED]: false,
  [ProposalStatus.CONTRACT]: false,
  [ProposalStatus.REJECTED]: true, // Requer motivo de recusa
  [ProposalStatus.EXPIRED]: false,
  [ProposalStatus.AWAITING_PAYMENT]: false,
  [ProposalStatus.ACTIVE_BOOKING]: false,
  [ProposalStatus.CANCELLED]: true, // Requer motivo de cancelamento
};

// Interface para dados do contrato
export interface ContractData {
  // Dados pessoais complementares
  fullName?: string;
  documentNumber?: string;
  documentType?: 'cpf' | 'cnpj';
  birthDate?: string;
  
  // Endereço completo
  address?: {
    zipcode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  
  // Dados da viagem
  travelDetails?: {
    departureDate?: string;
    returnDate?: string;
    destination?: string;
    numberOfPassengers?: number;
    specialRequests?: string;
  };
  
  // Contatos de emergência
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  
  // Outros campos customizáveis
  [key: string]: any;
}

// Interface para transição de status
export interface StatusTransition {
  fromStatus: ProposalStatusType;
  toStatus: ProposalStatusType;
  reason?: string;
  userId: string;
  timestamp: Date;
}

// Helper function para verificar se uma transição é válida
export function isValidTransition(
  fromStatus: ProposalStatusType,
  toStatus: ProposalStatusType
): boolean {
  const allowedTransitions = ProposalStatusTransitions[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
}

// Helper function para verificar se um status pode ser reativado
export function canBeReactivated(status: ProposalStatusType): boolean {
  return ReactivableStatuses.includes(status);
}

// Helper function para verificar se um status é final
export function isFinalStatus(status: ProposalStatusType): boolean {
  return FinalStatuses.includes(status);
}

// Helper function para verificar se um status requer motivo
export function requiresReason(status: ProposalStatusType): boolean {
  return StatusesRequiringReason[status] || false;
}

// Motivos pré-definidos para recusa
export const RejectionReasons = [
  'Preço muito alto',
  'Destino não desejado',
  'Datas não disponíveis',
  'Mudança de planos',
  'Encontrou melhor opção',
  'Problemas financeiros',
  'Outro',
] as const;

// Motivos pré-definidos para cancelamento
export const CancellationReasons = [
  'Desistência do cliente',
  'Problemas com pagamento',
  'Indisponibilidade do serviço',
  'Erro na proposta',
  'Mudança de requisitos',
  'Força maior',
  'Outro',
] as const;

export type RejectionReason = typeof RejectionReasons[number];
export type CancellationReason = typeof CancellationReasons[number];