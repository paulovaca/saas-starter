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
import styles from './edit-item-modal.module.css';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export function EditItemModal({ isOpen, onClose, item, onSuccess }: EditItemModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customName: item?.customName || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aqui você implementará a action para atualizar o item
      // Por enquanto, apenas simula o processo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Item atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={`sm:max-w-[500px] ${styles.modal}`}>
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
