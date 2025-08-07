'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  Send, 
  Copy, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  MoreHorizontal,
  CreditCard,
  Calendar,
  Ban
} from 'lucide-react';
import { 
  ProposalStatusType,
  ProposalStatusTransitions,
  requiresReason,
  RejectionReasons,
  CancellationReasons
} from '@/lib/types/proposal';
import {
  sendProposal,
  approveProposal,
  rejectProposal,
  cancelProposal,
  reactivateProposal,
  setAwaitingPayment,
  confirmPayment
} from '@/lib/actions/proposals/status-transitions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import styles from './proposal-status-actions.module.css';

interface ProposalStatusActionsProps {
  proposalId: string;
  currentStatus: ProposalStatusType;
  onStatusChange?: (newStatus: ProposalStatusType) => void;
}

export default function ProposalStatusActions({ 
  proposalId,
  currentStatus,
  onStatusChange
}: ProposalStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    action?: () => Promise<void>;
    title?: string;
    description?: string;
    confirmText?: string;
  }>({ show: false });
  const [showReasonDialog, setShowReasonDialog] = useState<{
    show: boolean;
    type?: 'rejection' | 'cancellation';
    reason?: string;
  }>({ show: false });

  const availableTransitions = ProposalStatusTransitions[currentStatus] || [];

  const handleStatusTransition = async (newStatus: ProposalStatusType) => {
    setLoading(true);
    try {
      let result;
      
      switch (newStatus) {
        case 'sent':
          result = await sendProposal({ proposalId });
          break;
        case 'approved':
          result = await approveProposal({ proposalId });
          break;
        case 'awaiting_payment':
          result = await setAwaitingPayment({ proposalId });
          break;
        case 'active_booking':
          result = await confirmPayment({ proposalId });
          break;
        case 'draft':
          result = await reactivateProposal({ proposalId });
          break;
        default:
          throw new Error(`Transição não implementada para ${newStatus}`);
      }

      if (result.success) {
        toast.success('Status alterado com sucesso!');
        onStatusChange?.(newStatus);
      } else {
        throw new Error('Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showReasonDialog.reason?.trim()) {
      toast.error('Motivo é obrigatório para recusar proposta');
      return;
    }

    setLoading(true);
    try {
      const result = await rejectProposal({ 
        proposalId, 
        reason: showReasonDialog.reason 
      });

      if (result.success) {
        toast.success('Proposta marcada como recusada!');
        onStatusChange?.('rejected');
        setShowReasonDialog({ show: false });
      } else {
        throw new Error('Erro ao recusar proposta');
      }
    } catch (error) {
      console.error('Erro ao recusar proposta:', error);
      toast.error('Erro ao recusar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!showReasonDialog.reason?.trim()) {
      toast.error('Motivo é obrigatório para cancelar proposta');
      return;
    }

    setLoading(true);
    try {
      const result = await cancelProposal({ 
        proposalId, 
        reason: showReasonDialog.reason 
      });

      if (result.success) {
        toast.success('Proposta cancelada!');
        onStatusChange?.('cancelled');
        setShowReasonDialog({ show: false });
      } else {
        throw new Error('Erro ao cancelar proposta');
      }
    } catch (error) {
      console.error('Erro ao cancelar proposta:', error);
      toast.error('Erro ao cancelar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/proposals/${proposalId}/edit`);
  };

  const handleDuplicate = () => {
    router.push(`/proposals/new?duplicate=${proposalId}`);
  };

  const handleContractData = () => {
    router.push(`/proposals/${proposalId}/contract`);
  };

  const getActionButton = (status: ProposalStatusType) => {
    switch (status) {
      case 'sent':
        return (
          <Button 
            size="sm" 
            onClick={() => setShowConfirmDialog({
              show: true,
              action: () => handleStatusTransition('sent'),
              title: 'Enviar Proposta',
              description: 'Tem certeza que deseja enviar esta proposta? O cliente será notificado.',
              confirmText: 'Enviar'
            })}
            disabled={loading}
          >
            <Send className={styles.actionIcon} />
            Enviar Proposta
          </Button>
        );
      
      case 'approved':
        return (
          <Button 
            size="sm" 
            onClick={() => setShowConfirmDialog({
              show: true,
              action: () => handleStatusTransition('approved'),
              title: 'Aprovar Proposta',
              description: 'Confirma que o cliente aprovou esta proposta? Ela será automaticamente convertida em contrato.',
              confirmText: 'Aprovar'
            })}
            disabled={loading}
          >
            <CheckCircle className={styles.actionIcon} />
            Marcar Aprovada
          </Button>
        );
      
      case 'awaiting_payment':
        return (
          <Button 
            size="sm" 
            onClick={() => setShowConfirmDialog({
              show: true,
              action: () => handleStatusTransition('awaiting_payment'),
              title: 'Aguardar Pagamento',
              description: 'Confirma que o contrato foi enviado e está aguardando pagamento?',
              confirmText: 'Aguardar Pagamento'
            })}
            disabled={loading}
          >
            <CreditCard className={styles.actionIcon} />
            Aguardar Pagamento
          </Button>
        );
      
      case 'active_booking':
        return (
          <Button 
            size="sm" 
            onClick={() => setShowConfirmDialog({
              show: true,
              action: () => handleStatusTransition('active_booking'),
              title: 'Confirmar Pagamento',
              description: 'Confirma que o pagamento foi recebido e a reserva está ativa?',
              confirmText: 'Confirmar'
            })}
            disabled={loading}
          >
            <Calendar className={styles.actionIcon} />
            Ativar Reserva
          </Button>
        );
      
      case 'draft':
        return (
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => setShowConfirmDialog({
              show: true,
              action: () => handleStatusTransition('draft'),
              title: 'Reativar Proposta',
              description: 'Esta proposta será reaberta como rascunho para edição.',
              confirmText: 'Reativar'
            })}
            disabled={loading}
          >
            <RefreshCw className={styles.actionIcon} />
            Reativar
          </Button>
        );
      
      default:
        return null;
    }
  };

  const renderMainActions = () => {
    const actions = [];

    // Ação principal baseada no status atual
    for (const targetStatus of availableTransitions) {
      if (targetStatus === 'rejected' || targetStatus === 'cancelled') continue;
      
      const button = getActionButton(targetStatus);
      if (button) {
        actions.push(button);
        break; // Apenas uma ação principal
      }
    }

    // Botão de editar para rascunhos
    if (currentStatus === 'draft') {
      actions.push(
        <Button 
          key="edit"
          variant="outline" 
          size="sm" 
          onClick={handleEdit}
          disabled={loading}
        >
          <Edit className={styles.actionIcon} />
          Editar
        </Button>
      );
    }

    // Botão de dados do contrato
    if (currentStatus === 'contract') {
      actions.push(
        <Button 
          key="contract"
          size="sm" 
          onClick={handleContractData}
          disabled={loading}
        >
          <FileText className={styles.actionIcon} />
          Dados do Contrato
        </Button>
      );
    }

    return actions;
  };

  const renderSecondaryActions = () => {
    const items = [];

    // Rejeitar (apenas para propostas enviadas)
    if (availableTransitions.includes('rejected')) {
      items.push(
        <DropdownMenuItem 
          key="reject"
          onClick={() => setShowReasonDialog({ show: true, type: 'rejection' })}
          className={styles.destructiveItem}
        >
          <XCircle className={styles.menuIcon} />
          Marcar Recusada
        </DropdownMenuItem>
      );
    }

    // Cancelar (disponível para vários status)
    if (availableTransitions.includes('cancelled')) {
      items.push(
        <DropdownMenuItem 
          key="cancel"
          onClick={() => setShowReasonDialog({ show: true, type: 'cancellation' })}
          className={styles.destructiveItem}
        >
          <Ban className={styles.menuIcon} />
          Cancelar
        </DropdownMenuItem>
      );
    }

    // Separador se houver ações destrutivas
    if (items.length > 0) {
      items.push(<DropdownMenuSeparator key="sep1" />);
    }

    // Duplicar (sempre disponível)
    items.push(
      <DropdownMenuItem key="duplicate" onClick={handleDuplicate}>
        <Copy className={styles.menuIcon} />
        Duplicar
      </DropdownMenuItem>
    );

    return items;
  };

  return (
    <>
      <div className={styles.actionsContainer}>
        {renderMainActions()}
        
        {/* Menu de ações secundárias */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              <MoreHorizontal className={styles.actionIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {renderSecondaryActions()}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog de confirmação */}
      <AlertDialog 
        open={showConfirmDialog.show} 
        onOpenChange={(open) => setShowConfirmDialog({ show: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{showConfirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {showConfirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => showConfirmDialog.action?.()}
              disabled={loading}
            >
              {loading ? 'Processando...' : showConfirmDialog.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para motivos de rejeição/cancelamento */}
      <AlertDialog 
        open={showReasonDialog.show} 
        onOpenChange={(open) => setShowReasonDialog({ show: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showReasonDialog.type === 'rejection' ? 'Motivo da Recusa' : 'Motivo do Cancelamento'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showReasonDialog.type === 'rejection' 
                ? 'Por favor, informe o motivo da recusa desta proposta.'
                : 'Por favor, informe o motivo do cancelamento desta proposta.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason-select">Motivo</Label>
              <Select 
                value={showReasonDialog.reason} 
                onValueChange={(value) => setShowReasonDialog(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {(showReasonDialog.type === 'rejection' ? RejectionReasons : CancellationReasons)
                    .map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            {showReasonDialog.reason === 'Outro' && (
              <div>
                <Label htmlFor="reason-text">Descreva o motivo</Label>
                <Textarea
                  id="reason-text"
                  placeholder="Descreva o motivo..."
                  value={showReasonDialog.reason}
                  onChange={(e) => setShowReasonDialog(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={showReasonDialog.type === 'rejection' ? handleReject : handleCancel}
              disabled={loading || !showReasonDialog.reason?.trim()}
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}