import { Metadata } from 'next/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import styles from './reports.module.css';

export const metadata: Metadata = {
  title: 'Relatórios',
  description: 'Visualize relatórios e métricas da agência',
};

export default function ReportsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Relatórios
        </h1>
        <p className={styles.description}>
          Visualize métricas e relatórios de desempenho
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <BarChart3 className={styles.icon} />
            Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta funcionalidade será implementada na Fase 5 do projeto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
