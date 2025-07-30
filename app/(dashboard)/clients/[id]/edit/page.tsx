import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { EditClientForm } from './edit-client-form';
import { getClientWithDetails } from '@/lib/db/queries/clients';
import { auth } from '@/lib/auth/auth';
import styles from './edit-client.module.css';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    notFound();
  }
  
  const { id } = await params;
  
  // Validar se o ID é válido
  if (!id || typeof id !== 'string') {
    notFound();
  }

  // Buscar dados do cliente
  const client = await getClientWithDetails(id, session.user.agencyId);
  
  if (!client) {
    notFound();
  }
  
  return (
    <div className={styles.editClientPage}>
      <Suspense fallback={<div className={styles.editClientLoadingMessage}>Carregando...</div>}>
        <EditClientForm clientId={id} initialData={client} />
      </Suspense>
    </div>
  );
}
