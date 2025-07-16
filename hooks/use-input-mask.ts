import { useCallback } from 'react';

export type MaskType = 'phone' | 'cnpj' | 'cep' | 'none';

export function useInputMask() {
  const applyMask = useCallback((value: string, maskType: MaskType): string => {
    if (!value || maskType === 'none') return value;

    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');

    switch (maskType) {
      case 'phone':
        if (numbers.length <= 10) {
          // Telefone fixo: (XX) XXXX-XXXX
          return numbers
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          // Celular: (XX) XXXXX-XXXX
          return numbers
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
        }

      case 'cnpj':
        // XX.XXX.XXX/XXXX-XX
        return numbers
          .replace(/^(\d{2})(\d)/, '$1.$2')
          .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
          .replace(/\.(\d{3})(\d)/, '.$1/$2')
          .replace(/(\d{4})(\d)/, '$1-$2');

      case 'cep':
        // XXXXX-XXX
        return numbers.replace(/^(\d{5})(\d)/, '$1-$2');

      default:
        return value;
    }
  }, []);

  const createMaskedHandler = useCallback((
    maskType: MaskType,
    onChange: (value: string) => void
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = applyMask(event.target.value, maskType);
      onChange(maskedValue);
      // Atualiza o valor do input diretamente para evitar cursor jumping
      event.target.value = maskedValue;
    };
  }, [applyMask]);

  return {
    applyMask,
    createMaskedHandler,
  };
}
