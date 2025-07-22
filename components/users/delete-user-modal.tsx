'use client';

import { useState, useTransition } from 'react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { confirmDeleteUser } from '@/lib/actions/users/confirm-delete-user';
import { useToast } from '@/components/ui/toast';
import styles from './delete-user-modal.module.css';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
}

export function DeleteUserModal({ isOpen, onClose, user }: DeleteUserModalProps) {
  const [isPending, startTransition] = useTransition();
  const { showSuccess, showError } = useToast();

  const handleConfirm = () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append('userId', user.id);
          formData.append('confirmText', 'deletar');

          const result = await confirmDeleteUser(formData);

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
          showError('Erro inesperado ao deletar usuário');
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
      <p>
        <span className={styles.userDetails}>Email:</span> {user.email}
      </p>
      <div className={styles.dangerBox}>
        <p className={styles.dangerTitle}>⚠️ ATENÇÃO: Esta ação é irreversível!</p>
        <ul className={styles.dangerList}>
          <li>• O usuário será removido permanentemente do sistema</li>
          <li>• Todos os dados associados serão perdidos</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deletar Usuário"
      description={descriptionContent}
      onConfirm={handleConfirm}
      requiredConfirmation="deletar"
      confirmText="Deletar Usuário"
      variant="danger"
      isLoading={isPending}
    />
  );
}
