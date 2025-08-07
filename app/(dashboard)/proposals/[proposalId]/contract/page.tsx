import { notFound, redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { proposals } from '@/lib/db/schema/clients';
import { getCurrentUser } from '@/lib/auth/session';
import { PageHeader } from '@/components/ui/page-header';
import ContractDataForm from '@/components/proposals/contract/contract-data-form';
import ProposalStatusBadge from '@/components/proposals/status/status-badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProposalStatusType } from '@/lib/types/proposal';
import styles from './contract.module.css';

interface Props {
  params: Promise<{ proposalId: string }>;
}

export default async function ContractDataPage({ params }: Props) {
  const { proposalId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar proposta
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(
      and(
        eq(proposals.id, proposalId),
        eq(proposals.agencyId, user.agencyId)
      )
    );

  if (!proposal) {
    notFound();
  }

  // Verificar se proposta está no status correto
  if (proposal.status !== 'contract') {
    redirect(`/proposals/${proposalId}`);
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Dados do Contrato"
        description={`Proposta ${proposal.proposalNumber}`}
      >
        <div className={styles.headerActions}>
          <ProposalStatusBadge status={proposal.status as ProposalStatusType} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/proposals/${proposalId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className={styles.content}>
        <ContractDataForm
          proposalId={proposalId}
          initialData={proposal.contractData as any}
          contractUrl={proposal.contractUrl || undefined}
          approvalEvidence={proposal.approvalEvidence || undefined}
        />
      </div>
    </div>
  );
}