'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormModal } from '@/components/ui/form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import { updateAvatar } from './actions';
import styles from './profile.module.css';
import modalStyles from './change-avatar-modal.module.css';

interface ChangeAvatarModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export function ChangeAvatarModal({ user }: ChangeAvatarModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.avatar || '');

  const closeModal = () => {
    router.push('/profile');
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewUrl(event.target.value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('avatarUrl', previewUrl);
    
    try {
      const result = await updateAvatar(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.success });
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro desconhecido' });
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      title="Alterar Foto do Perfil"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isSubmitting ? 'Salvando...' : 'Salvar Foto'}
      size="md"
    >
      <div className={modalStyles.formContainer}>
        <div className={styles.centerContainer}>
          <Avatar className={styles.previewAvatar}>
            <AvatarImage 
              src={previewUrl || user.avatar || ''} 
              alt={user.name} 
            />
            <AvatarFallback className={modalStyles.avatarFallback}>
              {user.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className={modalStyles.fieldContainer}>
          <Label htmlFor="avatarUrl">URL da Nova Foto</Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            placeholder="https://exemplo.com/minha-foto.jpg"
            value={previewUrl}
            onChange={handleUrlChange}
            required
          />
          <p className={styles.helpText}>
            Insira a URL de uma imagem para usar como avatar
          </p>
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
