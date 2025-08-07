import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProposalDetailsContent from '@/components/proposals/proposal-details-content';
import styles from './proposal-details.module.css';

interface ProposalDetailsPageProps {
  params: Promise<{ proposalId: string }>;
}

function ProposalDetailsSkeleton() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}>Carregando proposta...</div>
    </div>
  );
}

export default async function ProposalDetailsPage({ params }: ProposalDetailsPageProps) {
  const { proposalId } = await params;
  
  // Validar se o ID é válido
  if (!proposalId || typeof proposalId !== 'string') {
    notFound();
  }

  return (
    <div className={styles.proposalDetailsPage}>
      <Suspense fallback={<ProposalDetailsSkeleton />}>
        <ProposalDetailsContent proposalId={proposalId} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: ProposalDetailsPageProps) {
  const { proposalId } = await params;
  
  return {
    title: `Proposta ${proposalId} | SaaS Starter`,
    description: `Detalhes da proposta ${proposalId}`,
  };
}