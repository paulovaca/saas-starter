'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/ui/form-modal';
import { updateBaseItemField } from '@/lib/actions/catalog';
import { FIELD_TYPES, type FieldType, type BaseItemField } from '@/lib/db/schema/catalog';
import { useToast } from '@/components/ui/toast';
import styles from './edit-field-modal.module.css';

interface EditFieldModalProps {
  field: BaseItemField;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFieldModal({ field, isOpen, onClose, onSuccess }: EditFieldModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldName, setFieldName] = useState(field.name);
  const [fieldType, setFieldType] = useState<FieldType>(field.type as FieldType);
  const [isRequired, setIsRequired] = useState(field.isRequired);
  const [options, setOptions] = useState<string[]>(field.options || []);
  const [newOption, setNewOption] = useState('');
  const { showSuccess, showError } = useToast();

  // Reset form when field changes
  useEffect(() => {
    setFieldName(field.name);
    setFieldType(field.type as FieldType);
    setIsRequired(field.isRequired);
    setOptions(field.options || []);
    setNewOption('');
  }, [field]);

  const handleSubmit = async () => {
    if (!fieldName.trim()) {
      showError('Nome do campo é obrigatório');
      throw new Error('Nome do campo é obrigatório');
    }

    setIsLoading(true);
    
    try {
      await updateBaseItemField(field.id, {
        name: fieldName.trim(),
        type: fieldType,
        isRequired,
        options: (fieldType === 'select' || fieldType === 'multiselect') && options.length > 0 ? options : undefined,
      });
      
      showSuccess('Campo atualizado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar campo:', error);
      showError('Erro ao atualizar campo. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleFieldTypeChange = (type: FieldType) => {
    setFieldType(type);
    // Clear options when changing away from select types
    if (type !== 'select' && type !== 'multiselect') {
      setOptions([]);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Campo"
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitLabel="Salvar Alterações"
      size="md"
    >
      <div className={styles.form}>
        <div>
          <Label htmlFor="fieldName">Nome do Campo</Label>
          <Input
            id="fieldName"
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="Ex: Data de Check-in, Número de Adultos, Valor..."
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="fieldType">Tipo do Campo</Label>
          <select
            id="fieldType"
            value={fieldType}
            onChange={(e) => handleFieldTypeChange(e.target.value as FieldType)}
            className={styles.select}
            disabled={isLoading}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {(fieldType === 'select' || fieldType === 'multiselect') && (
          <div>
            <Label>Opções</Label>
            <div className={styles.optionsContainer}>
              <div className={styles.addOptionContainer}>
                <Input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Digite uma opção"
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!newOption.trim() || isLoading}
                  variant="outline"
                  className={styles.addOptionButton}
                >
                  Adicionar
                </Button>
              </div>
              
              {options.length > 0 && (
                <div className={styles.optionsList}>
                  {options.map((option, index) => (
                    <div key={index} className={styles.optionItem}>
                      <span>{option}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className={styles.removeOption}
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.checkboxField}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              disabled={isLoading}
            />
            Campo obrigatório
          </label>
        </div>
      </div>
    </FormModal>
  );
}
