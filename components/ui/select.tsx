"use client"

import React, { createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './select.module.css';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const Select = ({ value = '', onValueChange = () => {}, children }: SelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={styles.select}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectTrigger must be used within a Select component');
  }

  return (
    <button
      type="button"
      className={`${styles.selectTrigger} ${className || ''}`}
      onClick={() => context.setOpen(!context.open)}
    >
      {children}
      <ChevronDown className={styles.selectIcon} />
    </button>
  );
};

const SelectContent = ({ children, className }: SelectContentProps) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectContent must be used within a Select component');
  }

  if (!context.open) return null;

  return (
    <>
      <div className={styles.selectOverlay} onClick={() => context.setOpen(false)} />
      <div className={`${styles.selectContent} ${className || ''}`}>
        {children}
      </div>
    </>
  );
};

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectItem must be used within a Select component');
  }

  const isSelected = context.value === value;

  return (
    <div
      className={`${styles.selectItem} ${isSelected ? styles.selected : ''} ${className || ''}`}
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder = 'Selecione...', className }: SelectValueProps) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectValue must be used within a Select component');
  }

  return (
    <span className={`${styles.selectValue} ${className || ''}`}>
      {context.value || placeholder}
    </span>
  );
};

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};
