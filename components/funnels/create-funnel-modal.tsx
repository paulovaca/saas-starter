import React, { useState } from 'react';
import { Plus, Copy, Zap } from 'lucide-react';
import { createFunnel, createFunnelFromTemplate } from '@/lib/actions/funnels';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ColorPicker from './color-picker';
import styles from './create-funnel-modal.module.css';

interface CreateFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StageInput {
  name: string;
  description: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange' | 'pink';
}

type CreateMode = 'blank' | 'template' | 'duplicate';

export default function CreateFunnelModal({ isOpen, onClose, onSuccess }: CreateFunnelModalProps) {
  const [mode, setMode] = useState<CreateMode>('template');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados do funil
  const [funnelName, setFunnelName] = useState('');
  const [funnelDescription, setFunnelDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  // Template selecionado
  const [selectedTemplate, setSelectedTemplate] = useState<'b2c' | 'b2b' | 'support'>('b2c');

  // Etapas personalizadas (para modo em branco)
  const [stages, setStages] = useState<StageInput[]>([
    { name: 'Novo Lead', description: 'Cliente recém-captado', color: 'blue' },
    { name: 'Fechamento', description: 'Cliente convertido', color: 'green' },
  ]);

  const resetForm = () => {
    setFunnelName('');
    setFunnelDescription('');
    setIsDefault(false);
    setSelectedTemplate('b2c');
    setStages([
      { name: 'Novo Lead', description: 'Cliente recém-captado', color: 'blue' },
      { name: 'Fechamento', description: 'Cliente convertido', color: 'green' },
    ]);
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const addStage = () => {
    setStages([...stages, { name: '', description: '', color: 'blue' }]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 2) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const updateStage = (index: number, field: keyof StageInput, value: string) => {
    setStages(stages.map((stage, i) => 
      i === index ? { ...stage, [field]: value } : stage
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (mode === 'template') {
        result = await createFunnelFromTemplate(selectedTemplate);
      } else if (mode === 'blank') {
        result = await createFunnel({
          name: funnelName,
          description: funnelDescription,
          isDefault,
          stages: stages.map(stage => ({
            name: stage.name,
            description: stage.description,
            color: stage.color,
          })),
        });
      }

      if (result?.success) {
        onSuccess();
        handleClose();
      } else {
        setError((result as any)?.error || 'Erro ao criar funil');
      }
    } catch (error) {
      setError('Erro inesperado ao criar funil');
      console.error('Erro ao criar funil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWrapper = async () => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(mockEvent);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Novo Funil"
      onSubmit={handleSubmitWrapper}
      isSubmitting={isLoading}
      submitLabel="Criar Funil"
      size="lg"
    >
      <div className={styles.form}>
        {/* Seleção do modo */}
        <div className={styles.modeSelector}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'template' ? styles.active : ''}`}
            onClick={() => setMode('template')}
          >
            <Zap size={20} />
            <span>Usar Template</span>
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'blank' ? styles.active : ''}`}
            onClick={() => setMode('blank')}
          >
            <Plus size={20} />
            <span>Criar do Zero</span>
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {mode === 'template' && (
          <div className={styles.templateSection}>
            <Label className={styles.label}>Selecione um Template</Label>
            <div className={styles.templateGrid}>
              <div 
                className={`${styles.templateCard} ${selectedTemplate === 'b2c' ? styles.selected : ''}`}
                onClick={() => setSelectedTemplate('b2c')}
              >
                <h4 className={styles.templateName}>B2C - Vendas Diretas</h4>
                <p className={styles.templateDescription}>Para vendas diretas ao consumidor final</p>
              </div>
            </div>
          </div>
        )}

        {mode === 'blank' && (
          <div className={styles.customSection}>
            <div className={styles.basicInfo}>
              <div className={styles.formGroup}>
                <Label htmlFor="funnelName">Nome do Funil *</Label>
                <Input
                  id="funnelName"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                  placeholder="Ex: Vendas B2B, Atendimento..."
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <Label htmlFor="funnelDescription">Descrição</Label>
                <Input
                  id="funnelDescription"
                  value={funnelDescription}
                  onChange={(e) => setFunnelDescription(e.target.value)}
                  placeholder="Descrição opcional do funil"
                />
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <span>Definir como funil padrão</span>
              </label>
            </div>

            <div className={styles.stagesSection}>
              <h3 className={styles.label}>Etapas do Funil</h3>
              <div className={styles.stagesList}>
                {stages.map((stage, index) => (
                  <div key={index} className={styles.stageItem}>
                    <div className={styles.stageNumber}>
                      {index + 1}
                    </div>
                    
                    <div className={styles.stageInputs}>
                      <Input
                        type="text"
                        value={stage.name}
                        onChange={(e) => updateStage(index, 'name', e.target.value)}
                        placeholder="Nome da etapa"
                        required
                        maxLength={255}
                      />
                      <Input
                        type="text"
                        value={stage.description}
                        onChange={(e) => updateStage(index, 'description', e.target.value)}
                        placeholder="Descrição (opcional)"
                        maxLength={500}
                      />
                    </div>

                    <ColorPicker
                      value={stage.color}
                      onChange={(color) => updateStage(index, 'color', color)}
                    />

                    {stages.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className={styles.removeStageButton}
                        title="Remover etapa"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={addStage}
                disabled={stages.length >= 10}
              >
                <Plus size={16} />
                Adicionar Etapa
              </Button>
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
}
