'use client';

import { useState } from 'react';
import { toast } from 'sonner';
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
          toast.error('Formato JSON inválido nas condições');
          setIsLoading(false);
          return;
        }
      }

      const result = await createCommissionRule(data);
      
      if (result.success) {
        toast.success(result.message);
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
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error creating commission rule:', error);
      toast.error('Erro ao criar regra de comissão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={`sm:max-w-[600px] max-h-[90vh] overflow-y-auto ${styles.modal}`}>
        <DialogHeader>
          <DialogTitle>Nova Regra de Comissão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruleType">Tipo de Regra</Label>
            <Select
              value={formData.ruleType}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, ruleType: value as 'percentage_fixed' | 'value_fixed' | 'tiered' | 'custom' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de regra" />
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Escalonamento de Comissão</Label>
                <p className="text-sm text-muted-foreground">
                  Configure diferentes faixas de valor com comissões específicas
                </p>
              </div>
              
              {formData.tiers.map((tier, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Faixa {index + 1}</h4>
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
                  
                  <div className="grid grid-cols-2 gap-3">
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
                  
                  <div className="grid grid-cols-2 gap-3">
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
                className="w-full"
              >
                Adicionar Faixa
              </Button>
            </div>
          )}

          {formData.ruleType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="conditions">Configuração Personalizada (JSON)</Label>
              <Textarea
                id="conditions"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder='{"type": "custom", "formula": "value * 0.1 + base", "base": 50}'
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Configure uma regra personalizada em formato JSON com fórmulas específicas
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Regra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
