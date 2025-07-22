'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormModal } from '@/components/ui/form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from './actions';
import modalStyles from './edit-profile-modal.module.css';

interface EditProfileModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const closeModal = () => {
    router.push('/profile');
  };

  const handleSubmit = async () => {
    setMessage(null);
    const form = document.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.success });
      setTimeout(() => {
        closeModal();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro desconhecido' });
      throw new Error(result.error || 'Erro desconhecido');
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      title="Editar Perfil"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      size="md"
    >
      <div className={modalStyles.formContainer}>
        <div>
          <Label htmlFor="name">
            Nome Completo
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name}
            placeholder="Digite seu nome completo"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            placeholder="Digite seu e-mail"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">
            Telefone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone || ''}
            placeholder="Digite seu telefone"
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
