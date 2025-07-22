'use client';

import { useTransition } from 'react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { resetUserPassword } from '@/lib/actions/users/reset-password';
import { useToast } from '@/components/ui/toast';
import styles from './reset-password-modal.module.css';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
  const [isPending, startTransition] = useTransition();
  const { showSuccess, showError } = useToast();

  const handleConfirm = () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append('userId', user.id);
          formData.append('confirmText', 'resetar');

          const result = await resetUserPassword(formData);

          if (result.error) {
            showError(result.error);
            reject(new Error(result.error));
          } else if (result.success) {
            showSuccess(result.success);
            resolve();
          }
        } catch (error) {
          showError('Erro inesperado ao resetar senha');
          reject(error);
        }
      });
    });
  };

  const descriptionContent = (
    <div className={styles.description}>
      <p>
        <span className={styles.userDetails}>Usuário:</span> {user.name} ({user.role})
      </p>
      <div className={styles.infoBox}>
        <p className={styles.infoTitle}>ℹ️ Nova senha padrão: User123!</p>
        <p className={styles.infoText}>
          O usuário deverá alterar a senha no próximo login.
        </p>
      </div>
    </div>
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resetar Senha"
      description={descriptionContent}
      onConfirm={handleConfirm}
      requiredConfirmation="resetar"
      confirmText="Resetar Senha"
      variant="warning"
      isLoading={isPending}
    />
  );
}
