'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchFilters } from '@/components/shared/search-filters';
import { operatorFiltersConfig } from '@/components/shared/search-filters.config';
import styles from './operators-page-content.module.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Building2,
  MoreHorizontal,
  Edit,
  Power,
  Users,
  FileText,
  Phone,
  Mail,
  Trash2,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OperatorFormModal } from './operator-form-modal';
import { DeleteOperatorModal } from './delete-operator-modal';
import { OperatorWithStats } from '@/lib/actions/operators/get-operators';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toggleOperatorStatus } from '@/lib/actions/operators/toggle-operator-status';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from 'sonner';

interface OperatorsPageContentProps {
  operators: OperatorWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search?: string;
    isActive?: boolean;
    hasProducts?: boolean;
    page: number;
  };
}

export function OperatorsPageContent({ operators, pagination, filters }: OperatorsPageContentProps) {
  const router = useRouter();
  const { canDeleteOperators } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<{ 
    id: string; 
    name: string; 
    cnpj?: string | null; 
    contactEmail?: string | null; 
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const [activeFilter, setActiveFilter] = useState<string>(
    filters.isActive === true ? 'active' : filters.isActive === false ? 'inactive' : 'all'
  );
  const [productsFilter, setProductsFilter] = useState<string>(
    filters.hasProducts === true ? 'with-products' : filters.hasProducts === false ? 'without-products' : 'all'
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (activeFilter !== 'all') {
      params.set('isActive', activeFilter === 'active' ? 'true' : 'false');
    }
    if (productsFilter !== 'all') {
      params.set('hasProducts', productsFilter === 'with-products' ? 'true' : 'false');
    }
    router.push(`/operators?${params.toString()}`);
  };

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (searchTerm !== filters.search || 
        activeFilter !== (filters.isActive === true ? 'active' : filters.isActive === false ? 'inactive' : 'all') ||
        productsFilter !== (filters.hasProducts === true ? 'with-products' : filters.hasProducts === false ? 'without-products' : 'all')) {
      setSearchTimeout(setTimeout(handleSearch, 500));
    }
    
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm, activeFilter, productsFilter]);

  const handleToggleStatus = async (operatorId: string, currentStatus: boolean) => {
    try {
      const result = await toggleOperatorStatus({
        id: operatorId,
        isActive: !currentStatus,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao alterar status da operadora');
    }
  };

  const handleDeleteClick = (operator: { 
    id: string; 
    name: string; 
    cnpj?: string | null; 
    contactEmail?: string | null; 
  }) => {
    setOperatorToDelete(operator);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className={styles.operatorsContainer}>
      <SearchFilters
        searchPlaceholder={operatorFiltersConfig.searchPlaceholder}
        defaultSearch={searchTerm}
        filters={[
          {
            key: 'status',
            label: 'Todos os status',
            options: [
              { value: 'active', label: 'Ativas' },
              { value: 'inactive', label: 'Inativas' }
            ],
            defaultValue: activeFilter === 'all' ? '' : activeFilter
          },
          {
            key: 'hasProducts',
            label: 'Todos os produtos',
            options: [
              { value: 'with-products', label: 'Com produtos' },
              { value: 'without-products', label: 'Sem produtos' }
            ],
            defaultValue: productsFilter === 'all' ? '' : productsFilter
          }
        ]}
        onFiltersChange={(filters) => {
          if (searchTimeout) clearTimeout(searchTimeout);
          
          setSearchTerm(filters.search || '');
          setActiveFilter(filters.status || 'all');
          setProductsFilter(filters.hasProducts || 'all');
          
          const timeout = setTimeout(() => {
            handleSearch();
          }, 300);
          
          setSearchTimeout(timeout);
        }}
      />
       
      <div className={styles.actionsSection}>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className={styles.plusIcon} />
          Nova Operadora
        </Button>
      </div>

      {operators.length === 0 ? (
        <Card>
          <CardContent className={styles.emptyState}>
            <Building2 className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>Nenhuma operadora encontrada</h3>
            <p className={styles.emptyStateDescription}>
              {filters.search || filters.isActive !== undefined || filters.hasProducts !== undefined
                ? 'Tente ajustar os filtros para encontrar operadoras.'
                : 'Você ainda não cadastrou nenhuma operadora. Crie sua primeira operadora parceira.'}
            </p>
            {!filters.search && filters.isActive === undefined && filters.hasProducts === undefined && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className={styles.plusIcon} />
                Nova Operadora
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={styles.operatorsGrid}>
          {operators.map((operator) => (
            <Card key={operator.id} className={styles.operatorCard}>
              <CardHeader className={styles.operatorHeader}>
                <div className={styles.operatorHeaderContent}>
                  <div className={styles.operatorInfo}>
                    {operator.logo ? (
                      <div className={styles.operatorLogo}>
                        <Image
                          src={operator.logo}
                          alt={`Logo ${operator.name}`}
                          fill
                          className={styles.logoIcon}
                        />
                      </div>
                    ) : (
                      <div className={styles.operatorLogoPlaceholder}>
                        <Building2 className={styles.operatorLogoIcon} />
                      </div>
                    )}
                    <div className={styles.operatorDetails}>
                      <CardTitle className={styles.operatorName}>{operator.name}</CardTitle>
                      {operator.cnpj && (
                        <CardDescription className={styles.operatorCnpj}>
                          CNPJ: {operator.cnpj}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className={styles.moreIcon} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/operators/${operator.id}`}>
                          <Edit className={styles.editIcon} />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(operator.id, operator.isActive)}
                      >
                        <Power className={styles.powerIcon} />
                        {operator.isActive ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                      {canDeleteOperators() && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick({
                            id: operator.id,
                            name: operator.name,
                            cnpj: operator.cnpj,
                            contactEmail: operator.contactEmail
                          })}
                          className={styles.destructiveMenuItem}
                        >
                          <Trash2 className={styles.deleteIcon} />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
             
              <CardContent className={styles.operatorContent}>
                <div className={styles.operatorStats}>
                  <Badge variant={operator.isActive ? 'default' : 'secondary'}>
                    {operator.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <div className={styles.operatorItemsCount}>
                    <Users className={styles.operatorItemsIcon} />
                    {operator.itemsCount} {operator.itemsCount === 1 ? 'produto' : 'produtos'}
                  </div>
                </div>

                {(operator.contactEmail || operator.contactPhone || operator.contactName) && (
                  <div className={styles.operatorContactInfo}>
                    {operator.contactName && (
                      <div className={styles.operatorContactItem}>
                        <Users className={styles.operatorContactIcon} />
                        <span className={styles.operatorContactText}>{operator.contactName}</span>
                      </div>
                    )}
                    {operator.contactEmail && (
                      <div className={styles.operatorContactItem}>
                        <Mail className={styles.operatorContactIcon} />
                        <span className={styles.operatorContactText}>{operator.contactEmail}</span>
                      </div>
                    )}
                    {operator.contactPhone && (
                      <div className={styles.operatorContactItem}>
                        <Phone className={styles.operatorContactIcon} />
                        <span>{operator.contactPhone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.operatorActions}>
                  <Button variant="outline" size="sm" asChild className={styles.operatorActionsButton}>
                    <Link href={`/operators/${operator.id}`}>
                      <FileText className={styles.operatorActionsIcon} />
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', (pagination.page - 1).toString());
              router.push(`/operators?${params.toString()}`);
            }}
          >
            Anterior
          </Button>
          <span className={styles.paginationInfo}>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', (pagination.page + 1).toString());
              router.push(`/operators?${params.toString()}`);
            }}
          >
            Próxima
          </Button>
        </div>
      )}

      <DeleteOperatorModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        operator={operatorToDelete || { id: '', name: '' }}
      />

      <OperatorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}