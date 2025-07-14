import { 
  cpfSchema,
  cnpjSchema,
  cepSchema,
  brazilianPhoneSchema,
  formatCPF,
  formatCNPJ,
  formatBrazilianPhone,
  formatCEP
} from '@/lib/validations/common.schema';

describe('Brazilian Validations', () => {
  describe('CPF Validation', () => {
    test('should validate correct CPF', () => {
      expect(cpfSchema.safeParse('123.456.789-09').success).toBe(true);
      expect(cpfSchema.safeParse('00000000191').success).toBe(true);
    });

    test('should reject invalid CPF', () => {
      expect(cpfSchema.safeParse('12345678900').success).toBe(false);
      expect(cpfSchema.safeParse('111.111.111-11').success).toBe(false);
      expect(cpfSchema.safeParse('').success).toBe(false);
      expect(cpfSchema.safeParse('123').success).toBe(false);
    });

    test('should format CPF correctly', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
      expect(formatCPF('000.000.001-91')).toBe('000.000.001-91');
    });
  });

  describe('CNPJ Validation', () => {
    test('should validate correct CNPJ', () => {
      expect(cnpjSchema.safeParse('11.222.333/0001-81').success).toBe(true);
      expect(cnpjSchema.safeParse('11222333000181').success).toBe(true);
    });

    test('should reject invalid CNPJ', () => {
      expect(cnpjSchema.safeParse('11222333000180').success).toBe(false);
      expect(cnpjSchema.safeParse('11.111.111/1111-11').success).toBe(false);
      expect(cnpjSchema.safeParse('').success).toBe(false);
      expect(cnpjSchema.safeParse('123').success).toBe(false);
    });

    test('should format CNPJ correctly', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
    });
  });

  describe('CEP Validation', () => {
    test('should validate correct CEP', () => {
      expect(cepSchema.safeParse('01310-100').success).toBe(true);
      expect(cepSchema.safeParse('01310100').success).toBe(true);
    });

    test('should reject invalid CEP', () => {
      expect(cepSchema.safeParse('00000-000').success).toBe(false);
      expect(cepSchema.safeParse('').success).toBe(false);
      expect(cepSchema.safeParse('123').success).toBe(false);
    });

    test('should format CEP correctly', () => {
      expect(formatCEP('01310100')).toBe('01310-100');
      expect(formatCEP('01310-100')).toBe('01310-100');
    });
  });

  describe('Brazilian Phone Validation', () => {
    test('should validate correct phone numbers', () => {
      expect(brazilianPhoneSchema.safeParse('(11) 99999-9999').success).toBe(true);
      expect(brazilianPhoneSchema.safeParse('11999999999').success).toBe(true);
      expect(brazilianPhoneSchema.safeParse('(11) 9999-9999').success).toBe(true);
      expect(brazilianPhoneSchema.safeParse('1199999999').success).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(brazilianPhoneSchema.safeParse('123').success).toBe(false);
      expect(brazilianPhoneSchema.safeParse('').success).toBe(false);
      expect(brazilianPhoneSchema.safeParse('(11) 1234-5678').success).toBe(false); // Invalid area code pattern
    });

    test('should format phone correctly', () => {
      expect(formatBrazilianPhone('11999999999')).toBe('(11) 99999-9999');
      expect(formatBrazilianPhone('1199999999')).toBe('(11) 9999-9999');
      expect(formatBrazilianPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
    });
  });
});
