'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { INTERACTION_TYPES } from '@/lib/types/interactions';
import { TASK_PRIORITIES, TASK_STATUS } from '@/lib/types/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  UserCheck, 
  Plus,
  MapPin,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { formatCPF, formatCNPJ, formatPhone } from '@/lib/validations/clients/client.schema';
import { Client } from '@/lib/types/clients';
import type { User } from '@/lib/db/schema';
import ClientFunnelStageEditor from './client-funnel-stage-editor';
import { InteractionForm } from './interactions/interaction-form';
import { TaskForm } from './tasks/task-form';
import { TransferModal } from './transfer-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { InteractionFormInput, TaskFormInput } from '@/lib/validations/clients';
import styles from './client-details-content.module.css';
import badgeStyles from './client-details-content-badges.module.css';

interface ClientDetailsContentProps {
  clientId: string;
}

interface ClientWithDetails extends Client {
  // Relacionamentos obrigatórios
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  funnel: {
    id: string;
    name: string;
  };
  funnelStage: {
    id: string;
    name: string;
    color: string;
    order: number;
  };
  
  // Dados computados
  totalProposals: number;
  totalValue: number;
  lastInteraction?: Date;
  
  // Arrays de relacionamentos
  interactions: Array<{
    id: string;
    type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
    description: string;
    contactDate: Date;
    user: {
      name: string;
      email: string;
    };
    durationMinutes?: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    dueDate: Date;
    assignedUser: {
      name: string;
    };
  }>;
  proposals: Array<{
    id: string;
    proposalNumber: string;
    status: 'draft' | 'sent' | 'approved' | 'contract' | 'rejected' | 'expired' | 'awaiting_payment' | 'active_booking' | 'cancelled';
    totalAmount: number;
    createdAt: Date;
    operator: {
      name: string;
    };
  }>;
  transfers: Array<{
    id: string;
    fromUser: {
      name: string;
    };
    toUser: {
      name: string;
    };
    reason: string;
    transferredAt: Date;
    transferredByUser: {
      name: string;
    };
  }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientDetailsContent({ clientId }: ClientDetailsContentProps) {
  const router = useRouter();
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get current user and agency users
  const { data: currentUser } = useSWR<User>('/api/user', fetcher);
  const { data: agencyUsers } = useSWR<User[]>('/api/users', fetcher);
  
  // Estados para modais
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Buscar dados do cliente
  const fetchClient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/clients?error=cliente-nao-encontrado');
          return;
        }
        throw new Error('Erro ao buscar cliente');
      }

      const clientData = await response.json();
      
      // Os relacionamentos já vêm da API
      const transformedClient: ClientWithDetails = {
        ...clientData,
      };

      setClient(transformedClient);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      router.push('/clients?error=erro-ao-carregar-cliente');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId, router]);

  // Funções de navegação
  const handleEdit = () => {
    router.push(`/clients/${clientId}/edit`);
  };

  const handleNewInteraction = () => {
    setShowInteractionModal(true);
  };

  const handleNewTask = () => {
    setShowTaskModal(true);
  };

  const handleInteractionSubmit = async (data: InteractionFormInput & { clientId: string }) => {
    setIsSubmittingInteraction(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar interação');
      }

      // Recarregar dados do cliente
      await fetchClient();
      setShowInteractionModal(false);
      setActiveTab('interactions'); // Navegar para a aba de interações
    } catch (error) {
      console.error('Erro ao criar interação:', error);
      // TODO: Mostrar notificação de erro
    } finally {
      setIsSubmittingInteraction(false);
    }
  };

  const handleTaskSubmit = async (data: TaskFormInput & { clientId: string }) => {
    setIsSubmittingTask(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      // Recarregar dados do cliente
      await fetchClient();
      setShowTaskModal(false);
      setActiveTab('tasks'); // Navegar para a aba de tarefas
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      // TODO: Mostrar notificação de erro
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da tarefa');
      }

      // Recarregar dados do cliente
      await fetchClient();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar status da tarefa');
    }
  };

  const handleNewProposal = () => {
    router.push('/proposals');
  };

  const handleTransferSuccess = () => {
    // Recarregar dados do cliente após transferência
    fetchClient();
  };

  // Função para atualizar dados do cliente após mudança de funil/etapa
  const handleFunnelStageUpdate = async (funnelId: string, stageId: string) => {
    if (!client) return;

    try {
      // Recarregar dados completos do cliente
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const clientData = await response.json();
        const transformedClient: ClientWithDetails = {
          ...clientData,
        };
        setClient(transformedClient);
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do cliente:', error);
    }
  };

  // Formatação de dados
  const formatDocument = (type: 'cpf' | 'cnpj', number: string | null) => {
    if (!number) return 'Não informado';
    return type === 'cpf' ? formatCPF(number) : formatCNPJ(number);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        // Se a string contém 'T' é uma data ISO completa
        if (date.includes('T')) {
          // Extrair apenas a parte da data (YYYY-MM-DD) e criar a data no fuso local
          const [datePart] = date.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          dateObj = new Date(year, month - 1, day, 12, 0, 0);
        } else {
          // Se é apenas data (YYYY-MM-DD), criar no fuso local
          const [year, month, day] = date.split('-').map(Number);
          dateObj = new Date(year, month - 1, day, 12, 0, 0);
        }
      } else {
        dateObj = date;
      }
      
      if (isNaN(dateObj.getTime())) return '-';
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      return '-';
    }
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      return '-';
    }
  };

  // Função para obter o label do tipo de interação
  const getInteractionTypeLabel = (type: string) => {
    return INTERACTION_TYPES[type as keyof typeof INTERACTION_TYPES]?.label || type;
  };

  // Funções para obter labels das tarefas
  const getTaskPriorityLabel = (priority: string) => {
    return TASK_PRIORITIES[priority as keyof typeof TASK_PRIORITIES]?.label || priority;
  };

  const getTaskStatusLabel = (status: string) => {
    return TASK_STATUS[status as keyof typeof TASK_STATUS]?.label || status;
  };

  // Função para encontrar a próxima tarefa pendente
  const getNextPendingTask = () => {
    if (!client?.tasks || client.tasks.length === 0) return null;
    
    const pendingTasks = client.tasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    );
    
    if (pendingTasks.length === 0) return null;
    
    // Filtrar apenas tarefas futuras ou de hoje
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Começar do início do dia
    
    const futureTasks = pendingTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= now;
    });
    
    if (futureTasks.length === 0) return null;
    
    // Ordenar por data de vencimento (mais próxima primeiro)
    const sortedTasks = futureTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
    
    return sortedTasks[0];
  };

  // Ícones para tipos de interação
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className={styles.interactionIcon} />;
      case 'email':
        return <Mail className={styles.interactionIcon} />;
      case 'whatsapp':
        return <MessageCircle className={styles.interactionIcon} />;
      case 'meeting':
        return <Calendar className={styles.interactionIcon} />;
      case 'note':
        return <FileText className={styles.interactionIcon} />;
      default:
        return <Activity className={styles.interactionIcon} />;
    }
  };

  // Cores para prioridades
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return badgeStyles.priorityHigh;
      case 'medium':
        return badgeStyles.priorityMedium;
      case 'low':
        return badgeStyles.priorityLow;
      default:
        return badgeStyles.priorityDefault;
    }
  };

  // Cores para status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return badgeStyles.statusPending;
      case 'in_progress':
        return badgeStyles.statusInProgress;
      case 'completed':
        return badgeStyles.statusCompleted;
      case 'cancelled':
        return badgeStyles.statusCancelled;
      case 'sent':
        return badgeStyles.statusSent;
      case 'approved':
        return badgeStyles.statusAccepted;
      case 'contract':
        return badgeStyles.statusAccepted;
      case 'awaiting_payment':
        return badgeStyles.statusPending;
      case 'active_booking':
        return badgeStyles.statusCompleted;
      case 'cancelled':
        return badgeStyles.statusCancelled;
      case 'rejected':
        return badgeStyles.statusRejected;
      case 'expired':
        return badgeStyles.statusExpired;
      default:
        return badgeStyles.statusDefault;
    }
  };

  // Cores para etapas do funil
  const getStageColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: styles.colorBlue,
      green: styles.colorGreen,
      yellow: styles.colorYellow,
      red: styles.colorRed,
      purple: styles.colorPurple,
      gray: styles.colorGray,
      orange: styles.colorOrange,
      pink: styles.colorPink,
    };
    return colorMap[color] || styles.colorGray;
  };

  if (isLoading) {
    return <div className={styles.loadingState}>Carregando dados do cliente...</div>;
  }

  if (!client) {
    return <div className={styles.emptyState}>Cliente não encontrado</div>;
  }

  return (
    <div className={styles.clientDetailsContainer}>
      {/* Header */}
      <div className={styles.clientDetailsHeader}>
        <div className={styles.clientDetailsHeaderTop}>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/clients')}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            Voltar
          </Button>
        </div>
        <div className={styles.clientDetailsHeaderContent}>
          <div className={styles.clientDetailsHeaderMain}>
            <h1 className={styles.clientDetailsTitle}>{client.name}</h1>
            <div className={styles.clientDetailsContactInfo}>
              <a href={`mailto:${client.email}`} className={styles.clientDetailsContactLink}>
                <Mail className={styles.contactIcon} />
                {client.email}
              </a>
              {client.phone && (
                <a href={`tel:${client.phone}`} className={styles.clientDetailsContactLink}>
                  <Phone className={styles.contactIcon} />
                  {formatPhone(client.phone)}
                </a>
              )}
            </div>
            <div className={styles.clientDetailsMetaTags}>
              <Badge variant="outline" className={`${styles.clientStatus} ${styles.active} ${client.funnelStage?.color ? getStageColorClass(client.funnelStage.color) : ''}`}>
                {client.funnelStage?.name}
              </Badge>
              <span className={styles.clientDetailsDocumentText}>
                {formatDocument(client.documentType, client.documentNumber)}
              </span>
            </div>
          </div>
          <div className={styles.clientDetailsActions}>
            <Button onClick={handleEdit} variant="outline">
              <Edit className={styles.buttonIcon} />
              Editar
            </Button>
            <Button onClick={handleNewInteraction}>
              <Plus className={styles.buttonIcon} />
              Nova Interação
            </Button>
            <Button onClick={handleNewTask}>
              <Calendar className={styles.buttonIcon} />
              Nova Tarefa
            </Button>
            <Button onClick={handleNewProposal}>
              <FileText className={styles.buttonIcon} />
              Nova Proposta
            </Button>
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER' || currentUser?.role === 'DEVELOPER') && agencyUsers && client && (
              <TransferModal
                client={client}
                users={agencyUsers}
                onSuccess={handleTransferSuccess}
              >
                <Button variant="outline">
                  <UserCheck className={styles.buttonIcon} />
                  Transferir
                </Button>
              </TransferModal>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.clientDetailsLayout}>
        {/* Sidebar - Resumo */}
        <div className={styles.clientStatsSidebar}>
          <Card>
            <CardHeader>
              <CardTitle className={styles.clientStatsHeader}>
                <TrendingUp className={styles.statsIcon} />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.clientStatsContent}>
              <div className={styles.clientStatItem}>
                <div className={styles.clientStatValue}>{client.totalProposals}</div>
                <div className={styles.clientStatLabel}>Propostas</div>
              </div>
              <div className={styles.clientStatItem}>
                <div className={styles.clientStatValue}>{formatCurrency(client.totalValue || 0)}</div>
                <div className={styles.clientStatLabel}>Valor Total</div>
              </div>
              <div className={styles.clientStatItem}>
                <div className={styles.clientStatValue}>
                  {client.lastInteraction ? formatDate(client.lastInteraction) : 'Nunca'}
                </div>
                <div className={styles.clientStatLabel}>Última Interação</div>
              </div>
              <div className={styles.clientStatDivider} />
              <div className={styles.clientStatItem}>
                <div className={styles.clientStatValue}>
                  {getNextPendingTask() ? formatDate(getNextPendingTask()!.dueDate) : 'Nenhuma agendada'}
                </div>
                <div className={styles.clientStatLabel}>Próxima Tarefa</div>
              </div>
              <div className={styles.clientStatDivider} />
              <div className={styles.clientStatItem}>
                <div className={styles.clientStatValue}>{client.user?.name}</div>
                <div className={styles.clientStatLabel}>Responsável</div>
              </div>
              <div className={styles.clientStatItem}>
                <div className={styles.clientStatValue}>{formatDate(client.createdAt)}</div>
                <div className={styles.clientStatLabel}>Cliente desde</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className={styles.clientMainContent}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={styles.clientTabsList}>
              <TabsTrigger value="overview">Resumo</TabsTrigger>
              <TabsTrigger value="interactions">Timeline</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="proposals">Propostas</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className={styles.clientTabsContent}>
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientInfoGrid}>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Nome Completo</Label>
                      <p className={styles.clientInfoValue}>{client.name}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Email</Label>
                      <p className={styles.clientInfoValue}>{client.email}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Telefone</Label>
                      <p className={styles.clientInfoValue}>{client.phone ? formatPhone(client.phone) : 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Data de Nascimento</Label>
                      <p className={styles.clientInfoValue}>{client.birthDate ? formatDate(client.birthDate) : 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>
                        {client.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                      </Label>
                      <p className={styles.clientInfoValue}>{formatDocument(client.documentType, client.documentNumber)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className={styles.clientStatsHeader}>
                    <MapPin className={styles.statsIcon} />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientInfoGrid}>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>CEP</Label>
                      <p className={styles.clientInfoValue}>{client.addressZipcode || 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Logradouro</Label>
                      <p className={styles.clientInfoValue}>{client.addressStreet || 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Número</Label>
                      <p className={styles.clientInfoValue}>{client.addressNumber || 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Complemento</Label>
                      <p className={styles.clientInfoValue}>{client.addressComplement || 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Bairro</Label>
                      <p className={styles.clientInfoValue}>{client.addressNeighborhood || 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Cidade</Label>
                      <p className={styles.clientInfoValue}>{client.addressCity || 'Não informado'}</p>
                    </div>
                    <div className={styles.clientInfoField}>
                      <Label className={styles.clientInfoLabel}>Estado</Label>
                      <p className={styles.clientInfoValue}>{client.addressState || 'Não informado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ClientFunnelStageEditor
                clientId={client.id}
                currentFunnel={client.funnel}
                currentStage={client.funnelStage}
                clientUserId={client.userId}
                onUpdate={handleFunnelStageUpdate}
              />

              {client.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={styles.clientInfoValue}>{client.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="interactions" className={styles.clientTabsContent}>
              <Card>
                <CardHeader>
                  <CardTitle>Timeline de Interações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientInteractionsList}>
                    {client.interactions.length === 0 ? (
                      <p className={styles.emptyState}>Nenhuma interação registrada para este cliente.</p>
                    ) : (
                      client.interactions.map((interaction) => (
                      <div key={interaction.id} className={styles.clientInteractionItem}>
                        <div className={styles.clientInteractionIcon}>
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className={styles.clientInteractionContent}>
                          <div className={styles.clientInteractionHeader}>
                            <span className={styles.clientInteractionUser}>{interaction.user.name}</span>
                            <Badge variant="outline" className={badgeStyles.badgeSmall}>
                              {getInteractionTypeLabel(interaction.type)}
                            </Badge>
                            <span className={styles.clientInteractionTime}>
                              {formatDateTime(interaction.contactDate)}
                            </span>
                            {interaction.durationMinutes && (
                              <span className={styles.clientInteractionTime}>
                                ({interaction.durationMinutes} min)
                              </span>
                            )}
                          </div>
                          <p className={styles.clientInteractionDescription}>{interaction.description}</p>
                        </div>
                      </div>
                    )))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className={styles.clientTabsContent}>
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientTasksList}>
                    {!client?.tasks || client.tasks.length === 0 ? (
                      <div className={styles.empty}>
                        <p>Nenhuma tarefa encontrada para este cliente.</p>
                        <p>Debug: Total de tarefas carregadas: {client?.tasks?.length || 0}</p>
                      </div>
                    ) : (
                      client.tasks.map((task) => (
                        <div key={task.id} className={styles.clientTaskItem}>
                          <div className={styles.clientTaskContent}>
                            <div className={styles.clientTaskHeader}>
                              <h4 className={styles.clientTaskTitle}>{task.title}</h4>
                              <Badge className={`${badgeStyles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] || badgeStyles.priorityLow}`}>
                                {getTaskPriorityLabel(task.priority)}
                              </Badge>
                              <Badge variant="outline" className={`${badgeStyles[`status${task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', '')}`] || badgeStyles.statusPending}`}>
                                {getTaskStatusLabel(task.status)}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className={styles.clientTaskDescription}>{task.description}</p>
                            )}
                            <div className={styles.clientTaskMeta}>
                              <span>Responsável: {task.assignedUser.name}</span>
                              <span>Vencimento: {formatDate(task.dueDate)}</span>
                            </div>
                            <div className={styles.clientTaskActions}>
                              <div className={styles.taskStatusButtons}>
                                <button
                                  onClick={() => handleTaskStatusChange(task.id, 'pending')}
                                  className={`${styles.statusButton} ${task.status === 'pending' ? styles.activeStatus : ''}`}
                                  disabled={task.status === 'pending'}
                                  title="Pendente"
                                >
                                  ⏳
                                </button>
                                <button
                                  onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                                  className={`${styles.statusButton} ${task.status === 'in_progress' ? styles.activeStatus : ''}`}
                                  disabled={task.status === 'in_progress'}
                                  title="Em Progresso"
                                >
                                  🔄
                                </button>
                                <button
                                  onClick={() => handleTaskStatusChange(task.id, 'completed')}
                                  className={`${styles.statusButton} ${task.status === 'completed' ? styles.activeStatus : ''}`}
                                  disabled={task.status === 'completed'}
                                  title="Concluída"
                                >
                                  ✅
                                </button>
                                <button
                                  onClick={() => handleTaskStatusChange(task.id, 'cancelled')}
                                  className={`${styles.statusButton} ${task.status === 'cancelled' ? styles.activeStatus : ''}`}
                                  disabled={task.status === 'cancelled'}
                                  title="Cancelada"
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposals" className={styles.clientTabsContent}>
              <Card>
                <CardHeader>
                  <CardTitle>Propostas do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientProposalsList}>
                    {client.proposals.map((proposal) => (
                      <div key={proposal.id} className={styles.clientProposalItem}>
                        <div className={styles.clientProposalContent}>
                          <div className={styles.clientProposalHeader}>
                            <h4 className={styles.clientProposalTitle}>Proposta {proposal.proposalNumber}</h4>
                            <Badge variant="outline" className={`${badgeStyles[`status${proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}`] || badgeStyles.statusPending}`}>
                              {proposal.status}
                            </Badge>
                          </div>
                          <div className={styles.clientProposalMeta}>
                            <span>Operadora: {proposal.operator?.name || 'Não informado'}</span>
                            <span>Valor: {formatCurrency(proposal.totalAmount)}</span>
                            <span>Criada em: {formatDate(proposal.createdAt)}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className={styles.clientTabsContent}>
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Transferências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.clientHistoryList}>
                    {client.transfers.map((transfer) => (
                      <div key={transfer.id} className={styles.clientHistoryItem}>
                        <div className={styles.clientHistoryIcon}>
                          <UserCheck className={styles.statsIcon} />
                        </div>
                        <div className={styles.clientHistoryContent}>
                          <div className={styles.clientHistoryHeader}>
                            <span className={styles.clientHistoryTitle}>Transferência de Cliente</span>
                            <span className={styles.clientHistoryTime}>
                              {formatDateTime(transfer.transferredAt)}
                            </span>
                          </div>
                          <p className={styles.clientHistoryDescription}>
                            De: {transfer.fromUser.name} → Para: {transfer.toUser.name}
                          </p>
                          <p className={styles.clientHistoryDescription}>
                            Motivo: {transfer.reason}
                          </p>
                          <p className={styles.clientHistoryMeta}>
                            Transferido por: {transfer.transferredByUser.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de Nova Interação */}
      <Dialog open={showInteractionModal} onOpenChange={setShowInteractionModal}>
        <DialogContent className={badgeStyles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Nova Interação - {client?.name}</DialogTitle>
          </DialogHeader>
          <InteractionForm
            clientId={clientId}
            onSubmit={handleInteractionSubmit}
            onCancel={() => setShowInteractionModal(false)}
            isLoading={isSubmittingInteraction}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Tarefa */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className={badgeStyles.dialogContent}>
          <DialogHeader>
            <DialogTitle>Nova Tarefa - {client?.name}</DialogTitle>
          </DialogHeader>
          <TaskForm
            clientId={clientId}
            users={agencyUsers?.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
            })) || []}
            currentUserId={currentUser?.id || ''}
            currentUserRole={currentUser?.role || 'AGENT'}
            clientOwnerId={client?.userId}
            onSubmit={handleTaskSubmit}
            onCancel={() => setShowTaskModal(false)}
            isLoading={isSubmittingTask}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
