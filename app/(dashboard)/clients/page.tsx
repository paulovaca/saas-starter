import { Metadata } from 'next/types';
import { Suspense } from 'react';
import ClientsPageContent from '@/components/clients/clients-page-content';
import ClientsPageSkeleton from '@/components/clients/clients-page-skeleton';
import styles from './clients.module.css';

export const metadata: Metadata = {
  title: 'Clientes',
  description: 'Gerencie os clientes da sua agência',
};

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string;
    funnelId?: string;
    funnelStageId?: string;
    userId?: string;
    documentType?: string;
    city?: string;
    state?: string;
    status?: string;
    page?: string;
    limit?: string;
    view?: 'grid' | 'table';
  }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  
  return (
    <div className={styles.clientsContainer}>
      <Suspense fallback={<ClientsPageSkeleton />}>
        <ClientsPageContent searchParams={params} />
      </Suspense>
    </div>
  );
}
