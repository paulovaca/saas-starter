'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { confirmDeleteUser } from '@/lib/actions/users/confirm-delete-user';
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
      formData.append('userId', user.id);
      formData.append('confirmText', confirmText);

      const result = await confirmDeleteUser(formData);

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
            Deletar Usuário
          </h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.userInfo}>
          <p className={styles.userLabel}>
            Você está prestes a deletar permanentemente o usuário:
          </p>
          <p className={styles.userName}>
            {user.name} ({user.role})
          </p>
          <p className={styles.userEmail}>
            {user.email}
          </p>
        </div>

        <div className={styles.warning}>
          <p className={styles.warningText}>
            <strong>⚠️ ATENÇÃO:</strong> Esta ação é irreversível!
          </p>
          <p className={styles.warningText}>
            O usuário será removido permanentemente do sistema.
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
              {isPending ? 'Deletando...' : 'Deletar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
