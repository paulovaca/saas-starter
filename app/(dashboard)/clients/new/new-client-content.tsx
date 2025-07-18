'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientForm from '@/components/clients/forms/client-form';

export default function NewClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [funnelId, setFunnelId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const funnelIdParam = searchParams.get('funnelId');
    if (funnelIdParam) {
      setFunnelId(funnelIdParam);
    }
  }, [searchParams]);
  
  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          funnelId: funnelId || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar cliente');
      }

      const newClient = await response.json();
      console.log('Cliente criado:', newClient);
      
      // Redirecionar para a página de detalhes do cliente criado
      router.push(`/clients/${newClient.id}`);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error; // Re-throw para que o formulário possa tratar o erro
    }
  };

  const handleCancel = () => {
    router.push('/clients');
  };
  
  return (
    <ClientForm 
      initialData={funnelId ? { funnelId } : undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Criar Cliente"
    />
  );
}
