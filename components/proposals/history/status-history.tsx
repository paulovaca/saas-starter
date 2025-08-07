'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Timeline,
  TimelineItem,
  TimelinePoint,
  TimelineContent,
} from '@/components/ui/timeline';
import { 
  Clock, 
  User, 
  MessageSquare, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProposalStatusLabels, type ProposalStatusType } from '@/lib/types/proposal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './status-history.module.css';

interface StatusHistoryEntry {
  id: string;
  fromStatus: ProposalStatusType | null;
  toStatus: ProposalStatusType;
  changedBy: string;
  changedByName?: string;
  reason?: string | null;
  changedAt: string;
}

interface StatusHistoryProps {
  proposalId: string;
  initialHistory?: StatusHistoryEntry[];
  className?: string;
}

export default function StatusHistory({ 
  proposalId, 
  initialHistory,
  className 
}: StatusHistoryProps) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>(initialHistory || []);
  const [loading, setLoading] = useState(!initialHistory);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialHistory) {
      fetchHistory();
    }
  }, [proposalId, initialHistory]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/proposals/${proposalId}/history`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }
      
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ProposalStatusType) => {
    switch (status) {
      case 'draft':
        return <Clock className={styles.statusIcon} />;
      case 'sent':
        return <Clock className={styles.statusIcon} />;
      case 'approved':
        return <Clock className={styles.statusIcon} />;
      case 'contract':
        return <Clock className={styles.statusIcon} />;
      case 'rejected':
        return <Clock className={styles.statusIcon} />;
      case 'expired':
        return <Clock className={styles.statusIcon} />;
      case 'awaiting_payment':
        return <Clock className={styles.statusIcon} />;
      case 'active_booking':
        return <Clock className={styles.statusIcon} />;
      case 'cancelled':
        return <Clock className={styles.statusIcon} />;
      default:
        return <Clock className={styles.statusIcon} />;
    }
  };

  const getStatusColor = (status: ProposalStatusType): string => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'sent':
        return 'blue';
      case 'approved':
        return 'green';
      case 'contract':
        return 'purple';
      case 'rejected':
        return 'red';
      case 'expired':
        return 'orange';
      case 'awaiting_payment':
        return 'yellow';
      case 'active_booking':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM, HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const displayHistory = expanded ? history : history.slice(0, 3);
  const hasMoreItems = history.length > 3;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className={styles.title}>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.skeletonContainer}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.skeletonItem}>
                <Skeleton className={styles.skeletonIcon} />
                <div className={styles.skeletonContent}>
                  <Skeleton className={styles.skeletonTitle} />
                  <Skeleton className={styles.skeletonText} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className={styles.title}>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchHistory}
              className={styles.retryButton}
            >
              <RefreshCw className={styles.buttonIcon} />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className={styles.title}>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.emptyContainer}>
            <Clock className={styles.emptyIcon} />
            <p className={styles.emptyText}>Nenhuma alteração de status encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={styles.title}>
          Histórico de Status
          <span className={styles.count}>({history.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        <Timeline className={styles.timeline}>
          {displayHistory.map((entry, index) => (
            <TimelineItem key={entry.id} className={styles.timelineItem}>
              <TimelinePoint className={styles.timelinePoint}>
                {getStatusIcon(entry.toStatus)}
              </TimelinePoint>
              
              <TimelineContent className={styles.timelineContent}>
                <div className={styles.entryHeader}>
                  <div className={styles.statusChange}>
                    {entry.fromStatus && (
                      <>
                        <Badge variant="outline" className={styles.statusBadge}>
                          {ProposalStatusLabels[entry.fromStatus]}
                        </Badge>
                        <span className={styles.arrow}>→</span>
                      </>
                    )}
                    <Badge 
                      variant="default" 
                      className={`${styles.statusBadge} ${styles[`status-${getStatusColor(entry.toStatus)}`]}`}
                    >
                      {ProposalStatusLabels[entry.toStatus]}
                    </Badge>
                  </div>
                  
                  <div className={styles.metadata}>
                    <span className={styles.timestamp}>
                      {formatDateTime(entry.changedAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.entryDetails}>
                  <div className={styles.changedBy}>
                    <User className={styles.userIcon} />
                    <span>
                      {entry.changedBy === 'system' 
                        ? 'Sistema' 
                        : entry.changedByName || entry.changedBy
                      }
                    </span>
                  </div>

                  {entry.reason && (
                    <div className={styles.reason}>
                      <MessageSquare className={styles.reasonIcon} />
                      <span>{entry.reason}</span>
                    </div>
                  )}
                </div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        {hasMoreItems && (
          <div className={styles.expandContainer}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className={styles.expandButton}
            >
              {expanded ? (
                <>
                  <ChevronUp className={styles.buttonIcon} />
                  Mostrar Menos
                </>
              ) : (
                <>
                  <ChevronDown className={styles.buttonIcon} />
                  Mostrar Mais ({history.length - 3})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}