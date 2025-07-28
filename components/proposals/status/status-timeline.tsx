'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Edit,
  Eye,
  User,
  FileText
} from 'lucide-react';
import { ProposalStatus } from '@/lib/types/proposals';
import { getProposalTimelineAction } from '@/lib/actions/proposals/get-proposal';
import styles from './status-timeline.module.css';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'edit' | 'view' | 'creation';
  title: string;
  description?: string;
  timestamp: Date;
  user: {
    name: string;
    role?: string;
  };
  status?: ProposalStatus;
  metadata?: Record<string, any>;
}

interface ProposalTimelineProps {
  proposalId: string;
}

export default function ProposalTimeline({ proposalId }: ProposalTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real timeline data
  useEffect(() => {
    const fetchTimelineEvents = async () => {
      try {
        setLoading(true);
        
        const result = await getProposalTimelineAction({ proposalId });
        
        if (result.success && result.data) {
          // Check if data is nested or is directly an array
          let timelineData = result.data;
          
          // If result.data has a 'data' property, use that
          if (result.data.data && Array.isArray(result.data.data)) {
            timelineData = result.data.data;
          } else if (!Array.isArray(result.data)) {
            console.error('Timeline data is not an array:', result.data);
            setEvents([]);
            return;
          }
          
          // Transform database timeline to component format
          const transformedEvents: TimelineEvent[] = timelineData.map(event => ({
            id: event.id,
            type: event.type,
            title: event.title,
            description: event.description,
            timestamp: event.timestamp,
            user: event.user,
            status: event.status,
            metadata: event.metadata
          }));
          
          setEvents(transformedEvents);
        } else {
          console.error('Failed to fetch timeline:', result.error);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching timeline events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchTimelineEvents();
    }
  }, [proposalId]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'creation':
        return <FileText className={styles.eventIcon} />;
      case 'edit':
        return <Edit className={styles.eventIcon} />;
      case 'view':
        return <Eye className={styles.eventIcon} />;
      case 'status_change':
        switch (event.status) {
          case ProposalStatus.SENT:
            return <Send className={styles.eventIcon} />;
          case ProposalStatus.ACCEPTED:
            return <CheckCircle className={styles.eventIcon} />;
          case ProposalStatus.REJECTED:
            return <XCircle className={styles.eventIcon} />;
          case ProposalStatus.EXPIRED:
            return <AlertTriangle className={styles.eventIcon} />;
          default:
            return <Clock className={styles.eventIcon} />;
        }
      default:
        return <Clock className={styles.eventIcon} />;
    }
  };

  const getEventClass = (event: TimelineEvent) => {
    const baseClass = styles.timelineEvent;
    
    switch (event.type) {
      case 'creation':
        return `${baseClass} ${styles.eventCreation}`;
      case 'edit':
        return `${baseClass} ${styles.eventEdit}`;
      case 'view':
        return `${baseClass} ${styles.eventView}`;
      case 'status_change':
        switch (event.status) {
          case ProposalStatus.SENT:
            return `${baseClass} ${styles.eventSent}`;
          case ProposalStatus.ACCEPTED:
            return `${baseClass} ${styles.eventAccepted}`;
          case ProposalStatus.REJECTED:
            return `${baseClass} ${styles.eventRejected}`;
          case ProposalStatus.EXPIRED:
            return `${baseClass} ${styles.eventExpired}`;
          default:
            return baseClass;
        }
      default:
        return baseClass;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Agora há pouco';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Card className={styles.timelineCard}>
        <CardHeader>
          <CardTitle className={styles.timelineTitle}>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.loadingState}>Carregando histórico...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.timelineCard}>
      <CardHeader>
        <CardTitle className={styles.timelineTitle}>Timeline</CardTitle>
      </CardHeader>
      <CardContent className={styles.timelineContent}>
        <div className={styles.timelineList}>
          {events.map((event, index) => (
            <div key={event.id} className={getEventClass(event)}>
              <div className={styles.eventIconContainer}>
                {getEventIcon(event)}
                {index < events.length - 1 && (
                  <div className={styles.eventConnector} />
                )}
              </div>
              
              <div className={styles.eventContent}>
                <div className={styles.eventHeader}>
                  <h4 className={styles.eventTitle}>{event.title}</h4>
                  <span className={styles.eventTime}>
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
                
                {event.description && (
                  <p className={styles.eventDescription}>{event.description}</p>
                )}
                
                <div className={styles.eventUser}>
                  <User className={styles.userIcon} />
                  <span className={styles.userName}>{event.user.name}</span>
                  {event.user.role && (
                    <span className={styles.userRole}>• {event.user.role}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className={styles.emptyState}>
            <Clock className={styles.emptyIcon} />
            <p className={styles.emptyMessage}>Nenhum evento registrado ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}