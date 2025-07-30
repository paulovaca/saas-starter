'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { ProposalWithRelations } from '@/lib/types/proposals';
import { updateProposal } from '@/lib/actions/proposals/update-proposal';
import styles from './edit-expiration-modal.module.css';

interface EditExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalWithRelations | null;
  onUpdate: (updatedProposal: ProposalWithRelations) => void;
}

export default function EditExpirationModal({
  isOpen,
  onClose,
  proposal,
  onUpdate
}: EditExpirationModalProps) {
  const [loading, setLoading] = useState(false);
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (isOpen && proposal) {
      setValidUntil(
        proposal.validUntil 
          ? proposal.validUntil.toString().split('T')[0] 
          : ''
      );
    }
  }, [isOpen, proposal]);

  const handleSubmit = async () => {
    if (!proposal || !validUntil) return;

    setLoading(true);
    try {
      const result = await updateProposal({
        proposalId: proposal.id,
        validUntil: validUntil,
      });

      if (result.success) {
        // Create updated proposal data
        const updatedProposal = {
          ...proposal,
          validUntil: validUntil,
          updatedAt: new Date()
        };
        
        onUpdate(updatedProposal);
        onClose();
        
        // TODO: Show success notification
        alert('Data de expiração atualizada com sucesso!');
      } else {
        throw new Error(result.error || 'Erro ao atualizar data de expiração');
      }
      
    } catch (error) {
      console.error('Erro ao atualizar data de expiração:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar data de expiração. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const today = new Date().toISOString().split('T')[0];

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
        disabled={loading || !validUntil}
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Data de Expiração"
      description={proposal ? `Proposta ${proposal.proposalNumber}` : ''}
      size="sm"
      variant="form"
      footer={footer}
      loading={loading}
      preventClose={loading}
    >
      {proposal && (
        <div className={styles.editForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Calendar className={styles.labelIcon} />
              Nova data de expiração
            </label>
            <input
              type="date"
              className={styles.formInput}
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={loading}
              min={today}
            />
            <p className={styles.helperText}>
              Data atual de expiração: {' '}
              {proposal.validUntil 
                ? new Intl.DateTimeFormat('pt-BR').format(new Date(proposal.validUntil))
                : 'Não definida'
              }
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}