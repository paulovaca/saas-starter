import React from 'react';
import styles from './color-picker.module.css';

type ColorOption = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange' | 'pink';

interface ColorPickerProps {
  value: ColorOption;
  onChange: (color: ColorOption) => void;
  disabled?: boolean;
}

const COLOR_OPTIONS: { value: ColorOption; label: string; className: string }[] = [
  { value: 'blue', label: 'Azul', className: styles.colorBlue },
  { value: 'green', label: 'Verde', className: styles.colorGreen },
  { value: 'yellow', label: 'Amarelo', className: styles.colorYellow },
  { value: 'red', label: 'Vermelho', className: styles.colorRed },
  { value: 'purple', label: 'Roxo', className: styles.colorPurple },
  { value: 'gray', label: 'Cinza', className: styles.colorGray },
  { value: 'orange', label: 'Laranja', className: styles.colorOrange },
  { value: 'pink', label: 'Rosa', className: styles.colorPink },
];

export default function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Cor da Etapa</label>
      <div className={styles.colorGrid}>
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`${styles.colorOption} ${color.className} ${
              value === color.value ? styles.selected : ''
            } ${disabled ? styles.disabled : ''}`}
            onClick={() => !disabled && onChange(color.value)}
            disabled={disabled}
            title={color.label}
            aria-label={`Selecionar cor ${color.label}`}
          >
            {value === color.value && (
              <svg
                className={styles.checkIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
