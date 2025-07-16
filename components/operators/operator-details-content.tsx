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
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/operators">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            {operator.logo ? (
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={operator.logo}
                  alt={`Logo ${operator.name}`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{operator.name}</h1>
              {operator.cnpj && (
                <p className="text-muted-foreground">CNPJ: {operator.cnpj}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={operator.isActive ? 'default' : 'secondary'}>
            {operator.isActive ? 'Ativa' : 'Inativa'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <Power className="mr-2 h-4 w-4" />
                {operator.isActive ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
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
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {operator.contactName && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{operator.contactName}</span>
                  </div>
                )}
                {operator.contactEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{operator.contactEmail}</span>
                  </div>
                )}
                {operator.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{operator.contactPhone}</span>
                  </div>
                )}
                {!operator.contactName && !operator.contactEmail && !operator.contactPhone && (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma informação de contato cadastrada
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                {operator.address ? (
                  <p className="text-sm">{operator.address}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">
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
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{operator.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Itens Base da Operadora</h3>
              <p className="text-muted-foreground">
                Produtos e serviços oferecidos por esta operadora
              </p>
            </div>
            <Button onClick={() => setIsAssociationModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>

          {operator.items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum item cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Esta operadora ainda não possui itens do catálogo associados.
                </p>
                <Button onClick={() => setIsAssociationModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {operator.items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {item.customName || `Item ${item.catalogItemId.slice(-8)}`}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.isActive ? 'default' : 'secondary'}>
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          {item.commissionType === 'percentage' ? 'Percentual' :
                           item.commissionType === 'fixed' ? 'Valor Fixo' : 'Escalonado'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditItem(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageCommissions(item)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Comissões
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleItemStatus(item)}>
                              <Power className="mr-2 h-4 w-4" />
                              {item.isActive ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            {canHardDelete && (
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Definitivamente
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        ID do Catálogo: {item.catalogItemId}
                      </p>
                      {item.commissionRules.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Regras de Comissão:</p>
                          {item.commissionRules.map((rule) => (
                            <div key={rule.id} className="text-sm text-muted-foreground">
                              • {rule.ruleType}: {rule.percentage && `${rule.percentage}%`} 
                              {rule.fixedValue && `R$ ${rule.fixedValue.toFixed(2)}`}
                              {rule.minValue && rule.maxValue && ` (R$ ${rule.minValue} - R$ ${rule.maxValue})`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Documentos</h3>
              <p className="text-muted-foreground">
                Contratos, tabelas de preços e outros documentos
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Documento
            </Button>
          </div>

          {operator.documents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Faça upload de contratos, tabelas de preços e outros documentos importantes.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Primeiro Documento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {operator.documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{document.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.documentType === 'contract' && 'Contrato'}
                          {document.documentType === 'price_table' && 'Tabela de Preços'}
                          {document.documentType === 'marketing_material' && 'Material de Marketing'}
                          {document.documentType === 'other' && 'Outro'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={document.documentUrl} target="_blank" rel="noopener noreferrer">
                          Ver
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
        onSuccess={() => router.refresh()}
      />

      <CommissionModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        item={selectedItem}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
