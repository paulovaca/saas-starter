import React from 'react';
import styles from './color-picker.module.css';

type ColorOption = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange' | 'pink';

interface ColorPickerProps {
  value: ColorOption;
  onChange: (color: ColorOption) => void;
  disabled?: boolean;
}

const COLOR_OPTIONS: { value: ColorOption; label: string }[] = [
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'yellow', label: 'Amarelo' },
  { value: 'red', label: 'Vermelho' },
  { value: 'purple', label: 'Roxo' },
  { value: 'gray', label: 'Cinza' },
  { value: 'orange', label: 'Laranja' },
  { value: 'pink', label: 'Rosa' },
];

const getColorClass = (colorValue: ColorOption): string => {
  const colorMap: Record<ColorOption, string> = {
    blue: styles.colorBlue,
    green: styles.colorGreen,
    yellow: styles.colorYellow,
    red: styles.colorRed,
    purple: styles.colorPurple,
    gray: styles.colorGray,
    orange: styles.colorOrange,
    pink: styles.colorPink,
  };
  return colorMap[colorValue];
};

export default function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Cor da Etapa</label>
      <div className={styles.colorGrid}>
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color.value}
            type="button"
            className={`${styles.colorOption} ${getColorClass(color.value)} ${
              value === color.value ? styles.selected : ''
            } ${
              disabled ? styles.disabled : ''
            }`}
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
