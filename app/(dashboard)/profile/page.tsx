import { Metadata } from 'next/types';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Camera, 
  Building,
  CreditCard,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Suspense } from 'react';
import styles from './profile.module.css';
import { getAgencyForUser } from '@/lib/db/queries/agency';
import { handleChangeAvatar, handleEditProfile, handleChangePassword } from './actions';
import { ProfileModals } from './profile-modals';


export const metadata: Metadata = {
  title: 'Meu Perfil',
  description: 'Visualize e edite as informações do seu perfil',
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  const user = session.user;
  const { action: currentAction } = await searchParams;

  const formatDate = (date: Date | null) => {
    if (!date) return 'Não disponível';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      DEVELOPER: { label: 'Desenvolvedor', color: 'purple' },
      MASTER: { label: 'Master', color: 'gold' },
      ADMIN: { label: 'Administrador', color: 'blue' },
      AGENT: { label: 'Agente', color: 'green' },
    }[role] || { label: role, color: 'gray' };

    return (
      <span className={`${styles.roleBadge} ${styles[`role${roleConfig.color}`]}`}>
        <Shield className={styles.roleIcon} />
        {roleConfig.label}
      </span>
    );
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
        <p className={styles.description}>
          Visualize e gerencie as informações do seu perfil
        </p>
      </div>

      <div className={styles.content}>
        {/* Avatar e Informações Principais */}
        <Card className={styles.mainCard}>
          <CardContent className={styles.mainCardContent}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <Avatar className={styles.largeAvatar}>
                  <AvatarImage src={user.avatar || ''} alt={user.name} />
                  <AvatarFallback className={styles.avatarFallback}>
                    {user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <form action={handleChangeAvatar}>
                  <Button 
                    type="submit"
                    variant="outline" 
                    size="sm"
                    className={styles.changeAvatarButton}
                  >
                    <Camera className={styles.cameraIcon} />
                    Alterar Foto
                  </Button>
                </form>
              </div>
              
              <div className={styles.userInfo}>
                <h2 className={styles.userName}>{user.name}</h2>
                {getRoleBadge(user.role)}
                <p className={styles.userEmail}>{user.email}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <form action={handleEditProfile}>
                <Button type="submit" className={styles.editButton}>
                  Editar Perfil
                </Button>
              </form>
              <form action={handleChangePassword}>
                <Button type="submit" variant="outline" className={styles.changePasswordButton}>
                  Alterar Senha
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Informações Detalhadas */}
        <div className={styles.detailsGrid}>
          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <User className={styles.cardIcon} />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nome Completo:</span>
                <span className={styles.infoValue}>{user.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Telefone:</span>
                <span className={styles.infoValue}>
                  Não informado
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <Mail className={styles.cardIcon} />
                Informações de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>E-mail:</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Último acesso:</span>
                <span className={styles.infoValue}>
                  Não disponível
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>2FA:</span>
                <span className={styles.infoValue}>
                  Desativado
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <Calendar className={styles.cardIcon} />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.cardContent}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Agência */}
        {['DEVELOPER', 'MASTER', 'ADMIN'].includes(user.role) && (
          <>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Informações da Agência</h2>
            </div>
            
            <Suspense fallback={<AgencySkeleton />}>
              <AgencyInfo userId={user.id} userRole={user.role} />
            </Suspense>
          </>
        )}
      </div>

      {/* Modais */}
      <ProfileModals 
        currentAction={currentAction} 
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          phone: null, // Campo phone não existe no user da sessão
        }} 
      />
    </div>
  );
}

function AgencySkeleton() {
  return (
    <div className={styles.agencyGrid}>
      <Card>
        <CardHeader>
          <CardTitle>Informações da Agência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function AgencyInfo({ userId, userRole }: { userId: string, userRole: string }) {
  const agencyData = await getAgencyForUser(userId);
  
  if (!agencyData) {
    return (
      <div className={styles.agencyGrid}>
        <Card>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Building className={styles.cardIcon} />
              Dados da Agência
            </CardTitle>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status:</span>
              <span className={styles.infoValue}>Agência não encontrada</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Não disponível';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const isMaster = userRole === 'MASTER';

  return (
    <div className={styles.agencyGrid}>
      <Card>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <Building className={styles.cardIcon} />
            Dados da Agência
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Nome:</span>
            <span className={styles.infoValue}>{agencyData.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{agencyData.email}</span>
          </div>
          {agencyData.phone && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Telefone:</span>
              <span className={styles.infoValue}>{agencyData.phone}</span>
            </div>
          )}
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>País:</span>
            <span className={styles.infoValue}>{agencyData.country}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Data de criação:</span>
            <span className={styles.infoValue}>
              {formatDate(agencyData.createdAt)}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status:</span>
            <span className={`${styles.statusBadge} ${agencyData.isActive ? styles.statusActive : styles.statusInactive}`}>
              {agencyData.isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </CardContent>
        {isMaster && (
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <a href="/settings?modal=edit-agency">
                <Settings className={styles.buttonIcon} />
                Editar Agência
              </a>
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <CreditCard className={styles.cardIcon} />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Plano:</span>
            <span className={styles.infoValue}>
              {agencyData.planName || 'Gratuito'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status:</span>
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
              {agencyData.subscriptionStatus || 'Ativo'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
