'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ProposalItem } from '@/lib/types/proposals';
import { formatCurrency } from '@/lib/services/proposal-calculator';
import { Edit, Save, X, Package } from 'lucide-react';
import { useFieldNames } from '@/hooks/use-field-names';
import styles from './edit-item-modal.module.css';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
}

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedItem: any) => void;
  item: ProposalItem | null;
}

export default function EditItemModal({
  isOpen,
  onClose,
  onSubmit,
  item
}: EditItemModalProps) {
  const { getFieldName, getFieldInfo } = useFieldNames(item?.customFields as Record<string, any> | null | undefined);
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unitPrice: '0',
    customFields: {} as Record<string, any>
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || '0',
        customFields: item.customFields || {}
      });
    }
  }, [isOpen, item]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCustomFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!item) return;

    const updatedItem = {
      ...item,
      description: formData.description,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      customFields: formData.customFields
    };

    onSubmit(updatedItem);
    onClose();
  }, [item, formData, onSubmit, onClose]);

  const renderCustomFieldInput = (fieldName: string, value: any) => {
    // Use the correct field name from the hook
    const displayName = getFieldName(fieldName);

    // Determine field type based on name and value
    const isDate = fieldName.includes('date') || fieldName.includes('data') || 
                   fieldName.includes('checkin') || fieldName.includes('checkout');
    const isNumber = fieldName.includes('adult') || fieldName.includes('child') || 
                     fieldName.includes('quantidade') || fieldName.includes('number');
    const isBoolean = typeof value === 'boolean';

    if (isBoolean) {
      return (
        <div key={fieldName} className={styles.formField}>
          <label className={styles.fieldLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleCustomFieldChange(fieldName, e.target.checked)}
              className={styles.checkbox}
            />
            {displayName}
          </label>
        </div>
      );
    }

    if (isDate) {
      // Format date value for input
      let dateValue = '';
      if (value) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            dateValue = date.toISOString().split('T')[0];
          }
        } catch {}
      }

      return (
        <div key={fieldName} className={styles.formField}>
          <label className={styles.fieldLabel}>{displayName}</label>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.value)}
            className={styles.input}
          />
        </div>
      );
    }

    if (isNumber) {
      return (
        <div key={fieldName} className={styles.formField}>
          <label className={styles.fieldLabel}>{displayName}</label>
          <input
            type="number"
            value={value || 0}
            onChange={(e) => handleCustomFieldChange(fieldName, parseInt(e.target.value) || 0)}
            className={styles.input}
            min="0"
          />
        </div>
      );
    }

    // Default to text input
    return (
      <div key={fieldName} className={styles.formField}>
        <label className={styles.fieldLabel}>{displayName}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleCustomFieldChange(fieldName, e.target.value)}
          className={styles.input}
        />
      </div>
    );
  };

  const calculateSubtotal = () => {
    return formData.quantity * parseFloat(formData.unitPrice || '0');
  };

  const footer = (
    <div className={styles.modalFooter}>
      <Button variant="outline" onClick={onClose}>
        <X className={styles.buttonIcon} />
        Cancelar
      </Button>
      <Button onClick={handleSubmit}>
        <Save className={styles.buttonIcon} />
        Salvar Alterações
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Item"
      description={item ? `Editando: ${item.name}` : ''}
      size="lg"
      variant="form"
      footer={footer}
      preventClose={true}
    >
      {item && (
        <div className={styles.editForm}>
          {/* Item Info (Read-only) */}
          <div className={styles.itemInfoSection}>
            <h3 className={styles.sectionTitle}>
              <Package className={styles.sectionIcon} />
              {item.name}
            </h3>
            {item.description && (
              <p className={styles.itemDescription}>{item.description}</p>
            )}
          </div>

          {/* Editable Fields */}
          <div className={styles.basicFields}>
            <h3 className={styles.sectionTitle}>
              <Edit className={styles.sectionIcon} />
              Informações Editáveis
            </h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Quantidade</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    className={styles.input}
                    min="1"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Valor Unitário</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    className={styles.input}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Observações Adicionais</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={styles.textarea}
                  placeholder="Adicione observações específicas para este item (opcional)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          {formData.customFields && Object.keys(formData.customFields).length > 0 && (
            <div className={styles.customFieldsSection}>
              <h3 className={styles.sectionTitle}>Detalhes Específicos</h3>
              
              <div className={styles.customFieldsGrid}>
                {Object.entries(formData.customFields)
                  .filter(([_, value]) => value !== null && value !== undefined)
                  .sort(([fieldIdA], [fieldIdB]) => {
                    // Sort by creation date using the hook
                    const fieldInfoA = getFieldInfo(fieldIdA);
                    const fieldInfoB = getFieldInfo(fieldIdB);
                    
                    if (fieldInfoA?.createdAt && fieldInfoB?.createdAt) {
                      return fieldInfoA.createdAt.getTime() - fieldInfoB.createdAt.getTime();
                    }
                    
                    // Fallback to alphabetical order if no creation dates
                    return getFieldName(fieldIdA).localeCompare(getFieldName(fieldIdB));
                  })
                  .map(([fieldName, value]) => renderCustomFieldInput(fieldName, value))
                }
              </div>
            </div>
          )}

          {/* Total Preview */}
          <div className={styles.totalPreview}>
            <div className={styles.totalLine}>
              <span>Subtotal:</span>
              <span className={styles.totalValue}>
                {formatCurrency(calculateSubtotal())}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}