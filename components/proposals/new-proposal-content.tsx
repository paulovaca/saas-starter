'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CreateProposalModal from '@/components/proposals/create-proposal-modal';
import { getProposal } from '@/lib/actions/proposals/get-proposal';
import { createProposal } from '@/lib/actions/proposals/create-proposal';
import { toast } from 'sonner';
import styles from './new-proposal-content.module.css';

export default function NewProposalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  
  const [showModal, setShowModal] = useState(false);
  const [duplicateData, setDuplicateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load proposal data if duplicating
  useEffect(() => {
    const loadProposalForDuplication = async () => {
      if (!duplicateId) {
        setShowModal(true);
        return;
      }

      setLoading(true);
      try {
        const result = await getProposal({ proposalId: duplicateId });
        
        console.log('📋 Raw proposal data from getProposal:', result.data);
        console.log('📋 FunnelId:', result.data?.funnelId);
        console.log('📋 FunnelStageId:', result.data?.funnelStageId);
        
        if (result.success && result.data) {
          // Prepare data for duplication (remove IDs and status-specific fields)
          const proposalData = {
            clientId: result.data.clientId,
            operatorId: result.data.operatorId,
            funnelId: result.data.funnelId,
            funnelStageId: result.data.funnelStageId,
            validUntil: (() => {
              const date = new Date();
              date.setDate(date.getDate() + 30); // 30 days from now
              return date.toISOString().split('T')[0];
            })(),
            paymentMethod: result.data.paymentMethod || '',
            notes: result.data.notes || '',
            internalNotes: result.data.internalNotes || '',
            items: result.data.items?.map((item: any) => ({
              operatorId: item.operatorId || result.data.operatorId,
              operatorName: item.operatorName || result.data.operator?.name || '',
              baseItemId: item.baseItemId,
              baseItemName: item.baseItemName || item.name,
              name: item.name,
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.unitPrice) || 0,
              customFields: item.customFields || {},
            })) || [],
          };
          
          console.log('🔄 Original proposal data:', result.data);
          console.log('🔄 Prepared duplication data:', proposalData);
          console.log('🔄 FunnelId in prepared data:', proposalData.funnelId);
          console.log('🔄 FunnelStageId in prepared data:', proposalData.funnelStageId);
          
          setDuplicateData(proposalData);
          setShowModal(true);
        } else {
          throw new Error(!result.success ? result.error : 'Erro ao carregar proposta');
        }
      } catch (err) {
        console.error('Error loading proposal for duplication:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar proposta para duplicação');
      } finally {
        setLoading(false);
      }
    };

    loadProposalForDuplication();
  }, [duplicateId]);

  const handleCreateProposal = async (proposalData: any) => {
    try {
      console.log('🚀 Creating proposal with data:', proposalData);
      console.log('🚀 FunnelId being sent:', proposalData.funnelId);
      console.log('🚀 FunnelStageId being sent:', proposalData.funnelStageId);
      console.log('🚀 Full proposal object:', JSON.stringify(proposalData, null, 2));
      
      // Criar proposta no banco de dados
      const result = await createProposal(proposalData);
      
      if (result.success) {
        toast.success(`Proposta criada com sucesso!`);
        router.push('/proposals');
      } else {
        throw new Error('Erro ao criar proposta');
      }
    } catch (error) {
      console.error('Error in handleCreateProposal:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar proposta');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/proposals');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Carregando dados para duplicação...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{error}</div>
        <Button onClick={() => router.push('/proposals')} variant="outline">
          Voltar para Propostas
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.newProposalPage}>
      <div className={styles.header}>
        <Button
          variant="outline"
          onClick={() => router.push('/proposals')}
          className={styles.backButton}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Propostas
        </Button>
        <h1 className={styles.title}>
          {duplicateId ? 'Duplicar Proposta' : 'Nova Proposta'}
        </h1>
        <p className={styles.subtitle}>
          {duplicateId 
            ? 'Criando uma nova proposta baseada na proposta existente'
            : 'Preencha os dados para criar uma nova proposta'
          }
        </p>
      </div>

      {showModal && (
        <CreateProposalModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleCreateProposal}
          initialData={duplicateData}
          isDuplicate={!!duplicateId}
        />
      )}
    </div>
  );
}