export const BOOKING_STATUS = {
  PENDING_DOCUMENTS: "pending_documents",
  UNDER_ANALYSIS: "under_analysis",
  APPROVED: "approved",
  PENDING_INSTALLATION: "pending_installation",
  INSTALLED: "installed",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  SUSPENDED: "suspended"
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_documents: "Aguardando Documentos",
  under_analysis: "Em Análise",
  approved: "Aprovado",
  pending_installation: "Aguardando Instalação",
  installed: "Instalado",
  active: "Ativo",
  cancelled: "Cancelado",
  suspended: "Suspenso"
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending_documents: "orange",
  under_analysis: "blue",
  approved: "green",
  pending_installation: "purple",
  installed: "teal",
  active: "green",
  cancelled: "red",
  suspended: "gray"
};

// Transições válidas de status
export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_documents: ["under_analysis", "cancelled"],
  under_analysis: ["approved", "pending_documents", "cancelled"],
  approved: ["pending_installation", "cancelled"],
  pending_installation: ["installed", "cancelled"],
  installed: ["active", "cancelled", "suspended"],
  active: ["suspended", "cancelled"],
  cancelled: [],
  suspended: ["active", "cancelled"]
};

// Tipos de documentos
export const DOCUMENT_TYPE = {
  RG_CPF: "rg_cpf",
  PROOF_OF_RESIDENCE: "proof_of_residence",
  PROOF_OF_INCOME: "proof_of_income",
  SIGNED_CONTRACT: "signed_contract",
  OTHER: "other"
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rg_cpf: "RG/CPF",
  proof_of_residence: "Comprovante de Residência",
  proof_of_income: "Comprovante de Renda",
  signed_contract: "Contrato Assinado",
  other: "Outros Documentos"
};

// Tipos de eventos da timeline
export const TIMELINE_EVENT = {
  CREATED: "created",
  STATUS_CHANGED: "status_changed",
  DOCUMENT_UPLOADED: "document_uploaded",
  DOCUMENT_REMOVED: "document_removed",
  NOTE_ADDED: "note_added",
  CLIENT_CONTACTED: "client_contacted",
  INSTALLATION_SCHEDULED: "installation_scheduled",
  OTHER: "other"
} as const;

export type TimelineEvent = typeof TIMELINE_EVENT[keyof typeof TIMELINE_EVENT];

export const TIMELINE_EVENT_LABELS: Record<TimelineEvent, string> = {
  created: "Reserva criada",
  status_changed: "Status alterado",
  document_uploaded: "Documento enviado",
  document_removed: "Documento removido",
  note_added: "Anotação adicionada",
  client_contacted: "Cliente contatado",
  installation_scheduled: "Instalação agendada",
  other: "Outros eventos"
};

// Helper function para verificar se uma transição é válida
export function isValidStatusTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): boolean {
  return BOOKING_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

// Helper function para obter os status possíveis a partir do status atual
export function getAvailableStatusTransitions(
  currentStatus: BookingStatus
): BookingStatus[] {
  return BOOKING_STATUS_TRANSITIONS[currentStatus];
}