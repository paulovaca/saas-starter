'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getStatusLabel, getStatusColor, ProposalStatus } from '@/lib/types/proposals';
import CreateProposalModal from '@/components/proposals/create-proposal-modal';
import { SearchFilters } from '@/components/shared/search-filters';
import { formatCurrency } from '@/lib/services/proposal-calculator';
import { getProposalsListAction } from '@/lib/actions/proposals/get-proposals-list';
import styles from './proposals-page.module.css';

interface ProposalListItem {
  id: string;
  proposalNumber: string;
  clientName: string;
  operatorName: string;
  totalAmount: number;
  status: ProposalStatus;
  createdAt: Date | string;
  validUntil: Date | string;
  userName: string;
}


export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch proposals from database
  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append('search', searchQuery);
      if (statusFilter !== 'all') searchParams.append('status', statusFilter);
      searchParams.append('page', '1');
      searchParams.append('limit', '50');
      
      const response = await fetch(`/api/proposals?${searchParams.toString()}`);
      console.log('📡 Proposals response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Proposals result:', result);
      
      if (result.proposals && Array.isArray(result.proposals)) {
        setProposals(result.proposals);
      } else {
        console.error('No proposals in response or invalid format');
        setProposals([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar propostas';
      setError(errorMessage);
      setProposals([]); // Ensure proposals is always an array
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [searchQuery, statusFilter]);

  const filteredProposals = Array.isArray(proposals) ? proposals : [];

  const handleCreateProposal = async (proposalData: any) => {
    try {
      console.log('🚀 Creating proposal:', proposalData);
      
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const newProposal = await response.json();
      console.log('✅ Proposal created:', newProposal);
      
      // Refetch proposals to show the new one
      await fetchProposals();
      alert('Proposta criada com sucesso!');
      
    } catch (error) {
      console.error('❌ Error creating proposal:', error);
      alert('Erro ao criar proposta: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };


  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  };

  const StatusBadge = ({ status }: { status: ProposalStatus }) => {
    const label = getStatusLabel(status);
    
    const getStatusClass = (status: ProposalStatus) => {
      switch (status) {
        case ProposalStatus.DRAFT:
          return styles.statusDraft;
        case ProposalStatus.SENT:
          return styles.statusSent;
        case ProposalStatus.ACCEPTED:
          return styles.statusAccepted;
        case ProposalStatus.REJECTED:
          return styles.statusRejected;
        case ProposalStatus.EXPIRED:
          return styles.statusExpired;
        default:
          return styles.statusDraft;
      }
    };
    
    return (
      <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
        {label}
      </span>
    );
  };

  return (
    <div className={styles.proposalsContainer}>
      <div className={styles.proposalsHeader}>
        <h1 className={styles.proposalsTitle}>Propostas</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className={styles.buttonIcon} />
          Nova Proposta
        </Button>
      </div>

      {/* Filters */}
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <SearchFilters
        searchPlaceholder="Buscar por cliente ou número da proposta..."
        defaultSearch={searchQuery}
        filters={[
          {
            key: 'status',
            label: 'Todos os status',
            options: [
              { value: ProposalStatus.DRAFT, label: 'Rascunho' },
              { value: ProposalStatus.SENT, label: 'Enviada' },
              { value: ProposalStatus.ACCEPTED, label: 'Aceita' },
              { value: ProposalStatus.REJECTED, label: 'Recusada' },
              { value: ProposalStatus.EXPIRED, label: 'Expirada' }
            ],
            defaultValue: statusFilter === 'all' ? '' : statusFilter
          }
        ]}
        onFiltersChange={(filters) => {
          setSearchQuery(filters.search || '');
          setStatusFilter((filters.status as ProposalStatus) || 'all');
        }}
        showFilterButton={false}
        />
      </Suspense>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingMessage}>Carregando propostas...</div>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <div className={styles.errorMessage}>{error}</div>
          <Button onClick={fetchProposals}>Tentar novamente</Button>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyMessage}>
            {searchQuery || statusFilter !== 'all' 
              ? 'Nenhuma proposta encontrada com os filtros aplicados' 
              : 'Nenhuma proposta criada ainda'
            }
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className={styles.buttonIcon} />
            Criar Primeira Proposta
          </Button>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeader}>Proposta</th>
                <th className={styles.tableHeader}>Cliente</th>
                <th className={styles.tableHeader}>Operadora</th>
                <th className={styles.tableHeader}>Valor</th>
                <th className={styles.tableHeader}>Status</th>
                <th className={styles.tableHeader}>Criada em</th>
                <th className={styles.tableHeader}>Válida até</th>
                <th className={styles.tableHeader}>Responsável</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <Link 
                      href={`/proposals/${proposal.id}`}
                      className={styles.proposalNumber}
                    >
                      {proposal.proposalNumber}
                    </Link>
                  </td>
                  <td className={`${styles.tableCell} ${styles.clientName}`}>
                    <Link 
                      href={`/proposals/${proposal.id}`}
                      className={styles.clientLink}
                    >
                      {proposal.clientName}
                    </Link>
                  </td>
                  <td className={`${styles.tableCell} ${styles.operatorName}`}>
                    {proposal.operatorName}
                  </td>
                  <td className={`${styles.tableCell} ${styles.amount}`}>
                    {formatCurrency(proposal.totalAmount)}
                  </td>
                  <td className={styles.tableCell}>
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className={`${styles.tableCell} ${styles.date}`}>
                    {formatDate(proposal.createdAt)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.date}`}>
                    {formatDate(proposal.validUntil)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.userName}`}>
                    {proposal.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProposal}
      />
    </div>
  );
}
