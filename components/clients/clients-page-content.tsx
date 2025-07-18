'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, UserCheck, Phone, MessageCircle, Calendar, Eye, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCPF, formatCNPJ, formatPhone } from '@/lib/validations/clients/client.schema';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { usePermissions } from '@/hooks/use-permissions';
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
  funnel: {
    id: string;
    name: string;
  };
  funnelStage: {
    id: string;
    name: string;
    color: string;
  };
  user: {
    id: string;
    name: string;
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
      // Aqui será implementada a busca real nos actions
      // Por enquanto, dados mockados
      const mockClients: ClientData[] = [
        {
          id: '1',
          name: 'João Silva Santos',
          email: 'joao@email.com',
          phone: '11987654321',
          documentType: 'cpf',
          documentNumber: '12345678901',
          city: 'São Paulo',
          state: 'SP',
          funnel: {
            id: '1',
            name: 'Vendas Diretas'
          },
          funnelStage: {
            id: '1',
            name: 'Novo Lead',
            color: 'blue'
          },
          user: {
            id: '1',
            name: 'Maria Vendedora'
          },
          totalProposals: 2,
          totalValue: 15000,
          lastInteraction: new Date('2024-01-15'),
          createdAt: new Date('2024-01-10')
        },
        {
          id: '2',
          name: 'Empresa ABC Ltda',
          email: 'contato@empresaabc.com',
          phone: '1133334444',
          documentType: 'cnpj',
          documentNumber: '12345678000199',
          city: 'Rio de Janeiro',
          state: 'RJ',
          funnel: {
            id: '2',
            name: 'Vendas Corporativas'
          },
          funnelStage: {
            id: '2',
            name: 'Proposta Enviada',
            color: 'orange'
          },
          user: {
            id: '2',
            name: 'Carlos Agente'
          },
          totalProposals: 1,
          totalValue: 25000,
          lastInteraction: new Date('2024-01-18'),
          createdAt: new Date('2024-01-05')
        }
      ];
      
      setClients(mockClients);
      setTotalClients(mockClients.length);
      setTotalPages(Math.ceil(mockClients.length / 20));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedFunnel, selectedStage, selectedUser, currentPage]);

  // Função para buscar dados de filtro
  const fetchFilterData = useCallback(async () => {
    try {
      // Aqui será implementada a busca real nos actions
      // Por enquanto, dados mockados
      const mockFilterData: FilterData = {
        funnels: [
          { id: '1', name: 'Funil Principal' },
          { id: '2', name: 'Funil Corporativo' }
        ],
        funnelStages: [
          { id: '1', name: 'Novo Lead', funnelId: '1' },
          { id: '2', name: 'Proposta Enviada', funnelId: '1' },
          { id: '3', name: 'Negociação', funnelId: '1' },
          { id: '4', name: 'Fechado', funnelId: '1' }
        ],
        users: [
          { id: '1', name: 'Maria Vendedora' },
          { id: '2', name: 'Carlos Agente' }
        ]
      };
      
      setFilterData(mockFilterData);
    } catch (error) {
      console.error('Erro ao buscar dados de filtro:', error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchFilterData();
    fetchClients();
  }, [fetchFilterData, fetchClients]);

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
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  // Função para navegar para novo cliente
  const handleNewClient = () => {
    router.push('/clients/new');
  };

  // Função para navegar para detalhes do cliente
  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  // Função para editar cliente
  const handleEditClient = (clientId: string) => {
    router.push(`/clients/${clientId}/edit`);
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

  // Render dos filtros (estilo operadoras)
  const renderFilters = () => (
    <div className={pageStyles.filtersSection}>
      <div className={pageStyles.searchContainer}>
        <div className={pageStyles.searchInputWrapper}>
          <Search className={pageStyles.searchIcon} />
          <Input
            placeholder="Buscar por nome, email, telefone ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={pageStyles.searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters();
              }
            }}
          />
          {searchTerm && (
            <button
              className={pageStyles.clearButton}
              onClick={() => {
                setSearchTerm('');
                applyFilters();
              }}
            >
              <X className={pageStyles.clearIcon} size={16} />
            </button>
          )}
        </div>
        
        <div className={pageStyles.filterButtons}>
          <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
            <SelectTrigger className={pageStyles.filterSelect}>
              <SelectValue placeholder="Todos os funis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os funis</SelectItem>
              {filterData.funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className={pageStyles.filterSelect}>
              <SelectValue placeholder="Todas as etapas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as etapas</SelectItem>
              {filterData.funnelStages
                .filter(stage => !selectedFunnel || stage.funnelId === selectedFunnel)
                .map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {canEditUsers() && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className={pageStyles.filterSelect}>
                <SelectValue placeholder="Todos os agentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os agentes</SelectItem>
                {filterData.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );

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
                <Badge variant="secondary" className={pageStyles.funnelBadge}>
                  {client.funnel.name}
                </Badge>
              </td>
              <td className={styles.clientsTableCell}>
                <Badge variant="outline" className={`${styles.clientStatus} ${styles.active}`}>
                  {client.funnelStage.name}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={pageStyles.clientActionsButton}>
                      <MoreHorizontal className={pageStyles.clientActionsIcon} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                      <Eye className={pageStyles.actionMenuIcon} />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                      <Edit className={pageStyles.actionMenuIcon} />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Phone className={pageStyles.actionMenuIcon} />
                      Ligar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className={pageStyles.actionMenuIcon} />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className={pageStyles.actionMenuIcon} />
                      Agendar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserCheck className={pageStyles.actionMenuIcon} />
                      Transferir
                    </DropdownMenuItem>
                    <DropdownMenuItem className={pageStyles.actionMenuItemDanger}>
                      <Trash2 className={pageStyles.actionMenuIcon} />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
