'use client';

import { Badge } from '@/components/ui/badge';
import { 
  ProposalStatusType,
  ProposalStatusLabels,
  ProposalStatusColors
} from '@/lib/types/proposal';
import { 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  CreditCard,
  Calendar,
  Ban
} from 'lucide-react';
import styles from './status-badge.module.css';

interface ProposalStatusBadgeProps {
  status: ProposalStatusType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProposalStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md' 
}: ProposalStatusBadgeProps) {
  const label = ProposalStatusLabels[status] || 'Desconhecido';
  const color = ProposalStatusColors[status] || 'gray';
  
  const getStatusIcon = () => {
    switch (status) {
      case 'draft':
        return <Clock className={styles.badgeIcon} />;
      case 'sent':
        return <Send className={styles.badgeIcon} />;
      case 'approved':
        return <CheckCircle className={styles.badgeIcon} />;
      case 'contract':
        return <FileText className={styles.badgeIcon} />;
      case 'rejected':
        return <XCircle className={styles.badgeIcon} />;
      case 'expired':
        return <AlertTriangle className={styles.badgeIcon} />;
      case 'awaiting_payment':
        return <CreditCard className={styles.badgeIcon} />;
      case 'active_booking':
        return <Calendar className={styles.badgeIcon} />;
      case 'cancelled':
        return <Ban className={styles.badgeIcon} />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    const baseClass = styles.statusBadge;
    const sizeClass = styles[`badge${size?.charAt(0).toUpperCase() + size?.slice(1)}`] || '';
    const colorClass = styles[`badge${color?.charAt(0).toUpperCase() + color?.slice(1)}`] || '';
    
    return `${baseClass} ${sizeClass} ${colorClass}`.trim();
  };

  return (
    <Badge className={getStatusClass()}>
      {showIcon && getStatusIcon()}
      <span className={styles.badgeText}>{label}</span>
    </Badge>
  );
}