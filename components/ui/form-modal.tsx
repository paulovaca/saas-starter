'use client';

import { ReactNode } from 'react';
import { Modal, ModalProps } from './modal';
import { Button } from './button';
import { Loader2 } from 'lucide-react';
import loadingStyles from './loading-icon.module.css';

export interface FormModalProps extends Omit<ModalProps, 'variant' | 'footer'> {
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  submitVariant?: 'default' | 'destructive' | 'success';
  showFooter?: boolean;
}

export function FormModal({
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  submitDisabled = false,
  isSubmitting = false,
  submitVariant = 'default',
  showFooter = true,
  children,
  ...modalProps
}: FormModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      modalProps.onClose();
    }
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
  };

  const footer = showFooter ? (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      {onSubmit && (
        <Button
          type="button"
          variant={submitVariant}
          onClick={handleSubmit}
          disabled={submitDisabled || isSubmitting}
        >
          {isSubmitting && <Loader2 className={loadingStyles.loadingIcon} />}
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      )}
    </>
  ) : undefined;

  return (
    <Modal
      {...modalProps}
      variant="form"
      footer={footer}
      loading={isSubmitting}
      preventClose={true}
      showCloseButton={false}
    >
      {children}
    </Modal>
  );
}