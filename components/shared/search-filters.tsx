'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './search-filters.module.css';

export type FilterOption = {
  value: string;
  label: string;
};

export type SearchFiltersProps = {
  // Configuração da busca
  searchPlaceholder?: string;
  defaultSearch?: string;
  
  // Configuração dos filtros
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    defaultValue?: string;
  }[];
  
  // Callbacks opcionais
  onFiltersChange?: (filters: Record<string, string>) => void;
  
  // Configurações adicionais
  className?: string;
  showFilterButton?: boolean;
  showClearButton?: boolean;
};

export function SearchFilters({
  searchPlaceholder = "Buscar...",
  defaultSearch = "",
  filters = [],
  onFiltersChange,
  className = "",
  showFilterButton = true,
  showClearButton = true,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados dos filtros
  const [search, setSearch] = useState(defaultSearch);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach(filter => {
      const paramValue = searchParams.get(filter.key);
      initial[filter.key] = paramValue || filter.defaultValue || '';
    });
    return initial;
  });

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Resetar para página 1 quando filtrar
    params.set('page', '1');
    
    // Atualizar busca
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    
    // Atualizar filtros
    filters.forEach(filter => {
      const value = filterValues[filter.key];
      if (value) {
        params.set(filter.key, value);
      } else {
        params.delete(filter.key);
      }
    });

    // Callback opcional
    if (onFiltersChange) {
      onFiltersChange({
        search: search.trim(),
        ...filterValues
      });
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    const clearedFilters: Record<string, string> = {};
    filters.forEach(filter => {
      clearedFilters[filter.key] = '';
    });
    setFilterValues(clearedFilters);
    
    // Callback opcional
    if (onFiltersChange) {
      onFiltersChange({ search: '', ...clearedFilters });
    }
    
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = search || Object.values(filterValues).some(value => value);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateFilters();
    }
  };

  const clearSearch = () => {
    setSearch('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`${styles.filters} ${className}`} data-loading={isPending}>
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} />
          <Input 
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            onKeyDown={handleSearchKeyDown}
            disabled={isPending}
          />
          {search && (
            <button
              className={styles.clearSearchButton}
              onClick={clearSearch}
              disabled={isPending}
              title="Limpar busca"
            >
              <X className={styles.clearIcon} size={16} />
            </button>
          )}
        </div>
      </div>
      
      {filters.length > 0 && (
        <div className={styles.filterControls}>
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filterValues[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className={styles.select}
              disabled={isPending}
              aria-label={filter.label}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
          
          {showFilterButton && (
            <Button 
              onClick={updateFilters}
              className={styles.filterButton}
              disabled={isPending}
            >
              <Filter className={styles.buttonIcon} />
              {isPending ? 'Filtrando...' : 'Filtrar'}
            </Button>
          )}

          {showClearButton && hasFilters && (
            <Button 
              variant="outline"
              onClick={clearFilters}
              className={styles.clearButton}
              disabled={isPending}
              title="Limpar todos os filtros"
            >
              <X className={styles.buttonIcon} />
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
