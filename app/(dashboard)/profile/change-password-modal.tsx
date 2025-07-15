'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './profile.module.css';
import { changePassword } from './actions';

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    
    try {
      const result = await changePassword(formData);
      
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
                <Lock className={styles.modalIcon} />
                Alterar Senha
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
            <form onSubmit={handleSubmit} className={styles.passwordForm}>
              <div className={styles.formField}>
                <Label htmlFor="currentPassword" className={styles.fieldLabel}>
                  Senha Atual
                </Label>
                <div className={styles.passwordInputContainer}>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder="Digite sua senha atual"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={styles.passwordToggle}
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

              <div className={styles.formField}>
                <Label htmlFor="newPassword" className={styles.fieldLabel}>
                  Nova Senha
                </Label>
                <div className={styles.passwordInputContainer}>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="Digite a nova senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={styles.passwordToggle}
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className={styles.toggleIcon} />
                    ) : (
                      <Eye className={styles.toggleIcon} />
                    )}
                  </Button>
                </div>
                <p className={styles.fieldHelp}>
                  Mínimo de 8 caracteres
                </p>
              </div>

              <div className={styles.formField}>
                <Label htmlFor="confirmPassword" className={styles.fieldLabel}>
                  Confirmar Nova Senha
                </Label>
                <div className={styles.passwordInputContainer}>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirme a nova senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={styles.passwordToggle}
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
                  {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}