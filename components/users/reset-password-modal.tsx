'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetUserPassword } from '@/lib/actions/users/reset-password';
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
  const [confirmText, setConfirmText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (confirmText !== 'resetar') {
      setError('Digite "resetar" para confirmar');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('confirmText', confirmText);

      const result = await resetUserPassword(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.success);
        setTimeout(() => {
          onClose();
          setConfirmText('');
          setSuccess(null);
        }, 3000);
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
            Resetar Senha
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
            Você está prestes a resetar a senha do usuário:
          </p>
          <p className={styles.userName}>
            {user.name} ({user.role})
          </p>
        </div>

        <div className={styles.warning}>
          <p className={styles.warningText}>
            <strong>Nova senha padrão:</strong> User123!
          </p>
          <p className={styles.warningText}>
            O usuário deverá alterar a senha no próximo login.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="confirmText" className={styles.confirmLabel}>
              Digite "resetar" para confirmar:
            </label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="resetar"
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
              disabled={isPending || confirmText !== 'resetar'}
              className={styles.submitButton}
            >
              {isPending ? 'Resetando...' : 'Resetar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
