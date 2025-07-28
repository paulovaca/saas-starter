'use client';

import { useMemo } from 'react';
import { Package } from 'lucide-react';
import styles from './item-summary.module.css';

interface ProposalItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ItemSummaryProps {
  items: ProposalItem[];
  total: number;
  discount?: {
    type: 'amount' | 'percent';
    value: number;
  };
  commission?: {
    amount: number;
    percent: number;
  };
}

export default function ItemSummary({ 
  items, 
  total, 
  discount, 
  commission 
}: ItemSummaryProps) {
  const calculations = useMemo(() => {
    const subtotal = total;
    let discountAmount = 0;
    
    if (discount) {
      if (discount.type === 'amount') {
        discountAmount = discount.value;
      } else {
        discountAmount = (subtotal * discount.value) / 100;
      }
    }
    
    const finalTotal = subtotal - discountAmount;
    
    return {
      subtotal,
      discountAmount,
      finalTotal
    };
  }, [total, discount]);

  return (
    <div className={styles.summaryCard}>
      <h3 className={styles.summaryTitle}>
        <Package className={styles.summaryIcon} />
        Resumo da Proposta
      </h3>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          Nenhum item adicionado
        </div>
      ) : (
        <>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemDetails}>
                    {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  R$ {item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summarySection}>
            <div className={styles.summaryLine}>
              <span className={styles.summaryLabel}>Subtotal:</span>
              <span className={styles.summaryValue}>
                R$ {calculations.subtotal.toFixed(2)}
              </span>
            </div>

            {discount && calculations.discountAmount > 0 && (
              <div className={styles.summaryLine}>
                <span className={styles.summaryLabel}>
                  Desconto {discount.type === 'percent' ? `(${discount.value}%)` : ''}:
                </span>
                <span className={styles.summaryValue}>
                  -R$ {calculations.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className={styles.summaryLine}>
              <span className={styles.summaryLabel}>Total:</span>
              <span className={styles.summaryValue}>
                R$ {calculations.finalTotal.toFixed(2)}
              </span>
            </div>

            {commission && (
              <div className={styles.summaryLine}>
                <span className={styles.summaryLabel}>
                  Comissão ({commission.percent}%):
                </span>
                <span className={styles.summaryValue}>
                  R$ {commission.amount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Geral:</span>
              <span className={styles.totalValue}>
                R$ {calculations.finalTotal.toFixed(2)}
              </span>
            </div>
            
            {items.length > 0 && (
              <div className={styles.itemCount}>
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}