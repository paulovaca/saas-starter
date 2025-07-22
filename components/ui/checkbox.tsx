'use client';

import React from 'react';
import { Check } from 'lucide-react';
import styles from './checkbox.module.css';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const baseClasses = [
    styles.checkbox,
    checked && styles.checkboxChecked,
    disabled && styles.checkboxDisabled,
    !disabled && styles.checkboxHover,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      className={baseClasses}
      onClick={handleChange}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleChange();
        }
      }}
    >
      {checked && (
        <Check className={styles.checkIcon} />
      )}
    </div>
  );
}
