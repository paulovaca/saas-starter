'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Info, 
  ChevronRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getFunnelWithStage } from '@/lib/actions/funnels/get-funnel-stage';
import styles from './funnel-stage-info.module.css';

interface FunnelStageInfoProps {
  funnelId: string | null;
  funnelStageId: string | null;
}

export default function FunnelStageInfo({ funnelId, funnelStageId }: FunnelStageInfoProps) {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFunnelData = async () => {
      if (!funnelId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getFunnelWithStage({ 
          funnelId, 
          stageId: funnelStageId || undefined 
        });
        
        if (result.success && result.data.success) {
          setFunnelData(result.data.data);
        } else {
          setError(result.error || 'Erro ao carregar dados do funil');
        }
      } catch (err) {
        console.error('Error fetching funnel data:', err);
        setError('Erro ao carregar dados do funil');
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, [funnelId, funnelStageId]);

  if (loading) {
    return (
      <Card className={styles.funnelCard}>
        <CardContent className={styles.loadingContent}>
          <div className={styles.loadingText}>Carregando informações do funil...</div>
        </CardContent>
      </Card>
    );
  }

  if (!funnelId || !funnelData) {
    return (
      <Card className={styles.funnelCard}>
        <CardContent className={styles.emptyContent}>
          <Info className={styles.emptyIcon} />
          <div className={styles.emptyText}>Nenhum funil associado a esta proposta</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.funnelCard}>
        <CardContent className={styles.errorContent}>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { funnel, currentStage, stages } = funnelData || {};
  const activeStage = currentStage || stages?.find((s: any) => s.id === funnelStageId) || stages?.[0];

  // Se não tiver dados do funil, mostrar mensagem
  if (!funnel) {
    return (
      <Card className={styles.funnelCard}>
        <CardContent className={styles.emptyContent}>
          <Info className={styles.emptyIcon} />
          <div className={styles.emptyText}>Informações do funil não disponíveis</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.funnelCard}>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <Target className={styles.titleIcon} />
            Funil de Vendas
          </CardTitle>
        </CardHeader>
      <CardContent className={styles.cardContent}>
        {/* Funnel Name and Description */}
        <div className={styles.funnelInfo}>
          <h3 className={styles.funnelName}>{funnel.name}</h3>
          {funnel.description && (
            <p className={styles.funnelDescription}>{funnel.description}</p>
          )}
        </div>

        {/* Current Stage */}
        {activeStage && (
          <div className={styles.currentStage}>
            <div className={styles.stageHeader}>
              <Layers className={styles.stageIcon} />
              <span className={styles.stageLabel}>Etapa Atual:</span>
            </div>
            <div className={styles.stageContent}>
              <Badge 
                className={styles.stageBadge}
                style={{ 
                  backgroundColor: activeStage.color ? `${activeStage.color}20` : undefined,
                  color: activeStage.color || undefined,
                  borderColor: activeStage.color || undefined
                }}
              >
                {activeStage.name}
              </Badge>
              {activeStage.description && (
                <p className={styles.stageDescription}>{activeStage.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Guidelines */}
        {activeStage?.guidelines && (
          <div className={styles.guidelines}>
            <div className={styles.guidelinesHeader}>
              <CheckCircle2 className={styles.guidelinesIcon} />
              <h4 className={styles.guidelinesTitle}>Diretrizes da Etapa</h4>
            </div>
            <div className={styles.guidelinesContent}>
              {activeStage.guidelines.split('\n').map((line: string, index: number) => (
                <div key={index} className={styles.guidelineItem}>
                  <ChevronRight className={styles.guidelineIcon} />
                  <span>{line.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Progress */}
        {stages && stages.length > 0 && (
          <div className={styles.stageProgress}>
            <h4 className={styles.progressTitle}>Progresso no Funil</h4>
            <div className={styles.progressBar}>
              {stages.map((stage: any, index: number) => {
                const isActive = stage.id === (activeStage?.id || funnelStageId);
                const isPast = activeStage && stage.order < activeStage.order;
                
                return (
                  <div 
                    key={stage.id}
                    className={`${styles.progressStep} ${isActive ? styles.activeStep : ''} ${isPast ? styles.pastStep : ''}`}
                  >
                    <div 
                      className={styles.stepDot}
                      style={{ backgroundColor: stage.color || '#6b7280' }}
                    />
                    <span className={styles.stepName}>{stage.name}</span>
                    {index < stages.length - 1 && (
                      <div className={styles.stepConnector} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}