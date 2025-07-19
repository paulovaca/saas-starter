'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Building, Globe, Phone, Mail, MapPin, FileText, Save, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './settings.module.css';
import { updateAgencyData } from './actions';
import { usePhoneMask, getUnformattedPhone } from '@/hooks/use-phone-mask';

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
  
  const phoneMask = usePhoneMask(agency.phone || '');

  const closeModal = () => {
    router.push('/settings');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    
    // Convert formatted phone back to unformatted for storage
    const formattedPhone = formData.get('phone') as string;
    if (formattedPhone) {
      formData.set('phone', getUnformattedPhone(formattedPhone));
    }
    
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
      <div className={styles.modernModalContent}>
        <Card className={styles.modernModalCard}>
          <CardHeader className={styles.modernModalHeader}>
            <div className={styles.modalTitleContainer}>
              <div className={styles.titleWithIcon}>
                <div className={styles.iconContainer}>
                  <Building className={styles.modalIcon} />
                </div>
                <div>
                  <CardTitle className={styles.modernModalTitle}>
                    Editar Dados da Agência
                  </CardTitle>
                  <p className={styles.modalSubtitle}>
                    Atualize as informações da sua agência
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className={styles.modernCloseButton}
              >
                <X className={styles.closeIcon} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className={styles.modernModalBody}>
            <form onSubmit={handleSubmit} className={styles.modernAgencyForm}>
              <div className={styles.formRow}>
                <div className={styles.modernFormField}>
                  <Label htmlFor="name" className={styles.modernFieldLabel}>
                    <Building className={styles.fieldIcon} />
                    Nome da Agência *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={agency.name}
                    placeholder="Nome da agência"
                    className={styles.modernInput}
                    required
                  />
                </div>

                <div className={styles.modernFormField}>
                  <Label htmlFor="email" className={styles.modernFieldLabel}>
                    <Mail className={styles.fieldIcon} />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={agency.email}
                    placeholder="contato@agencia.com"
                    className={styles.modernInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.modernFormField}>
                  <Label htmlFor="phone" className={styles.modernFieldLabel}>
                    <Phone className={styles.fieldIcon} />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phoneMask.value}
                    onChange={phoneMask.onChange}
                    placeholder="(11) 99999-9999"
                    className={styles.modernInput}
                    maxLength={15}
                  />
                </div>

                <div className={styles.modernFormField}>
                  <Label htmlFor="website" className={styles.modernFieldLabel}>
                    <Globe className={styles.fieldIcon} />
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={agency.website || ''}
                    placeholder="https://www.agencia.com"
                    className={styles.modernInput}
                  />
                </div>
              </div>

              <div className={styles.modernFormField}>
                <Label htmlFor="address" className={styles.modernFieldLabel}>
                  <MapPin className={styles.fieldIcon} />
                  Endereço
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={agency.address || ''}
                  placeholder="Endereço completo da agência"
                  className={styles.modernInput}
                />
              </div>

              <div className={styles.modernFormField}>
                <Label htmlFor="description" className={styles.modernFieldLabel}>
                  <FileText className={styles.fieldIcon} />
                  Descrição
                </Label>
                <textarea
                  id="description"
                  name="description"
                  className={styles.modernTextarea}
                  defaultValue={agency.description || ''}
                  placeholder="Descrição da agência e seus serviços"
                  rows={4}
                />
              </div>

              {message && (
                <div className={`${styles.modernMessage} ${styles[message.type]}`}>
                  {message.type === 'success' ? (
                    <CheckCircle className={styles.messageIcon} />
                  ) : (
                    <AlertCircle className={styles.messageIcon} />
                  )}
                  {message.text}
                </div>
              )}

              <div className={styles.modernModalActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className={styles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.saveButton}
                >
                  <Save className={styles.buttonIcon} />
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
