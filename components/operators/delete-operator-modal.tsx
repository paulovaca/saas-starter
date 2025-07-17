'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { confirmDeleteOperator } from '@/lib/actions/operators/confirm-delete-operator';
import styles from './delete-operator-modal.module.css';

interface DeleteOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: {
    id: string;
    name: string;
    cnpj?: string | null;
    contactEmail?: string | null;
  };
}

export function DeleteOperatorModal({ isOpen, onClose, operator }: DeleteOperatorModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (confirmText !== 'deletar') {
      setError('Digite "deletar" para confirmar');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('operatorId', operator.id);
      formData.append('confirmText', confirmText);

      const result = await confirmDeleteOperator(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.success);
        setTimeout(() => {
          onClose();
          setConfirmText('');
          setSuccess(null);
          // Recarregar a página para refletir as mudanças
          window.location.reload();
        }, 2000);
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setConfirmText('');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Deletar Operadora
          </h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.operatorInfo}>
          <p className={styles.operatorLabel}>
            Você está prestes a deletar permanentemente a operadora:
          </p>
          <p className={styles.operatorName}>
            {operator.name}
          </p>
          {operator.cnpj && (
            <p className={styles.operatorCnpj}>
              CNPJ: {operator.cnpj}
            </p>
          )}
          {operator.contactEmail && (
            <p className={styles.operatorEmail}>
              {operator.contactEmail}
            </p>
          )}
        </div>

        <div className={styles.warning}>
          <p className={styles.warningText}>
            <strong>⚠️ ATENÇÃO:</strong> Esta ação é irreversível!
          </p>
          <p className={styles.warningText}>
            A operadora será removida permanentemente do sistema.
          </p>
          <p className={styles.warningText}>
            Todos os dados associados serão perdidos.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="confirmText" className={styles.confirmLabel}>
              Digite "deletar" para confirmar:
            </label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="deletar"
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p className={styles.successText}>{success}</p>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isPending || confirmText !== 'deletar'}
              className={styles.submitButton}
            >
              {isPending ? 'Deletando...' : 'Deletar Operadora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
