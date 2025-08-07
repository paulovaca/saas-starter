'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditProposalModal from '@/components/proposals/edit-proposal-modal';
import EditExpirationModal from '@/components/proposals/edit-expiration-modal';
import { DeleteProposalModal } from '@/components/proposals/delete-proposal-modal';
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
  MoreHorizontal,
  CreditCard,
  Calendar,
  Plane
} from 'lucide-react';
import { ProposalStatus, isValidTransition, ProposalStatusType } from '@/lib/types/proposal';
import { 
  approveProposal,
  rejectProposal,
  sendProposal,
  setAwaitingPayment,
  cancelProposal,
  confirmPayment,
  reactivateProposal,
  transitionProposalStatus
} from '@/lib/actions/proposals/status-transitions';
import { deleteProposal } from '@/lib/actions/proposals/delete-proposal';
import { generateProposalPDF, downloadPDF } from '@/lib/services/pdf-generator';
import { useRouter } from 'next/navigation';
import { User as UserType } from '@/lib/db/schema';
import useSWR from 'swr';
import styles from './status-actions.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProposalStatusActionsProps {
  proposalId: string;
  currentStatus: ProposalStatusType;
  proposal?: any | null;
  onStatusChange: (newStatus: ProposalStatusType) => void;
  onProposalUpdate?: (updatedProposal: any) => void;
}

export default function ProposalStatusActions({ 
  proposalId,
  currentStatus,
  proposal,
  onStatusChange,
  onProposalUpdate
}: ProposalStatusActionsProps) {
  // Component working correctly

  const router = useRouter();
  const { data: user } = useSWR<UserType>('/api/user', fetcher);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState<{
    show: boolean;
    newStatus?: ProposalStatusType;
  }>({ show: false });
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: ProposalStatusType) => {
    if (!isValidTransition(currentStatus, newStatus)) {
      alert(`Não é possível alterar o status de ${currentStatus} para ${newStatus}`);
      return;
    }

    setLoading(true);
    try {
      const result = await transitionProposalStatus({
        proposalId,
        toStatus: newStatus
      });

      if (result.success) {
        onStatusChange(newStatus);
        setShowStatusDialog({ show: false });
      } else {
        throw new Error(result.error || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert(error instanceof Error ? error.message : 'Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const result = await sendProposal({ proposalId });
      if (result.success) {
        onStatusChange(ProposalStatus.SENT);
      } else {
        throw new Error('Erro ao enviar proposta');
      }
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await approveProposal({ proposalId });
      if (result.success) {
        onStatusChange(ProposalStatus.CONTRACT); // Vai automaticamente para contrato
      } else {
        throw new Error('Erro ao aprovar proposta');
      }
    } catch (error) {
      console.error('Erro ao aprovar proposta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao aprovar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Informe o motivo da recusa:');
    if (!reason?.trim()) {
      alert('Motivo é obrigatório para recusar proposta');
      return;
    }

    setLoading(true);
    try {
      const result = await rejectProposal({ 
        proposalId, 
        reason: reason.trim() 
      });
      if (result.success) {
        onStatusChange(ProposalStatus.REJECTED);
      } else {
        throw new Error('Erro ao recusar proposta');
      }
    } catch (error) {
      console.error('Erro ao recusar proposta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao recusar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAwaitingPayment = async () => {
    setLoading(true);
    try {
      const result = await setAwaitingPayment({ proposalId });
      if (result.success) {
        onStatusChange(ProposalStatus.AWAITING_PAYMENT);
      } else {
        throw new Error('Erro ao definir como aguardando pagamento');
      }
    } catch (error) {
      console.error('Erro ao definir aguardando pagamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao definir aguardando pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason: string) => {
    setLoading(true);
    try {
      const result = await cancelProposal({ 
        proposalId, 
        reason 
      });
      if (result.success) {
        onStatusChange(ProposalStatus.CANCELLED);
      } else {
        throw new Error('Erro ao cancelar proposta');
      }
    } catch (error) {
      console.error('Erro ao cancelar proposta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao cancelar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (reason: string) => {
    setLoading(true);
    try {
      const result = await cancelProposal({ 
        proposalId, 
        reason 
      });
      if (result.success) {
        onStatusChange(ProposalStatus.CANCELLED);
      } else {
        throw new Error('Erro ao processar reembolso');
      }
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar reembolso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render cancel/refund button based on permissions
  const renderCancelRefundButton = (isRefund = false) => {
    const buttonText = isRefund ? 'Reembolsar' : 'Cancelar';
    const promptText = isRefund 
      ? 'Informe o motivo do reembolso:' 
      : 'Informe o motivo do cancelamento:';
    const handler = isRefund ? handleRefund : handleCancel;

    return (
      <DropdownMenuItem 
        className={styles.destructiveItem}
        onClick={() => {
          const reason = prompt(promptText);
          if (reason?.trim()) {
            handler(reason.trim());
          }
        }}
      >
        <Trash2 className={styles.menuIcon} />
        {buttonText}
      </DropdownMenuItem>
    );
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const result = await confirmPayment({ proposalId });
      if (result.success) {
        onStatusChange(ProposalStatus.ACTIVE_BOOKING);
      } else {
        throw new Error('Erro ao confirmar pagamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao confirmar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      // TODO: Get full proposal data for PDF generation
      // For now, just show a placeholder
      console.log('Generating PDF for proposal:', proposalId);
      // const result = await generateProposalPDF(proposalData);
      // if (result.success && result.buffer) {
      //   downloadPDF(result.buffer, result.filename);
      // }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleProposalUpdate = (updatedProposal: any) => {
    onProposalUpdate?.(updatedProposal);
    onStatusChange(updatedProposal.status as ProposalStatusType);
  };

  const handleDuplicate = () => {
    router.push(`/proposals/new?duplicate=${proposalId}`);
  };

  // Remove the old handleDelete function - we'll use the modal now

  const getStatusDialogContent = (newStatus: ProposalStatusType) => {
    switch (newStatus) {
      case ProposalStatus.SENT:
        return {
          title: 'Enviar Proposta',
          description: 'Tem certeza que deseja enviar esta proposta? O cliente será notificado por email.',
          action: 'Enviar'
        };
      case ProposalStatus.APPROVED:
        return {
          title: 'Marcar como Aceita',
          description: 'Confirma que o cliente aceitou esta proposta? Isso irá mover para "Aguardando Pagamento".',
          action: 'Aceitar'
        };
      case ProposalStatus.REJECTED:
        return {
          title: 'Marcar como Recusada',
          description: 'Confirma que o cliente recusou esta proposta? Esta ação não pode ser desfeita.',
          action: 'Recusar'
        };
      case ProposalStatus.EXPIRED:
        return {
          title: 'Marcar como Expirada',
          description: 'Confirma que esta proposta expirou? O prazo de validade foi ultrapassado.',
          action: 'Expirar'
        };
      case ProposalStatus.AWAITING_PAYMENT:
        return {
          title: 'Marcar como Aguardando Pagamento',
          description: 'Confirma que a proposta foi aceita e está aguardando pagamento.',
          action: 'Aguardar Pagamento'
        };
      case ProposalStatus.ACTIVE_BOOKING:
        return {
          title: 'Marcar como Negócio/Viagem Ativo',
          description: 'Confirma que o pagamento foi recebido e a viagem está ativa.',
          action: 'Ativar Viagem'
        };
      default:
        return {
          title: 'Alterar Status',
          description: 'Tem certeza que deseja alterar o status desta proposta?',
          action: 'Confirmar'
        };
    }
  };

  const renderDraftActions = () => (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={handleEdit}
        disabled={loading}
      >
        <Edit className={styles.actionIcon} />
        Editar
      </Button>
      
      <Button 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Tem certeza que deseja enviar esta proposta? O cliente será notificado por email.');
          if (confirm) {
            handleSend();
          }
        }}
        disabled={loading}
      >
        <Send className={styles.actionIcon} />
        Enviar Proposta
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {renderCancelRefundButton(false)}
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderSentActions = () => (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Confirma que o cliente aceitou esta proposta? Isso irá mover para "Aguardando Pagamento".');
          if (confirm) {
            handleApprove();
          }
        }}
        disabled={loading}
      >
        <CheckCircle className={styles.actionIcon} />
        Marcar Aceita
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Confirma que o cliente recusou esta proposta? Esta ação não pode ser desfeita.');
          if (confirm) {
            handleReject();
          }
        }}
        disabled={loading}
      >
        <XCircle className={styles.actionIcon} />
        Marcar Recusada
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <RefreshCw className={styles.menuIcon} />
            Reenviar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {renderCancelRefundButton(false)}
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderAcceptedActions = () => (
    <>
      <Button 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Confirma que a proposta foi aceita e está aguardando pagamento?');
          if (confirm) {
            handleStatusChange(ProposalStatus.AWAITING_PAYMENT);
          }
        }}
        disabled={loading}
      >
        <CreditCard className={styles.actionIcon} />
        Aguardando Pagamento
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={handleGeneratePDF}
        disabled={loading}
      >
        <FileText className={styles.actionIcon} />
        Gerar PDF
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {renderCancelRefundButton(false)}
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderContractActions = () => (
    <>
      <Button 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          router.push(`/proposals/${proposalId}/contract`);
        }}
        disabled={loading}
      >
        <FileText className={styles.actionIcon} />
        Dados do Contrato
      </Button>
      
      <Button 
        variant="outline"
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Confirma que o contrato foi enviado e está aguardando pagamento?');
          if (confirm) {
            handleAwaitingPayment();
          }
        }}
        disabled={loading}
      >
        <CreditCard className={styles.actionIcon} />
        Aguardar Pagamento
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {renderCancelRefundButton(false)}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderRejectedActions = () => (
    <>
      <Button 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Reabrir esta proposta como rascunho para edição?');
          if (confirm) {
            handleStatusChange(ProposalStatus.DRAFT);
          }
        }}
        disabled={loading}
      >
        <RefreshCw className={styles.actionIcon} />
        Reabrir Proposta
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={handleDuplicate}
        disabled={loading}
      >
        <Copy className={styles.menuIcon} />
        Duplicar
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>
            <Archive className={styles.menuIcon} />
            Arquivar
          </DropdownMenuItem>
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderExpiredActions = () => (
    <>
      <Button 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Reabrir esta proposta como rascunho para edição?');
          if (confirm) {
            handleStatusChange(ProposalStatus.DRAFT);
          }
        }}
        disabled={loading}
      >
        <RefreshCw className={styles.actionIcon} />
        Reabrir Proposta
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={handleDuplicate}
        disabled={loading}
      >
        <Copy className={styles.menuIcon} />
        Duplicar
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>
            <Archive className={styles.menuIcon} />
            Arquivar
          </DropdownMenuItem>
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderActions = () => {
    switch (currentStatus) {
      case ProposalStatus.DRAFT:
        return renderDraftActions();
      case ProposalStatus.SENT:
        return renderSentActions();
      case ProposalStatus.APPROVED:
        return renderAcceptedActions();
      case ProposalStatus.CONTRACT:
        return renderContractActions();
      case ProposalStatus.REJECTED:
        return renderRejectedActions();
      case ProposalStatus.EXPIRED:
        return renderExpiredActions();
      case ProposalStatus.AWAITING_PAYMENT:
        return renderAwaitingPaymentActions();
      case ProposalStatus.ACTIVE_BOOKING:
        return renderActiveBookingActions();
      case ProposalStatus.CANCELLED:
        return renderCancelledActions();
      default:
        return null;
    }
  };

  const renderAwaitingPaymentActions = () => (
    <>
      <Button 
        size="sm" 
        className={styles.actionButton}
        onClick={() => {
          const confirm = window.confirm('Confirma que o pagamento foi recebido e a viagem está ativa?');
          if (confirm) {
            handleConfirmPayment();
          }
        }}
        disabled={loading}
      >
        <Plane className={styles.actionIcon} />
        Pago / Ativar Viagem
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={() => setShowExpirationModal(true)}
        disabled={loading}
      >
        <Calendar className={styles.actionIcon} />
        Editar Data de Expiração
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleGeneratePDF}>
            <FileText className={styles.menuIcon} />
            Gerar PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {renderCancelRefundButton(false)}
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderActiveBookingActions = () => (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        disabled={loading}
      >
        <FileText className={styles.actionIcon} />
        Ver Negócio
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={handleGeneratePDF}
        disabled={loading}
      >
        <FileText className={styles.actionIcon} />
        Gerar PDF
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {renderCancelRefundButton(true)}
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderCancelledActions = () => (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={handleDuplicate}
        disabled={loading}
      >
        <Copy className={styles.actionIcon} />
        Duplicar
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <MoreHorizontal className={styles.actionIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleGeneratePDF}>
            <FileText className={styles.menuIcon} />
            Gerar PDF
          </DropdownMenuItem>
          {(user?.role === 'MASTER' || user?.role === 'DEVELOPER') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={styles.destructiveItem}
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className={styles.menuIcon} />
                Excluir Definitivamente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const dialogContent = showStatusDialog.newStatus ? 
    getStatusDialogContent(showStatusDialog.newStatus) : 
    { title: '', description: '', action: '' };

  return (
    <>
      <div className={styles.actionsContainer}>
        {renderActions()}
      </div>

      {/* Status Change Dialog */}
      <AlertDialog 
        open={showStatusDialog.show} 
        onOpenChange={(open) => {
          console.log('🚪 [MODAL] AlertDialog onOpenChange:', open);
          setShowStatusDialog({ show: open });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                console.log('🖱️ [MODAL] Botão de confirmação clicado');
                console.log('🖱️ [MODAL] showStatusDialog:', showStatusDialog);
                console.log('🖱️ [MODAL] newStatus:', showStatusDialog.newStatus);
                if (showStatusDialog.newStatus) {
                  handleStatusChange(showStatusDialog.newStatus);
                } else {
                  console.error('❌ [MODAL] newStatus é undefined!');
                }
              }}
              disabled={loading}
            >
              {loading ? 'Processando...' : dialogContent.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Proposal Modal */}
      {proposal && (
        <DeleteProposalModal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          proposal={proposal}
          userRole={user?.role}
        />
      )}

      {/* Edit Proposal Modal */}
      <EditProposalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        proposal={proposal || null}
        onUpdate={handleProposalUpdate}
      />

      {/* Edit Expiration Modal */}
      <EditExpirationModal
        isOpen={showExpirationModal}
        onClose={() => setShowExpirationModal(false)}
        proposal={proposal || null}
        onUpdate={handleProposalUpdate}
      />
    </>
  );
}