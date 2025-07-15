'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addBaseItemField } from '@/lib/actions/catalog';
import { FIELD_TYPES, type FieldType } from '@/lib/db/schema/catalog';
import styles from './add-field-modal.module.css';

interface AddFieldModalProps {
  baseItemId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddFieldModal({ baseItemId, isOpen, onClose, onSuccess }: AddFieldModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fieldName.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await addBaseItemField({
        baseItemId,
        name: fieldName.trim(),
        type: fieldType,
        isRequired,
        options: (fieldType === 'select' || fieldType === 'multiselect') && options.length > 0 ? options : undefined,
      });
      
      // Reset form
      setFieldName('');
      setFieldType('text');
      setIsRequired(false);
      setOptions([]);
      setNewOption('');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar campo:', error);
      alert('Erro ao adicionar campo. Tente novamente.');
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Adicionar Campo</h2>
          <button 
            type="button" 
            onClick={onClose}
            className={styles.closeButton}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
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

          <div className={styles.field}>
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
            <div className={styles.field}>
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
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                disabled={isLoading}
              />
              Campo obrigatório
            </label>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !fieldName.trim()}
              className={styles.submitButton}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Campo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
