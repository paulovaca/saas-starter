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
    // Aqui será implementada a lógica de criação
    console.log('Criar cliente:', data);
    // Após criar o cliente, redirecionar para a lista
    router.push('/clients');
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
