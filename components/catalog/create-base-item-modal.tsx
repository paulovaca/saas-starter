'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormModal } from '@/components/ui/form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBaseItem } from '@/lib/actions/catalog';
import { useToast } from '@/components/ui/toast';
import styles from './create-base-item-modal.module.css';

interface CreateBaseItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBaseItemModal({ open, onOpenChange }: CreateBaseItemModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showError('Nome do item é obrigatório');
      throw new Error('Nome do item é obrigatório');
    }

    setIsLoading(true);
    
    try {
      const newItem = await createBaseItem({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      showSuccess('Item base criado com sucesso!');
      
      // Reset form
      setFormData({ name: '', description: '' });
      
      // Refresh the page to show the new item
      router.refresh();
    } catch (error) {
      console.error('Erro ao criar item base:', error);
      showError(error instanceof Error ? error.message : 'Erro ao criar item base');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setFormData({ name: '', description: '' });
    }
  };

  return (
    <FormModal
      isOpen={open}
      onClose={handleClose}
      title="Criar Novo Item Base"
      description="Crie um novo item base que poderá ser usado na composição de portfólios"
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitLabel="Criar Item"
      size="md"
    >
      <div className={styles.form}>
        <div>
          <Label htmlFor="name">Nome do Item *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Hospedagem, Transporte, Passeio..."
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição opcional do item base"
            disabled={isLoading}
          />
        </div>
      </div>
    </FormModal>
  );
}
