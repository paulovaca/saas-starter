'use client';

import { useTransition } from 'react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { confirmDeleteOperator } from '@/lib/actions/operators/confirm-delete-operator';
import { useToast } from '@/components/ui/toast';
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
  const [isPending, startTransition] = useTransition();
  const { showSuccess, showError } = useToast();

  const handleConfirm = () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append('operatorId', operator.id);
          formData.append('confirmText', 'deletar');

          const result = await confirmDeleteOperator(formData);

          if (result.error) {
            showError(result.error);
            reject(new Error(result.error));
          } else if (result.success) {
            showSuccess(result.success);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            resolve();
          }
        } catch (error) {
          showError('Erro inesperado ao deletar operadora');
          reject(error);
        }
      });
    });
  };

  const descriptionContent = (
    <div className={styles.description}>
      <p>
        <span className={styles.operatorDetails}>Operadora:</span> {operator.name}
      </p>
      {operator.cnpj && (
        <p>
          <span className={styles.operatorDetails}>CNPJ:</span> {operator.cnpj}
        </p>
      )}
      {operator.contactEmail && (
        <p>
          <span className={styles.operatorDetails}>Email:</span> {operator.contactEmail}
        </p>
      )}
      <div className={styles.dangerBox}>
        <p className={styles.dangerTitle}>⚠️ ATENÇÃO: Esta ação é irreversível!</p>
        <ul className={styles.dangerList}>
          <li>• A operadora será removida permanentemente do sistema</li>
          <li>• Todos os dados associados serão perdidos</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deletar Operadora"
      description={descriptionContent}
      onConfirm={handleConfirm}
      requiredConfirmation="deletar"
      confirmText="Deletar Operadora"
      variant="danger"
      isLoading={isPending}
    />
  );
}
