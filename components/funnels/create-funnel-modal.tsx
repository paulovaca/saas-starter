import React, { useState } from 'react';
import { X, Plus, Copy, Zap } from 'lucide-react';
import { createFunnel, createFunnelFromTemplate } from '@/lib/actions/funnels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Criar Novo Funil</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
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
              {error}
            </div>
          )}

          {mode === 'template' && (
            <div className={styles.templateSection}>
              <Label className={styles.label}>Selecione um Template</Label>
              <div className={styles.templateGrid}>
                {[
                  { key: 'b2c', name: 'Funil B2C - Padrão', description: 'Funil otimizado para vendas diretas ao consumidor', stages: 6 },
                  { key: 'b2b', name: 'Funil B2B - Empresarial', description: 'Funil estruturado para vendas corporativas', stages: 7 },
                  { key: 'support', name: 'Funil de Suporte', description: 'Gestão de tickets e atendimento ao cliente', stages: 6 }
                ].map((template) => (
                  <div
                    key={template.key}
                    className={`${styles.templateCard} ${
                      selectedTemplate === template.key ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedTemplate(template.key as 'b2c' | 'b2b' | 'support')}
                  >
                    <h4 className={styles.templateName}>{template.name}</h4>
                    <p className={styles.templateDescription}>{template.description}</p>
                    <div className={styles.templateStages}>
                      {template.stages} etapas
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'blank' && (
            <div className={styles.customSection}>
              <div className={styles.basicInfo}>
                <div className={styles.formGroup}>
                  <Label htmlFor="funnelName" className={styles.label}>
                    Nome do Funil *
                  </Label>
                  <Input
                    id="funnelName"
                    type="text"
                    value={funnelName}
                    onChange={(e) => setFunnelName(e.target.value)}
                    placeholder="Ex: Funil de Vendas B2C"
                    required
                    maxLength={255}
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="funnelDescription" className={styles.label}>
                    Descrição
                  </Label>
                  <Input
                    id="funnelDescription"
                    type="text"
                    value={funnelDescription}
                    onChange={(e) => setFunnelDescription(e.target.value)}
                    placeholder="Descrição opcional do funil"
                    maxLength={1000}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <span>Definir como funil padrão</span>
                  </label>
                </div>
              </div>

              <div className={styles.stagesSection}>
                <div className={styles.stagesHeader}>
                  <Label className={styles.label}>Etapas do Funil</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStage}
                    disabled={stages.length >= 10}
                  >
                    <Plus size={16} />
                    Adicionar Etapa
                  </Button>
                </div>

                <div className={styles.stagesList}>
                  {stages.map((stage, index) => (
                    <div key={index} className={styles.stageItem}>
                      <div className={styles.stageNumber}>{index + 1}</div>
                      
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
                          className={styles.removeStageButton}
                          onClick={() => removeStage(index)}
                          title="Remover etapa"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (mode === 'blank' && !funnelName.trim())}
            >
              {isLoading ? 'Criando...' : 'Criar Funil'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
