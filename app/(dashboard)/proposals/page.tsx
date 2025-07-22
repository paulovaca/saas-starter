import { Metadata } from 'next/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import styles from './proposals.module.css';

export const metadata: Metadata = {
  title: 'Propostas',
  description: 'Gerencie as propostas de venda',
};

export default function ProposalsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Propostas
        </h1>
        <p className={styles.description}>
          Gerencie propostas de venda e acompanhe o pipeline
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <FileText className={styles.icon} />
            Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta funcionalidade será implementada na Fase 3 do projeto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
