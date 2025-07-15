'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBaseItem } from '@/lib/actions/catalog';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome do item é obrigatório');
      return;
    }

    setIsLoading(true);
    
    try {
      const newItem = await createBaseItem({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      alert('Item base criado com sucesso!');
      onOpenChange(false);
      
      // Reset form
      setFormData({ name: '', description: '' });
      
      // Refresh the page to show the new item
      router.refresh();
    } catch (error) {
      console.error('Erro ao criar item base:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar item base');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setFormData({ name: '', description: '' });
      }
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Criar Novo Item Base</h2>
            <p className={styles.subtitle}>
              Crie um novo item base que poderá ser usado na composição de portfólios
            </p>
          </div>
          <button
            onClick={() => handleOpenChange(false)}
            className={styles.closeButton}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
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

          <div className={styles.field}>
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

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
