'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Edit3, Save, X } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import styles from './client-funnel-stage-editor.module.css';

interface FunnelStageEditorProps {
  clientId: string;
  currentFunnel?: {
    id: string;
    name: string;
  };
  currentStage?: {
    id: string;
    name: string;
    color?: string;
    instructions?: string;
  };
  clientUserId: string;
  onUpdate: (funnelId: string, stageId: string) => void;
}

interface Funnel {
  id: string;
  name: string;
  isDefault: boolean;
}

interface Stage {
  id: string;
  name: string;
  funnelId: string;
  color: string;
  instructions?: string | null;
}

export default function ClientFunnelStageEditor({ 
  clientId, 
  currentFunnel, 
  currentStage, 
  clientUserId, 
  onUpdate 
}: FunnelStageEditorProps) {
  const { canEditClientFunnel } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState(currentFunnel?.id || '');
  const [selectedStageId, setSelectedStageId] = useState(currentStage?.id || '');
  const [availableStages, setAvailableStages] = useState<Stage[]>([]);

  const canEdit = canEditClientFunnel(clientUserId);

  // Buscar funis e estágios
  useEffect(() => {
    if (isEditing) {
      fetchFilters();
    }
  }, [isEditing]);

  // Resetar valores quando as props mudarem
  useEffect(() => {
    setSelectedFunnelId(currentFunnel?.id || '');
    setSelectedStageId(currentStage?.id || '');
  }, [currentFunnel, currentStage]);

  // Filtrar estágios quando o funil muda
  useEffect(() => {
    if (selectedFunnelId) {
      const filtered = stages.filter(stage => stage.funnelId === selectedFunnelId);
      setAvailableStages(filtered);
      
      // Se o estágio atual não pertence ao funil selecionado, selecionar o primeiro
      if (!filtered.some(stage => stage.id === selectedStageId)) {
        setSelectedStageId(filtered[0]?.id || '');
      }
    }
  }, [selectedFunnelId, stages, selectedStageId]);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/clients/filters');
      if (response.ok) {
        const data = await response.json();
        setFunnels(data.funnels);
        setStages(data.funnelStages);
      }
    } catch (error) {
      console.error('Erro ao buscar filtros:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedFunnelId || !selectedStageId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funnelId: selectedFunnelId,
          funnelStageId: selectedStageId,
        }),
      });

      if (response.ok) {
        onUpdate(selectedFunnelId, selectedStageId);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar funil/etapa');
      }
    } catch (error) {
      console.error('Erro ao atualizar funil/etapa:', error);
      alert('Erro ao atualizar funil/etapa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFunnelId(currentFunnel?.id || '');
    setSelectedStageId(currentStage?.id || '');
    setIsEditing(false);
  };

  const getStageColor = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: styles.colorBlue,
      green: styles.colorGreen,
      yellow: styles.colorYellow,
      red: styles.colorRed,
      purple: styles.colorPurple,
      orange: styles.colorOrange,
      pink: styles.colorPink,
      gray: styles.colorGray,
    };
    return colorMap[color || 'gray'] || styles.colorGray;
  };

  if (!canEdit) {
    return (
      <Card className={styles.funnelStageCard}>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>Funil e Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.currentInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Funil:</span>
              <span className={styles.value}>{currentFunnel?.name || 'Não definido'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Etapa:</span>
              <Badge variant="outline" className={`${styles.stageBadge} ${getStageColor(currentStage?.color)}`}>
                {currentStage?.name || 'Não definido'}
              </Badge>
            </div>
            {currentStage?.instructions && (
              <div className={styles.stageInstructions}>
                <span className={styles.label}>Diretrizes da Etapa:</span>
                <p className={styles.instructionsText}>{currentStage.instructions}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.funnelStageCard}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          Funil e Etapa
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              <Edit3 className={styles.editIcon} />
              Editar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className={styles.currentInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Funil:</span>
              <span className={styles.value}>{currentFunnel?.name || 'Não definido'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Etapa:</span>
              <Badge variant="outline" className={`${styles.stageBadge} ${getStageColor(currentStage?.color)}`}>
                {currentStage?.name || 'Não definido'}
              </Badge>
            </div>
            {currentStage?.instructions && (
              <div className={styles.stageInstructions}>
                <span className={styles.label}>Diretrizes da Etapa:</span>
                <p className={styles.instructionsText}>{currentStage.instructions}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.editingForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Funil</label>
              <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId}>
                <SelectTrigger className={styles.selectTrigger}>
                  <div className={styles.selectValue}>
                    {selectedFunnelId ? 
                      funnels.find(f => f.id === selectedFunnelId)?.name + 
                      (funnels.find(f => f.id === selectedFunnelId)?.isDefault ? ' (Padrão)' : '') 
                      : 'Selecione o funil'}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {funnels.map(funnel => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}{funnel.isDefault ? ' (Padrão)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Etapa</label>
              <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                <SelectTrigger className={styles.selectTrigger}>
                  <div className={styles.selectValue}>
                    {selectedStageId ? 
                      availableStages.find(s => s.id === selectedStageId)?.name 
                      : 'Selecione a etapa'}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStageId && availableStages.find(s => s.id === selectedStageId)?.instructions && (
              <div className={styles.stageInstructions}>
                <span className={styles.label}>Diretrizes da Etapa:</span>
                <p className={styles.instructionsText}>
                  {availableStages.find(s => s.id === selectedStageId)?.instructions}
                </p>
              </div>
            )}

            <div className={styles.formActions}>
              <Button
                onClick={handleSave}
                disabled={isLoading || !selectedFunnelId || !selectedStageId}
                className={styles.saveButton}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={styles.loadingIcon} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className={styles.saveIcon} />
                    Salvar
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className={styles.cancelButton}
              >
                <X className={styles.cancelIcon} />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
