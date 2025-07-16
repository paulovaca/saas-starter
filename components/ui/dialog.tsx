"use client"

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './dialog.module.css';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => onOpenChange(false)}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }: DialogContentProps) => {
  return <div className={`${styles.dialogContent} ${className || ''}`}>{children}</div>;
};

const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <div className={styles.header}>{children}</div>;
};

const DialogTitle = ({ children }: DialogTitleProps) => {
  return <h2 className={styles.title}>{children}</h2>;
};

const DialogDescription = ({ children }: DialogDescriptionProps) => {
  return <p className={styles.description}>{children}</p>;
};

const DialogFooter = ({ children }: DialogFooterProps) => {
  return <div className={styles.footer}>{children}</div>;
};

const DialogTrigger = ({ children, asChild }: DialogTriggerProps) => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }
  return <>{children}</>;
};

const DialogClose = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
};
