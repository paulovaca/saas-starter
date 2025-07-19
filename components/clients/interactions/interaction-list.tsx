'use client';

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { INTERACTION_TYPES } from '@/lib/types/interactions';
import type { InteractionWithUser, InteractionFilters, InteractionType } from '@/lib/types/interactions';
import { InteractionItem } from './interaction-item';
import styles from './interaction-list.module.css';

interface InteractionListProps {
  interactions: InteractionWithUser[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount?: number;
}

export function InteractionList({
  interactions,
  loading = false,
  onLoadMore,
  hasMore = false,
  totalCount = 0,
}: InteractionListProps) {
  const [filters, setFilters] = useState<InteractionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof InteractionFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value.trim() || undefined);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const filteredInteractions = interactions.filter(interaction => {
    if (filters.type && interaction.type !== filters.type) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        interaction.description.toLowerCase().includes(searchLower) ||
        interaction.user.name.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>Interações</h3>
          <span className={styles.count}>
            {totalCount > 0 ? `${totalCount} registro${totalCount !== 1 ? 's' : ''}` : 'Nenhuma interação'}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={styles.filterToggle}
        >
          <Filter className={styles.filterIcon} />
          Filtros
          {hasActiveFilters && <span className={styles.filterBadge} />}
        </Button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className={styles.filtersContainer}>
          <div className={styles.filtersGrid}>
            {/* Busca */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Buscar nas interações..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Tipo */}
            <Select
              value={filters.type || ''}
              onValueChange={(value: string) => handleFilterChange('type', value)}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {Object.entries(INTERACTION_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className={styles.selectItem}>
                      <span className={styles.selectIcon}>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className={styles.filtersActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={styles.clearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lista */}
      <div className={styles.content}>
        {loading && filteredInteractions.length === 0 ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <span>Carregando interações...</span>
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <h4 className={styles.emptyTitle}>
              {hasActiveFilters ? 'Nenhuma interação encontrada' : 'Nenhuma interação registrada'}
            </h4>
            <p className={styles.emptyDescription}>
              {hasActiveFilters
                ? 'Tente ajustar os filtros para encontrar outras interações.'
                : 'As interações com este cliente aparecerão aqui.'}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredInteractions.map((interaction) => (
              <InteractionItem
                key={interaction.id}
                interaction={interaction}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className={styles.loadMore}>
            <Button
              variant="outline"
              onClick={onLoadMore}
              className={styles.loadMoreButton}
            >
              Carregar mais interações
            </Button>
          </div>
        )}

        {loading && filteredInteractions.length > 0 && (
          <div className={styles.loadingMore}>
            <div className={styles.loadingSpinner} />
            <span>Carregando mais...</span>
          </div>
        )}
      </div>
    </div>
  );
}
