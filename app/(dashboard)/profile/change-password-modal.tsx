'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { changePassword } from './actions';
import styles from './change-password-modal.module.css';

interface ChangePasswordModalProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function ChangePasswordModal({ user }: ChangePasswordModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const closeModal = () => {
    router.push('/profile');
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async () => {
    setMessage(null);

    // Get form data from the DOM since FormModal doesn't pass the event
    const form = document.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);
    
    const result = await changePassword(formData);
    
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
      title="Alterar Senha"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isSubmitting ? 'Alterando...' : 'Alterar Senha'}
      size="md"
    >
      <div className={styles.container}>
        <div>
          <Label htmlFor="currentPassword" className={styles.fieldLabel}>
            Senha Atual
          </Label>
          <div className={styles.passwordField}>
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              placeholder="Digite sua senha atual"
              required
              className={styles.passwordInput}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.toggleButton}
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? (
                <EyeOff className={styles.toggleIcon} />
              ) : (
                <Eye className={styles.toggleIcon} />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="newPassword" className={styles.fieldLabel}>
            Nova Senha
          </Label>
          <div className={styles.passwordField}>
            <Input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              placeholder="Digite a nova senha"
              required
              className={styles.passwordInput}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.toggleButton}
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? (
                <EyeOff className={styles.toggleIcon} />
              ) : (
                <Eye className={styles.toggleIcon} />
              )}
            </Button>
          </div>
          <p className={styles.helpText}>
            Mínimo de 8 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className={styles.fieldLabel}>
            Confirmar Nova Senha
          </Label>
          <div className={styles.passwordField}>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              placeholder="Confirme a nova senha"
              required
              className={styles.passwordInput}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.toggleButton}
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? (
                <EyeOff className={styles.toggleIcon} />
              ) : (
                <Eye className={styles.toggleIcon} />
              )}
            </Button>
          </div>
        </div>

        {message && (
          <div className={`${styles.messageContainer} ${
            message.type === 'success' 
              ? styles.messageSuccess
              : styles.messageError
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </FormModal>
  );
}