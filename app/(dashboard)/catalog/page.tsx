import { Metadata } from 'next/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Gerencie o catálogo de produtos e serviços',
};

export default function CatalogPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
          Catálogo
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', margin: '0' }}>
          Configure produtos e serviços oferecidos pela sua agência
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
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
