import { Metadata } from 'next/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Relatórios',
  description: 'Visualize relatórios e métricas da agência',
};

export default function ReportsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
          Relatórios
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', margin: '0' }}>
          Visualize métricas e relatórios de desempenho
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
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
