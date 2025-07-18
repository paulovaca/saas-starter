'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './new-client.module.css';
import NewClientContent from './new-client-content';

export default function NewClientPage() {
  return (
    <div className={styles.newClientPage}>
      {/* Header */}
      <div className={styles.newClientHeader}>
        <Link href="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className={styles.backIcon} />
            Voltar
          </Button>
        </Link>
        <h1 className={styles.newClientTitle}>Novo Cliente</h1>
      </div>

      {/* Conteúdo */}
      <div className={styles.newClientContent}>
        <Suspense fallback={<div className={styles.newClientLoadingMessage}>Carregando formulário...</div>}>
          <NewClientContent />
        </Suspense>
      </div>
    </div>
  );
}
