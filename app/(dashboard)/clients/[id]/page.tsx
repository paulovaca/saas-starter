import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ClientDetailsContent from '@/components/clients/client-details-content';
import ClientDetailsSkeleton from '@/components/clients/client-details-skeleton';
import styles from './client-details.module.css';

interface ClientDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  const { id } = await params;
  
  // Validar se o ID é válido
  if (!id || typeof id !== 'string') {
    notFound();
  }

  return (
    <div className={styles.clientDetailsPage}>
      <Suspense fallback={<ClientDetailsSkeleton />}>
        <ClientDetailsContent clientId={id} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: ClientDetailsPageProps) {
  const { id } = await params;
  
  // Aqui seria buscado o nome do cliente para o título
  // Por enquanto, título genérico
  return {
    title: `Detalhes do Cliente | SaaS Starter`,
    description: `Visualizar detalhes completos do cliente incluindo informações pessoais, histórico de interações, tarefas e propostas.`,
  };
}
