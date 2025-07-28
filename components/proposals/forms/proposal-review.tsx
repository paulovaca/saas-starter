'use client';

import { useState, useCallback } from 'react';
import { Calendar, CreditCard, FileText, User, Building2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './proposal-review.module.css';

interface ProposalReviewProps {
  data: {
    clientId?: string;
    operatorId?: string;
    items: any[];
    discountAmount?: number;
    discountPercent?: number;
    paymentMethod?: string;
    validUntil?: Date;
    notes?: string;
    internalNotes?: string;
  };
  onComplete: (data: any) => void;
  onUpdate: (data: any) => void;
}

export default function ProposalReview({ data, onComplete, onUpdate }: ProposalReviewProps) {
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('percent');
  const [discountValue, setDiscountValue] = useState(data.discountPercent || data.discountAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState(data.paymentMethod || 'PIX');
  const [validUntil, setValidUntil] = useState(
    data.validUntil ? data.validUntil.toISOString().split('T')[0] : 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(data.notes || '');
  const [internalNotes, setInternalNotes] = useState(data.internalNotes || '');

  // Mock data - should come from API
  const mockClient = {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '123.456.789-00'
  };

  const mockOperator = {
    name: 'CVC Viagens'
  };

  const paymentMethods = [
    { value: 'PIX', label: 'PIX', commission: 15 },
    { value: 'Cartão 1x', label: 'Cartão 1x', commission: 10 },
    { value: 'Cartão 12x', label: 'Cartão 12x', commission: 8 },
    { value: 'Boleto', label: 'Boleto', commission: 12 }
  ];

  const calculateTotals = useCallback(() => {
    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    let discountAmount = 0;
    if (discountValue > 0) {
      if (discountType === 'amount') {
        discountAmount = discountValue;
      } else {
        discountAmount = (subtotal * discountValue) / 100;
      }
    }

    const total = subtotal - discountAmount;
    const selectedPayment = paymentMethods.find(pm => pm.value === paymentMethod);
    const commissionPercent = selectedPayment?.commission || 0;
    const commissionAmount = (total * commissionPercent) / 100;

    return {
      subtotal,
      discountAmount,
      total,
      commissionPercent,
      commissionAmount
    };
  }, [data.items, discountType, discountValue, paymentMethod]);

  const totals = calculateTotals();

  const handleSubmit = useCallback(() => {
    const finalData = {
      ...data,
      discountAmount: discountType === 'amount' ? discountValue : undefined,
      discountPercent: discountType === 'percent' ? discountValue : undefined,
      paymentMethod,
      validUntil: new Date(validUntil),
      notes: notes.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined
    };

    onComplete(finalData);
  }, [data, discountType, discountValue, paymentMethod, validUntil, notes, internalNotes, onComplete]);

  return (
    <div className={styles.reviewContainer}>
      <h2 className={styles.sectionTitle}>Revisar e Configurar Proposta</h2>

      {/* Client Information */}
      <div className={styles.reviewSection}>
        <h3 className={styles.reviewSectionTitle}>
          <User className={styles.sectionIcon} />
          Informações do Cliente
        </h3>
        <div className={styles.reviewFieldsContainer}>
          <div className={styles.reviewField}>
            <span className={styles.reviewLabel}>Nome:</span>
            <span className={styles.reviewValue}>{mockClient.name}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewLabel}>Email:</span>
            <span className={styles.reviewValue}>{mockClient.email}</span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewLabel}>CPF:</span>
            <span className={styles.reviewValue}>{mockClient.document}</span>
          </div>
        </div>
      </div>

      {/* Operator Information */}
      <div className={styles.reviewSection}>
        <h3 className={styles.reviewSectionTitle}>
          <Building2 className={styles.sectionIcon} />
          Operadora
        </h3>
        <div className={styles.reviewField}>
          <span className={styles.reviewLabel}>Nome:</span>
          <span className={styles.reviewValue}>{mockOperator.name}</span>
        </div>
      </div>

      {/* Items */}
      <div className={styles.reviewSection}>
        <h3 className={styles.reviewSectionTitle}>
          <Package className={styles.sectionIcon} />
          Itens da Proposta
        </h3>
        <div className={styles.itemsList}>
          {data.items.map((item, index) => (
            <div key={item.id || index} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemDetails}>
                    Quantidade: {item.quantity} × R$ {item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  R$ {item.subtotal.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className={styles.reviewSection}>
        <h3 className={styles.reviewSectionTitle}>
          <CreditCard className={styles.sectionIcon} />
          Configurações de Preço
        </h3>
        
        <div className={styles.configSection}>
          {/* Discount */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Desconto</label>
            <div className={styles.discountRow}>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percent')}
                className={styles.discountSelect}
              >
                <option value="percent">Percentual (%)</option>
                <option value="amount">Valor (R$)</option>
              </select>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder="0"
                min="0"
                max={discountType === 'percent' ? 100 : totals.subtotal}
                className={styles.discountInput}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={styles.select}
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label} (Comissão: {method.commission}%)
                </option>
              ))}
            </select>
          </div>

          {/* Valid Until */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Válido até</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className={styles.reviewSection}>
        <h3 className={styles.reviewSectionTitle}>
          <FileText className={styles.sectionIcon} />
          Observações
        </h3>
        
        <div className={styles.configSection}>
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Observações da Proposta (visível para o cliente)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações que o cliente verá na proposta..."
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Notas Internas (apenas para equipe)
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Adicione notas internas que não aparecerão na proposta..."
              rows={3}
              className={styles.textarea}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.reviewSection}>
        <h3 className={styles.summaryTitle}>Resumo Financeiro</h3>
        <div className={styles.reviewFieldsContainer}>
          <div className={styles.reviewField}>
            <span className={styles.reviewLabel}>Subtotal:</span>
            <span className={styles.reviewValue}>R$ {totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className={styles.reviewField}>
              <span className={styles.reviewLabel}>Desconto:</span>
              <span className={styles.reviewValue}>-R$ {totals.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className={`${styles.reviewField} ${styles.totalRow}`}>
            <span className={styles.reviewLabel}>Total:</span>
            <span className={`${styles.reviewValue} ${styles.totalValue}`}>
              R$ {totals.total.toFixed(2)}
            </span>
          </div>
          <div className={styles.reviewField}>
            <span className={styles.reviewLabel}>
              Comissão ({totals.commissionPercent}%):
            </span>
            <span className={styles.reviewValue}>
              R$ {totals.commissionAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={handleSubmit} size="lg">
          Criar Proposta
        </Button>
      </div>
    </div>
  );
}