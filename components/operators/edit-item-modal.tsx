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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateOperatorItem } from '@/lib/actions/operators/update-operator-item';
import styles from './edit-item-modal.module.css';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateOperatorItem({
        operatorItemId: item.id,
        operatorId: operatorId,
        customName: formData.customName.trim() || undefined,
      });
      
      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error updating operator item:', error);
      toast.error('Erro ao atualizar item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={styles.modal}>
        <DialogHeader>
          <DialogTitle>Editar Item da Operadora</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formField}>
            <Label htmlFor="customName" className={styles.label}>Nome Customizado</Label>
            <Input
              id="customName"
              value={formData.customName}
              onChange={(e) => setFormData(prev => ({ ...prev, customName: e.target.value }))}
              placeholder="Nome personalizado para este item"
              className={styles.input}
            />
          </div>

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
              Atualizar Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
