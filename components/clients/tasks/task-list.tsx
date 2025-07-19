'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Grid, List } from 'lucide-react';
import { TASK_PRIORITIES, TASK_STATUS } from '@/lib/types/tasks';
import type { TaskWithUsers, TaskFilters, TaskPriority, TaskStatus } from '@/lib/types/tasks';
import { TaskCard } from './task-card';
import styles from './task-list.module.css';

interface TaskListProps {
  tasks: TaskWithUsers[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount?: number;
  currentUserId: string;
  isAdmin: boolean;
  onStatusChange?: (taskId: string, status: string) => void;
  onEdit?: (task: TaskWithUsers) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskList({
  tasks,
  loading = false,
  onLoadMore,
  hasMore = false,
  totalCount = 0,
  currentUserId,
  isAdmin,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const handleFilterChange = (key: keyof TaskFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const isOverdue = (dueDate: Date): boolean => {
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
      return false;
    }
    
    if (filters.overdue && !isOverdue(task.dueDate)) {
      return false;
    }
    
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Primeiro: vencidas
    const aOverdue = isOverdue(a.dueDate) && a.status !== 'completed';
    const bOverdue = isOverdue(b.dueDate) && b.status !== 'completed';
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Segundo: prioridade
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Terceiro: data de vencimento
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>Tarefas</h3>
          <span className={styles.count}>
            {totalCount > 0 ? `${totalCount} tarefa${totalCount !== 1 ? 's' : ''}` : 'Nenhuma tarefa'}
          </span>
        </div>
        
        <div className={styles.headerActions}>
          {/* View Mode Toggle */}
          <div className={styles.viewToggle}>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className={styles.viewButton}
            >
              <Grid className={styles.viewIcon} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={styles.viewButton}
            >
              <List className={styles.viewIcon} />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggle}
          >
            <Filter className={styles.filterIcon} />
            Filtros
            {hasActiveFilters && <span className={styles.filterBadge} />}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className={styles.filtersContainer}>
          <div className={styles.filtersGrid}>
            {/* Status */}
            <Select
              value={filters.status || ''}
              onValueChange={(value: string) => handleFilterChange('status', value)}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {Object.entries(TASK_STATUS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className={styles.selectItem}>
                      <span className={`${styles.statusBadge} ${styles[`status${config.color}`]}`}>
                        {config.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Prioridade */}
            <Select
              value={filters.priority || ''}
              onValueChange={(value: string) => handleFilterChange('priority', value)}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as prioridades</SelectItem>
                {Object.entries(TASK_PRIORITIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className={styles.selectItem}>
                      <span className={`${styles.priorityBadge} ${styles[`priority${config.color}`]}`}>
                        {config.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Responsável (se Admin) */}
            {isAdmin && (
              <Select
                value={filters.assignedTo || ''}
                onValueChange={(value: string) => handleFilterChange('assignedTo', value)}
              >
                <SelectTrigger className={styles.select}>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os responsáveis</SelectItem>
                  <SelectItem value={currentUserId}>Minhas tarefas</SelectItem>
                  {/* Aqui você adicionaria outros usuários */}
                </SelectContent>
              </Select>
            )}

            {/* Checkbox Vencidas */}
            <div className={styles.checkboxField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.overdue || false}
                  onChange={(e) => handleFilterChange('overdue', e.target.checked)}
                  className={styles.checkbox}
                />
                Apenas vencidas
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <div className={styles.filtersActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={styles.clearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lista */}
      <div className={styles.content}>
        {loading && sortedTasks.length === 0 ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <span>Carregando tarefas...</span>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h4 className={styles.emptyTitle}>
              {hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa criada'}
            </h4>
            <p className={styles.emptyDescription}>
              {hasActiveFilters
                ? 'Tente ajustar os filtros para encontrar outras tarefas.'
                : 'As tarefas relacionadas a este cliente aparecerão aqui.'}
            </p>
          </div>
        ) : (
          <div className={`${styles.taskGrid} ${viewMode === 'list' ? styles.taskList : ''}`}>
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                compact={viewMode === 'list'}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={isAdmin ? onDelete : undefined}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className={styles.loadMore}>
            <Button
              variant="outline"
              onClick={onLoadMore}
              className={styles.loadMoreButton}
            >
              Carregar mais tarefas
            </Button>
          </div>
        )}

        {loading && sortedTasks.length > 0 && (
          <div className={styles.loadingMore}>
            <div className={styles.loadingSpinner} />
            <span>Carregando mais...</span>
          </div>
        )}
      </div>
    </div>
  );
}
