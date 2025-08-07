'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, User, AlertCircle } from 'lucide-react';
import { duplicateProposal } from '@/lib/actions/proposals/duplicate-proposal';
import { toast } from 'sonner';
import styles from './duplicate-proposal-modal.module.css';

interface Client {
  id: string;
  name: string;
  email?: string | null;
}

interface DuplicateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalNumber: string;
  currentClientId: string;
  currentClientName: string;
  clients?: Client[];
}

export default function DuplicateProposalModal({
  isOpen,
  onClose,
  proposalId,
  proposalNumber,
  currentClientId,
  currentClientName,
  clients = []
}: DuplicateProposalModalProps) {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState(currentClientId);
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const result = await duplicateProposal({
        proposalId,
        clientId: selectedClientId === currentClientId ? undefined : selectedClientId,
      });

      if (result.success) {
        toast.success(result.data.message);
        onClose();
        
        // Redirecionar para a nova proposta
        router.push(`/proposals/${result.data.newProposalId}/edit`);
      } else {
        throw new Error('Erro ao duplicar proposta');
      }
    } catch (error) {
      console.error('Erro ao duplicar proposta:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao duplicar proposta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(client => client.id === selectedClientId) || {
    id: currentClientId,
    name: currentClientName,
  };

  const isDifferentClient = selectedClientId !== currentClientId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.modal}>
        <DialogHeader>
          <DialogTitle>
            <div className={styles.title}>
              <Copy className={styles.titleIcon} />
              Duplicar Proposta
            </div>
          </DialogTitle>
          <DialogDescription>
            Criar uma cópia da proposta <strong>{proposalNumber}</strong> como novo rascunho.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.content}>
          <div className={styles.section}>
            <Label htmlFor="client-select" className={styles.label}>
              Cliente para a nova proposta
            </Label>
            <Select 
              value={selectedClientId} 
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger className={styles.select}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={currentClientId}>
                  <div className={styles.clientOption}>
                    <User className={styles.clientIcon} />
                    <div>
                      <div className={styles.clientName}>{currentClientName}</div>
                      <div className={styles.clientMeta}>Cliente atual</div>
                    </div>
                  </div>
                </SelectItem>
                
                {clients
                  .filter(client => client.id !== currentClientId)
                  .map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className={styles.clientOption}>
                        <User className={styles.clientIcon} />
                        <div>
                          <div className={styles.clientName}>{client.name}</div>
                          {client.email && (
                            <div className={styles.clientMeta}>{client.email}</div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            {isDifferentClient && (
              <div className={styles.warning}>
                <AlertCircle className={styles.warningIcon} />
                <div className={styles.warningContent}>
                  <p className={styles.warningTitle}>Cliente diferente selecionado</p>
                  <p className={styles.warningText}>
                    A nova proposta será criada para <strong>{selectedClient.name}</strong> 
                    em vez do cliente original.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>O que será duplicado:</h4>
            <ul className={styles.infoList}>
              <li>Todos os produtos e serviços</li>
              <li>Valores e descontos</li>
              <li>Configurações de comissão</li>
              <li>Observações (com referência à proposta original)</li>
            </ul>
          </div>

          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>O que será alterado:</h4>
            <ul className={styles.infoList}>
              <li>Novo número de proposta</li>
              <li>Status inicial: Rascunho</li>
              <li>Data de validade: 30 dias a partir de hoje</li>
              <li>Você será definido como responsável</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <div className={styles.footer}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDuplicate} 
            disabled={loading}
            className={styles.duplicateButton}
          >
            {loading ? (
              'Duplicando...'
            ) : (
              <>
                <Copy className={styles.buttonIcon} />
                Duplicar Proposta
              </>
            )}
          </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}