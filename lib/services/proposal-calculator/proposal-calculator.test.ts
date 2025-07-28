/**
 * Testes para o serviço de calculadora de propostas
 */

import {
  calculateSubtotal,
  applyDiscount,
  calculateTotal,
  calculateCommission,
  validateTotals,
  calculateProposal,
  formatCurrency,
  parseCurrency,
  type ProposalItem,
  type Discount
} from './index';

describe('Proposal Calculator Service', () => {
  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly for multiple items', () => {
      const items: ProposalItem[] = [
        { quantity: 2, unitPrice: 100.50 }, // 201.00
        { quantity: 1, unitPrice: 50.25 },  // 50.25
        { quantity: 3, unitPrice: 75.00 }   // 225.00
      ];
      
      expect(calculateSubtotal(items)).toBe(476.25);
    });

    it('should return 0 for empty array', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('should handle items with zero quantity', () => {
      const items: ProposalItem[] = [
        { quantity: 0, unitPrice: 100 },
        { quantity: 2, unitPrice: 50 }
      ];
      
      expect(calculateSubtotal(items)).toBe(100);
    });

    it('should handle decimal precision correctly', () => {
      const items: ProposalItem[] = [
        { quantity: 1, unitPrice: 0.1 },
        { quantity: 1, unitPrice: 0.2 }
      ];
      
      expect(calculateSubtotal(items)).toBe(0.30);
    });
  });

  describe('applyDiscount', () => {
    it('should apply percentage discount correctly', () => {
      const discount: Discount = { type: 'percent', value: 10 };
      expect(applyDiscount(100, discount)).toBe(10);
    });

    it('should apply fixed amount discount correctly', () => {
      const discount: Discount = { type: 'amount', value: 25.50 };
      expect(applyDiscount(100, discount)).toBe(25.50);
    });

    it('should return 0 for null or undefined discount', () => {
      expect(applyDiscount(100, null)).toBe(0);
      expect(applyDiscount(100, undefined)).toBe(0);
    });

    it('should not apply discount greater than total value', () => {
      const discount: Discount = { type: 'amount', value: 150 };
      expect(applyDiscount(100, discount)).toBe(100);
    });

    it('should handle percentage precision correctly', () => {
      const discount: Discount = { type: 'percent', value: 5.5 };
      const result = applyDiscount(200, discount);
      // O resultado atual é 11 (5.5% de 200 = 11)
      expect(result).toBe(11);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      expect(calculateTotal(100, 10)).toBe(90);
    });

    it('should handle zero discount', () => {
      expect(calculateTotal(100, 0)).toBe(100);
    });

    it('should not return negative total', () => {
      expect(calculateTotal(100, 150)).toBe(0);
    });

    it('should handle decimal precision', () => {
      expect(calculateTotal(100.75, 10.25)).toBe(90.50);
    });
  });

  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      const result = calculateCommission(1000, 15);
      expect(result.percent).toBe(15);
      expect(result.amount).toBe(150);
    });

    it('should handle decimal commission rates', () => {
      const result = calculateCommission(1000, 12.5);
      expect(result.percent).toBe(12.5);
      // O resultado atual é 125 (12.5% de 1000 = 125)
      expect(result.amount).toBe(125);
    });

    it('should return zero for zero total or rate', () => {
      expect(calculateCommission(0, 15)).toEqual({ percent: 0, amount: 0 });
      expect(calculateCommission(1000, 0)).toEqual({ percent: 0, amount: 0 });
    });

    it('should handle payment method parameter', () => {
      const result = calculateCommission(1000, 15, 'PIX');
      expect(result.percent).toBe(15);
      expect(result.amount).toBe(150);
    });
  });

  describe('validateTotals', () => {
    it('should validate correct calculations', () => {
      const proposal = {
        items: [
          { quantity: 2, unitPrice: 50 },
          { quantity: 1, unitPrice: 100 }
        ],
        subtotal: 200,
        discountAmount: 20,
        total: 180,
        commissionPercent: 10,
        commissionAmount: 18
      };
      
      const result = validateTotals(proposal);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect incorrect subtotal', () => {
      const proposal = {
        items: [{ quantity: 2, unitPrice: 50 }],
        subtotal: 150, // Should be 100
        total: 150
      };
      
      const result = validateTotals(proposal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subtotal incorreto. Esperado: 100, Recebido: 150');
    });

    it('should detect incorrect total', () => {
      const proposal = {
        items: [{ quantity: 1, unitPrice: 100 }],
        subtotal: 100,
        discountAmount: 10,
        total: 100 // Should be 90
      };
      
      const result = validateTotals(proposal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Total incorreto. Esperado: 90, Recebido: 100');
    });

    it('should detect incorrect commission', () => {
      const proposal = {
        items: [{ quantity: 1, unitPrice: 100 }],
        subtotal: 100,
        total: 100,
        commissionPercent: 10,
        commissionAmount: 15 // Should be 10
      };
      
      const result = validateTotals(proposal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Comissão incorreta. Esperado: 10, Recebido: 15');
    });
  });

  describe('calculateProposal', () => {
    it('should calculate complete proposal with discount and commission', () => {
      const items: ProposalItem[] = [
        { quantity: 2, unitPrice: 100 },
        { quantity: 1, unitPrice: 50 }
      ];
      const discount: Discount = { type: 'percent', value: 10 };
      
      const result = calculateProposal(items, discount, 15);
      
      expect(result.subtotal).toBe(250);
      expect(result.discountAmount).toBe(25);
      expect(result.total).toBe(225);
      expect(result.commissionPercent).toBe(15);
      expect(result.commissionAmount).toBe(33.75);
    });

    it('should handle proposal without discount', () => {
      const items: ProposalItem[] = [{ quantity: 1, unitPrice: 100 }];
      
      const result = calculateProposal(items, null, 10);
      
      expect(result.subtotal).toBe(100);
      expect(result.discountAmount).toBe(0);
      expect(result.total).toBe(100);
      expect(result.commissionAmount).toBe(10);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result1 = formatCurrency(1234.56);
      const result2 = formatCurrency(0);
      const result3 = formatCurrency(10);
      
      expect(result1).toMatch(/R\$\s*1\.234,56/);
      expect(result2).toMatch(/R\$\s*0,00/);
      expect(result3).toMatch(/R\$\s*10,00/);
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency strings correctly', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
      expect(parseCurrency('1234,56')).toBe(1234.56);
      expect(parseCurrency('1.234,56')).toBe(1234.56);
    });

    it('should handle invalid inputs', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('abc')).toBe(0);
      expect(parseCurrency('R$ ')).toBe(0);
    });

    it('should handle negative values', () => {
      expect(parseCurrency('-100,50')).toBe(-100.50);
      expect(parseCurrency('R$ -100,50')).toBe(-100.50);
    });
  });
});