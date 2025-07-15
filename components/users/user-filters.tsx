'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './user-filters.module.css';

type UserFiltersProps = {
  defaultSearch: string;
  defaultRole: string;
  defaultStatus: string;
};

export function UserFilters({ defaultSearch, defaultRole, defaultStatus }: UserFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(defaultSearch);
  const [role, setRole] = useState(defaultRole);
  const [status, setStatus] = useState(defaultStatus);

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Resetar para página 1 quando filtrar
    params.set('page', '1');
    
    // Atualizar parâmetros
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    
    if (role) {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = search || role || status;

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateFilters();
    }
  };

  return (
    <div className={styles.filters}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className={styles.searchInput}
          disabled={isPending}
        />
      </div>
      
      <div className={styles.filterControls}>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={styles.select}
          disabled={isPending}
        >
          <option value="">Todas as permissões</option>
          <option value="MASTER">Master</option>
          <option value="ADMIN">Administrador</option>
          <option value="AGENT">Agente</option>
        </select>
        
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
          disabled={isPending}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
        
        <Button 
          onClick={updateFilters}
          className={styles.filterButton}
          disabled={isPending}
        >
          <Filter className={styles.buttonIcon} />
          {isPending ? 'Filtrando...' : 'Filtrar'}
        </Button>

        {hasFilters && (
          <Button 
            variant="outline"
            onClick={clearFilters}
            className={styles.clearButton}
            disabled={isPending}
          >
            <X className={styles.buttonIcon} />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
