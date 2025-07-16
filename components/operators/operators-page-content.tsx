'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Building2, 
  MoreHorizontal, 
  Edit, 
  Power, 
  Users,
  FileText,
  Phone,
  Mail,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OperatorFormModal } from './operator-form-modal';
import { OperatorWithStats } from '@/lib/actions/operators/get-operators';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toggleOperatorStatus } from '@/lib/actions/operators/toggle-operator-status';
import { deleteOperator } from '@/lib/actions/operators/delete-operator';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface OperatorsPageContentProps {
  operators: OperatorWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search?: string;
    isActive?: boolean;
    hasProducts?: boolean;
    page: number;
  };
}

export function OperatorsPageContent({ operators, pagination, filters }: OperatorsPageContentProps) {
  const router = useRouter();
  const { canDeleteOperators } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [activeFilter, setActiveFilter] = useState<string>(
    filters.isActive === true ? 'active' : filters.isActive === false ? 'inactive' : 'all'
  );
  const [productsFilter, setProductsFilter] = useState<string>(
    filters.hasProducts === true ? 'with-products' : filters.hasProducts === false ? 'without-products' : 'all'
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (activeFilter !== 'all') {
      params.set('isActive', activeFilter === 'active' ? 'true' : 'false');
    }
    if (productsFilter !== 'all') {
      params.set('hasProducts', productsFilter === 'with-products' ? 'true' : 'false');
    }
    router.push(`/operators?${params.toString()}`);
  };

  const handleToggleStatus = async (operatorId: string, currentStatus: boolean) => {
    try {
      const result = await toggleOperatorStatus({
        id: operatorId,
        isActive: !currentStatus,
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

  const handleDeleteClick = (operatorId: string, operatorName: string) => {
    setOperatorToDelete({ id: operatorId, name: operatorName });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!operatorToDelete) return;

    try {
      const result = await deleteOperator({ operatorId: operatorToDelete.id });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error) {
      toast.error('Erro ao excluir operadora');
    } finally {
      setIsDeleteDialogOpen(false);
      setOperatorToDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={productsFilter} onValueChange={setProductsFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Produtos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="with-products">Com Produtos</SelectItem>
              <SelectItem value="without-products">Sem Produtos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Operadora
        </Button>
      </div>

      {operators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma operadora encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {filters.search || filters.isActive !== undefined || filters.hasProducts !== undefined
                ? 'Tente ajustar os filtros para encontrar operadoras.'
                : 'Você ainda não cadastrou nenhuma operadora. Crie sua primeira operadora parceira.'}
            </p>
            {!filters.search && filters.isActive === undefined && filters.hasProducts === undefined && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Operadora
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {operators.map((operator) => (
            <Card key={operator.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {operator.logo ? (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={operator.logo}
                          alt={`Logo ${operator.name}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{operator.name}</CardTitle>
                      {operator.cnpj && (
                        <CardDescription className="mt-1">
                          CNPJ: {operator.cnpj}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/operators/${operator.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(operator.id, operator.isActive)}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {operator.isActive ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                      {canDeleteOperators() && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(operator.id, operator.name)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={operator.isActive ? 'default' : 'secondary'}>
                    {operator.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    {operator.itemsCount} {operator.itemsCount === 1 ? 'produto' : 'produtos'}
                  </div>
                </div>

                {(operator.contactEmail || operator.contactPhone || operator.contactName) && (
                  <div className="space-y-2">
                    {operator.contactName && (
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{operator.contactName}</span>
                      </div>
                    )}
                    {operator.contactEmail && (
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{operator.contactEmail}</span>
                      </div>
                    )}
                    {operator.contactPhone && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{operator.contactPhone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/operators/${operator.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', (pagination.page - 1).toString());
              router.push(`/operators?${params.toString()}`);
            }}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', (pagination.page + 1).toString());
              router.push(`/operators?${params.toString()}`);
            }}
          >
            Próxima
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a operadora "{operatorToDelete?.name}"? 
              Esta ação é irreversível e todos os dados relacionados serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OperatorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
