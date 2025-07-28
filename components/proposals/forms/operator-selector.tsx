'use client';

import { useState, useCallback, useEffect } from 'react';
import { Package, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './operator-selector.module.css';

interface CommissionRule {
  paymentMethod: string;
  commissionPercent: number;
}

interface Operator {
  id: string;
  name: string;
  logo?: string;
  productsCount: number;
  commissionRules: CommissionRule[];
  isActive: boolean;
}

interface OperatorSelectorProps {
  data: any;
  onComplete: (data: { operatorId: string }) => void;
  onUpdate: (data: { operatorId: string }) => void;
}

export default function OperatorSelector({ data, onComplete, onUpdate }: OperatorSelectorProps) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(data.operatorId || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOperators = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockOperators: Operator[] = [
          {
            id: '1',
            name: 'CVC Viagens',
            logo: '/logos/cvc.png',
            productsCount: 15,
            isActive: true,
            commissionRules: [
              { paymentMethod: 'PIX', commissionPercent: 15 },
              { paymentMethod: 'Cartão 1x', commissionPercent: 10 },
              { paymentMethod: 'Cartão 12x', commissionPercent: 8 },
              { paymentMethod: 'Boleto', commissionPercent: 12 }
            ]
          },
          {
            id: '2',
            name: 'Decolar.com',
            productsCount: 23,
            isActive: true,
            commissionRules: [
              { paymentMethod: 'PIX', commissionPercent: 12 },
              { paymentMethod: 'Cartão 1x', commissionPercent: 10 },
              { paymentMethod: 'Cartão 12x', commissionPercent: 7 }
            ]
          },
          {
            id: '3',
            name: 'Azul Viagens',
            logo: '/logos/azul.png',
            productsCount: 8,
            isActive: true,
            commissionRules: [
              { paymentMethod: 'PIX', commissionPercent: 18 },
              { paymentMethod: 'Cartão 1x', commissionPercent: 15 },
              { paymentMethod: 'Boleto', commissionPercent: 16 }
            ]
          }
        ];

        // Filter only active operators with products
        const activeOperators = mockOperators.filter(op => op.isActive && op.productsCount > 0);
        setOperators(activeOperators.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error fetching operators:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperators();
  }, []);

  const handleSelectOperator = useCallback((operatorId: string) => {
    setSelectedOperator(operatorId);
    onUpdate({ operatorId });
  }, [onUpdate]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Carregando operadoras...</div>
      </div>
    );
  }

  return (
    <div className={styles.operatorContainer}>
      <h2 className={styles.sectionTitle}>Selecione a Operadora</h2>
      
      <div className={styles.operatorGrid}>
        {operators.map((operator) => (
          <div
            key={operator.id}
            className={`${styles.operatorCard} ${
              selectedOperator === operator.id ? styles.selected : ''
            }`}
            onClick={() => handleSelectOperator(operator.id)}
          >
            {operator.logo ? (
              <img
                src={operator.logo}
                alt={operator.name}
                className={styles.operatorLogo}
              />
            ) : (
              <div className={styles.operatorLogo}>
                <Building2 className={styles.operatorLogoIcon} />
              </div>
            )}

            <h3 className={styles.operatorName}>{operator.name}</h3>
            
            <div className={styles.operatorInfo}>
              <Package className={styles.operatorInfoIcon} />
              <span>{operator.productsCount} produtos disponíveis</span>
            </div>

            <div className={styles.operatorCommissions}>
              <table className={styles.commissionTable}>
                <thead>
                  <tr>
                    <th>Pagamento</th>
                    <th>Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  {operator.commissionRules.map((rule, index) => (
                    <tr key={index}>
                      <td>{rule.paymentMethod}</td>
                      <td>{rule.commissionPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {operators.length === 0 && (
        <div className={styles.emptyState}>
          Nenhuma operadora ativa encontrada
        </div>
      )}

      <div className={styles.actions}>
        <Button
          onClick={() => selectedOperator && onComplete({ operatorId: selectedOperator })}
          disabled={!selectedOperator}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}