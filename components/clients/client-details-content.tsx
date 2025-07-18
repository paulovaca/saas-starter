'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import styles from './client-details-content.module.css';

interface ClientDetailsContentProps {
  clientId: string;
}

interface ClientWithDetails extends Client {
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
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
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

export default function ClientDetailsContent({ clientId }: ClientDetailsContentProps) {
  const router = useRouter();
  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar dados do cliente
  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true);
      try {
        // Aqui será implementada a busca real do cliente
        // Por enquanto, dados mockados
        const mockClient: ClientWithDetails = {
          id: clientId,
          agencyId: 'agency-1',
          userId: 'user-1',
          name: 'João Silva Santos',
          email: 'joao@email.com',
          phone: '11987654321',
          documentType: 'cpf',
          documentNumber: '12345678901',
          birthDate: new Date('1985-05-15'),
          addressZipcode: '01234567',
          addressStreet: 'Rua das Flores',
          addressNumber: '123',
          addressComplement: 'Apt 45',
          addressNeighborhood: 'Centro',
          addressCity: 'São Paulo',
          addressState: 'SP',
          funnelId: 'funnel-1',
          funnelStageId: 'stage-1',
          notes: 'Cliente em potencial para pacotes corporativos. Demonstrou interesse em viagens para Europa.',
          isActive: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20'),
          totalProposals: 3,
          totalValue: 45000,
          lastInteraction: new Date('2024-01-18'),
          
          // Dados relacionados
          funnel: {
            id: 'funnel-1',
            name: 'Funil Principal'
          },
          funnelStage: {
            id: 'stage-1',
            name: 'Proposta Enviada',
            instructions: 'Aguardar retorno do cliente'
          },
          user: {
            id: 'user-1',
            name: 'Maria Vendedora',
            email: 'maria@agencia.com'
          },
          
          interactions: [
            {
              id: '1',
              type: 'call',
              description: 'Ligação para apresentar nova proposta de viagem para Europa. Cliente demonstrou interesse.',
              contactDate: new Date('2024-01-18'),
              user: {
                name: 'Maria Vendedora',
                email: 'maria@agencia.com'
              },
              durationMinutes: 45
            },
            {
              id: '2',
              type: 'email',
              description: 'Enviado catálogo de hotéis em Paris e Roma conforme solicitado.',
              contactDate: new Date('2024-01-15'),
              user: {
                name: 'Maria Vendedora',
                email: 'maria@agencia.com'
              }
            },
            {
              id: '3',
              type: 'whatsapp',
              description: 'Cliente perguntou sobre documentação necessária para viagem.',
              contactDate: new Date('2024-01-12'),
              user: {
                name: 'Maria Vendedora',
                email: 'maria@agencia.com'
              }
            }
          ],
          
          tasks: [
            {
              id: '1',
              title: 'Enviar cotação final',
              description: 'Preparar proposta final com valores negociados',
              priority: 'high',
              status: 'pending',
              dueDate: new Date('2024-01-25'),
              assignedUser: {
                name: 'Maria Vendedora'
              }
            },
            {
              id: '2',
              title: 'Agendar reunião',
              description: 'Marcar reunião presencial para apresentação',
              priority: 'medium',
              status: 'in_progress',
              dueDate: new Date('2024-01-22'),
              assignedUser: {
                name: 'Maria Vendedora'
              }
            }
          ],
          
          proposals: [
            {
              id: '1',
              proposalNumber: '2024/001',
              status: 'sent',
              totalAmount: 25000,
              createdAt: new Date('2024-01-15'),
              operator: {
                name: 'TravelCorp'
              }
            },
            {
              id: '2',
              proposalNumber: '2024/002',
              status: 'accepted',
              totalAmount: 18000,
              createdAt: new Date('2024-01-05'),
              operator: {
                name: 'EuroTravel'
              }
            }
          ],
          
          transfers: [
            {
              id: '1',
              fromUser: {
                name: 'João Antigo'
              },
              toUser: {
                name: 'Maria Vendedora'
              },
              reason: 'Realocação por especialização em viagens corporativas',
              transferredAt: new Date('2024-01-08'),
              transferredByUser: {
                name: 'Admin Sistema'
              }
            }
          ]
        };
        
        setClient(mockClient);
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  // Funções de navegação
  const handleEdit = () => {
    router.push(`/clients/${clientId}/edit`);
  };

  const handleNewInteraction = () => {
    // Implementar modal ou página de nova interação
    console.log('Nova interação');
  };

  const handleNewTask = () => {
    // Implementar modal ou página de nova tarefa
    console.log('Nova tarefa');
  };

  const handleNewProposal = () => {
    router.push(`/proposals/new?clientId=${clientId}`);
  };

  const handleTransfer = () => {
    // Implementar modal de transferência
    console.log('Transferir cliente');
  };

  // Formatação de dados
  const formatDocument = (type: 'cpf' | 'cnpj', number: string) => {
    return type === 'cpf' ? formatCPF(number) : formatCNPJ(number);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Cores para status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <Badge variant="outline" className={`${styles.clientStatus} ${styles.active}`}>
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
            <Button onClick={handleTransfer} variant="outline">
              <UserCheck className={styles.buttonIcon} />
              Transferir
            </Button>
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
                    {client.interactions.map((interaction) => (
                      <div key={interaction.id} className={styles.clientInteractionItem}>
                        <div className={styles.clientInteractionIcon}>
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className={styles.clientInteractionContent}>
                          <div className={styles.clientInteractionHeader}>
                            <span className={styles.clientInteractionUser}>{interaction.user.name}</span>
                            <Badge variant="outline" className={styles.badgeSmall}>
                              {interaction.type}
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
                    ))}
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
                    {client.tasks.map((task) => (
                      <div key={task.id} className={styles.clientTaskItem}>
                        <div className={styles.clientTaskContent}>
                          <div className={styles.clientTaskHeader}>
                            <h4 className={styles.clientTaskTitle}>{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className={styles.clientTaskDescription}>{task.description}</p>
                          )}
                          <div className={styles.clientTaskMeta}>
                            <span>Responsável: {task.assignedUser.name}</span>
                            <span>Vencimento: {formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                            <Badge variant="outline" className={getStatusColor(proposal.status)}>
                              {proposal.status}
                            </Badge>
                          </div>
                          <div className={styles.clientProposalMeta}>
                            <span>Operadora: {proposal.operator.name}</span>
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
    </div>
  );
}
