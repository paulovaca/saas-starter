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
import styles from './page.module.css';

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
        <div className={styles.skeletonContainer}>
          <div className={`${styles.skeletonLine} ${styles.large}`}></div>
          <div className={`${styles.skeletonLine} ${styles.medium}`}></div>
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
          <p className="text-destructive">Erro ao carregar dados da agência</p>
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
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <p className={styles.label}>
              Plano Atual: {agencyData.agency.planName || 'Gratuito'}
            </p>
            <p className={styles.value}>
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
        <form action={formAction} className={styles.form}>
          <Button type="submit" disabled={pending} className={styles.submitButton}>
            {pending ? (
              <>
                <Loader2 className={`${styles.buttonIcon} ${styles.spinIcon}`} />
                Carregando...
              </>
            ) : (
              'Gerenciar Assinatura'
            )}
          </Button>
        </form>
        {state?.error && (
          <p className={`${styles.errorMessage} ${styles.footerError}`}>{state.error}</p>
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
          <p className="text-destructive">Erro ao carregar dados da agência</p>
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
          <div className={styles.skeletonContainer}>
            <div className={`${styles.skeletonLine} ${styles.large}`}></div>
            <div className={`${styles.skeletonLine} ${styles.medium}`}></div>
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
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Nome da Agência:</p>
            <p className={styles.value}>{agencyData.agency.name}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Email:</p>
            <p className={styles.value}>{agencyData.agency.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Usuário Master:</p>
            <p className={styles.value}>{agencyData.user.name || agencyData.user.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Data de Criação:</p>
            <p className={styles.value}>
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações da Agência</h1>
        <p className={styles.description}>
          Gerencie as configurações e assinatura da sua agência.
        </p>
      </div>

      <div className={styles.grid}>
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