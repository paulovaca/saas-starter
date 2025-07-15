'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Eye, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StageCard from '@/components/funnels/stage-card-new';
import { getFunnelById, updateFunnel, createStage, reorderStages } from '@/lib/actions/funnels';
import { updateStage } from '@/lib/actions/funnels/update-stage';
import { deleteStage } from '@/lib/actions/funnels/delete-stage';
import { usePermissions } from '@/hooks/use-permissions';
import styles from './page.module.css';

interface Stage {
  id: string;
  name: string;
  description: string | null;
  guidelines: string | null;
  color: string;
  order: number;
  clientCount?: number;
  isActive: boolean;
}

interface Funnel {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  stages: Stage[];
}

export default function FunnelEditor() {
  const { canManageFunnels, user } = usePermissions();
  const params = useParams();
  const router = useRouter();
  const funnelId = params.funnelId as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [funnelName, setFunnelName] = useState('');
  const [funnelDescription, setFunnelDescription] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar dados do funil
  useEffect(() => {
    async function loadFunnel() {
      try {
        const result = await getFunnelById(funnelId);
        if (result.success && result.data) {
          const funnelData = result.data;
          setFunnel(funnelData);
          setFunnelName(funnelData.name);
          setFunnelDescription(funnelData.description || '');
          setStages(funnelData.stages.sort((a, b) => a.order - b.order));
        } else {
          console.error('Erro ao carregar funil:', result.error);
          router.push('/funnels');
        }
      } catch (error) {
        console.error('Erro ao carregar funil:', error);
        router.push('/funnels');
      } finally {
        setIsLoading(false);
      }
    }

    loadFunnel();
  }, [funnelId, router]);

  // Salvar alterações do funil
  const handleSaveFunnel = async () => {
    if (!funnel) return;

    setIsSaving(true);
    try {
      const result = await updateFunnel({
        id: funnel.id,
        name: funnelName,
        description: funnelDescription,
      });

      if (result.success) {
        setHasChanges(false);
        console.log('Funil salvo com sucesso!');
      } else {
        console.error('Erro ao salvar funil:', result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar funil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Adicionar nova etapa
  const handleAddStage = async () => {
    if (!funnel) return;

    const newOrder = Math.max(...stages.map(s => s.order), 0) + 1;
    
    try {
      const result = await createStage({
        funnelId: funnel.id,
        name: `Nova Etapa ${newOrder}`,
        description: '',
        color: 'blue',
        order: newOrder,
      });

      if (result.success && result.data) {
        setStages(prev => [...prev, result.data].sort((a, b) => a.order - b.order));
        console.log('Etapa criada com sucesso!');
      } else {
        console.error('Erro ao criar etapa:', result.error);
      }
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
    }
  };

  // Mover etapa para cima
  const handleMoveStageUp = async (stageId: string) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (stageIndex <= 0) return;

    const newStages = [...stages];
    // Trocar posições
    [newStages[stageIndex], newStages[stageIndex - 1]] = [newStages[stageIndex - 1], newStages[stageIndex]];
    
    // Atualizar orders
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });

    setStages(newStages);
    await updateStageOrders(newStages);
  };

  // Mover etapa para baixo
  const handleMoveStageDown = async (stageId: string) => {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    if (stageIndex >= stages.length - 1) return;

    const newStages = [...stages];
    // Trocar posições
    [newStages[stageIndex], newStages[stageIndex + 1]] = [newStages[stageIndex + 1], newStages[stageIndex]];
    
    // Atualizar orders
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });

    setStages(newStages);
    await updateStageOrders(newStages);
  };

  // Atualizar dados da etapa
  const handleUpdateStageData = async (stageId: string, data: { name?: string; description?: string; guidelines?: string }) => {
    try {
      const result = await updateStage(stageId, data);
      if (result.success) {
        setStages(prev => prev.map(stage => 
          stage.id === stageId ? { ...stage, ...data } : stage
        ));
        console.log('Etapa atualizada com sucesso!');
      } else {
        console.error('Erro ao atualizar etapa:', result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
    }
  };

  // Atualizar ordens das etapas
  const updateStageOrders = async (newStages: typeof stages) => {
    try {
      // Para cada etapa, atualizar sua order
      for (const stage of newStages) {
        const result = await updateStage(stage.id, { order: stage.order });
        if (!result.success) {
          console.error('Erro ao atualizar ordem da etapa:', result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar ordens:', error);
    }
  };

  // Remover etapa
  const handleStageDelete = async (stageId: string) => {
    try {
      const result = await deleteStage(stageId);
      if (result.success) {
        setStages(prev => prev.filter(stage => stage.id !== stageId));
        console.log('Etapa excluída com sucesso');
      } else {
        console.error('Erro ao excluir etapa:', result.error);
        alert(result.error || 'Erro ao excluir etapa');
      }
    } catch (error) {
      console.error('Erro ao excluir etapa:', error);
      alert('Erro inesperado ao excluir etapa');
    }
  };

  // Detectar mudanças
  useEffect(() => {
    if (funnel) {
      const nameChanged = funnelName !== funnel.name;
      const descChanged = funnelDescription !== (funnel.description || '');
      setHasChanges(nameChanged || descChanged);
    }
  }, [funnel, funnelName, funnelDescription]);

  // Verificar permissões
  if (!canManageFunnels()) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <Lock size={64} className={styles.lockIcon} />
          <h2>Acesso Restrito</h2>
          <p>
            Você não tem permissão para editar funis de venda.
            <br />
            Entre em contato com o administrador da sua agência para solicitar acesso.
          </p>
          <div className={styles.userInfo}>
            <strong>Usuário:</strong> {user?.name} ({user?.role})
          </div>
          <Button onClick={() => router.push('/')} className={styles.backToHome}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Carregando funil...</p>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Funil não encontrado</p>
          <Button onClick={() => router.push('/funnels')}>
            Voltar para Funis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="ghost"
            onClick={() => router.push('/funnels')}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            Voltar
          </Button>
          <div className={styles.title}>
            <h1>Editor de Funil</h1>
            {funnel.isDefault && (
              <span className={styles.defaultBadge}>Padrão</span>
            )}
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <Button variant="outline" className={styles.previewButton}>
            <Eye size={16} />
            Preview
          </Button>
          <Button
            onClick={handleSaveFunnel}
            disabled={!hasChanges || isSaving}
            className={styles.saveButton}
          >
            <Save size={16} />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Informações do funil */}
      <div className={styles.funnelInfo}>
        <div className={styles.row}>
          <div className={styles.field}>
            <Label htmlFor="funnelName">Nome do Funil</Label>
            <Input
              id="funnelName"
              value={funnelName}
              onChange={(e) => setFunnelName(e.target.value)}
              placeholder="Nome do funil"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <Label htmlFor="funnelDescription">Descrição</Label>
            <Input
              id="funnelDescription"
              value={funnelDescription}
              onChange={(e) => setFunnelDescription(e.target.value)}
              placeholder="Descrição do funil (opcional)"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Editor de etapas */}
      <div className={styles.stagesSection}>
        <div className={styles.stagesHeader}>
          <h2>Etapas do Funil</h2>
          <Button onClick={handleAddStage} className={styles.addStageButton}>
            <Plus size={16} />
            Adicionar Etapa
          </Button>
        </div>

        <div className={styles.stagesEditor}>
          {stages.length === 0 ? (
            <div className={styles.emptyState}>
              <Settings size={48} />
              <h3>Nenhuma etapa criada</h3>
              <p>Comece adicionando a primeira etapa ao seu funil</p>
              <Button onClick={handleAddStage}>
                <Plus size={16} />
                Criar Primeira Etapa
              </Button>
            </div>
          ) : (
            <div className={styles.stagesFlow}>
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <StageCard
                    id={stage.id}
                    name={stage.name}
                    description={stage.description}
                    guidelines={stage.guidelines}
                    color={stage.color}
                    order={stage.order}
                    clientsCount={stage.clientCount || 0}
                    canMoveUp={index > 0}
                    canMoveDown={index < stages.length - 1}
                    onEdit={(id) => {
                      console.log('Botão editar clicado para etapa:', id);
                    }}
                    onDelete={handleStageDelete}
                    onMoveUp={handleMoveStageUp}
                    onMoveDown={handleMoveStageDown}
                    onUpdate={handleUpdateStageData}
                    canEdit={true}
                    canDelete={stages.length > 2}
                  />
                  {index < stages.length - 1 && (
                    <div className={styles.stageConnector}>
                      <div className={styles.arrow}></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer com estatísticas */}
      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total de Etapas:</span>
            <span className={styles.statValue}>{stages.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Clientes no Funil:</span>
            <span className={styles.statValue}>
              {stages.reduce((total, stage) => total + (stage.clientCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
