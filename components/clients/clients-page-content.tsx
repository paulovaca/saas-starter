'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCPF, formatCNPJ, formatPhone } from '@/lib/validations/clients/client.schema';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { usePermissions } from '@/hooks/use-permissions';
import { SearchFilters } from '@/components/shared/search-filters';
import Link from 'next/link';
import styles from '../../app/(dashboard)/clients/clients.module.css';
import pageStyles from './clients-page-content.module.css';

// Tipos para o componente
interface ClientsPageContentProps {
  searchParams?: {
    search?: string;
    funnelId?: string;
    funnelStageId?: string;
    userId?: string;
    documentType?: string;
    city?: string;
    state?: string;
    status?: string;
    page?: string;
    limit?: string;
  };
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  city?: string;
  state?: string;
  userId: string;
  funnel: {
    id: string;
    name: string;
  } | null;
  funnelStage: {
    id: string;
    name: string;
    color: string;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  totalProposals: number;
  totalValue: number;
  lastInteraction?: Date;
  createdAt: Date;
}

interface FilterData {
  funnels: Array<{ id: string; name: string; }>;
  funnelStages: Array<{ id: string; name: string; funnelId: string; }>;
  users: Array<{ id: string; name: string; }>;
}

export default function ClientsPageContent({ searchParams }: ClientsPageContentProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { canEditUsers } = usePermissions();
  
  // Estados
  const [clients, setClients] = useState<ClientData[]>([]);
  const [filterData, setFilterData] = useState<FilterData>({ funnels: [], funnelStages: [], users: [] });
  const [agencyUsers, setAgencyUsers] = useState<Array<{id: string; name: string; email: string; role: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(Number(searchParams?.page) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  
  // Filtros com debounce
  const [searchTerm, setSearchTerm] = useState(searchParams?.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const [selectedFunnel, setSelectedFunnel] = useState(searchParams?.funnelId || '');
  const [selectedStage, setSelectedStage] = useState(searchParams?.funnelStageId || '');
  const [selectedUser, setSelectedUser] = useState(searchParams?.userId || '');

  // Função para aplicar filtros
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedFunnel) params.set('funnelId', selectedFunnel);
    if (selectedStage) params.set('funnelStageId', selectedStage);
    if (selectedUser) params.set('userId', selectedUser);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    router.push(`/clients?${params.toString()}`);
  };

  // Debounce para pesquisa
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (searchTerm !== searchParams?.search ||
        selectedFunnel !== searchParams?.funnelId ||
        selectedStage !== searchParams?.funnelStageId ||
        selectedUser !== searchParams?.userId) {
      setSearchTimeout(setTimeout(applyFilters, 500));
    }
    
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTerm, selectedFunnel, selectedStage, selectedUser]);

  // Função para buscar clientes
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // Construir parâmetros da busca
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (selectedFunnel) params.set('funnelId', selectedFunnel);
      if (selectedStage) params.set('funnelStageId', selectedStage);
      if (selectedUser) params.set('userId', selectedUser);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      // Fazer a chamada para a API
      const response = await fetch(`/api/clients?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }

      const data = await response.json();
      
      // Transformar os dados para o formato esperado
      const transformedClients: ClientData[] = data.clients.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email || '',
        phone: client.phone,
        documentType: client.documentType,
        documentNumber: client.documentNumber || '',
        city: client.city,
        state: client.state,
        funnel: client.funnel ? {
          id: client.funnel.id,
          name: client.funnel.name
        } : null,
        funnelStage: client.funnelStage ? {
          id: client.funnelStage.id,
          name: client.funnelStage.name,
          color: client.funnelStage.color || 'gray'
        } : null,
        user: {
          id: client.user?.id || '',
          name: client.user?.name || 'Sem responsável'
        },
        totalProposals: client.totalProposals || 0,
        totalValue: client.totalValue || 0,
        lastInteraction: client.lastInteraction ? 
          (typeof client.lastInteraction === 'string' ? new Date(client.lastInteraction) : client.lastInteraction) : 
          undefined,
        createdAt: client.createdAt ? 
          (typeof client.createdAt === 'string' ? new Date(client.createdAt) : client.createdAt) : 
          new Date()
      }));
      
      setClients(transformedClients);
      setTotalClients(data.totalClients);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      // Em caso de erro, manter lista vazia
      setClients([]);
      setTotalClients(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedFunnel, selectedStage, selectedUser, currentPage]);

  // Função para buscar dados de filtro
  const fetchFilterData = useCallback(async () => {
    try {
      const response = await fetch('/api/clients/filters');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de filtro');
      }

      const data = await response.json();
      setFilterData(data);
    } catch (error) {
      console.error('Erro ao buscar dados de filtro:', error);
      // Em caso de erro, usar dados mockados básicos
      const fallbackData: FilterData = {
        funnels: [
          { id: '1', name: 'Funil Principal' }
        ],
        funnelStages: [
          { id: '1', name: 'Novo Lead', funnelId: '1' }
        ],
        users: [
          { id: '1', name: 'Usuário Padrão' }
        ]
      };
      setFilterData(fallbackData);
    }
  }, []);

  // Função para buscar usuários da agência
  const fetchAgencyUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const users = await response.json();
      setAgencyUsers(users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      })));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setAgencyUsers([]);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchFilterData();
    fetchAgencyUsers();
    fetchClients();
  }, [fetchFilterData, fetchAgencyUsers, fetchClients]);

  // Função para formatar documento
  const formatDocument = (type: 'cpf' | 'cnpj', number: string) => {
    return type === 'cpf' ? formatCPF(number) : formatCNPJ(number);
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      
      return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    } catch (error) {
      return '-';
    }
  };

  // Função para obter classe CSS da cor
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: pageStyles.colorBlue,
      green: pageStyles.colorGreen,
      yellow: pageStyles.colorYellow,
      red: pageStyles.colorRed,
      purple: pageStyles.colorPurple,
      gray: pageStyles.colorGray,
      orange: pageStyles.colorOrange,
      pink: pageStyles.colorPink,
    };
    return colorMap[color] || pageStyles.colorGray;
  };

  // Função para navegar para novo cliente
  const handleNewClient = () => {
    router.push('/clients/new');
  };

  // Função para navegar para detalhes do cliente
  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  // Função para recarregar após transferência
  const handleTransferSuccess = () => {
    fetchClients();
  };

  // Render do cabeçalho
  const renderHeader = () => (
    <div className={styles.clientsHeader}>
      <div className={styles.clientsHeaderContent}>
        <h1 className={styles.clientsTitle}>Clientes</h1>
        <p className={styles.clientsDescription}>
          Gerencie todos os clientes da sua agência
        </p>
      </div>
      <Button onClick={handleNewClient} className={pageStyles.newClientButton}>
        <Plus className={pageStyles.newClientIcon} />
        Novo Cliente
      </Button>
    </div>
  );

  // Render dos filtros usando SearchFilters
  const renderFilters = () => {
    const dynamicFilters = [
      {
        key: 'funnelId',
        label: 'Todos os funis',
        options: filterData.funnels.map(funnel => ({
          value: funnel.id,
          label: funnel.name
        })),
        defaultValue: selectedFunnel
      },
      {
        key: 'funnelStageId',
        label: 'Todas as etapas',
        options: filterData.funnelStages
          .filter(stage => !selectedFunnel || stage.funnelId === selectedFunnel)
          .map(stage => ({
            value: stage.id,
            label: stage.name
          })),
        defaultValue: selectedStage
      }
    ];

    // Adicionar filtro de usuário apenas se o usuário tem permissão
    if (canEditUsers()) {
      dynamicFilters.push({
        key: 'userId',
        label: 'Todos os agentes',
        options: filterData.users.map(user => ({
          value: user.id,
          label: user.name
        })),
        defaultValue: selectedUser
      });
    }

    return (
      <SearchFilters
        searchPlaceholder="Buscar por nome, email, telefone ou documento..."
        defaultSearch={searchTerm}
        filters={dynamicFilters}
        onFiltersChange={(filters) => {
          setSelectedFunnel(filters.funnelId || '');
          setSelectedStage(filters.funnelStageId || '');
          setSelectedUser(filters.userId || '');
          setSearchTerm(filters.search || '');
        }}
      />
    );
  };

  // Render da visualização em tabela
  const renderTableView = () => (
    <div className={styles.clientsList}>
      <table className={styles.clientsTable}>
        <thead className={styles.clientsTableHead}>
          <tr>
            <th>Cliente</th>
            <th>Contato</th>
            <th>Funil</th>
            <th>Etapa</th>
            <th>Responsável</th>
            <th>Propostas</th>
            <th>Valor Total</th>
            <th>Última Interação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className={styles.clientsTableRow}>
              <td className={styles.clientsTableCell}>
                <div>
                  <div className={pageStyles.clientName}>{client.name}</div>
                  <div className={pageStyles.clientEmail}>{client.email}</div>
                </div>
              </td>
              <td className={styles.clientsTableCell}>
                {client.phone ? formatPhone(client.phone) : '-'}
              </td>
              <td className={styles.clientsTableCell}>
                <Badge variant="outline" className={`${styles.clientStatus} ${styles.active} ${client.funnelStage?.color ? getColorClass(client.funnelStage.color) : ''}`}>
                  {client.funnel?.name || 'Sem funil'}
                </Badge>
              </td>
              <td className={styles.clientsTableCell}>
                <Badge variant="outline" className={`${styles.clientStatus} ${styles.active} ${client.funnelStage?.color ? getColorClass(client.funnelStage.color) : ''}`}>
                  {client.funnelStage?.name || 'Sem etapa'}
                </Badge>
              </td>
              <td className={styles.clientsTableCell}>
                {client.user.name}
              </td>
              <td className={styles.clientsTableCell}>
                {client.totalProposals}
              </td>
              <td className={styles.clientsTableCell}>
                {formatCurrency(client.totalValue)}
              </td>
              <td className={styles.clientsTableCell}>
                {client.lastInteraction ? formatDate(client.lastInteraction) : 'Nunca'}
              </td>
              <td className={`${styles.clientsTableCell} ${styles.actions}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={pageStyles.clientActionsButton}
                  onClick={() => handleViewClient(client.id)}
                  title="Visualizar detalhes do cliente"
                >
                  <Eye className={pageStyles.clientActionsIcon} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render da paginação
  const renderPagination = () => (
    <div className={styles.pagination}>
      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Anterior
      </Button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const pageNum = i + 1;
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(pageNum)}
            className={currentPage === pageNum ? styles.active : ''}
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Próximo
      </Button>
      
      <div className={styles.paginationInfo}>
        Página {currentPage} de {totalPages}
      </div>
    </div>
  );

  // Render do estado vazio
  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <Filter className={pageStyles.emptyStateIconSvg} />
      </div>
      <h3 className={styles.emptyStateTitle}>Nenhum cliente encontrado</h3>
      <p className={styles.emptyStateDescription}>
        Tente ajustar os filtros ou adicione um novo cliente para começar.
      </p>
      <Button onClick={handleNewClient} className={pageStyles.emptyStateButton}>
        <Plus className={pageStyles.actionMenuIcon} />
        Adicionar Cliente
      </Button>
    </div>
  );

  // Render do estado de loading
  const renderLoadingState = () => (
    <div className={styles.loadingState}>
      <div className={styles.loadingSpinner}>
        <div className={pageStyles.loadingSpinnerInner}></div>
      </div>
      <span>Carregando clientes...</span>
    </div>
  );

  // Render principal
  return (
    <>
      {renderHeader()}
      {renderFilters()}
      
      {isLoading ? (
        renderLoadingState()
      ) : clients.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderTableView()}
          {totalPages > 1 && renderPagination()}
        </>
      )}
    </>
  );
}
