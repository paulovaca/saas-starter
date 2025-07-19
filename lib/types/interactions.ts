export type InteractionType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';

export interface InteractionFormData {
  type: InteractionType;
  description: string;
  contactDate: Date;
  durationMinutes?: number;
}

export interface InteractionWithUser {
  id: string;
  clientId: string;
  userId: string;
  type: InteractionType;
  description: string;
  contactDate: Date;
  durationMinutes?: number | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InteractionFilters {
  type?: InteractionType;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
}

export const INTERACTION_TYPES = {
  call: {
    label: 'Ligação telefônica',
    icon: '📞',
    color: 'blue',
    requiresDuration: true,
  },
  email: {
    label: 'Email enviado',
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
    label: 'Reunião presencial',
    icon: '👥',
    color: 'purple',
    requiresDuration: true,
  },
  note: {
    label: 'Observação geral',
    icon: '📝',
    color: 'gray',
    requiresDuration: false,
  },
} as const;
