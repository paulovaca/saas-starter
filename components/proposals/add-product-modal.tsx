'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Building2, Package, ArrowRight } from 'lucide-react';
import { formatCurrency, calculateSubtotal } from '@/lib/services/proposal-calculator';
import styles from './add-product-modal.module.css';

interface Operator {
  id: string;
  name: string;
  logo?: string;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
}

interface BaseItem {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
  allowPriceEdit: boolean;
  customFields: CustomField[];
}

interface ProposalItem {
  id?: string;
  operatorId: string;
  operatorName: string;
  baseItemId: string;
  baseItemName: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  customFields: Record<string, any>;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProposalItem) => void;
  editingItem?: ProposalItem | null;
}

type Step = 'operator' | 'item' | 'details';

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingItem 
}: AddProductModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('operator');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedItem, setSelectedItem] = useState<BaseItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [operators, setOperators] = useState<Operator[]>([]);
  const [baseItems, setBaseItems] = useState<BaseItem[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Load operators when modal opens
  useEffect(() => {
    if (isOpen && currentStep === 'operator') {
      loadOperators();
    }
  }, [isOpen, currentStep]);

  // Load base items when operator is selected
  useEffect(() => {
    if (selectedOperator && currentStep === 'item') {
      loadBaseItems(selectedOperator.id);
    }
  }, [selectedOperator, currentStep]);

  const loadOperators = async () => {
    try {
      console.log('🏢 Starting to load operators...');
      setLoadingOperators(true);
      
      const response = await fetch('/api/operators?limit=50');
      console.log('📡 Operators response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Operators result:', result);
      
      if (result.operators && Array.isArray(result.operators)) {
        const transformedOperators = result.operators.map((operator: any) => ({
          id: operator.id,
          name: operator.name,
          logo: operator.logo,
        }));
        
        console.log('✅ Setting operators:', transformedOperators);
        setOperators(transformedOperators);
      } else {
        console.error('No operators in response or invalid format');
        setOperators([]);
      }
    } catch (error) {
      console.error('❌ Error loading operators:', error);
      setOperators([]);
    } finally {
      setLoadingOperators(false);
      console.log('🏁 Finished loading operators');
    }
  };

  const loadBaseItems = async (operatorId: string) => {
    try {
      console.log('📦 Starting to load base items for operator:', operatorId);
      setLoadingItems(true);
      
      const response = await fetch(`/api/operators/${operatorId}/items`);
      console.log('📡 Base items response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Base items result:', result);
      
      if (result.items && Array.isArray(result.items)) {
        const transformedItems = result.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          basePrice: item.basePrice,
          allowPriceEdit: item.allowPriceEdit,
          customFields: item.customFields || [],
        }));
        
        console.log('✅ Setting base items:', transformedItems);
        setBaseItems(transformedItems);
      } else {
        console.error('No items in response or invalid format');
        setBaseItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading base items:', error);
      setBaseItems([]);
    } finally {
      setLoadingItems(false);
      console.log('🏁 Finished loading base items');
    }
  };

  // Reset form when modal opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // Load editing item data will be handled when operators/baseItems load
        // For now, just set the step to details
        setQuantity(editingItem.quantity);
        setUnitPrice(editingItem.unitPrice);
        setCustomFieldValues(editingItem.customFields || {});
        setCurrentStep('details');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingItem]);

  // Handle editing item data when operators load
  useEffect(() => {
    if (editingItem && operators.length > 0) {
      const operator = operators.find(op => op.id === editingItem.operatorId);
      setSelectedOperator(operator || null);
    }
  }, [editingItem, operators]);

  // Handle editing item data when base items load
  useEffect(() => {
    if (editingItem && baseItems.length > 0) {
      const baseItem = baseItems.find(item => item.id === editingItem.baseItemId);
      setSelectedItem(baseItem || null);
    }
  }, [editingItem, baseItems]);

  const resetForm = () => {
    setCurrentStep('operator');
    setSelectedOperator(null);
    setSelectedItem(null);
    setQuantity(1);
    setUnitPrice(0);
    setCustomFieldValues({});
  };

  const handleSelectOperator = useCallback((operator: Operator) => {
    setSelectedOperator(operator);
    setCurrentStep('item');
  }, []);

  const handleSelectItem = useCallback((item: BaseItem) => {
    setSelectedItem(item);
    setUnitPrice(item.basePrice || 0);
    setCurrentStep('details');
    
    // Initialize custom fields with default values
    const initialValues: Record<string, any> = {};
    item.customFields.forEach(field => {
      if (field.type === 'boolean') {
        initialValues[field.id] = false;
      } else if (field.type === 'number') {
        initialValues[field.id] = 0;
      } else {
        initialValues[field.id] = '';
      }
    });
    setCustomFieldValues(initialValues);
  }, []);

  const handleCustomFieldChange = useCallback((fieldId: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedOperator || !selectedItem) return;

    // Validate required fields
    const missingFields = selectedItem.customFields
      .filter(field => field.required)
      .filter(field => {
        const value = customFieldValues[field.id];
        return !value || (typeof value === 'string' && value.trim() === '');
      });

    if (missingFields.length > 0) {
      alert(`Os seguintes campos são obrigatórios: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    if (quantity <= 0) {
      alert('A quantidade deve ser maior que zero');
      return;
    }

    if (unitPrice <= 0) {
      alert('O valor unitário deve ser maior que zero');
      return;
    }

    const subtotal = calculateSubtotal([{ quantity, unitPrice }]);
    
    const product: ProposalItem = {
      operatorId: selectedOperator.id,
      operatorName: selectedOperator.name,
      baseItemId: selectedItem.id,
      baseItemName: selectedItem.name,
      name: selectedItem.name,
      quantity,
      unitPrice,
      subtotal,
      customFields: customFieldValues
    };

    onSubmit(product);
  }, [selectedOperator, selectedItem, quantity, unitPrice, customFieldValues, onSubmit]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose]);

  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={styles.input}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, Number(e.target.value))}
            className={styles.input}
            min="0"
            required={field.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={styles.input}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            className={styles.input}
            required={field.required}
          >
            <option value="">Selecione...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleCustomFieldChange(field.id, e.target.checked)}
              className={styles.checkbox}
            />
            Sim
          </label>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'operator':
        return editingItem ? 'Editando Produto - Operadora' : 'Selecionar Operadora';
      case 'item':
        return editingItem ? 'Editando Produto - Item' : 'Selecionar Item';
      case 'details':
        return editingItem ? 'Editando Produto - Detalhes' : 'Detalhes do Produto';
      default:
        return 'Adicionar Produto';
    }
  };


  const footer = (
    <div className={styles.footer}>
      {currentStep !== 'operator' && !editingItem && (
        <Button 
          variant="outline" 
          onClick={() => {
            if (currentStep === 'details') setCurrentStep('item');
            else if (currentStep === 'item') setCurrentStep('operator');
          }}
        >
          Voltar
        </Button>
      )}
      <Button variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      {currentStep === 'details' && (
        <Button onClick={handleSubmit}>
          {editingItem ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getStepTitle()}
      size="lg"
      footer={footer}
      className={styles.modal}
      preventClose={true}
    >
      <div className={styles.content}>
        {currentStep === 'operator' && (
          <div className={styles.operatorGrid}>
            {loadingOperators ? (
              <div className={styles.loadingState}>Carregando operadoras...</div>
            ) : operators.length === 0 ? (
              <div className={styles.emptyState}>
                <Building2 className={styles.emptyIcon} />
                <p className={styles.emptyMessage}>Nenhuma operadora cadastrada</p>
              </div>
            ) : (
              operators.map((operator) => (
                <button
                  key={operator.id}
                  type="button"
                  onClick={() => handleSelectOperator(operator)}
                  className={`${styles.operatorCard} ${
                    selectedOperator?.id === operator.id ? styles.selected : ''
                  }`}
                >
                  <Building2 className={styles.operatorIcon} />
                  <h3 className={styles.operatorName}>{operator.name}</h3>
                  <ArrowRight className={styles.arrowIcon} />
                </button>
              ))
            )}
          </div>
        )}

        {currentStep === 'item' && selectedOperator && (
          <div className={styles.itemsSection}>
            <div className={styles.stepInfo}>
              <span className={styles.stepLabel}>Operadora selecionada:</span>
              <span className={styles.stepValue}>{selectedOperator.name}</span>
            </div>
            
            <div className={styles.itemsList}>
              {loadingItems ? (
                <div className={styles.loadingState}>Carregando itens...</div>
              ) : baseItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package className={styles.emptyIcon} />
                  <p className={styles.emptyMessage}>Nenhum item disponível para esta operadora</p>
                  <p className={styles.emptySubMessage}>Configure os itens da operadora na seção de Operadoras</p>
                </div>
              ) : (
                baseItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={styles.itemCard}
                  >
                    <div className={styles.itemHeader}>
                      <Package className={styles.itemIcon} />
                      <div className={styles.itemInfo}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        {item.description && (
                          <p className={styles.itemDescription}>{item.description}</p>
                        )}
                        {item.basePrice && (
                          <p className={styles.itemPrice}>
                            A partir de {formatCurrency(item.basePrice)}
                          </p>
                        )}
                      </div>
                      <ArrowRight className={styles.arrowIcon} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {currentStep === 'details' && selectedItem && selectedOperator && (
          <div className={styles.detailsSection}>
            <div className={styles.stepInfo}>
              <span className={styles.stepLabel}>Item selecionado:</span>
              <span className={styles.stepValue}>{selectedItem.name}</span>
            </div>

            <div className={styles.formGrid}>
              {/* Quantity and Price */}
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Quantidade *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    Valor Unitário * 
                    {!selectedItem.allowPriceEdit && (
                      <span className={styles.fieldNote}>(fixo)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className={styles.input}
                    readOnly={!selectedItem.allowPriceEdit}
                  />
                </div>
              </div>

              {/* Custom Fields */}
              {selectedItem.customFields.map((field) => (
                <div key={field.id} className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    {field.name}
                    {field.required && <span className={styles.required}>*</span>}
                  </label>
                  {renderCustomField(field)}
                </div>
              ))}
            </div>

            {/* Total Preview */}
            <div className={styles.totalPreview}>
              <div className={styles.totalLine}>
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal([{ quantity, unitPrice }]))}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}