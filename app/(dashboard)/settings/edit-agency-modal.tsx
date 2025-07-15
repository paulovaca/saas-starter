'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Building, Globe, Phone, Mail, MapPin, FileText } from 'lucide-react';
import styles from './settings.module.css';
import { updateAgencyData } from './actions';

interface EditAgencyModalProps {
  agency: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    description?: string | null;
  };
}

export function EditAgencyModal({ agency }: EditAgencyModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const closeModal = () => {
    router.push('/settings');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateAgencyData(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.success });
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro desconhecido' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <Card className={styles.modalCard}>
          <CardHeader className={styles.modalHeader}>
            <div className={styles.modalTitleContainer}>
              <CardTitle className={styles.modalTitle}>
                <Building className={styles.modalIcon} />
                Editar Dados da Agência
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className={styles.closeButton}
              >
                <X className={styles.closeIcon} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className={styles.modalBody}>
            <form onSubmit={handleSubmit} className={styles.agencyForm}>
              <div className={styles.formField}>
                <Label htmlFor="name" className={styles.fieldLabel}>
                  <Building className={styles.fieldIcon} />
                  Nome da Agência *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={agency.name}
                  placeholder="Nome da agência"
                  required
                />
              </div>

              <div className={styles.formField}>
                <Label htmlFor="email" className={styles.fieldLabel}>
                  <Mail className={styles.fieldIcon} />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={agency.email}
                  placeholder="contato@agencia.com"
                  required
                />
              </div>

              <div className={styles.formField}>
                <Label htmlFor="phone" className={styles.fieldLabel}>
                  <Phone className={styles.fieldIcon} />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={agency.phone || ''}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className={styles.formField}>
                <Label htmlFor="website" className={styles.fieldLabel}>
                  <Globe className={styles.fieldIcon} />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={agency.website || ''}
                  placeholder="https://www.agencia.com"
                />
              </div>

              <div className={styles.formField}>
                <Label htmlFor="address" className={styles.fieldLabel}>
                  <MapPin className={styles.fieldIcon} />
                  Endereço
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={agency.address || ''}
                  placeholder="Endereço completo da agência"
                />
              </div>

              <div className={styles.formField}>
                <Label htmlFor="description" className={styles.fieldLabel}>
                  <FileText className={styles.fieldIcon} />
                  Descrição
                </Label>
                <textarea
                  id="description"
                  name="description"
                  className={styles.textarea}
                  defaultValue={agency.description || ''}
                  placeholder="Descrição da agência e seus serviços"
                  rows={4}
                />
              </div>

              {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
