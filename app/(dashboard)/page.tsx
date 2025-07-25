import { Metadata } from 'next';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target, 
  Package, 
  Building2, 
  FileText,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Visão geral das vendas, clientes e performance da agência',
};

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Visão geral das vendas e performance da sua agência
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/demo">
            <button className={styles.demoButton}>
              📊 Ver Demonstração
            </button>
          </Link>
        </div>
      </div>
      
      {/* Métricas Principais */}
      <div className={styles.metricsGrid}>
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Meta do Mês
            </CardTitle>
            <DollarSign className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>R$ 50.000</div>
            <p className={styles.metricDescription}>
              <Target className={styles.trendIcon} />
              Meta estabelecida para este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Leads Captados
            </CardTitle>
            <Users className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>0</div>
            <p className={styles.metricDescription}>
              <ArrowUpRight className={styles.trendIcon} />
              Novos leads este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Propostas Criadas
            </CardTitle>
            <FileText className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>0</div>
            <p className={styles.metricDescription}>
              Propostas em elaboração
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Taxa de Sucesso
            </CardTitle>
            <TrendingUp className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>--</div>
            <p className={styles.metricDescription}>
              Aguardando primeiras vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Atividades Recentes</h2>
        
        <Card>
          <CardContent className={styles.activityCard}>
            <div className={styles.emptyState}>
              <Activity className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Nenhuma atividade recente</h3>
              <p className={styles.emptyDescription}>
                As atividades mais recentes da sua agência aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Operadora */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance por Operadora</h2>
        
        <div className={styles.performanceGrid}>
          <Card>
            <CardHeader>
              <CardTitle className={styles.performanceTitle}>
                <Building2 className={styles.performanceIcon} />
                Operadoras Cadastradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.performanceValue}>0</div>
              <p className={styles.performanceDescription}>
                Parcerias ativas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className={styles.performanceTitle}>
                <Package className={styles.performanceIcon} />
                Produtos no Catálogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.performanceValue}>0</div>
              <p className={styles.performanceDescription}>
                Produtos disponíveis
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        
        <div className={styles.actionsGrid}>
          <Link href="/clients" className={styles.actionLink}>
            <Card className={styles.actionCard}>
              <CardContent className={styles.actionCardContent}>
                <Users className={styles.actionIcon} />
                <h3 className={styles.actionTitle}>Adicionar Cliente</h3>
                <p className={styles.actionDescription}>
                  Cadastre um novo cliente
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/proposals" className={styles.actionLink}>
            <Card className={styles.actionCard}>
              <CardContent className={styles.actionCardContent}>
                <FileText className={styles.actionIcon} />
                <h3 className={styles.actionTitle}>Nova Proposta</h3>
                <p className={styles.actionDescription}>
                  Crie uma nova proposta de venda
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/catalog" className={styles.actionLink}>
            <Card className={styles.actionCard}>
              <CardContent className={styles.actionCardContent}>
                <Package className={styles.actionIcon} />
                <h3 className={styles.actionTitle}>Ver Catálogo</h3>
                <p className={styles.actionDescription}>
                  Consulte produtos disponíveis
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports" className={styles.actionLink}>
            <Card className={styles.actionCard}>
              <CardContent className={styles.actionCardContent}>
                <BarChart3 className={styles.actionIcon} />
                <h3 className={styles.actionTitle}>Relatórios</h3>
                <p className={styles.actionDescription}>
                  Visualize suas métricas
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
