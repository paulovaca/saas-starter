import { getOperatorDetails } from '@/lib/actions/operators/get-operator-details';
import { OperatorDetailsContent } from '@/components/operators/operator-details-content';
import { getUser } from '@/lib/db/queries/auth';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import styles from './page.module.css';

// Força a página a ser dinâmica e não usar cache
export const dynamic = 'force-dynamic';

interface OperatorDetailsPageProps {
  params: Promise<{
    operatorId: string;
  }>;
}

export async function generateMetadata({ params }: OperatorDetailsPageProps): Promise<Metadata> {
  const { operatorId } = await params;
  const result = await getOperatorDetails(operatorId);
  
  if (!result.success || !result.data) {
    return {
      title: 'Operadora não encontrada',
    };
  }

  return {
    title: `${result.data.name} - Operadora`,
    description: `Detalhes da operadora ${result.data.name}`,
  };
}

export default async function OperatorDetailsPage({ params }: OperatorDetailsPageProps) {
  const user = await getUser();
  
  // Verificar se o usuário tem permissão para acessar operadoras
  if (!user || !['DEVELOPER', 'MASTER', 'ADMIN'].includes(user.role)) {
    redirect('/');
  }

  const { operatorId } = await params;
  const result = await getOperatorDetails(operatorId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <OperatorDetailsContent operator={result.data} />
    </div>
  );
}
