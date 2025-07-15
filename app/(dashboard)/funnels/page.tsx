import { Metadata } from 'next/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Funis de Venda',
  description: 'Gerencie os funis de venda da sua agência',
};

export default function FunnelsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
          Funis de Venda
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', margin: '0' }}>
          Configure e gerencie os funis de venda da sua agência
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
            Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta funcionalidade será implementada na Fase 2 do projeto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
