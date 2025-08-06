'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ProposalStatus, ProposalWithRelations, ProposalItem } from '@/lib/types/proposals';
import { Calendar, User, DollarSign, FileText, CreditCard, Edit, Plus, Trash2, Package } from 'lucide-react';
import { updateProposal } from '@/lib/actions/proposals/update-proposal';
import { getProposal } from '@/lib/actions/proposals/get-proposal';
import { formatCurrency } from '@/lib/services/proposal-calculator';
import AddProductModal from './add-product-modal';
import EditItemModal from './edit-item-modal';
import { CustomFieldsDisplay } from './custom-fields-display';
import styles from './edit-proposal-modal.module.css';

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalWithRelations | null;
  onUpdate: (updatedProposal: ProposalWithRelations) => void;
}

interface EditableItem extends ProposalItem {
  isNew?: boolean;
  uniqueKey?: string;
}

export default function EditProposalModal({
  isOpen,
  onClose,
  proposal,
  onUpdate
}: EditProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    validUntil: '',
    paymentMethod: '',
    notes: '',
    internalNotes: ''
  });
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [itemsModified, setItemsModified] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && proposal) {
      setFormData({
        validUntil: proposal.validUntil ? proposal.validUntil.toString().split('T')[0] : '',
        paymentMethod: proposal.paymentMethod || '',
        notes: proposal.notes || '',
        internalNotes: proposal.internalNotes || ''
      });
      setEditableItems(proposal.items.map((item, index) => ({ ...item, uniqueKey: `${item.id}-${index}` })));
      setItemsModified(false);
    }
  }, [isOpen, proposal]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleEditItem = useCallback((item: EditableItem) => {
    console.log('🔧 Editing item:', item);
    console.log('🔧 operatorProductId:', item.operatorProductId);
    console.log('🔧 baseItemId:', item.baseItemId);
    console.log('🔧 customFields:', item.customFields);
    
    setEditingItem(item);
    
    // For existing items from proposals, always use the simple edit modal
    // The AddProductModal is only for adding completely new items
    setShowEditItemModal(true);
  }, []);

  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setShowAddProductModal(true);
  }, []);

  const handleProductSubmit = useCallback((product: any) => {
    if (editingItem) {
      // Update existing item
      setEditableItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? {
              ...item,
              name: product.name,
              quantity: product.quantity,
              unitPrice: product.unitPrice,
              customFields: product.customFields,
              operatorProductId: product.operatorId,
              baseItemId: product.baseItemId
            }
          : item
      ));
    } else {
      // Add new item
      const newItemId = crypto.randomUUID();
      const newItem: EditableItem = {
        id: newItemId,
        proposalId: proposal?.id || '',
        operatorProductId: product.operatorId,
        baseItemId: product.baseItemId,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        unitPrice: product.unitPrice.toString(),
        subtotal: (product.quantity * product.unitPrice).toFixed(2),
        customFields: product.customFields,
        sortOrder: editableItems.length,
        createdAt: new Date(),
        isNew: true,
        uniqueKey: `${newItemId}-new-${Date.now()}`
      };
      setEditableItems(prev => [...prev, newItem]);
    }
    
    setItemsModified(true);
    setShowAddProductModal(false);
    setEditingItem(null);
  }, [editingItem, proposal, editableItems.length]);

  const handleItemEdit = useCallback((updatedItem: any) => {
    // Update existing item
    setEditableItems(prev => prev.map(item => 
      item.id === updatedItem.id ? { ...updatedItem } : item
    ));
    
    setItemsModified(true);
    setShowEditItemModal(false);
    setEditingItem(null);
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    if (editableItems.length <= 1) {
      alert('A proposta deve ter pelo menos um item');
      return;
    }
    setEditableItems(prev => prev.filter(item => item.id !== itemId));
    setItemsModified(true);
  }, [editableItems.length]);

  const calculateTotals = useCallback(() => {
    const subtotal = editableItems.reduce((sum, item) => {
      return sum + (item.quantity * parseFloat(item.unitPrice || '0'));
    }, 0);
    
    const discountAmount = proposal?.discountAmount ? parseFloat(proposal.discountAmount) : 0;
    const total = subtotal - discountAmount;
    const commissionAmount = total * (parseFloat(proposal?.commissionPercent || '0') / 100);
    
    return { subtotal, discountAmount, total, commissionAmount };
  }, [editableItems, proposal]);

  const handleSubmit = useCallback(async () => {
    if (!proposal) return;

    // Validate date if it's being updated - must be at least tomorrow
    if (formData.validUntil) {
      const selectedDate = new Date(formData.validUntil);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Reset time to start of day
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < tomorrow) {
        alert('A data de validade deve ser a partir de amanhã');
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare the update data
      const updateData: any = {
        proposalId: proposal.id,
        validUntil: formData.validUntil || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        notes: formData.notes || undefined,
        internalNotes: formData.internalNotes || undefined,
      };

      // If items were modified, include them in the update
      if (itemsModified) {
        const totals = calculateTotals();
        updateData.items = editableItems.map(item => ({
          id: item.isNew ? crypto.randomUUID() : item.id,
          operatorProductId: item.operatorProductId || null,
          baseItemId: item.baseItemId || null,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: (item.quantity * parseFloat(item.unitPrice || '0')).toFixed(2),
          customFields: item.customFields || null
        }));
        updateData.subtotal = totals.subtotal.toFixed(2);
        updateData.totalAmount = totals.total.toFixed(2);
        updateData.commissionAmount = totals.commissionAmount.toFixed(2);
      }

      // Call the update proposal action
      const result = await updateProposal(updateData);

      if (result.success) {
        // Fetch the updated proposal data
        const updatedProposalResult = await getProposal({ proposalId: proposal.id });
        
        if (updatedProposalResult.success) {
          onUpdate(updatedProposalResult.data);
          onClose();
          
          // TODO: Show success notification
          alert('Proposta atualizada com sucesso!');
        } else {
          throw new Error('Erro ao buscar proposta atualizada');
        }
      } else {
        throw new Error(result.error || 'Erro ao atualizar proposta');
      }
      
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [proposal, formData, editableItems, itemsModified, calculateTotals, onUpdate, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const totals = calculateTotals();

  const footer = (
    <div className={styles.modalFooter}>
      <Button 
        variant="outline" 
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      
      <Button 
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );


  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Proposta"
        description={proposal ? `Proposta ${proposal.proposalNumber} - ${proposal.client?.name}` : ''}
        size="lg"
        variant="form"
        footer={footer}
        loading={loading}
        preventClose={true}
      >
        {proposal && (
          <div className={styles.editForm}>
            {/* Client Info (Read-only) */}
            <div className={styles.readOnlySection}>
              <h3 className={styles.sectionTitle}>Informações da Proposta</h3>
              
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <User className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Cliente</div>
                    <div className={styles.infoValue}>{proposal.client?.name}</div>
                    <div className={styles.infoDetail}>{proposal.client?.documentNumber}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <DollarSign className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Valor Total</div>
                    <div className={styles.infoValue}>
                      {formatCurrency(totals.total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className={styles.editableSection}>
              <h3 className={styles.sectionTitle}>Detalhes Editáveis</h3>
              
              <div className={styles.formGrid}>
                {/* Valid Until */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Calendar className={styles.labelIcon} />
                    Válida até
                  </label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    disabled={loading}
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split('T')[0];
                    })()}
                    title="A data deve ser a partir de amanhã"
                  />
                </div>

                {/* Payment Method */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <CreditCard className={styles.labelIcon} />
                    Forma de Pagamento
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Ex: Cartão de crédito, PIX, Boleto..."
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FileText className={styles.labelIcon} />
                  Observações (Visível para o cliente)
                </label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Adicione observações que serão visíveis para o cliente..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Internal Notes */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FileText className={styles.labelIcon} />
                  Observações Internas (Apenas para a equipe)
                </label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Adicione observações internas que não serão visíveis para o cliente..."
                  value={formData.internalNotes}
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>

            {/* Items Section */}
            <div className={styles.itemsSection}>
              <div className={styles.itemsSectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <Package className={styles.sectionIcon} />
                  Itens da Proposta
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={loading}
                >
                  <Plus className={styles.buttonIcon} />
                  Adicionar Item
                </Button>
              </div>
              
              <div className={styles.itemsList}>
                {editableItems.map((item) => (
                  <div key={item.uniqueKey || item.id} className={styles.itemCard}>
                    <div className={styles.itemView}>
                      <div className={styles.itemHeader}>
                        <div>
                          <div className={styles.itemName}>{item.name}</div>
                          {item.description && (
                            <div className={styles.itemDescription}>{item.description}</div>
                          )}
                          <CustomFieldsDisplay 
                            customFields={item.customFields as Record<string, any> | null | undefined}
                            className={styles.customFieldsList}
                          />
                        </div>
                        <div className={styles.itemTotal}>
                          {formatCurrency(item.quantity * parseFloat(item.unitPrice || '0'))}
                        </div>
                      </div>
                      <div className={styles.itemDetails}>
                        <span>{item.quantity}x {formatCurrency(parseFloat(item.unitPrice || '0'))}</span>
                      </div>
                      <div className={styles.itemActions}>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className={styles.itemActionIcon} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteItem(item.id)}
                          disabled={editableItems.length <= 1}
                        >
                          <Trash2 className={styles.itemActionIcon} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className={styles.totalsSummary}>
                <div className={styles.totalLine}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className={styles.totalLine}>
                    <span>Desconto</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}
                <div className={styles.totalLine + ' ' + styles.totalLineMain}>
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
                <div className={styles.totalLine}>
                  <span>Comissão ({proposal.commissionPercent || '0'}%)</span>
                  <span>{formatCurrency(totals.commissionAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleProductSubmit}
        editingItem={editingItem ? {
          id: editingItem.id,
          operatorId: editingItem.operatorProductId || '',
          operatorName: '',
          baseItemId: editingItem.baseItemId || '',
          baseItemName: editingItem.name,
          name: editingItem.name,
          quantity: editingItem.quantity,
          unitPrice: parseFloat(editingItem.unitPrice || '0'),
          customFields: editingItem.customFields || {}
        } : null}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={showEditItemModal}
        onClose={() => {
          setShowEditItemModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleItemEdit}
        item={editingItem}
      />
    </>
  );
}