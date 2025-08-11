'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, Globe, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { updateAgencyData } from './actions';
import { usePhoneMask, getUnformattedPhone } from '@/hooks/use-phone-mask';
import styles from './settings.module.css';
import modalStyles from './edit-agency-modal.module.css';

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

  const handleSubmit = async () => {
    setMessage(null);
    setIsSubmitting(true);
    
    try {
      // Manually collect form data since there's no form element
      const formData = new FormData();
      
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const phoneInput = document.getElementById('phone') as HTMLInputElement;
      const websiteInput = document.getElementById('website') as HTMLInputElement;
      const addressInput = document.getElementById('address') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
      
      formData.set('name', nameInput?.value || '');
      formData.set('email', emailInput?.value || '');
      
      // Convert formatted phone back to unformatted for storage
      const formattedPhone = phoneInput?.value || '';
      if (formattedPhone) {
        formData.set('phone', getUnformattedPhone(formattedPhone));
      }
      
      formData.set('website', websiteInput?.value || '');
      formData.set('address', addressInput?.value || '');
      formData.set('description', descriptionInput?.value || '');
      
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
      console.error('Erro ao atualizar agência:', error);
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      title="Editar Dados da Agência"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      size="lg"
    >
      <div className={modalStyles.formContainer}>
        <div className={styles.formRow}>
          <div>
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
              required
            />
          </div>

          <div>
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
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div>
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
              maxLength={15}
            />
          </div>

          <div>
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
            />
          </div>
        </div>

        <div>
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
          />
        </div>

        <div>
          <Label htmlFor="description" className={styles.modernFieldLabel}>
            <FileText className={styles.fieldIcon} />
            Descrição
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={agency.description || ''}
            placeholder="Descrição da agência e seus serviços"
            rows={4}
          />
        </div>

        {message && (
          <div className={message.type === 'success' ? modalStyles.messageSuccess : modalStyles.messageError}>
            {message.text}
          </div>
        )}
      </div>
    </FormModal>
  );
}
