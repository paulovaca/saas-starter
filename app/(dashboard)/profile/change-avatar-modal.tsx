'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import styles from './profile.module.css';
import { updateAvatar } from './actions';

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateAvatar(formData);
      
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
                <Camera className={styles.modalIcon} />
                Alterar Foto do Perfil
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
            <form onSubmit={handleSubmit} className={styles.avatarForm}>
              <div className={styles.avatarPreviewContainer}>
                <Avatar className={styles.avatarPreview}>
                  <AvatarImage 
                    src={previewUrl || user.avatar || ''} 
                    alt={user.name} 
                  />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className={styles.uploadSection}>
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
                <p className={styles.uploadHelp}>
                  Insira a URL de uma imagem para usar como avatar
                </p>
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Foto'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
