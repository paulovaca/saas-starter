'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ClientForm from '@/components/clients/forms/client-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { updateClient } from '@/lib/actions/clients';
import { useToast } from '@/components/ui/toast';
import styles from './edit-client.module.css';

interface EditClientFormProps {
  clientId: string;
  initialData: any;
}

export function EditClientForm({ clientId, initialData }: EditClientFormProps) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await updateClient({
        clientId,
        ...data
      });
      
      if ('error' in result) {
        showError('Erro ao atualizar cliente', result.error);
      } else {
        showSuccess('Cliente atualizado', 'Os dados do cliente foram atualizados com sucesso.');
        router.push(`/clients/${clientId}`);
      }
    } catch (error) {
      showError('Erro ao atualizar cliente', 'Ocorreu um erro ao atualizar os dados do cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/clients/${clientId}`);
  };

  // Converter dados do cliente para o formato esperado pelo formulário
  const formData = {
    id: initialData.id,
    name: initialData.name,
    email: initialData.email,
    phone: initialData.phone || '',
    documentType: initialData.documentType,
    documentNumber: initialData.documentNumber,
    birthDate: initialData.birthDate ? new Date(initialData.birthDate) : undefined,
    addressZipcode: initialData.addressZipcode || '',
    addressStreet: initialData.addressStreet || '',
    addressNumber: initialData.addressNumber || '',
    addressComplement: initialData.addressComplement || '',
    addressNeighborhood: initialData.addressNeighborhood || '',
    addressCity: initialData.addressCity || '',
    addressState: initialData.addressState || '',
    notes: initialData.notes || '',
    isActive: initialData.isActive,
  };
  
  return (
    <>
      {/* Header */}
      <div className={styles.editClientHeader}>
        <Link href={`/clients/${clientId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className={styles.backIcon} />
            Voltar
          </Button>
        </Link>
        <h1 className={styles.editClientTitle}>Editar Cliente</h1>
      </div>

      {/* Formulário */}
      <div className={styles.editClientContent}>
        <ClientForm 
          initialData={formData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar Alterações"
          isLoading={isLoading}
        />
      </div>
    </>
  );
}