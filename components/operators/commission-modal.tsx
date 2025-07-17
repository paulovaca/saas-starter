'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { CreateCommissionRuleModal } from './create-commission-rule-modal';
import { EditCommissionRuleModal } from './edit-commission-rule-modal';
import { deleteCommissionRule } from '@/lib/actions/operators/create-commission-rule';
import styles from './commission-modal.module.css';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export function CommissionModal({ isOpen, onClose, item: initialItem, onSuccess }: CommissionModalProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [item, setItem] = useState(initialItem);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update local item when initialItem changes or when refreshKey changes
  useEffect(() => {
    if (initialItem) {
      // Encontra o item atualizado no array do operator (se disponível)
      setItem(initialItem);
    }
  }, [initialItem, refreshKey, isOpen]);

  const handleAddRule = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setIsEditModalOpen(true);
  };

  const handleDeleteRule = async (rule: any) => {
    if (confirm('Tem certeza que deseja excluir esta regra de comissão?')) {
      try {
        const result = await deleteCommissionRule({ id: rule.id });
        
        if (result.success) {
          toast.success(result.message);
          onSuccess(); // Refresh parent data
          setTimeout(() => {
            setRefreshKey(prev => prev + 1); // Force local refresh after delay
          }, 100);
          // Fecha o modal principal automaticamente após excluir regra
          setTimeout(() => {
            onClose();
          }, 200);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Error deleting commission rule:', error);
        toast.error('Erro ao excluir regra de comissão');
      }
    }
  };

  const handleSuccess = () => {
    // Primeiro chama o onSuccess do pai para atualizar os dados
    onSuccess();
    // Fecha os sub-modais
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingRule(null);
    // Force refresh local data após um pequeno delay para permitir que o router.refresh() termine
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 100);
    // Fecha o modal principal automaticamente após adicionar/editar regra
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={`sm:max-w-[600px] max-h-[80vh] overflow-y-auto ${styles.modal}`}>
        <DialogHeader>
          <DialogTitle>Gerenciar Comissões</DialogTitle>
          <p className={styles.itemId}>
            {item?.customName || `Item ${item?.catalogItemId?.slice(-8)}`}
          </p>
        </DialogHeader>
        
        <div className={styles.rulesContainer}>
          <div className={styles.ruleHeader}>
            <div>
              <h3 className={styles.ruleType}>Regras de Comissão</h3>
              <p className={styles.itemId}>
                Configure as regras de comissionamento para este item
              </p>
            </div>
            <Button onClick={handleAddRule} className={styles.addButton}>
              <Plus className={styles.plusIcon} />
              Nova Regra
            </Button>
          </div>

          {item?.commissionRules?.length === 0 ? (
            <Card>
              <CardContent className={styles.emptyState}>
                <div>
                  <h3 className={styles.emptyTitle}>Nenhuma regra configurada</h3>
                  <p className={styles.emptyDescription}>
                    Este item ainda não possui regras de comissão configuradas.
                    Use o botão "Nova Regra" acima para adicionar a primeira regra.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={styles.rulesContainer}>
              {item?.commissionRules?.map((rule: any) => (
                <Card key={rule.id} className={styles.ruleCard}>
                  <CardHeader>
                    <div className={styles.ruleHeader}>
                      <CardTitle className={styles.ruleType}>
                        Regra {rule.ruleType}
                      </CardTitle>
                      <div className={styles.ruleActions}>
                        <Badge variant="outline">
                          {rule.percentage && `${rule.percentage}%`}
                          {rule.fixedValue && `R$ ${rule.fixedValue.toFixed(2)}`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                          className={styles.actionButton}
                        >
                          <Edit className={styles.editIcon} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          <Trash2 className={styles.deleteIcon} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={styles.ruleDetails}>
                      {rule.minValue && rule.maxValue && (
                        <p className={styles.ruleRange}>
                          Faixa: R$ {rule.minValue.toFixed(2)} - R$ {rule.maxValue.toFixed(2)}
                        </p>
                      )}
                      {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                        <div className={styles.conditionsSection}>
                          <p className={styles.conditionsTitle}>Condições:</p>
                          <ul className={styles.conditionsList}>
                            {Object.entries(rule.conditions).map(([key, value]) => (
                              <li key={key}>
                                {key}: {String(value)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className={styles.buttonContainer}>
            <Button variant="outline" onClick={onClose} className={styles.closeButton}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Sub-modals */}
        <CreateCommissionRuleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          operatorItemId={item?.id || ''}
          onSuccess={handleSuccess}
        />

        <EditCommissionRuleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          rule={editingRule}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
