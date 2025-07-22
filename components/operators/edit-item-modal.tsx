'use client';

import { useState, useEffect } from 'react';
import { FormModal } from '@/components/ui/form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { updateOperatorItem } from '@/lib/actions/operators/update-operator-item';
import styles from './edit-item-modal.module.css';
import formStyles from '../ui/form-styles.module.css';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  operatorId: string;
  onSuccess: () => void;
}

export function EditItemModal({ isOpen, onClose, item, operatorId, onSuccess }: EditItemModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customName: '',
  });

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        customName: item.customName || '',
      });
    }
  }, [item]);

  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    const result = await updateOperatorItem({
      operatorItemId: item.id,
      operatorId: operatorId,
      customName: formData.customName.trim() || undefined,
    });
    
    if (result.success) {
      showSuccess(result.message || 'Item atualizado com sucesso!');
      onSuccess();
      onClose();
    } else {
      showError(result.error || 'Erro ao atualizar item');
      throw new Error(result.error || 'Erro ao atualizar item');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Item da Operadora"
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitLabel="Atualizar Item"
      size="md"
    >
      <div className={formStyles.formContainer}>
        <div>
          <Label htmlFor="customName">Nome Customizado</Label>
          <Input
            id="customName"
            value={formData.customName}
            onChange={(e) => setFormData(prev => ({ ...prev, customName: e.target.value }))}
            placeholder="Nome personalizado para este item"
          />
          <p className={styles.helpText}>
            Deixe em branco para usar o nome padrão do item
          </p>
        </div>
      </div>
    </FormModal>
  );
}
