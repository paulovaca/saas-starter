'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ProposalStatus, ProposalWithRelations } from '@/lib/types/proposals';
import { Calendar, User, Building2, DollarSign, FileText, CreditCard, Edit } from 'lucide-react';
import { updateProposal } from '@/lib/actions/proposals/update-proposal';
import { getProposal } from '@/lib/actions/proposals/get-proposal';
import styles from './edit-proposal-modal.module.css';

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalWithRelations | null;
  onUpdate: (updatedProposal: ProposalWithRelations) => void;
  onFullEdit?: () => void;
}

export default function EditProposalModal({
  isOpen,
  onClose,
  proposal,
  onUpdate,
  onFullEdit
}: EditProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    validUntil: '',
    paymentMethod: '',
    notes: '',
    internalNotes: ''
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && proposal) {
      setFormData({
        validUntil: proposal.validUntil ? proposal.validUntil.toString().split('T')[0] : '',
        paymentMethod: proposal.paymentMethod || '',
        notes: proposal.notes || '',
        internalNotes: proposal.internalNotes || ''
      });
    }
  }, [isOpen, proposal]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!proposal) return;

    setLoading(true);
    try {
      // Call the update proposal action
      const result = await updateProposal({
        proposalId: proposal.id,
        validUntil: formData.validUntil || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        notes: formData.notes || undefined,
        internalNotes: formData.internalNotes || undefined,
      });

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
  }, [proposal, formData, onUpdate, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // Check if proposal can be edited based on status
  const canEdit = () => {
    if (!proposal) return false;
    const editableStatuses: ProposalStatus[] = [ProposalStatus.DRAFT, ProposalStatus.REJECTED, ProposalStatus.EXPIRED];
    return editableStatuses.includes(proposal.status);
  };

  const footer = (
    <div className={styles.modalFooter}>
      <Button 
        variant="outline" 
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      
      {proposal?.status === ProposalStatus.DRAFT && onFullEdit && (
        <Button 
          variant="outline"
          onClick={() => {
            onClose();
            onFullEdit();
          }}
          disabled={loading}
        >
          <Edit className={styles.buttonIcon} />
          Edição Completa
        </Button>
      )}
      
      <Button 
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Proposta"
      description={proposal ? `Proposta ${proposal.proposalNumber} - ${proposal.client?.name}` : ''}
      size="lg"
      variant="form"
      footer={footer}
      loading={loading}
      preventClose={loading}
    >
      {proposal && (
        <div className={styles.editForm}>
          {/* Client and Operator Info (Read-only) */}
          <div className={styles.readOnlySection}>
            <h3 className={styles.sectionTitle}>Informações da Proposta</h3>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <User className={styles.infoIcon} />
                <div>
                  <div className={styles.infoLabel}>Cliente</div>
                  <div className={styles.infoValue}>{proposal.client?.name}</div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Building2 className={styles.infoIcon} />
                <div>
                  <div className={styles.infoLabel}>Operadora</div>
                  <div className={styles.infoValue}>{proposal.operator?.name}</div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <DollarSign className={styles.infoIcon} />
                <div>
                  <div className={styles.infoLabel}>Valor Total</div>
                  <div className={styles.infoValue}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(parseFloat(proposal.totalAmount || '0'))}
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
        </div>
      )}
    </Modal>
  );
}