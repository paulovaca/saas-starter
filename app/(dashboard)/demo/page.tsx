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
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Phone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import styles from './demo.module.css';

export const metadata: Metadata = {
  title: 'Dashboard - Demonstração',
  description: 'Demonstração do dashboard com dados de exemplo',
};

// Dados de exemplo
const mockData = {
  metrics: {
    salesMonth: 125800,
    salesGrowth: 12.5,
    totalClients: 247,
    newClients: 18,
    activeProposals: 32,
    conversionRate: 18.7
  },
  recentActivities: [
    {
      id: 1,
      type: 'sale',
      message: 'Nova venda fechada - Seguro Viagem Europa',
      client: 'Maria Silva',
      value: 'R$ 1.200',
      time: '2 min atrás'
    },
    {
      id: 2,
      type: 'proposal',
      message: 'Proposta enviada - Seguro Residencial',
      client: 'João Santos',
      value: 'R$ 850/mês',
      time: '15 min atrás'
    },
    {
      id: 3,
      type: 'client',
      message: 'Novo cliente cadastrado',
      client: 'Ana Costa',
      value: '',
      time: '1h atrás'
    },
    {
      id: 4,
      type: 'call',
      message: 'Ligação agendada - Follow-up proposta',
      client: 'Pedro Lima',
      value: '',
      time: '2h atrás'
    }
  ],
  operators: [
    { name: 'Allianz', sales: 45, commission: 15200 },
    { name: 'SulAmérica', sales: 38, commission: 12800 },
    { name: 'Porto Seguro', sales: 32, commission: 10400 },
    { name: 'Bradesco Seguros', sales: 28, commission: 9100 }
  ],
  quickStats: {
    callsToday: 23,
    meetingsScheduled: 8,
    proposalsPending: 15,
    followUpsRequired: 12
  }
};

export default async function DashboardDemoPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className={styles.activityIcon} />;
      case 'proposal': return <FileText className={styles.activityIcon} />;
      case 'client': return <Users className={styles.activityIcon} />;
      case 'call': return <Phone className={styles.activityIcon} />;
      default: return <Activity className={styles.activityIcon} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return styles.activitySale;
      case 'proposal': return styles.activityProposal;
      case 'client': return styles.activityClient;
      case 'call': return styles.activityCall;
      default: return styles.activityDefault;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard Executivo</h1>
          <p className={styles.subtitle}>
            Demonstração com dados de exemplo - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/">
            <button className={styles.backButton}>
              ← Voltar ao Dashboard
            </button>
          </Link>
        </div>
      </div>
      
      {/* Métricas Principais */}
      <div className={styles.metricsGrid}>
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Vendas do Mês
            </CardTitle>
            <DollarSign className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>
              R$ {mockData.metrics.salesMonth.toLocaleString('pt-BR')}
            </div>
            <p className={styles.metricDescription}>
              <ArrowUpRight className={`${styles.trendIcon} ${styles.trendUp}`} />
              +{mockData.metrics.salesGrowth}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Total de Clientes
            </CardTitle>
            <Users className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{mockData.metrics.totalClients}</div>
            <p className={styles.metricDescription}>
              <ArrowUpRight className={`${styles.trendIcon} ${styles.trendUp}`} />
              +{mockData.metrics.newClients} novos este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Propostas Ativas
            </CardTitle>
            <Target className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{mockData.metrics.activeProposals}</div>
            <p className={styles.metricDescription}>
              Em pipeline de vendas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>{mockData.metrics.conversionRate}%</div>
            <p className={styles.metricDescription}>
              Taxa de fechamento mensal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Estatísticas do Dia</h2>
        
        <div className={styles.quickStatsGrid}>
          <Card className={styles.quickStatCard}>
            <CardContent className={styles.quickStatContent}>
              <Phone className={styles.quickStatIcon} />
              <div className={styles.quickStatInfo}>
                <div className={styles.quickStatValue}>{mockData.quickStats.callsToday}</div>
                <div className={styles.quickStatLabel}>Ligações hoje</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.quickStatCard}>
            <CardContent className={styles.quickStatContent}>
              <Clock className={styles.quickStatIcon} />
              <div className={styles.quickStatInfo}>
                <div className={styles.quickStatValue}>{mockData.quickStats.meetingsScheduled}</div>
                <div className={styles.quickStatLabel}>Reuniões agendadas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.quickStatCard}>
            <CardContent className={styles.quickStatContent}>
              <FileText className={styles.quickStatIcon} />
              <div className={styles.quickStatInfo}>
                <div className={styles.quickStatValue}>{mockData.quickStats.proposalsPending}</div>
                <div className={styles.quickStatLabel}>Propostas pendentes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={styles.quickStatCard}>
            <CardContent className={styles.quickStatContent}>
              <TrendingUp className={styles.quickStatIcon} />
              <div className={styles.quickStatInfo}>
                <div className={styles.quickStatValue}>{mockData.quickStats.followUpsRequired}</div>
                <div className={styles.quickStatLabel}>Follow-ups necessários</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Atividades Recentes</h2>
        
        <Card>
          <CardContent className={styles.activitiesCard}>
            <div className={styles.activitiesList}>
              {mockData.recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={`${styles.activityIconContainer} ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityMessage}>{activity.message}</div>
                    <div className={styles.activityDetails}>
                      <span className={styles.activityClient}>{activity.client}</span>
                      {activity.value && (
                        <>
                          <span className={styles.activitySeparator}>•</span>
                          <span className={styles.activityValue}>{activity.value}</span>
                        </>
                      )}
                      <span className={styles.activitySeparator}>•</span>
                      <span className={styles.activityTime}>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Operadora */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance por Operadora</h2>
        
        <div className={styles.operatorsGrid}>
          {mockData.operators.map((operator) => (
            <Card key={operator.name}>
              <CardHeader>
                <CardTitle className={styles.operatorTitle}>
                  <Building2 className={styles.operatorIcon} />
                  {operator.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.operatorStats}>
                  <div className={styles.operatorStat}>
                    <div className={styles.operatorValue}>{operator.sales}</div>
                    <div className={styles.operatorLabel}>Vendas</div>
                  </div>
                  <div className={styles.operatorStat}>
                    <div className={styles.operatorValue}>
                      R$ {operator.commission.toLocaleString('pt-BR')}
                    </div>
                    <div className={styles.operatorLabel}>Comissão</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
