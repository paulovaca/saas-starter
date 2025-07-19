'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Upload, UserIcon, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserSchema, updateUserSchema, type CreateUserData, type UpdateUserData } from '@/lib/validations/users/user.schema';
import { createUser } from '@/lib/actions/users/create-user';
import { updateUser } from '@/lib/actions/users/update-user';
import type { User, UserListItem } from '@/lib/db/schema';
import styles from './user-form-modal.module.css';

type UserFormModalProps = {
  children: React.ReactNode;
  user?: User | UserListItem;
  currentUserRole: 'DEVELOPER' | 'MASTER' | 'ADMIN' | 'AGENT';
  onSuccess?: () => void;
};

export function UserFormModal({ children, user, currentUserRole, onSuccess }: UserFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user;
  const schema = isEditing ? updateUserSchema : createUserSchema;

  // LIMPAR qualquer cache de formulário no localStorage/sessionStorage
  useEffect(() => {
    // Limpar qualquer cache relacionado a formulários de usuário
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('user-form') || key.includes('react-hook-form'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Fazer o mesmo para sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('user-form') || key.includes('react-hook-form'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
  }, []);

  // Definir quais roles o usuário atual pode criar
  const getAvailableRoles = () => {
    switch (currentUserRole) {
      case 'DEVELOPER':
        return [
          { value: 'MASTER', label: 'Master - Dono da agência (acesso total)' },
          { value: 'ADMIN', label: 'Administrador - Gerencia usuários e configurações' },
          { value: 'AGENT', label: 'Agente - Acesso básico ao sistema' }
        ];
      case 'MASTER':
        return [
          { value: 'ADMIN', label: 'Administrador - Gerencia usuários e configurações' },
          { value: 'AGENT', label: 'Agente - Acesso básico ao sistema' }
        ];
      case 'ADMIN':
        return [
          { value: 'AGENT', label: 'Agente - Acesso básico ao sistema' }
        ];
      default:
        return [];
    }
  };

  const availableRoles = getAvailableRoles();
  
  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Não formatar se não tiver números
    if (!numbers) return '';
    
    // Limitar a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Formatar com base na quantidade de dígitos
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers}`;
    } else if (limitedNumbers.length <= 6) {
      return limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (limitedNumbers.length <= 10) {
      // Formato: (11) 9999-9999
      return limitedNumbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else {
      // Formato: (11) 99999-9999
      return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Estado para valor do telefone formatado
  const [phoneValue, setPhoneValue] = useState('');
  
  // Usar formulário sem qualquer valor padrão para evitar cache
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError: setFormError,
  } = useForm({
    // SEM defaultValues para evitar qualquer cache ou persistência
  });

  // FORÇAR reset completo a cada abertura do modal
  useEffect(() => {
    if (isOpen) {
      // SEMPRE resetar primeiro para limpar qualquer estado anterior
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'AGENT',
        isActive: true,
      });
      
      // Limpar estados locais
      setPhoneValue('');
      setAvatarPreview(null);
      setError(null);
      
      // SE estiver editando, então preencher (mas sempre começar vazio)
      if (isEditing && user) {
        // Usar setTimeout para garantir que o reset aconteça primeiro
        setTimeout(() => {
          reset({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive,
          });
          
          const formatted = formatPhone(user.phone || '');
          setPhoneValue(formatted);
          setAvatarPreview(user.avatar || null);
        }, 0);
      }
    }
  }, [isOpen, isEditing, user, reset]);

  // FORÇAR limpeza quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'AGENT',
        isActive: true,
      });
      setPhoneValue('');
      setAvatarPreview(null);
      setError(null);
    }
  }, [isOpen, reset]);

  // Registrar campo phone manualmente para funcionar com formatação
  useEffect(() => {
    register('phone');
  }, [register]);
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhone(inputValue);
    
    setPhoneValue(formatted);
    
    // Extrair apenas os números para salvar no formulário (limitado a 11 dígitos)
    const numbersOnly = inputValue.replace(/\D/g, '').slice(0, 11);
    setValue('phone', numbersOnly);
  };

  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const labels = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = password ? getPasswordStrength(password) : { strength: 0, label: '' };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setError(null);
    
    // Validação manual para senhas (quando criando usuário)
    if (!isEditing) {
      if (!data.password) {
        setError('A senha é obrigatória.');
        return;
      }
      
      if (data.password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      
      if (!/[a-z]/.test(data.password)) {
        setError('A senha deve conter pelo menos uma letra minúscula.');
        return;
      }
      
      if (!/[A-Z]/.test(data.password)) {
        setError('A senha deve conter pelo menos uma letra maiúscula.');
        return;
      }
      
      if (!/\d/.test(data.password)) {
        setError('A senha deve conter pelo menos um número.');
        return;
      }
      
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
        setError('A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>).');
        return;
      }
      
      if (!data.confirmPassword) {
        setError('A confirmação da senha é obrigatória.');
        return;
      }
      
      if (data.password !== data.confirmPassword) {
        setError('As senhas não coincidem. Verifique se digitou corretamente nos dois campos.');
        return;
      }
    }
    
    startTransition(async () => {
      try {
        let result;
        
        if (isEditing) {
          result = await updateUser(user.id, data);
        } else {
          result = await createUser(data);
        }

        if (result.error) {
          setError(result.error);
          return;
        }

        setIsOpen(false);
        
        // Limpar formulário após sucesso
        if (isEditing) {
          // Para edição, resetar com dados atualizados se necessário
          reset();
        } else {
          // Para criação, limpar completamente
          reset({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role: 'AGENT',
            isActive: true,
          });
        }
        
        setAvatarPreview(null);
        setPhoneValue('');
        setError(null);
        onSuccess?.();
      } catch (error) {
        setError('Erro inesperado. Verifique os dados e tente novamente.');
      }
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    
    if (isEditing) {
      // Para edição, resetar com os dados originais do usuário
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive,
      });
      setAvatarPreview(user?.avatar || null);
      setPhoneValue(user?.phone ? formatPhone(user.phone) : '');
    } else {
      // Para criação, resetar com valores vazios
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'AGENT',
        isActive: true,
      });
      setAvatarPreview(null);
      setPhoneValue('');
    }
  };

  // Permitir fechar o modal com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll da página quando o modal estiver aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2 className={styles.title}>
                {isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </h2>
              <button
                onClick={handleClose}
                className={styles.closeButton}
                type="button"
              >
                ×
              </button>
            </div>

            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className={styles.form}
              autoComplete="off"
              noValidate
            >
              {/* Campo oculto para confundir o autocomplete */}
              <input
                type="email"
                autoComplete="email"
                className={styles.hiddenField}
                tabIndex={-1}
              />
              <input
                type="password"
                autoComplete="current-password"
                className={styles.hiddenField}
                tabIndex={-1}
              />
              
              {/* Avatar Upload */}
              <div className={styles.avatarSection}>
                <Label htmlFor="avatar" className={styles.avatarLabel}>
                  Foto do Perfil
                </Label>
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarPreview}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className={styles.avatarImage} />
                    ) : (
                      <UserIcon className={styles.avatarPlaceholder} />
                    )}
                  </div>
                  <label htmlFor="avatar" className={styles.avatarUpload}>
                    <Upload className={styles.uploadIcon} />
                    <span>Alterar foto</span>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles.avatarInput}
                    />
                  </label>
                </div>
              </div>

              {/* Nome */}
              <div className={styles.fieldGroup}>
                <Label htmlFor="name" className={styles.label}>
                  <UserIcon className={styles.labelIcon} />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Digite o nome completo"
                  className={errors.name ? styles.inputError : styles.input}
                />
                {errors.name && (
                  <span className={styles.fieldError}>{String(errors.name.message)}</span>
                )}
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <Label htmlFor="email" className={styles.label}>
                  <Mail className={styles.labelIcon} />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="usuario@exemplo.com"
                  className={errors.email ? styles.inputError : styles.input}
                  autoComplete="new-email"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                />
                {errors.email && (
                  <span className={styles.fieldError}>{String(errors.email.message)}</span>
                )}
              </div>

              {/* Telefone */}
              <div className={styles.fieldGroup}>
                <Label htmlFor="phone" className={styles.label}>
                  <Phone className={styles.labelIcon} />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  className={errors.phone ? styles.inputError : styles.input}
                  maxLength={15}
                />
                {errors.phone && (
                  <span className={styles.fieldError}>{String(errors.phone.message)}</span>
                )}
              </div>

              {/* Role */}
              <div className={styles.fieldGroup}>
                <Label htmlFor="role" className={styles.label}>
                  <Shield className={styles.labelIcon} />
                  Permissão *
                </Label>
                <select
                  id="role"
                  {...register('role')}
                  className={errors.role ? styles.selectError : styles.select}
                >
                  {availableRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <span className={styles.fieldError}>{String(errors.role.message)}</span>
                )}
              </div>

              {/* Senha (apenas na criação) */}
              {!isEditing && (
                <>
                  <div className={styles.fieldGroup}>
                    <Label htmlFor="password" className={styles.label}>
                      Senha *
                    </Label>
                    <div className={styles.passwordContainer}>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Digite uma senha forte"
                        className={password && password !== confirmPassword && confirmPassword ? styles.inputError : styles.input}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-form-type="other"
                        data-lpignore="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.passwordToggle}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {password && (
                      <div className={styles.passwordStrength}>
                        <div className={styles.strengthBar}>
                          <div 
                            className={`${styles.strengthFill} ${styles[`strength${passwordStrength.strength}`]}`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={styles.strengthLabel}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    {errors.password && (
                      <span className={styles.fieldError}>{String(errors.password.message)}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <Label htmlFor="confirmPassword" className={styles.label}>
                      Confirmar Senha *
                    </Label>
                    <div className={styles.passwordContainer}>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        placeholder="Confirme a senha"
                        className={password && password !== confirmPassword && confirmPassword ? styles.inputError : styles.input}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-form-type="other"
                        data-lpignore="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={styles.passwordToggle}
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {password && password !== confirmPassword && confirmPassword && (
                      <span className={styles.fieldError}>As senhas não coincidem</span>
                    )}
                  </div>
                </>
              )}

              {/* Status */}
              <div className={styles.fieldGroup}>
                <Label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>Usuário ativo</span>
                </Label>
              </div>

              <div className={styles.actions}>
                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}
                <div className={styles.buttonsContainer}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={styles.submitButton}
                  >
                    {isPending ? (
                      <>
                        <div className={styles.spinner} />
                        {isEditing ? 'Salvando...' : 'Criando...'}
                      </>
                    ) : (
                      isEditing ? 'Salvar Alterações' : 'Criar Usuário'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
