'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User } from 'lucide-react';
import styles from './profile.module.css';
import { updateProfile } from './actions';

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await updateProfile(formData);
      
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
                <User className={styles.modalIcon} />
                Editar Perfil
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
            <form onSubmit={handleSubmit} className={styles.profileForm}>
              <div className={styles.formField}>
                <Label htmlFor="name" className={styles.fieldLabel}>
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

              <div className={styles.formField}>
                <Label htmlFor="email" className={styles.fieldLabel}>
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
