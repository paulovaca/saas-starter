'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'dialog' | 'alert' | 'form';
  title: string;
  description?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  preventClose?: boolean;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  variant = 'dialog',
  title,
  description,
  children,
  footer,
  loading = false,
  preventClose = false,
  className,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !preventClose && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, preventClose, loading]);

  const handleOverlayClick = () => {
    if (!preventClose && !loading) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(styles.overlay, {
        [styles.overlayAlert]: variant === 'alert',
      })}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          styles.content,
          styles[size],
          styles[variant],
          className,
          {
            [styles.loading]: loading,
          }
        )}
        onClick={handleContentClick}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            {description && (
              <div id="modal-description" className={styles.description}>
                {description}
              </div>
            )}
          </div>
          {showCloseButton && !preventClose && (
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              disabled={loading}
              aria-label="Fechar modal"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  );
}