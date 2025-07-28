/**
 * Serviço de cálculo de propostas
 * Garante precisão e consistência em todos os cálculos financeiros
 */

// Função auxiliar para operações decimais precisas
class DecimalCalculator {
  private static round(num: number, decimals: number = 2): number {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static add(a: number, b: number): number {
    return this.round(a + b);
  }

  static subtract(a: number, b: number): number {
    return this.round(a - b);
  }

  static multiply(a: number, b: number): number {
    return this.round(a * b);
  }

  static divide(a: number, b: number): number {
    if (b === 0) return 0;
    return this.round(a / b);
  }

  static toFixed(num: number, decimals: number = 2): number {
    return this.round(num, decimals);
  }
}

/**
 * Tipos para os cálculos
 */
export interface ProposalItem {
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface Discount {
  type: 'amount' | 'percent';
  value: number;
}

export interface CommissionRate {
  paymentMethod: string;
  rate: number;
}

export interface ProposalCalculation {
  subtotal: number;
  discountAmount: number;
  total: number;
  commissionPercent: number;
  commissionAmount: number;
}

/**
 * Calcula o subtotal de todos os itens da proposta
 * @param items - Array de itens da proposta
 * @returns Subtotal calculado com precisão
 */
export function calculateSubtotal(items: ProposalItem[]): number {
  if (!items || items.length === 0) {
    return 0;
  }

  const subtotal = items.reduce((acc, item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const itemTotal = DecimalCalculator.multiply(quantity, unitPrice);
    
    return DecimalCalculator.add(acc, itemTotal);
  }, 0);

  return DecimalCalculator.toFixed(subtotal);
}

/**
 * Aplica desconto ao valor
 * @param value - Valor base
 * @param discount - Objeto com tipo e valor do desconto
 * @returns Valor do desconto calculado
 */
export function applyDiscount(value: number, discount?: Discount | null): number {
  if (!discount || discount.value <= 0) {
    return 0;
  }

  let discountAmount = 0;

  if (discount.type === 'percent') {
    // Desconto percentual
    const percentage = DecimalCalculator.divide(discount.value, 100);
    discountAmount = DecimalCalculator.multiply(value, percentage);
  } else {
    // Desconto em valor fixo
    discountAmount = discount.value;
  }

  // Garantir que o desconto não seja maior que o valor total
  if (discountAmount > value) {
    return value;
  }

  return DecimalCalculator.toFixed(discountAmount);
}

/**
 * Calcula o total final (subtotal - desconto)
 * @param subtotal - Subtotal dos itens
 * @param discountAmount - Valor do desconto
 * @returns Total final
 */
export function calculateTotal(subtotal: number, discountAmount: number = 0): number {
  const total = DecimalCalculator.subtract(subtotal, discountAmount);
  
  // Garantir que o total não seja negativo
  if (total < 0) {
    return 0;
  }
  
  return DecimalCalculator.toFixed(total);
}

/**
 * Calcula a comissão baseada no total e na forma de pagamento
 * @param total - Valor total da proposta
 * @param rate - Taxa de comissão em percentual
 * @param paymentMethod - Forma de pagamento (opcional, para log)
 * @returns Objeto com percentual e valor da comissão
 */
export function calculateCommission(
  total: number, 
  rate: number, 
  paymentMethod?: string
): { percent: number; amount: number } {
  if (total <= 0 || rate <= 0) {
    return { percent: 0, amount: 0 };
  }

  const commissionRate = DecimalCalculator.divide(rate, 100);
  const commissionAmount = DecimalCalculator.multiply(total, commissionRate);

  return {
    percent: rate,
    amount: DecimalCalculator.toFixed(commissionAmount)
  };
}

/**
 * Valida se todos os cálculos de uma proposta estão corretos
 * @param proposal - Objeto com todos os valores da proposta
 * @returns true se válido, false caso contrário
 */
export function validateTotals(proposal: {
  items: ProposalItem[];
  subtotal: number;
  discountAmount?: number;
  total: number;
  commissionAmount?: number;
  commissionPercent?: number;
}): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  // Validar subtotal
  const calculatedSubtotal = calculateSubtotal(proposal.items);
  const subtotalDiff = Math.abs(calculatedSubtotal - proposal.subtotal);
  
  if (subtotalDiff > 0.01) {
    errors.push(`Subtotal incorreto. Esperado: ${calculatedSubtotal}, Recebido: ${proposal.subtotal}`);
  }

  // Validar total
  const calculatedTotal = calculateTotal(
    proposal.subtotal, 
    proposal.discountAmount || 0
  );
  const totalDiff = Math.abs(calculatedTotal - proposal.total);
  
  if (totalDiff > 0.01) {
    errors.push(`Total incorreto. Esperado: ${calculatedTotal}, Recebido: ${proposal.total}`);
  }

  // Validar comissão se fornecida
  if (proposal.commissionPercent !== undefined && proposal.commissionAmount !== undefined) {
    const calculatedCommission = calculateCommission(
      proposal.total, 
      proposal.commissionPercent
    );
    const commissionDiff = Math.abs(calculatedCommission.amount - proposal.commissionAmount);
    
    if (commissionDiff > 0.01) {
      errors.push(`Comissão incorreta. Esperado: ${calculatedCommission.amount}, Recebido: ${proposal.commissionAmount}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Calcula todos os valores de uma proposta de uma vez
 * @param items - Itens da proposta
 * @param discount - Desconto (opcional)
 * @param commissionRate - Taxa de comissão
 * @returns Objeto com todos os cálculos
 */
export function calculateProposal(
  items: ProposalItem[],
  discount?: Discount | null,
  commissionRate: number = 0
): ProposalCalculation {
  const subtotal = calculateSubtotal(items);
  const discountAmount = applyDiscount(subtotal, discount);
  const total = calculateTotal(subtotal, discountAmount);
  const commission = calculateCommission(total, commissionRate);

  return {
    subtotal,
    discountAmount,
    total,
    commissionPercent: commission.percent,
    commissionAmount: commission.amount
  };
}

/**
 * Formata valor para moeda brasileira
 * @param value - Valor numérico
 * @returns String formatada em BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Converte string para número seguro para cálculos
 * @param value - String com valor monetário
 * @returns Número válido para cálculos
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  let cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Lógica para números brasileiros: 1.234,56
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Se tem ambos, o ponto é separador de milhares e vírgula é decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Se só tem vírgula, é separador decimal
    cleaned = cleaned.replace(',', '.');
  }
  // Se só tem ponto, assume que é separador decimal
  
  // Converte para número
  try {
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : DecimalCalculator.toFixed(num);
  } catch {
    return 0;
  }
}