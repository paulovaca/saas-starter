'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';  
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft,
  Building2, 
  Edit, 
  MoreHorizontal,
  Power,
  Phone,
  Mail,
  MapPin,
  FileText,
  Plus,
  Package,
  Users,
  Settings,
  Trash2
} from 'lucide-react';
import { OperatorFormModal } from './operator-form-modal';
import { ItemAssociationModal } from './item-association-modal';
import { EditItemModal } from './edit-item-modal';
import { CommissionModal } from './commission-modal';
import { OperatorDetails } from '@/lib/actions/operators/get-operator-details';
import { deleteOperatorItem } from '@/lib/actions/operators/delete-operator-item';
import { toggleOperatorItemStatus } from '@/lib/actions/operators/toggle-operator-item-status';
import { usePermissions } from '@/hooks/use-permissions';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toggleOperatorStatus } from '@/lib/actions/operators/toggle-operator-status';
import { toast } from 'sonner';
import styles from './operator-details-content.module.css';
interface OperatorDetailsContentProps {
  operator: OperatorDetails;
}

export function OperatorDetailsContent({ operator }: OperatorDetailsContentProps) {
  const router = useRouter();
  const { user, canDeleteOperators } = usePermissions();
  
  const getRuleTypeLabel = (ruleType: string) => {
    switch (ruleType) {
      case 'percentage_fixed': return 'Porcentagem Fixa';
      case 'value_fixed': return 'Valor Fixo Por Venda';
      case 'tiered': return 'Escalonamento';
      case 'custom': return 'Personalizado';
      default: return ruleType;
    }
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Check if user can hard delete items
  const canHardDelete = user?.role && ['MASTER', 'ADMIN'].includes(user.role);

  const handleToggleStatus = async () => {
    try {
      const result = await toggleOperatorStatus({
        id: operator.id,
        isActive: !operator.isActive,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao alterar status da operadora');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item definitivamente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const result = await deleteOperatorItem({
        operatorItemId: itemId,
        operatorId: operator.id,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir item da operadora');
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsEditItemModalOpen(true);
  };

  const handleManageCommissions = (item: any) => {
    // Encontra o item atualizado na lista de itens da operadora
    const updatedItem = operator.items.find(i => i.id === item.id) || item;
    setSelectedItem(updatedItem);
    setIsCommissionModalOpen(true);
  };

  const handleToggleItemStatus = async (item: any) => {
    try {
      const result = await toggleOperatorItemStatus({
        operatorItemId: item.id,
        operatorId: operator.id,
        isActive: !item.isActive,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao alterar status do item');
    }
  };

  return (
    <div className={styles.detailsContainer}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <Button variant="ghost" size="sm" asChild className={styles.backButton}>
            <Link href="/operators">
              <ArrowLeft className={styles.backIcon} />
              Voltar
            </Link>
          </Button>
          <div className={styles.operatorHeader}>
            {operator.logo ? (
              <div className={styles.operatorLogo}>                        <Image
                          src={operator.logo}
                          alt={`Logo ${operator.name}`}
                          fill
                          className={styles.objectContain}
                        />
              </div>
            ) : (
              <div className={styles.operatorLogoPlaceholder}>
                <Building2 className={styles.operatorLogoIcon} />
              </div>
            )}
            <div className={styles.operatorInfo}>
              <h1>{operator.name}</h1>
              {operator.cnpj && (
                <p>CNPJ: {operator.cnpj}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <Badge variant={operator.isActive ? 'default' : 'secondary'}>
            {operator.isActive ? 'Ativa' : 'Inativa'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className={styles.moreIcon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit className={styles.editIcon} />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <Power className={styles.powerIcon} />
                {operator.isActive ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <Tabs defaultValue="info">
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="info" className={styles.tabsTrigger}>Informações</TabsTrigger>
            <TabsTrigger value="items" className={styles.tabsTrigger}>
              Itens Base ({operator.items.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className={styles.tabsTrigger}>
              Documentos ({operator.documents.length})
            </TabsTrigger>
          </TabsList>

        {/* Information Tab */}
          <TabsContent value="info">
            <div className={styles.infoGrid}>
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className={styles.contactHeader}>
                  <Users className={styles.contactIcon} />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                {operator.contactName && (
                  <div className={styles.contactItem}>
                    <Users className={styles.contactIcon} />
                    <span>{operator.contactName}</span>
                  </div>
                )}
                {operator.contactEmail && (
                  <div className={styles.contactItem}>
                    <Mail className={styles.contactIcon} />
                    <span>{operator.contactEmail}</span>
                  </div>
                )}
                {operator.contactPhone && (
                  <div className={styles.contactItem}>
                    <Phone className={styles.contactIcon} />
                    <span>{operator.contactPhone}</span>
                  </div>
                )}
                {!operator.contactName && !operator.contactEmail && !operator.contactPhone && (
                  <p className={styles.emptyStateDescription}>
                    Nenhuma informação de contato cadastrada
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className={styles.contactHeader}>
                  <MapPin className={styles.mapIcon} />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                {operator.address ? (
                  <p className={styles.notesContent}>{operator.address}</p>
                ) : (
                  <p className={styles.emptyStateDescription}>
                    Nenhum endereço cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {operator.notes && (
            <Card>
              <CardHeader>
                <CardTitle className={styles.contactHeader}>
                  <FileText className={styles.fileIcon} />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={styles.notesContent}>{operator.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items">
          <div className={styles.itemsHeader}>
            <div>
              <h3 className={styles.itemsTitle}>Itens Base da Operadora</h3>
              <p className={styles.itemsDescription}>
                Produtos e serviços oferecidos por esta operadora
              </p>
            </div>
            <Button onClick={() => setIsAssociationModalOpen(true)}>
              <Plus className={styles.plusIcon} />
              Adicionar Item
            </Button>
          </div>

          {operator.items.length === 0 ? (
            <Card>
              <CardContent className={styles.emptyState}>
                <Package className={styles.emptyStateIcon} />
                <h3 className={styles.emptyStateTitle}>Nenhum item cadastrado</h3>
                <p className={styles.emptyStateDescription}>
                  Esta operadora ainda não possui itens do catálogo associados.
                </p>
                <Button onClick={() => setIsAssociationModalOpen(true)}>
                  <Plus className={styles.plusIcon} />
                  Adicionar Primeiro Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={styles.itemsGrid}>
              {operator.items.map((item) => (
                <Card key={item.id} className={styles.compactCard}>
                  <CardHeader className={styles.compactCardHeader}>
                    <div className={styles.itemHeader}>
                      <CardTitle className={styles.itemTitle}>
                        {item.customName || `Item ${item.catalogItemId.slice(-8)}`}
                      </CardTitle>
                      <div className={styles.itemActions}>
                        <Badge 
                          variant={item.isActive ? 'default' : 'secondary'}
                          className={`${!item.isActive ? styles.inactiveBadge : styles.activeBadge}`}
                          key={`${item.id}-${item.isActive}`}
                        >
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className={styles.itemMoreIcon} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Edit className={styles.itemEditIcon} />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageCommissions(item)}>
                              <Settings className={styles.settingsIcon} />
                              Comissões
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleItemStatus(item)}>
                              <Power className={styles.itemPowerIcon} />
                              {item.isActive ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            {canHardDelete && (
                              <DropdownMenuItem 
                                className={styles.destructiveMenuItem}
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className={styles.trashIcon} />
                                Excluir Definitivamente
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={styles.compactCardContent}>
                    {item.commissionRules.length > 0 ? (
                      <div className={styles.itemContent}>
                        <div className={styles.commissionRules}>
                          <p className={styles.commissionRuleTitle}>Regras de Comissão:</p>
                          {item.commissionRules.map((rule) => (
                            <div key={rule.id} className={styles.commissionRule}>
                              • {getRuleTypeLabel(rule.ruleType)}: {rule.percentage && `${rule.percentage}%`} 
                              {rule.fixedValue && `R$ ${rule.fixedValue.toFixed(2)}`}
                              {rule.minValue && rule.maxValue && ` (R$ ${rule.minValue} - R$ ${rule.maxValue})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.emptyCommissionRules}>
                        <p className={styles.emptyCommissionText}>
                          Nenhuma regra de comissão configurada
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className={styles.itemsHeader}>
            <div>
              <h3 className={styles.itemsTitle}>Documentos</h3>
              <p className={styles.itemsDescription}>
                Contratos, tabelas de preços e outros documentos
              </p>
            </div>
            <Button>
              <Plus className={styles.plusIcon} />
              Upload Documento
            </Button>
          </div>

          {operator.documents.length === 0 ? (
            <Card>
              <CardContent className={styles.emptyState}>
                <FileText className={styles.emptyStateIcon} />
                <h3 className={styles.emptyStateTitle}>Nenhum documento</h3>
                <p className={styles.emptyStateDescription}>
                  Faça upload de contratos, tabelas de preços e outros documentos importantes.
                </p>
                <Button>
                  <Plus className={styles.plusIcon} />
                  Upload Primeiro Documento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={styles.documentsGrid}>
              {operator.documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className={styles.documentContent}>
                    <div className={styles.documentInfo}>
                      <FileText className={styles.documentIcon} />
                      <div className={styles.documentDetails}>
                        <h4>{document.fileName}</h4>
                        <p className={styles.documentType}>
                          {document.documentType === 'contract' && 'Contrato'}
                          {document.documentType === 'price_table' && 'Tabela de Preços'}
                          {document.documentType === 'marketing_material' && 'Material de Marketing'}
                          {document.documentType === 'other' && 'Outro'}
                        </p>
                        <p className={styles.documentDate}>
                          Upload: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={styles.documentActions}>
                      <Button variant="outline" size="sm" asChild>
                        <a href={document.documentUrl} target="_blank" rel="noopener noreferrer">
                          Ver
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className={styles.itemMoreIcon} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className={styles.itemEditIcon} />
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem className={styles.destructiveMenuItem}>
                            <Trash2 className={styles.trashIcon} />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>

      <OperatorFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        operator={operator}
      />

      <ItemAssociationModal
        isOpen={isAssociationModalOpen}
        onClose={() => setIsAssociationModalOpen(false)}
        operatorId={operator.id}
        operatorName={operator.name}
      />

      <EditItemModal
        isOpen={isEditItemModalOpen}
        onClose={() => setIsEditItemModalOpen(false)}
        item={editingItem}
        operatorId={operator.id}
        onSuccess={() => router.refresh()}
      />

      <CommissionModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        item={selectedItem}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
