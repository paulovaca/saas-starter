'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import type { InteractionFormInput } from '@/lib/validations/interactions';
import { interactionFormSchema } from '@/lib/validations/interactions';
import { INTERACTION_TYPES } from '@/lib/types/interactions';
import type { InteractionType } from '@/lib/types/interactions';
import styles from './interaction-form.module.css';

interface InteractionFormProps {
  clientId: string;
  onSubmit: (data: InteractionFormInput & { clientId: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InteractionForm({
  clientId,
  onSubmit,
  onCancel,
  isLoading = false,
}: InteractionFormProps) {
  const [selectedType, setSelectedType] = useState<InteractionType | undefined>();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InteractionFormInput>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      contactDate: new Date(),
    },
  });

  const watchedType = watch('type');
  const requiresDuration = watchedType && INTERACTION_TYPES[watchedType]?.requiresDuration;

  const handleFormSubmit = async (data: InteractionFormInput) => {
    try {
      await onSubmit({ ...data, clientId });
    } catch (error) {
      console.error('Erro ao salvar interação:', error);
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

  const handleDateChange = (dateString: string) => {
    const currentContactDate = watch('contactDate') || new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    const newDate = new Date(currentContactDate);
    newDate.setFullYear(year);
    newDate.setMonth(month - 1);
    newDate.setDate(day);
    setValue('contactDate', newDate);
  };

  const handleTimeChange = (timeString: string) => {
    const currentContactDate = watch('contactDate') || new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(currentContactDate);
    newDate.setHours(hours || 0);
    newDate.setMinutes(minutes || 0);
    setValue('contactDate', newDate);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Nova Interação</h3>
        <p className={styles.subtitle}>
          Registre o contato realizado com o cliente
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {/* Tipo de Interação */}
        <div className={styles.field}>
          <Label htmlFor="type" className={styles.label}>
            Tipo de Interação *
          </Label>
          <Select
            value={watchedType || ''}
            onValueChange={(value: string) => {
              setSelectedType(value as InteractionType);
              setValue('type', value as InteractionType);
            }}
          >
            <SelectTrigger className={styles.select}>
              {watchedType ? (
                <div className={styles.selectItem}>
                  <span className={styles.selectIcon}>{INTERACTION_TYPES[watchedType].icon}</span>
                  <span>{INTERACTION_TYPES[watchedType].label}</span>
                </div>
              ) : (
                <SelectValue placeholder="Selecione o tipo de interação" />
              )}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INTERACTION_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className={styles.selectItem}>
                    <span className={styles.selectIcon}>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <span className={styles.error}>{errors.type.message}</span>
          )}
        </div>

        {/* Data e Hora */}
        <div className={styles.dateTimeContainer}>
          <div className={styles.field}>
            <Label className={styles.label}>Data *</Label>
            <Input
              type="date"
              defaultValue={formatDateForInput(new Date())}
              onChange={(e) => handleDateChange(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.timeContainer}>
            <Label className={styles.label}>Horário *</Label>
            <Input
              type="time"
              defaultValue={formatTimeForInput(new Date())}
              onChange={(e) => handleTimeChange(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        {errors.contactDate && (
          <span className={styles.error}>{errors.contactDate.message}</span>
        )}

        {/* Duração (se necessário) */}
        {requiresDuration && (
          <div className={styles.field}>
            <Label htmlFor="duration" className={styles.label}>
              <Clock className={styles.labelIcon} />
              Duração (minutos) *
            </Label>
            <Input
              type="number"
              min="1"
              max="600"
              placeholder="Ex: 30"
              {...register('durationMinutes', { valueAsNumber: true })}
              className={styles.input}
            />
            {errors.durationMinutes && (
              <span className={styles.error}>{errors.durationMinutes.message}</span>
            )}
          </div>
        )}

        {/* Descrição */}
        <div className={styles.field}>
          <Label htmlFor="description" className={styles.label}>
            Descrição *
          </Label>
          <Textarea
            placeholder="Descreva o que foi conversado ou realizado..."
            rows={4}
            {...register('description')}
            className={styles.textarea}
          />
          {errors.description && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>

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
            {isLoading || isSubmitting ? 'Salvando...' : 'Salvar Interação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
