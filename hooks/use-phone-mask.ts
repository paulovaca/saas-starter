import { useState, useCallback } from 'react';

export function usePhoneMask(initialValue = '') {
  const [value, setValue] = useState(formatPhoneNumber(initialValue));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
    setValue(formattedValue);
    
    // Update the actual input value
    e.target.value = formattedValue;
  }, []);

  return {
    value,
    onChange: handleChange,
    setValue: (newValue: string) => setValue(formatPhoneNumber(newValue))
  };
}

function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // Don't format if empty
  if (!cleaned) return '';
  
  // Format based on length
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 10) {
    // Format for 10 digits: (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length <= 11) {
    // Format for 11 digits: (XX) XXXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else {
    // Limit to 11 digits maximum
    const limited = cleaned.slice(0, 11);
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
}

export function getUnformattedPhone(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}
