import { Metadata } from 'next/types';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { BaseItemsPageContent } from '@/components/catalog/base-items-page-content';
import { CatalogPageSkeleton } from '@/components/catalog/catalog-page-skeleton';
import styles from './catalog.module.css';

export const metadata: Metadata = {
  title: 'Itens Base',
  description: 'Gerencie os itens base para criação de propostas',
};

export default async function BaseItemsPage() {
  // Verificar autenticação e permissões
  const session = await auth();
  
  if (!session?.user) {
    redirect('/sign-in');
  }

  // Apenas Master e Admin podem acessar itens base
  if (!['MASTER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard'); // ou página de acesso negado
  }

  return (
    <div className={styles.catalogPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Itens Base</h1>
        <p className={styles.description}>
          Gerencie os itens base utilizados na criação de propostas
        </p>
      </div>

      <Suspense fallback={<CatalogPageSkeleton />}>
        <BaseItemsPageContent />
      </Suspense>
    </div>
  );
}
