'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { signIn, signUp } from './actions';
import styles from './login.module.css';

type ActionState = {
  error?: string;
  email?: string;
  password?: string;
  name?: string;
  agencyName?: string;
};

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { 
      error: '',
      email: '',
      password: '',
      name: '',
      agencyName: ''
    }
  );

  return (
    <div className={styles.loginContainer}>
      <div className={styles.themeToggleContainer}>
        <ThemeToggle />
      </div>
      <div className={styles.logoContainer}>
        <div className={styles.logoWrapper}>
          <CircleIcon className={styles.logo} />
        </div>
        <h2 className={styles.title}>
          {mode === 'signin'
            ? 'Entrar na sua conta'
            : 'Criar conta da agência'}
        </h2>
        {mode === 'signup' && (
          <p className={styles.subtitle}>
            Crie sua agência de viagens e comece a gerenciar seus clientes
          </p>
        )}
      </div>

      <div className={styles.formContainer}>
        <form className={styles.form} action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          
          {mode === 'signup' && (
            <>
              <div className={styles.formGroup}>
                <Label htmlFor="agencyName">
                  Nome da Agência
                </Label>
                <Input
                  id="agencyName"
                  name="agencyName"
                  type="text"
                  autoComplete="organization"
                  defaultValue={state?.agencyName || ''}
                  required
                  maxLength={255}
                  placeholder="Ex: Viagens & Turismo LTDA"
                />
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="name">
                  Seu Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={state?.name || ''}
                  required
                  maxLength={255}
                  placeholder="Seu nome completo"
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state?.email || ''}
              required
              maxLength={255}
              placeholder={mode === 'signup' ? 'Email da agência' : 'Seu email'}
            />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="password">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              defaultValue={state?.password || ''}
              required
              minLength={8}
              maxLength={100}
              placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : 'Sua senha'}
            />
          </div>

          {state?.error && (
            <div className={styles.errorMessage}>{state.error}</div>
          )}

          <Button
            type="submit"
            className={styles.submitButton}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className={styles.loadingIcon} />
                Processando...
              </>
            ) : mode === 'signin' ? (
              'Entrar'
            ) : (
              'Criar Agência'
            )}
          </Button>
        </form>

        <div className={styles.switchLink}>
          <span className={styles.switchLinkText}>
            {mode === 'signin'
              ? 'Ainda não tem agência?'
              : 'Já tem uma conta?'}
          </span>
          <Link
            href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
              redirect ? `?redirect=${redirect}` : ''
            }`}
            className={styles.switchLinkButton}
          >
            {mode === 'signin'
              ? 'Cadastrar nova agência'
              : 'Entrar em conta existente'}
          </Link>
        </div>
      </div>
    </div>
  );
}
