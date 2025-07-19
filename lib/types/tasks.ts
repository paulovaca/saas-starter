export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: Date;
  assignedTo: string;
  notifyAssignee: boolean;
}

export interface TaskWithUsers {
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
  assignedUser: {
    id: string;
    name: string;
    email: string;
  };
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  overdue?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

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
