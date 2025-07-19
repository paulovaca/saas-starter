import type { ReactElement } from 'react';
import type { TaskWithUsers, TaskPriority, TaskStatus } from '../../../lib/types/tasks';
import { TASK_PRIORITIES, TASK_STATUS } from '../../../lib/types/tasks';
import { formatDate } from '../../../lib/utils/dates';
import styles from './task-card.module.css';

interface TaskCardProps {
  task: TaskWithUsers;
  onStatusChange?: (taskId: string, status: string) => void;
  onEdit?: (task: TaskWithUsers) => void;
  onDelete?: (taskId: string) => void;
  compact?: boolean;
}

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  compact = false
}: TaskCardProps): ReactElement {
  const statusConfig = TASK_STATUS[task.status];
  const priorityConfig = TASK_PRIORITIES[task.priority];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleStatusChange = (newStatus: string): void => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  const handleEdit = (): void => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = (): void => {
    if (onDelete && confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      className={`${styles.card} ${compact ? styles.compact : ''} ${isOverdue ? styles.overdue : ''}`}
    >
      {/* Header da tarefa */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{task.title}</h3>
            {isOverdue && (
              <span className={styles.overdueIcon} title="Tarefa atrasada">
                ⚠️
              </span>
            )}
          </div>
          
          <div className={styles.badges}>
            <span 
              className={`${styles.statusBadge} ${styles[`status${statusConfig.color}`]}`}
            >
              <span className={styles.badgeIcon}>{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
            
            <span 
              className={`${styles.priorityBadge} ${styles[`priority${priorityConfig.color}`]}`}
            >
              <span className={styles.badgeIcon}>{priorityConfig.icon}</span>
              {priorityConfig.label}
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.actions}>
            {onEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className={`${styles.actionButton} ${styles.editButton}`}
                title="Editar tarefa"
              >
                ✏️
              </button>
            )}
            
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Excluir tarefa"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo da tarefa */}
      {!compact && (
        <div className={styles.content}>
          {task.description && (
            <p className={styles.description}>{task.description}</p>
          )}
          
          <div className={styles.metadata}>
            {task.dueDate && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataIcon}>📅</span>
                <span className={styles.metadataLabel}>Vencimento:</span>
                <span className={`${styles.metadataValue} ${isOverdue ? styles.overdueText : ''}`}>
                  {formatDate(task.dueDate, 'DD/MM/YYYY HH:mm')}
                </span>
              </div>
            )}
            
            {task.assignedTo && task.assignedUser && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataIcon}>👤</span>
                <span className={styles.metadataLabel}>Responsável:</span>
                <span className={styles.metadataValue}>
                  {task.assignedUser.name}
                </span>
              </div>
            )}
            
            <div className={styles.metadataItem}>
              <span className={styles.metadataIcon}>📝</span>
              <span className={styles.metadataLabel}>Criado por:</span>
              <span className={styles.metadataValue}>
                {task.createdByUser?.name || 'Sistema'}
              </span>
            </div>
            
            <div className={styles.metadataItem}>
              <span className={styles.metadataIcon}>🕒</span>
              <span className={styles.metadataLabel}>Criado em:</span>
              <span className={styles.metadataValue}>
                {formatDate(task.createdAt, 'DD/MM/YYYY HH:mm')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer com ações de status */}
      {onStatusChange && (
        <div className={styles.footer}>
          <div className={styles.statusActions}>
            <span className={styles.statusLabel}>Alterar status:</span>
            <div className={styles.statusButtons}>
              {Object.entries(TASK_STATUS).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleStatusChange(key)}
                  className={`${styles.statusButton} ${
                    task.status === key ? styles.activeStatus : ''
                  }`}
                  disabled={task.status === key}
                  title={config.label}
                >
                  {config.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
