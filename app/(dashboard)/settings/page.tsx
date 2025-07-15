import { Metadata } from 'next/types';
import { auth } from '@/lib/auth/auth';
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

function AgencySettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Building className={styles.cardIcon} />
          Configurações da Agência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Nome da Agência:</p>
            <p className={styles.value}>Minha Agência</p>
          </div>
          <div className={styles.infoGroup}>
            <p className={styles.label}>Email:</p>
            <p className={styles.value}>contato@minhaagencia.com</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline">
          Editar Informações
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  const canManageAgency = ['DEVELOPER', 'MASTER', 'ADMIN'].includes(session.user.role);

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.description}>
          Gerencie as configurações da agência e suas preferências
        </p>
      </div>

      {/* Configurações da Agência (apenas para MASTER, ADMIN, DEVELOPER) */}
      {canManageAgency && (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Configurações da Agência</h2>
          </div>
          
          <div className={styles.agencyGrid}>
            <SubscriptionCard />
            <AgencySettingsCard />
          </div>
        </>
      )}

      {/* Configurações do Sistema */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Configurações do Sistema</h2>
      </div>

      <div className={styles.settingsGrid}>
        <Card className={styles.settingCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Bell className={styles.cardIcon} />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.cardDescription}>
              Configure suas preferências de notificação
            </p>
          </CardContent>
        </Card>

        <Card className={styles.settingCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Shield className={styles.cardIcon} />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.cardDescription}>
              Configurações de segurança e autenticação
            </p>
          </CardContent>
        </Card>

        <Card className={styles.settingCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Palette className={styles.cardIcon} />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.cardDescription}>
              Personalize a aparência da interface
            </p>
          </CardContent>
        </Card>

        <Card className={styles.settingCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Globe className={styles.cardIcon} />
              Idioma e Região
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.cardDescription}>
              Configure idioma e configurações regionais
            </p>
          </CardContent>
        </Card>

        {canManageAgency && (
          <Card className={styles.settingCard}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <Users className={styles.cardIcon} />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={styles.cardDescription}>
                Gerencie usuários e permissões da agência
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
