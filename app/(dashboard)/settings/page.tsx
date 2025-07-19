import { Metadata } from 'next';
import { getUser } from '@/lib/db/queries/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Building,
  CreditCard,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAgencyForUser } from '@/lib/db/queries/agency';
import { EditAgencyModal } from './edit-agency-modal';
import { AppearanceCard } from './appearance-card';
import styles from './settings.module.css';

export const metadata: Metadata = {
  title: 'Configurações',
  description: 'Configurações da agência e preferências do sistema',
};

function SubscriptionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <CreditCard className={styles.cardIcon} />
          Assinatura da Agência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Plano Atual:</p>
            <p className={styles.value}>Gratuito</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Status:</p>
            <p className={styles.value}>Ativo</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>
          Gerenciar Assinatura
        </Button>
      </CardFooter>
    </Card>
  );
}

function NotificationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Bell className={styles.cardIcon} />
          Notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Email:</p>
            <p className={styles.value}>Ativado</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Sistema:</p>
            <p className={styles.value}>Ativado</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">
          Configurar
        </Button>
      </CardFooter>
    </Card>
  );
}

function AgencyInfoCard({ agency }: { agency?: any }) {
  if (!agency) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Building className={styles.cardIcon} />
          Informações da Agência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Nome:</p>
            <p className={styles.value}>{agency.name}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>CNPJ:</p>
            <p className={styles.value}>{agency.cnpj || 'Não informado'}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Email:</p>
            <p className={styles.value}>{agency.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Telefone:</p>
            <p className={styles.value}>{agency.phone || 'Não informado'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <a href="?modal=edit-agency">
            Editar Informações
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function SettingsPage({ searchParams }: { 
  searchParams: Promise<{ modal?: string }> 
}) {
  const resolvedSearchParams = await searchParams;
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const canManageAgency = ['DEVELOPER', 'MASTER', 'ADMIN'].includes(user.role);
  const isMaster = user.role === 'MASTER';
  
  // Buscar dados da agência se o usuário pode gerenciá-la
  let agencyData = null;
  if (canManageAgency && user.id) {
    agencyData = await getAgencyForUser(user.id);
  }

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.description}>
          Gerencie as configurações da agência e suas preferências
        </p>
      </div>

      <div className={styles.settingsGrid}>
        {/* Card de Notificações - Disponível para todos */}
        <NotificationCard />

        {/* Card de Informações da Agência - Apenas para roles específicos */}
        {canManageAgency && <AgencyInfoCard agency={agencyData} />}

        {/* Card de Assinatura - Apenas para MASTER */}
        {isMaster && <SubscriptionCard />}

        {/* Card de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Shield className={styles.cardIcon} />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.infoSection}>
              <div className={styles.infoGroup}>
                <p className={styles.label}>Autenticação de 2 fatores:</p>
                <p className={styles.value}>Desativado</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.label}>Última alteração de senha:</p>
                <p className={styles.value}>Há 30 dias</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">
              Configurar Segurança
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Aparência */}
        <AppearanceCard />

        {/* Card de Sistema - Apenas para roles específicos */}
        {canManageAgency && (
          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <Globe className={styles.cardIcon} />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.infoSection}>
                <div className={styles.infoGroup}>
                  <p className={styles.label}>Versão:</p>
                  <p className={styles.value}>v1.0.0</p>
                </div>
                <div className={styles.infoGroup}>
                  <p className={styles.label}>Última atualização:</p>
                  <p className={styles.value}>15/07/2025</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Verificar Atualizações
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Card de Usuários - Apenas para MASTER e ADMIN */}
        {(user.role === 'MASTER' || user.role === 'ADMIN') && (
          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <Users className={styles.cardIcon} />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.infoSection}>
                <p className={styles.description}>
                  Gerencie usuários, permissões e acessos da agência
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a href="/users">
                  Gerenciar Usuários
                </a>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Modal de Edição da Agência */}
      {canManageAgency && agencyData && resolvedSearchParams.modal === 'edit-agency' && (
        <EditAgencyModal agency={agencyData} />
      )}
    </div>
  );
}
