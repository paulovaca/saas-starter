'use client';

import { useState, useTransition } from 'react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { deleteProposal } from '@/lib/actions/proposals/delete-proposal';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { ProposalWithRelations } from '@/lib/types/proposals';
import styles from './delete-proposal-modal.module.css';

interface DeleteProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalWithRelations;
  userRole?: string;
}

export function DeleteProposalModal({ 
  isOpen, 
  onClose, 
  proposal, 
  userRole 
}: DeleteProposalModalProps) {
  const [isPending, startTransition] = useTransition();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const isHardDelete = userRole === 'MASTER' || userRole === 'DEVELOPER';

  const handleConfirm = () => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          console.log('🗑️ Starting proposal deletion...', { 
            proposalId: proposal.id, 
            isHardDelete,
            userRole 
          });

          const result = await deleteProposal({
            proposalId: proposal.id,
            hardDelete: isHardDelete
          });

          console.log('🗑️ Delete result:', result);

          if (!result.success) {
            showError(result.error);
            reject(new Error(result.error));
          } else {
            const message = isHardDelete 
              ? 'Proposta excluída permanentemente com sucesso!'
              : 'Proposta excluída com sucesso!';
            
            showSuccess(message);
            
            // For hard delete, redirect to proposals page immediately
            if (isHardDelete) {
              setTimeout(() => {
                router.push('/proposals');
              }, 1000);
            } else {
              // For soft delete, reload the page
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            resolve();
          }
        } catch (error) {
          console.error('❌ Error deleting proposal:', error);
          showError('Erro inesperado ao deletar proposta');
          reject(error);
        }
      });
    });
  };

  const descriptionContent = (
    <div className={styles.description}>
      <p>
        <span className={styles.proposalDetails}>Proposta:</span> {proposal.proposalNumber}
      </p>
      <p>
        <span className={styles.proposalDetails}>Cliente:</span> {proposal.client?.name || 'N/A'}
      </p>
      <p>
        <span className={styles.proposalDetails}>Status:</span> {proposal.status}
      </p>
      <p>
        <span className={styles.proposalDetails}>Valor Total:</span> R$ {proposal.totalAmount}
      </p>
      
      <div className={styles.dangerBox}>
        <p className={styles.dangerTitle}>
          ⚠️ ATENÇÃO: {isHardDelete ? 'Esta ação é irreversível!' : 'Esta proposta será marcada como excluída!'}
        </p>
        <ul className={styles.dangerList}>
          {isHardDelete ? (
            <>
              <li>• A proposta será removida permanentemente do sistema</li>
              <li>• Todos os dados associados (itens, histórico, etc.) serão perdidos</li>
              <li>• Esta ação não pode ser desfeita</li>
            </>
          ) : (
            <>
              <li>• A proposta será marcada como excluída</li>
              <li>• Poderá ser recuperada por usuários MASTER</li>
              <li>• Os dados não serão perdidos permanentemente</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title={isHardDelete ? "Excluir Proposta Definitivamente" : "Excluir Proposta"}
      description={descriptionContent}
      onConfirm={handleConfirm}
      requiredConfirmation="deletar"
      confirmText={isHardDelete ? "Excluir Definitivamente" : "Excluir"}
      cancelText="Cancelar"
      variant="danger"
      isLoading={isPending}
    />
  );
}