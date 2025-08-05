'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, User } from 'lucide-react';
import { taskFormSchema } from '@/lib/validations/tasks';
import { TASK_PRIORITIES } from '@/lib/types/tasks';
import type { TaskFormInput } from '@/lib/validations/tasks';
import type { TaskPriority } from '@/lib/validations/tasks';
import styles from './task-form.module.css';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskFormProps {
  clientId: string;
  users: User[];
  currentUserId: string;
  currentUserRole: 'DEVELOPER' | 'MASTER' | 'ADMIN' | 'AGENT';
  clientOwnerId?: string;
  onSubmit: (data: TaskFormInput & { clientId: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({
  clientId,
  users,
  currentUserId,
  currentUserRole,
  clientOwnerId,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [notifyAssignee, setNotifyAssignee] = useState(false);

  // Determine default assignee: for admin/master creating task, default to client owner if different, otherwise current user
  const getDefaultAssignee = () => {
    if (['ADMIN', 'MASTER'].includes(currentUserRole) && clientOwnerId && clientOwnerId !== currentUserId) {
      return clientOwnerId;
    }
    return currentUserId;
  };

  // Default para amanhã às 9h
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      assignedTo: getDefaultAssignee(),
      notifyAssignee: false,
      priority: 'medium' as TaskPriority,
      dueDate: tomorrow,
    },
  });

  const watchedPriority = watch('priority');
  const watchedAssignedTo = watch('assignedTo');

  const handleFormSubmit = async (data: TaskFormInput) => {
    try {
      await onSubmit({ ...data, clientId });
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateTimeChange = (dateString: string, timeString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const newDate = new Date();
    newDate.setFullYear(year);
    newDate.setMonth(month - 1);
    newDate.setDate(day);
    newDate.setHours(hours || 9);
    newDate.setMinutes(minutes || 0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    
    setValue('dueDate', newDate);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Nova Tarefa</h3>
        <p className={styles.subtitle}>
          Agende uma atividade relacionada ao cliente
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {/* Título */}
        <div className={styles.field}>
          <Label htmlFor="title" className={styles.label}>
            Título *
          </Label>
          <Input
            placeholder="Ex: Ligar para confirmar interesse"
            {...register('title')}
            className={styles.input}
          />
          {errors.title && (
            <span className={styles.error}>{errors.title.message}</span>
          )}
        </div>

        {/* Descrição */}
        <div className={styles.field}>
          <Label htmlFor="description" className={styles.label}>
            Descrição
          </Label>
          <Textarea
            placeholder="Detalhes adicionais sobre a tarefa..."
            rows={3}
            {...register('description')}
            className={styles.textarea}
          />
          {errors.description && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>

        {/* Prioridade */}
        <div className={styles.field}>
          <Label className={styles.label}>Prioridade *</Label>
          <Select
            value={watchedPriority || 'medium'}
            onValueChange={(value) => setValue('priority', value as TaskPriority)}
          >
            <SelectTrigger className={styles.select}>
              {watchedPriority ? (
                <div className={styles.selectItem}>
                  <span className={`${styles.priorityBadge} ${styles[`priority${TASK_PRIORITIES[watchedPriority].color}`]}`}>
                    {TASK_PRIORITIES[watchedPriority].label}
                  </span>
                </div>
              ) : (
                <SelectValue placeholder="Selecione a prioridade" />
              )}
            </SelectTrigger>
            <SelectContent>
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
          {errors.priority && (
            <span className={styles.error}>{errors.priority.message}</span>
          )}
        </div>

        {/* Responsável */}
        {['ADMIN', 'MASTER'].includes(currentUserRole) && users.length > 1 && (
          <div className={styles.field}>
            <Label className={styles.label}>
              <User className={styles.labelIcon} />
              Responsável *
            </Label>
            <Select
              value={watchedAssignedTo || getDefaultAssignee()}
              onValueChange={(value) => setValue('assignedTo', value)}
            >
              <SelectTrigger className={styles.select}>
                {watchedAssignedTo ? (
                  <div className={styles.selectItem}>
                    <span>{users.find(u => u.id === watchedAssignedTo)?.name || 'Usuário não encontrado'}</span>
                    {watchedAssignedTo === currentUserId && (
                      <span className={styles.currentUserBadge}>(Você)</span>
                    )}
                    {watchedAssignedTo === clientOwnerId && watchedAssignedTo !== currentUserId && (
                      <span className={styles.currentUserBadge}>(Dono do Cliente)</span>
                    )}
                  </div>
                ) : (
                  <SelectValue placeholder="Selecione o responsável" />
                )}
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className={styles.selectItem}>
                      <span>{user.name}</span>
                      {user.id === currentUserId && (
                        <span className={styles.currentUserBadge}>(Você)</span>
                      )}
                      {user.id === clientOwnerId && user.id !== currentUserId && (
                        <span className={styles.currentUserBadge}>(Dono do Cliente)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedTo && (
              <span className={styles.error}>{errors.assignedTo.message}</span>
            )}
          </div>
        )}

        {/* Data e Hora de Vencimento */}
        <div className={styles.dateTimeContainer}>
          <div className={styles.field}>
            <Label className={styles.label}>
              <Calendar className={styles.labelIcon} />
              Data de Vencimento *
            </Label>
            <Input
              type="date"
              defaultValue={formatDateForInput(tomorrow)}
              onChange={(e) => {
                const timeInput = document.querySelector<HTMLInputElement>('input[type="time"]');
                const timeValue = timeInput?.value || '09:00';
                handleDateTimeChange(e.target.value, timeValue);
              }}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <Label className={styles.label}>
              <Clock className={styles.labelIcon} />
              Horário *
            </Label>
            <Input
              type="time"
              defaultValue={formatTimeForInput(tomorrow)}
              onChange={(e) => {
                const dateInput = document.querySelector<HTMLInputElement>('input[type="date"]');
                const dateValue = dateInput?.value || formatDateForInput(tomorrow);
                handleDateTimeChange(dateValue, e.target.value);
              }}
              className={styles.input}
            />
          </div>
        </div>

        {errors.dueDate && (
          <span className={styles.error}>{errors.dueDate.message}</span>
        )}

        {/* Notificação */}
        {watchedAssignedTo && watchedAssignedTo !== currentUserId && (
          <div className={styles.checkboxField}>
            <div className={styles.checkboxContainer}>
              <Checkbox
                id="notifyAssignee"
                checked={notifyAssignee}
                onCheckedChange={(checked: boolean) => {
                  setNotifyAssignee(checked);
                  setValue('notifyAssignee', checked);
                }}
              />
              <Label htmlFor="notifyAssignee" className={styles.checkboxLabel}>
                Notificar responsável por email
              </Label>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={styles.submitButton}
          >
            {isLoading || isSubmitting ? 'Salvando...' : 'Criar Tarefa'}
          </Button>
        </div>
      </form>
    </div>
  );
}
