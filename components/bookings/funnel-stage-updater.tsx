'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ChevronDown, Save, X } from 'lucide-react';
import { updateBookingFunnelStage } from '@/lib/actions/funnels/update-stage-manually';
import { toast } from 'sonner';
import styles from './funnel-stage-updater.module.css';

interface FunnelStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface FunnelStageUpdaterProps {
  bookingId: string;
  currentFunnelId: string;
  currentStageId?: string | null;
  currentStageName?: string | null;
  onUpdate?: () => void;
}

export default function FunnelStageUpdater({
  bookingId,
  currentFunnelId,
  currentStageId,
  currentStageName,
  onUpdate
}: FunnelStageUpdaterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState(currentStageId || '');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);

  // Carregar etapas do funil quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && currentFunnelId) {
      loadFunnelStages();
    }
  }, [isEditing, currentFunnelId]);

  const loadFunnelStages = async () => {
    if (!currentFunnelId) return;
    
    setLoadingStages(true);
    try {
      const response = await fetch(`/api/funnels/${currentFunnelId}/stages`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar etapas do funil');
      }
      
      const result = await response.json();
      if (result.stages && Array.isArray(result.stages)) {
        setStages(result.stages);
      }
    } catch (error) {
      console.error('Erro ao carregar etapas do funil:', error);
      toast.error('Erro ao carregar etapas do funil');
    } finally {
      setLoadingStages(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStageId || selectedStageId === currentStageId) {
      toast.error('Selecione uma etapa diferente da atual');
      return;
    }

    if (!reason.trim()) {
      toast.error('Digite uma justificativa para a mudança');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateBookingFunnelStage({
        bookingId,
        newFunnelStageId: selectedStageId,
        reason: reason.trim()
      });

      if (result.success) {
        toast.success('Etapa da reserva atualizada com sucesso');
        setIsEditing(false);
        setReason('');
        onUpdate?.();
      } else {
        toast.error('Erro ao atualizar etapa da reserva');
      }
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
      toast.error('Erro ao atualizar etapa da reserva');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedStageId(currentStageId || '');
    setReason('');
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || '#e5e7eb';
  };

  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.name || 'Etapa não encontrada';
  };

  if (!currentFunnelId) {
    return (
      <Card className={styles.card}>
        <CardContent className={styles.noFunnelContent}>
          <Target className={styles.noFunnelIcon} />
          <p className={styles.noFunnelText}>Esta reserva não está associada a nenhum funil</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <CardTitle className={styles.cardTitle}>
          <Target className={styles.titleIcon} />
          Etapa do Funil
        </CardTitle>
      </CardHeader>
      <CardContent className={styles.cardContent}>
        {!isEditing ? (
          <div className={styles.displayMode}>
            <div className={styles.currentStage}>
              <span 
                className={styles.stageBadge}
                style={{ backgroundColor: getStageColor(currentStageId || '') }}
              >
                {currentStageName || 'Nenhuma etapa definida'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              <ChevronDown className={styles.buttonIcon} />
              Alterar Etapa
            </Button>
          </div>
        ) : (
          <div className={styles.editMode}>
            <div className={styles.formField}>
              <Label htmlFor="stage-select">Nova Etapa</Label>
              {loadingStages ? (
                <div className={styles.loading}>Carregando etapas...</div>
              ) : (
                <Select value={selectedStageId} onValueChange={setSelectedStageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className={styles.stageOption}>
                          <span 
                            className={styles.stageColor}
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="reason">Justificativa *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo da mudança de etapa..."
                rows={3}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formActions}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className={styles.buttonIcon} />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading || !selectedStageId || !reason.trim()}
              >
                <Save className={styles.buttonIcon} />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}