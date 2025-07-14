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
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {mode === 'signin'
            ? 'Entrar na sua conta'
            : 'Criar conta da agência'}
        </h2>
        {mode === 'signup' && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Crie sua agência de viagens e comece a gerenciar seus clientes
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          
          {mode === 'signup' && (
            <>
              <div>
                <Label
                  htmlFor="agencyName"
                  className="block text-sm font-medium text-foreground"
                >
                  Nome da Agência
                </Label>
                <div className="mt-1">                <Input
                  id="agencyName"
                  name="agencyName"
                  type="text"
                  autoComplete="organization"
                  defaultValue={state?.agencyName || ''}
                  required
                  maxLength={255}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                  placeholder="Ex: Viagens & Turismo LTDA"
                />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  Seu Nome
                </Label>
                <div className="mt-1">                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={state?.name || ''}
                  required
                  maxLength={255}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                  placeholder="Seu nome completo"
                />
                </div>
              </div>
            </>
          )}

          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state?.email || ''}
                required
                maxLength={255}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                placeholder={mode === 'signup' ? 'Email da agência' : 'Seu email'}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Senha
            </Label>
            <div className="mt-1">
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
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-input placeholder:text-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm"
                placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : 'Sua senha'}
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-destructive text-sm">{state.error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Processando...
                </>
              ) : mode === 'signin' ? (
                'Entrar'
              ) : (
                'Criar Agência'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                {mode === 'signin'
                  ? 'Ainda não tem agência?'
                  : 'Já tem uma conta?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${redirect}` : ''
              }`}
              className="w-full flex justify-center py-2 px-4 border border-border rounded-full shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              {mode === 'signin'
                ? 'Cadastrar nova agência'
                : 'Entrar em conta existente'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
