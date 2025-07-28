'use client';

import { Badge } from '@/components/ui/badge';
import { ProposalStatus, getStatusLabel, getStatusColor } from '@/lib/types/proposals';
import { 
  Clock, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import styles from './status-badge.module.css';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProposalStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md' 
}: ProposalStatusBadgeProps) {
  // Ensure we have a valid status, default to DRAFT if invalid
  const validStatus = status || ProposalStatus.DRAFT;
  const label = getStatusLabel(validStatus);
  const color = getStatusColor(validStatus) || 'gray';
  
  const getStatusIcon = () => {
    switch (validStatus) {
      case ProposalStatus.DRAFT:
        return <Clock className={styles.badgeIcon} />;
      case ProposalStatus.SENT:
        return <Send className={styles.badgeIcon} />;
      case ProposalStatus.ACCEPTED:
        return <CheckCircle className={styles.badgeIcon} />;
      case ProposalStatus.REJECTED:
        return <XCircle className={styles.badgeIcon} />;
      case ProposalStatus.EXPIRED:
        return <AlertTriangle className={styles.badgeIcon} />;
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