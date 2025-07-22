'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, FormModal, ConfirmModal } from '@/components/ui';
import { useModal } from '@/lib/hooks/use-modal';
import styles from './page.module.css';

export default function TestModalsPage() {
  const basicModal = useModal();
  const formModal = useModal();
  const confirmModal = useModal();
  const dangerModal = useModal();

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Formulário enviado: ${formData.name} - ${formData.email}`);
    setIsSubmitting(false);
    formModal.close();
    setFormData({ name: '', email: '' });
  };

  const handleDangerAction = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Ação perigosa executada!');
  };

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle>Teste do Sistema de Modais</CardTitle>
          <CardDescription>
            Teste dos novos componentes modais reutilizáveis
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.buttonGrid}>
            <Button onClick={basicModal.open} variant="outline">
              Modal Básico
            </Button>
            
            <Button onClick={formModal.open} variant="outline">
              Modal de Formulário
            </Button>
            
            <Button onClick={confirmModal.open} variant="outline">
              Modal de Confirmação
            </Button>
            
            <Button onClick={dangerModal.open} variant="destructive">
              Ação Perigosa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Básico */}
      <Modal
        isOpen={basicModal.isOpen}
        onClose={basicModal.close}
        title="Modal Básico"
        description="Este é um modal básico de exemplo"
        size="md"
      >
        <div className={styles.modalContent}>
          <p>
            Este é o conteúdo do modal básico. Você pode adicionar qualquer conteúdo aqui.
          </p>
          <p>
            O modal suporta diferentes tamanhos: sm, md, lg, xl, e full.
          </p>
        </div>
      </Modal>

      {/* Modal de Formulário */}
      <FormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title="Formulário de Teste"
        description="Preencha os dados abaixo"
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Enviar Dados"
      >
        <div className={styles.modalContent}>
          <div className={styles.formField}>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite seu nome"
            />
          </div>
          <div className={styles.formField}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Digite seu email"
            />
          </div>
        </div>
      </FormModal>

      {/* Modal de Confirmação Simples */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        title="Confirmar Ação"
        description="Tem certeza de que deseja prosseguir com esta ação?"
        onConfirm={() => {
          alert('Ação confirmada!');
          confirmModal.close();
        }}
        variant="info"
      />

      {/* Modal de Confirmação Perigosa */}
      <ConfirmModal
        isOpen={dangerModal.isOpen}
        onClose={dangerModal.close}
        title="Ação Perigosa"
        description="Esta é uma ação irreversível. Digite 'DELETAR' para confirmar."
        requiredConfirmation="DELETAR"
        onConfirm={handleDangerAction}
        confirmText="Executar"
        variant="danger"
      />
    </div>
  );
}