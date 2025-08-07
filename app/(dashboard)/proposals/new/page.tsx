import { Suspense } from 'react';
import NewProposalContent from '@/components/proposals/new-proposal-content';
import styles from './new-proposal.module.css';

function NewProposalSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.loadingMessage}>Carregando...</div>
      </div>
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={<NewProposalSkeleton />}>
      <NewProposalContent />
    </Suspense>
  );
}