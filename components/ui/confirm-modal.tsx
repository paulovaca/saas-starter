'use client';

import { useState, ReactNode } from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import styles from './confirm-modal.module.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  requiredConfirmation?: string;
  confirmationPlaceholder?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  requiredConfirmation,
  confirmationPlaceholder = 'Digite para confirmar',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfirmDisabled = requiredConfirmation
    ? confirmationInput !== requiredConfirmation
    : false;

  const handleConfirm = async () => {
    if (isConfirmDisabled || isLoading) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Error during confirmation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmationInput('');
    onClose();
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
      case 'warning':
        return <AlertTriangle className={`${styles.dangerIcon}`} />;
      default:
        return <AlertTriangle className={`${styles.infoIcon}`} />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive' as const;
      case 'warning':
        return 'warning' as const;
      default:
        return 'default' as const;
    }
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        {cancelText}
      </Button>
      <Button
        type="button"
        variant={getButtonVariant()}
        onClick={handleConfirm}
        disabled={isConfirmDisabled || isSubmitting || isLoading}
      >
        {(isSubmitting || isLoading) && (
          <Loader2 className={styles.loadingIcon} />
        )}
        {isSubmitting || isLoading ? 'Processando...' : confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      variant="alert"
      title={title}
      description={description}
      footer={footer}
      loading={isLoading}
      preventClose={true}
      showCloseButton={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.iconContainer}>{getIcon()}</div>

        {requiredConfirmation && (
          <div className={styles.confirmationContainer}>
            <Label htmlFor="confirmation-input" className={styles.confirmationLabel}>
              Digite "{requiredConfirmation}" para confirmar:
            </Label>
            <Input
              id="confirmation-input"
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={confirmationPlaceholder}
              className={styles.confirmationInput}
              disabled={isSubmitting || isLoading}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}