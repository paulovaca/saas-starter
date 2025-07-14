import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, Users, TrendingUp } from 'lucide-react';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Visão geral da sua agência de viagens',
};

export default function DashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Dashboard</h2>
      </div>
      
      <div className={styles.metricsGrid}>
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Total de Clientes
            </CardTitle>
            <Users className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>0</div>
            <p className={styles.metricDescription}>
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Vendas do Mês
            </CardTitle>
            <DollarSign className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>R$ 0</div>
            <p className={styles.metricDescription}>
              Faturamento mensal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Propostas Ativas
            </CardTitle>
            <TrendingUp className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>0</div>
            <p className={styles.metricDescription}>
              Em negociação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={styles.metricCardHeader}>
            <CardTitle className={styles.metricTitle}>
              Atividades Hoje
            </CardTitle>
            <Activity className={styles.metricIcon} />
          </CardHeader>
          <CardContent>
            <div className={styles.metricValue}>0</div>
            <p className={styles.metricDescription}>
              Ações realizadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className={styles.contentGrid}>
        <Card className={styles.welcomeCard}>
          <CardHeader>
            <CardTitle>Bem-vindo ao CRM Travel</CardTitle>
          </CardHeader>
          <CardContent className={styles.welcomeContent}>
            <div className={styles.welcomeDescription}>
              <p className={styles.welcomeText}>
                Este é o painel principal da sua agência de viagens. Aqui você pode visualizar:
              </p>
              <ul className={styles.featureList}>
                <li>• Métricas importantes da sua agência</li>
                <li>• Atividades recentes dos usuários</li>
                <li>• Status dos clientes e propostas</li>
                <li>• Relatórios de desempenho</li>
              </ul>
              <p className={styles.welcomeText}>
                Use o menu de navegação acima para acessar diferentes seções do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className={styles.activityCard}>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <Activity className={styles.activityIconInner} />
                </div>
                <div className={styles.activityDetails}>
                  <p className={styles.activityTitle}>
                    Sistema inicializado
                  </p>
                  <p className={styles.activityDescription}>
                    Agência criada com sucesso
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
