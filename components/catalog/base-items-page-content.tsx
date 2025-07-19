'use client';

import { useState, useEffect } from 'react';
import { getBaseItems } from '@/lib/actions/catalog';
import { BaseItem, BaseItemField } from '@/lib/db/schema/catalog';
import { SearchFilters } from '@/components/shared/search-filters';
import { catalogFiltersConfig } from '@/components/shared/search-filters.config';
import { BaseItemsList } from './base-items-list';
import { CreateBaseItemButton } from './create-base-item-button';
import styles from './base-items-page-content.module.css';

export function BaseItemsPageContent() {
  const [baseItems, setBaseItems] = useState<(BaseItem & { customFields: BaseItemField[] })[]>([]);
  const [filteredItems, setFilteredItems] = useState<(BaseItem & { customFields: BaseItemField[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await getBaseItems();
        setBaseItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Erro ao carregar itens base:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  const handleFiltersChange = (filters: Record<string, string>) => {
    let filtered = baseItems;

    // Filtrar por busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filtrar por status
    if (filters.status) {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(item => item.isActive === isActive);
    }

    setFilteredItems(filtered);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando itens...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h2 className={styles.title}>Itens Base</h2>
            <p className={styles.description}>
              Gerencie os itens base que comporão os portfólios das operadoras
            </p>
          </div>
          <CreateBaseItemButton />
        </div>
      </div>

      <SearchFilters
        searchPlaceholder={catalogFiltersConfig.searchPlaceholder}
        filters={catalogFiltersConfig.filters.filter(f => f.key === 'status')} // Apenas status por enquanto
        onFiltersChange={handleFiltersChange}
      />

      <div className={styles.content}>
        <BaseItemsList items={filteredItems} />
      </div>
    </div>
  );
}
