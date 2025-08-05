'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { Plus, Search, Star, Users, Settings, Copy, Trash2 } from 'lucide-react';
import { getFunnels, setDefaultFunnel, duplicateFunnel, deleteFunnel } from '@/lib/actions/funnels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchFilters } from '@/components/shared/search-filters';
import { funnelFiltersConfig } from '@/components/shared/search-filters.config';
import CreateFunnelModal from '@/components/funnels/create-funnel-modal';
import { usePermissions } from '@/hooks/use-permissions';
import styles from './page.module.css';

interface Funnel {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  stagesCount: number;
}

export default function FunnelsPage() {
  const { canManageFunnels, user } = usePermissions();
  const router = useRouter();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [filteredFunnels, setFilteredFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDefault, setFilterDefault] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Estados para ações
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const loadFunnels = async () => {
    try {
      setIsLoading(true);
      const result = await getFunnels();
      
      if (result.success && result.data) {
        setFunnels(result.data.funnels);
        setError(null);
      } else {
        setError(result.error || 'Erro ao carregar funis');
      }
    } catch (error) {
      setError('Erro inesperado ao carregar funis');
      console.error('Erro ao carregar funis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar funis na inicialização
  useEffect(() => {
    loadFunnels();
  }, []);

  // Filtrar funis quando mudam os critérios
  useEffect(() => {
    let filtered = funnels;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(funnel =>
        funnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (funnel.description && funnel.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por padrão
    if (filterDefault !== null) {
      filtered = filtered.filter(funnel => funnel.isDefault === filterDefault);
    }

    setFilteredFunnels(filtered);
  }, [funnels, searchTerm, filterDefault]);

  const handleSetDefault = async (funnelId: string) => {
    setLoadingActions(prev => new Set(prev).add(funnelId));
    
    try {
      const result = await setDefaultFunnel(funnelId);
      
      if (result.success) {
        // Atualizar estado local sem recarregar
        setFunnels(prevFunnels => 
          prevFunnels.map(funnel => ({
            ...funnel,
            isDefault: funnel.id === funnelId
          }))
        );
        // Mostrar notificação de sucesso
        setNotification({ message: 'Funil definido como padrão com sucesso!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setError(result.error || 'Erro ao definir funil padrão');
      }
    } catch (error) {
      setError('Erro inesperado');
      console.error('Erro ao definir funil padrão:', error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(funnelId);
        return newSet;
      });
    }
  };

  const handleDuplicate = async (funnelId: string) => {
    setLoadingActions(prev => new Set(prev).add(funnelId));
    
    try {
      const result = await duplicateFunnel(funnelId);
      
      if (result.success) {
        await loadFunnels();
        setNotification({ message: 'Funil duplicado com sucesso!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setError((result as any).error || 'Erro ao duplicar funil');
      }
    } catch (error) {
      setError('Erro inesperado');
      console.error('Erro ao duplicar funil:', error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(funnelId);
        return newSet;
      });
    }
  };

  const handleDelete = async (funnelId: string) => {
    if (!confirm('Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoadingActions(prev => new Set(prev).add(funnelId));
    
    try {
      const result = await deleteFunnel(funnelId);
      
      if (result.success) {
        await loadFunnels();
        setNotification({ message: 'Funil excluído com sucesso!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setError((result as any).error || 'Erro ao excluir funil');
      }
    } catch (error) {
      setError('Erro inesperado');
      console.error('Erro ao excluir funil:', error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(funnelId);
        return newSet;
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Verificar permissões - redirecionar se não tiver acesso
  useEffect(() => {
    if (!canManageFunnels()) {
      router.push('/');
    }
  }, [canManageFunnels, router]);

  if (!canManageFunnels()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Carregando funis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Funis de Venda</h1>
          <p className={styles.description}>
            Gerencie os funis de venda da sua agência
          </p>
        </div>
        {canManageFunnels() && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Criar Funil
          </Button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <Suspense fallback={<div>Carregando filtros...</div>}>
        <SearchFilters
        searchPlaceholder={funnelFiltersConfig.searchPlaceholder}
        defaultSearch={searchTerm}
        filters={[
          {
            key: 'status',
            label: 'Todos os funis',
            options: [
              { value: 'default', label: 'Padrão' },
              { value: 'custom', label: 'Personalizado' }
            ],
            defaultValue: filterDefault === true ? 'default' : filterDefault === false ? 'custom' : ''
          }
        ]}
        onFiltersChange={(filters) => {
          setSearchTerm(filters.search || '');
          if (filters.status === 'default') {
            setFilterDefault(true);
          } else if (filters.status === 'custom') {
            setFilterDefault(false);
          } else {
            setFilterDefault(null);
          }
        }}
        />
      </Suspense>

      <div className={styles.content}>
        {filteredFunnels.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Users size={48} />
            </div>
            <h3>Nenhum funil encontrado</h3>
            <p>
              {searchTerm 
                ? 'Tente ajustar sua busca ou criar um novo funil.'
                : 'Comece criando seu primeiro funil de vendas.'
              }
            </p>
            {!searchTerm && canManageFunnels() && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={20} />
                Criar Primeiro Funil
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredFunnels.map((funnel) => (
              <div key={funnel.id} className={styles.funnelCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <h3>{funnel.name}</h3>
                    {funnel.isDefault && (
                      <span className={styles.defaultBadge}>
                        <Star size={12} fill="currentColor" />
                        Padrão
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.cardActions}>
                    {canManageFunnels() && (
                      <>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleDuplicate(funnel.id)}
                          disabled={loadingActions.has(funnel.id)}
                          title="Duplicar funil"
                        >
                          <Copy size={16} />
                        </button>
                        
                        <button
                          className={styles.actionButton}
                          onClick={() => router.push(`/funnels/${funnel.id}`)}
                          title="Editar funil"
                        >
                          <Settings size={16} />
                        </button>

                        {!funnel.isDefault && (
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(funnel.id)}
                            disabled={loadingActions.has(funnel.id)}
                            title="Excluir funil"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {funnel.description && (
                  <p className={styles.cardDescription}>{funnel.description}</p>
                )}

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Etapas:</span>
                    <span className={styles.statValue}>{funnel.stagesCount}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Criado em:</span>
                    <span className={styles.statValue}>{formatDate(funnel.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  {!funnel.isDefault && canManageFunnels() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(funnel.id)}
                      disabled={loadingActions.has(funnel.id)}
                    >
                      <Star size={16} />
                      Definir como Padrão
                    </Button>
                  )}
                  
                  {canManageFunnels() && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/funnels/${funnel.id}`)}
                    >
                      Gerenciar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateFunnelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadFunnels}
      />
    </div>
  );
}
