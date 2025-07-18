'use client';

import { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import ClientForm from '@/components/clients/forms/client-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './edit-client.module.css';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // Validar se o ID é válido
  if (!id || typeof id !== 'string') {
    notFound();
  }

  const handleSubmit = async (data: any) => {
    // Aqui será implementada a lógica de edição
    console.log('Editar cliente:', id, data);
    // Após editar, redirecionar para os detalhes do cliente
    router.push(`/clients/${id}`);
  };

  const handleCancel = () => {
    router.push(`/clients/${id}`);
  };
  
  return (
    <div className={styles.editClientPage}>
      {/* Header */}
      <div className={styles.editClientHeader}>
        <Link href={`/clients/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className={styles.backIcon} />
            Voltar
          </Button>
        </Link>
        <h1 className={styles.editClientTitle}>Editar Cliente</h1>
      </div>

      {/* Formulário */}
      <div className={styles.editClientContent}>
        <Suspense fallback={<div className={styles.editClientLoadingMessage}>Carregando formulário...</div>}>
          <ClientForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Salvar Alterações"
          />
        </Suspense>
      </div>
    </div>
  );
}
