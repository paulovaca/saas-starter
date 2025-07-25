'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createCommissionRule } from '@/lib/actions/operators/create-commission-rule';
import styles from './create-commission-rule-modal.module.css';

interface CreateCommissionRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatorItemId: string;
  onSuccess: () => void;
}

export function CreateCommissionRuleModal({ 
  isOpen, 
  onClose, 
  operatorItemId, 
  onSuccess 
}: CreateCommissionRuleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ruleType: 'percentage_fixed' as 'percentage_fixed' | 'value_fixed' | 'tiered' | 'custom',
    percentage: '',
    fixedValue: '',
    minValue: '',
    maxValue: '',
    conditions: '{}',
    tiers: [] as { minAmount: number; maxAmount: number; percentage?: number; fixedValue?: number }[],
  });

  const getRuleTypeLabel = (ruleType: string) => {
    switch (ruleType) {
      case 'percentage_fixed': return 'Porcentagem Fixa';
      case 'value_fixed': return 'Valor Fixo Por Venda';
      case 'tiered': return 'Escalonamento';
      case 'custom': return 'Personalizado';
      default: return 'Selecione o tipo de regra';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: any = {
        operatorItemId,
        ruleType: formData.ruleType,
      };

      // Adicionar campos específicos por tipo
      if (formData.ruleType === 'percentage_fixed' && formData.percentage) {
        data.percentage = parseFloat(formData.percentage);
      }
      
      if (formData.ruleType === 'value_fixed' && formData.fixedValue) {
        data.fixedValue = parseFloat(formData.fixedValue);
      }
      
      if (formData.ruleType === 'tiered' && formData.tiers.length > 0) {
        data.tiers = formData.tiers.filter(tier => 
          tier.minAmount >= 0 && tier.maxAmount > tier.minAmount
        );
      }
      
      if (formData.ruleType === 'custom' && formData.conditions !== '{}') {
        try {
          data.conditions = JSON.parse(formData.conditions);
        } catch {
          showError('Formato JSON inválido nas condições');
          setIsLoading(false);
          return;
        }
      }

      const result = await createCommissionRule(data);
      
      if (result.success) {
        showSuccess(result.message || 'Regra criada com sucesso!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          ruleType: 'percentage_fixed',
          percentage: '',
          fixedValue: '',
          minValue: '',
          maxValue: '',
          conditions: '{}',
          tiers: [],
        });
      } else {
        showError(result.error || 'Erro ao criar regra');
      }
    } catch (error) {
      console.error('Error creating commission rule:', error);
      showError('Erro ao criar regra de comissão');
    } finally {
      setIsLoading(false);
    }
  };

  const { showSuccess, showError } = useToast();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.modal}>
        <DialogHeader>
          <DialogTitle>Nova Regra de Comissão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formField}>
            <Label htmlFor="ruleType">Tipo de Regra</Label>
            <Select
              value={formData.ruleType}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, ruleType: value as 'percentage_fixed' | 'value_fixed' | 'tiered' | 'custom' }))
              }
            >
              <SelectTrigger>
                <span>
                  {formData.ruleType ? getRuleTypeLabel(formData.ruleType) : "Selecione o tipo de regra"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage_fixed">Porcentagem Fixa</SelectItem>
                <SelectItem value="value_fixed">Valor Fixo Por Venda</SelectItem>
                <SelectItem value="tiered">Escalonamento</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos específicos para cada tipo */}
          {formData.ruleType === 'percentage_fixed' && (
            <div className={styles.formField}>
              <Label htmlFor="percentage">Percentual (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                placeholder="Ex: 10.5"
                required
              />
            </div>
          )}

          {formData.ruleType === 'value_fixed' && (
            <div className={styles.formField}>
              <Label htmlFor="fixedValue">Valor Fixo por Venda (R$)</Label>
              <Input
                id="fixedValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.fixedValue}
                onChange={(e) => setFormData(prev => ({ ...prev, fixedValue: e.target.value }))}
                placeholder="Ex: 50.00"
                required
              />
            </div>
          )}

          {formData.ruleType === 'tiered' && (
            <div className={styles.tiersSection}>
              <div className={styles.formField}>
                <Label>Escalonamento de Comissão</Label>
                <p className={styles.helpText}>
                  Configure diferentes faixas de valor com comissões específicas
                </p>
              </div>
              
              {formData.tiers.map((tier, index) => (
                <div key={index} className={styles.tierItem}>
                  <div className={styles.tiersHeader}>
                    <h4 className={styles.tiersTitle}>Faixa {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTiers = formData.tiers.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, tiers: newTiers }));
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                  
                  <div className={styles.gridContainer}>
                    <div>
                      <Label>Valor Mínimo (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tier.minAmount}
                        onChange={(e) => {
                          const newTiers = [...formData.tiers];
                          newTiers[index].minAmount = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, tiers: newTiers }));
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Valor Máximo (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tier.maxAmount}
                        onChange={(e) => {
                          const newTiers = [...formData.tiers];
                          newTiers[index].maxAmount = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, tiers: newTiers }));
                        }}
                        placeholder="1000.00"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.gridContainer}>
                    <div>
                      <Label>Percentual (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={tier.percentage || ''}
                        onChange={(e) => {
                          const newTiers = [...formData.tiers];
                          newTiers[index].percentage = parseFloat(e.target.value) || undefined;
                          setFormData(prev => ({ ...prev, tiers: newTiers }));
                        }}
                        placeholder="5.0"
                      />
                    </div>
                    <div>
                      <Label>Valor Fixo (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tier.fixedValue || ''}
                        onChange={(e) => {
                          const newTiers = [...formData.tiers];
                          newTiers[index].fixedValue = parseFloat(e.target.value) || undefined;
                          setFormData(prev => ({ ...prev, tiers: newTiers }));
                        }}
                        placeholder="100.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    tiers: [...prev.tiers, { minAmount: 0, maxAmount: 0 }]
                  }));
                }}
                className={styles.addTierButton}
              >
                Adicionar Faixa
              </Button>
            </div>
          )}

          {formData.ruleType === 'custom' && (
            <div className={styles.formField}>
              <Label htmlFor="conditions">Configuração Personalizada (JSON)</Label>
              <Textarea
                id="conditions"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder='{"type": "custom", "formula": "value * 0.1 + base", "base": 50}'
                rows={5}
              />
              <p className={styles.helpText}>
                Configure uma regra personalizada em formato JSON com fórmulas específicas
              </p>
            </div>
          )}

          <div className={styles.buttonContainer}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading && <Loader2 className={styles.loadingIcon} />}
              Criar Regra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
