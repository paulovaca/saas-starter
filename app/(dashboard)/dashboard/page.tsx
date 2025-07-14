'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { Agency, User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

type AgencyData = {
  agency: Agency;
  user: User;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinatura da Agência</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function Subscription() {
  const { data: agencyData, error } = useSWR<AgencyData>('/api/agency', fetcher);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData) => {
      try {
        await customerPortalAction(formData);
        return { success: 'Redirecionando para o portal do cliente...' };
      } catch (error) {
        return { error: 'Erro ao acessar o portal do cliente' };
      }
    },
    {}
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura da Agência</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Erro ao carregar dados da agência</p>
        </CardContent>
      </Card>
    );
  }

  if (!agencyData || !agencyData.agency) {
    return <SubscriptionSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinatura da Agência</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Plano Atual: {agencyData.agency.planName || 'Gratuito'}
            </p>
            <p className="text-sm text-gray-600">
              Status: {agencyData.agency.subscriptionStatus === 'active'
                ? 'Ativo'
                : agencyData.agency.subscriptionStatus === 'trialing'
                ? 'Período de Teste'
                : 'Inativo'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <form action={formAction} className="w-full">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Gerenciar Assinatura'
            )}
          </Button>
        </form>
        {state?.error && (
          <p className="text-red-500 text-sm mt-2">{state.error}</p>
        )}
      </CardFooter>
    </Card>
  );
}

function AgencyInfo() {
  const { data: agencyData, error } = useSWR<AgencyData>('/api/agency', fetcher);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informações da Agência</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Erro ao carregar dados da agência</p>
        </CardContent>
      </Card>
    );
  }

  if (!agencyData || !agencyData.agency) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informações da Agência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Agência</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Nome da Agência:</p>
            <p className="text-sm text-gray-600">{agencyData.agency.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm text-gray-600">{agencyData.agency.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Usuário Master:</p>
            <p className="text-sm text-gray-600">{agencyData.user.name || agencyData.user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Data de Criação:</p>
            <p className="text-sm text-gray-600">
              {new Date(agencyData.agency.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações da Agência</h1>
        <p className="text-gray-600">
          Gerencie as configurações e assinatura da sua agência.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<SubscriptionSkeleton />}>
          <Subscription />
        </Suspense>
        
        <Suspense fallback={<SubscriptionSkeleton />}>
          <AgencyInfo />
        </Suspense>
      </div>
    </div>
  );
}