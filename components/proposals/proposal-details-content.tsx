'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  Edit, 
  Send, 
  Copy, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  Archive,
  Eye,
  User,
  Building2,
  Calendar,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { ProposalWithRelations, ProposalStatus, getStatusLabel, getStatusColor, canTransitionToStatus } from '@/lib/types/proposals';
import { formatCurrency } from '@/lib/services/proposal-calculator';
import { getProposal } from '@/lib/actions/proposals/get-proposal';
import ProposalStatusBadge from '@/components/proposals/status/status-badge';
import ProposalStatusActions from '@/components/proposals/status/status-actions';
import ProposalTimeline from '@/components/proposals/status/status-timeline';
import { CustomFieldsDisplay } from '@/components/proposals/custom-fields-display';
import styles from './proposal-details-content.module.css';

interface ProposalDetailsContentProps {
  proposalId: string;
}

export default function ProposalDetailsContent({ proposalId }: ProposalDetailsContentProps) {
  const router = useRouter();
  
  const [proposal, setProposal] = useState<ProposalWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real proposal data
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        console.log('🚀 Frontend: Starting to fetch proposal with ID:', proposalId);
        setLoading(true);
        setError(null);
        
        const result = await getProposal({ proposalId });
        console.log('📊 Frontend: getProposal result:', result);
        console.log('📋 Frontend: result keys:', Object.keys(result));
        
        if (result.success) {
          console.log('📋 Frontend: result.data type:', typeof result.data);
          console.log('📋 Frontend: result.data keys:', result.data ? Object.keys(result.data) : 'null');
          
          console.log('✅ Frontend: Setting proposal data:', {
            id: result.data.id,
            clientName: result.data.client?.name,
            operatorName: result.data.operator?.name,
            keys: Object.keys(result.data),
            dataType: typeof result.data,
            hasClient: !!result.data.client,
            hasOperator: !!result.data.operator,
            hasUser: !!result.data.user
          });
          
          setProposal(result.data);
        } else {
          console.error('❌ Frontend: Result not successful:', result);
          throw new Error(result.error || 'Erro ao carregar proposta');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar proposta';
        console.error('❌ Frontend: Error fetching proposal:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!proposal) return;
    
    try {
      // Status change is now handled by ProposalStatusActions component
      // This callback is called after successful status change
      // Refetch proposal data to get updated information
      const result = await getProposal({ proposalId });
      
      if (result.success) {
        setProposal(result.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar proposta após mudança de status:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderCustomField = (key: string, value: any, getFieldName: (id: string) => string) => {
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    if (value instanceof Date) {
      return formatDate(value);
    }
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Carregando proposta...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          {error || 'Proposta não encontrada'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.proposalContainer}>
      {/* Header */}
      <div className={styles.proposalHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.headerTop}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/proposals')}
              className={styles.backButton}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Propostas
            </Button>
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.proposalNumber}>Proposta {proposal.proposalNumber}</h1>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <div className={styles.headerSubtitle}>
            Criada em {formatDate(proposal.createdAt)} por {proposal.user?.name || 'Usuário desconhecido'}
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <ProposalStatusActions 
            proposalId={proposal.id}
            currentStatus={proposal.status}
            proposal={proposal}
            onStatusChange={handleStatusChange}
            onProposalUpdate={setProposal}
          />
        </div>
      </div>

      <div className={styles.proposalContent}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          
          {/* Information Section */}
          <Card className={styles.infoCard}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>Informações da Proposta</CardTitle>
            </CardHeader>
            <CardContent className={styles.infoContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <User className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Cliente</div>
                    <div className={styles.infoValue}>
                      {proposal.client?.name || 'Cliente não encontrado'}
                      <span className={styles.infoDetail}>
                        {proposal.client?.documentNumber || 'N/A'} • {proposal.client?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Building2 className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Operadora</div>
                    <div className={styles.infoValue}>{proposal.operator?.name || 'Operadora não encontrada'}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Calendar className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Válida até</div>
                    <div className={styles.infoValue}>
                      {proposal.validUntil ? new Intl.DateTimeFormat('pt-BR').format(new Date(proposal.validUntil)) : 'Não definida'}
                    </div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <DollarSign className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Forma de Pagamento</div>
                    <div className={styles.infoValue}>
                      {proposal.paymentMethod || 'Não definida'}
                    </div>
                  </div>
                </div>
              </div>

              {proposal.notes && (
                <div className={styles.notesSection}>
                  <h4 className={styles.notesTitle}>Observações</h4>
                  <p className={styles.notesText}>{proposal.notes}</p>
                </div>
              )}

              {proposal.internalNotes && (
                <div className={styles.notesSection}>
                  <h4 className={styles.notesTitle}>Observações Internas</h4>
                  <p className={styles.notesText}>{proposal.internalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card className={styles.itemsCard}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>Itens da Proposta</CardTitle>
            </CardHeader>
            <CardContent className={styles.itemsContent}>
              <div className={styles.itemsList}>
                {(proposal.items || []).map((item, index) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemSubtotal}>
                        {formatCurrency(parseFloat(item.subtotal || '0'))}
                      </div>
                    </div>
                    
                    {item.description && (
                      <div className={styles.itemDescription}>{item.description}</div>
                    )}
                    
                    <div className={styles.itemDetails}>
                      <span>Quantidade: {item.quantity}</span>
                      <span>Valor unitário: {formatCurrency(parseFloat(item.unitPrice || '0'))}</span>
                    </div>
                    
                    <CustomFieldsDisplay 
                      customFields={item.customFields as Record<string, any> | null | undefined}
                      className={styles.customFields}
                    />
                    
                    {index < proposal.items.length - 1 && <Separator className={styles.itemSeparator} />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Values Section */}
          <Card className={styles.valuesCard}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className={styles.valuesContent}>
              <div className={styles.valueBreakdown}>
                <div className={styles.valueLine}>
                  <span className={styles.valueLabel}>Subtotal</span>
                  <span className={styles.valueAmount}>{formatCurrency(parseFloat(proposal.subtotal || '0'))}</span>
                </div>
                
                {proposal.discountAmount && parseFloat(proposal.discountAmount) > 0 && (
                  <div className={styles.valueLine}>
                    <span className={styles.valueLabel}>
                      Desconto {proposal.discountPercent ? `(${proposal.discountPercent}%)` : ''}
                    </span>
                    <span className={styles.valueAmount}>
                      -{formatCurrency(parseFloat(proposal.discountAmount))}
                    </span>
                  </div>
                )}
                
                <Separator className={styles.totalSeparator} />
                
                <div className={styles.totalLine}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalAmount}>{formatCurrency(parseFloat(proposal.totalAmount || '0'))}</span>
                </div>
                
                <div className={styles.commissionLine}>
                  <span className={styles.commissionLabel}>
                    Comissão ({proposal.commissionPercent || '0'}%)
                  </span>
                  <span className={styles.commissionAmount}>
                    {formatCurrency(parseFloat(proposal.commissionAmount || '0'))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Sidebar */}
        <div className={styles.sidebarContent}>
          <ProposalTimeline proposalId={proposal.id} />
        </div>
      </div>
    </div>
  );
}