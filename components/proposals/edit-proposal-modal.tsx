'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ProposalStatus, ProposalWithRelations } from '@/lib/types/proposals';
import { Calendar, User, Building2, DollarSign, FileText, CreditCard } from 'lucide-react';
import styles from './edit-proposal-modal.module.css';

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalWithRelations | null;
  onUpdate: (updatedProposal: ProposalWithRelations) => void;
}

export default function EditProposalModal({
  isOpen,
  onClose,
  proposal,
  onUpdate
}: EditProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: ProposalStatus.DRAFT,
    validUntil: '',
    paymentMethod: '',
    notes: '',
    internalNotes: ''
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && proposal) {
      setFormData({
        status: proposal.status as ProposalStatus,
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
      // TODO: Implement actual update API call
      console.log('Updating proposal:', { proposalId: proposal.id, ...formData });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create updated proposal object
      const updatedProposal: ProposalWithRelations = {
        ...proposal,
        status: formData.status,
        validUntil: formData.validUntil,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        updatedAt: new Date()
      };

      onUpdate(updatedProposal);
      onClose();
      
      // TODO: Show success notification
      alert('Proposta atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      alert('Erro ao atualizar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [proposal, formData, onUpdate, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  const getStatusOptions = () => [
    { value: ProposalStatus.DRAFT, label: 'Rascunho' },
    { value: ProposalStatus.SENT, label: 'Enviada' },
    { value: ProposalStatus.ACCEPTED, label: 'Aceita' },
    { value: ProposalStatus.REJECTED, label: 'Recusada' },
    { value: ProposalStatus.EXPIRED, label: 'Expirada' }
  ];

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
              {/* Status */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FileText className={styles.labelIcon} />
                  Status
                </label>
                <select
                  className={styles.formSelect}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={loading}
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

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