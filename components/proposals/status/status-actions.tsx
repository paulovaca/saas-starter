'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditProposalModal from '@/components/proposals/edit-proposal-modal';
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
  MoreHorizontal
} from 'lucide-react';
import { ProposalStatus, canTransitionToStatus, ProposalWithRelations } from '@/lib/types/proposals';
import { changeProposalStatus } from '@/lib/actions/proposals/change-status';
import { generateProposalPDF, downloadPDF } from '@/lib/services/pdf-generator';
import { useRouter } from 'next/navigation';
import styles from './status-actions.module.css';

interface ProposalStatusActionsProps {
  proposalId: string;
  currentStatus: ProposalStatus;
  proposal?: ProposalWithRelations | null;
  onStatusChange: (newStatus: ProposalStatus) => void;
  onProposalUpdate?: (updatedProposal: ProposalWithRelations) => void;
}

export default function ProposalStatusActions({ 
  proposalId,
  currentStatus,
  proposal,
  onStatusChange,
  onProposalUpdate
}: ProposalStatusActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState<{
    show: boolean;
    newStatus?: ProposalStatus;
  }>({ show: false });
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!canTransitionToStatus(currentStatus, newStatus)) {
      return;
    }

    setLoading(true);
    try {
      const result = await changeProposalStatus({
        proposalId,
        newStatus
      });

      if (result.success) {
        onStatusChange(newStatus);
        setShowStatusDialog({ show: false });
      } else {
        throw new Error(result.error || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      // TODO: Show toast notification with error
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

  const handleProposalUpdate = (updatedProposal: ProposalWithRelations) => {
    onProposalUpdate?.(updatedProposal);
    onStatusChange(updatedProposal.status as ProposalStatus);
  };

  const handleDuplicate = () => {
    router.push(`/proposals/new?duplicate=${proposalId}`);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Implement delete functionality
      console.log('Deleting proposal...');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDialogContent = (newStatus: ProposalStatus) => {
    switch (newStatus) {
      case ProposalStatus.SENT:
        return {
          title: 'Enviar Proposta',
          description: 'Tem certeza que deseja enviar esta proposta? O cliente será notificado por email.',
          action: 'Enviar'
        };
      case ProposalStatus.ACCEPTED:
        return {
          title: 'Marcar como Aceita',
          description: 'Confirma que o cliente aceitou esta proposta? Isso irá iniciar o processo de reserva.',
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
        onClick={() => setShowStatusDialog({ show: true, newStatus: ProposalStatus.SENT })}
        disabled={loading}
      >
        <Send className={styles.actionIcon} />
        Enviar
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
          <DropdownMenuItem 
            className={styles.destructiveItem}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className={styles.menuIcon} />
            Excluir
          </DropdownMenuItem>
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
        onClick={() => setShowStatusDialog({ show: true, newStatus: ProposalStatus.ACCEPTED })}
        disabled={loading}
      >
        <CheckCircle className={styles.actionIcon} />
        Marcar Aceita
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        onClick={() => setShowStatusDialog({ show: true, newStatus: ProposalStatus.REJECTED })}
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
          <DropdownMenuItem>
            <Copy className={styles.menuIcon} />
            Duplicar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderAcceptedActions = () => (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        disabled={loading}
      >
        <FileText className={styles.actionIcon} />
        Ver Reserva
      </Button>
      
      <Button 
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderRejectedActions = () => (
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
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        disabled={loading}
      >
        <Archive className={styles.actionIcon} />
        Arquivar
      </Button>
    </>
  );

  const renderExpiredActions = () => (
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
      
      <Button 
        variant="outline" 
        size="sm" 
        className={styles.actionButton}
        disabled={loading}
      >
        <Archive className={styles.actionIcon} />
        Arquivar
      </Button>
    </>
  );

  const renderActions = () => {
    switch (currentStatus) {
      case ProposalStatus.DRAFT:
        return renderDraftActions();
      case ProposalStatus.SENT:
        return renderSentActions();
      case ProposalStatus.ACCEPTED:
        return renderAcceptedActions();
      case ProposalStatus.REJECTED:
        return renderRejectedActions();
      case ProposalStatus.EXPIRED:
        return renderExpiredActions();
      default:
        return null;
    }
  };

  const dialogContent = showStatusDialog.newStatus ? 
    getStatusDialogContent(showStatusDialog.newStatus) : 
    { title: '', description: '', action: '' };

  return (
    <>
      <div className={styles.actionsContainer}>
        {renderActions()}
      </div>

      {/* Status Change Dialog */}
      <AlertDialog open={showStatusDialog.show} onOpenChange={(open) => setShowStatusDialog({ show: open })}>
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
              onClick={() => showStatusDialog.newStatus && handleStatusChange(showStatusDialog.newStatus)}
              disabled={loading}
            >
              {loading ? 'Processando...' : dialogContent.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Proposta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className={styles.destructiveAction}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Proposal Modal */}
      <EditProposalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        proposal={proposal}
        onUpdate={handleProposalUpdate}
      />
    </>
  );
}