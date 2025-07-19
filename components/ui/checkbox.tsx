'use client';

import React from 'react';
import { Check } from 'lucide-react';

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

  const baseClasses = `
    inline-flex
    items-center
    justify-center
    w-4
    h-4
    border
    border-gray-300
    rounded
    cursor-pointer
    transition-colors
    ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
    ${className}
  `;

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
        <Check className="w-3 h-3 text-white" />
      )}
    </div>
  );
}
