'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormModal } from '@/components/ui/form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { associateItemsSchema, type AssociateItemsInput } from '@/lib/validations/operators/association.schema';
import { associateItems } from '@/lib/actions/operators/associate-items';
import { getBaseItems } from '@/lib/actions/catalog/base-items';
import { useRouter } from 'next/navigation';
import { Loader2, Package, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import styles from './item-association-modal.module.css';

interface ItemAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatorId: string;
  operatorName: string;
  associatedItemIds?: string[];
}

interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export function ItemAssociationModal({ isOpen, onClose, operatorId, operatorName, associatedItemIds = [] }: ItemAssociationModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [duplicateNameError, setDuplicateNameError] = useState<string>('');

  const form = useForm({
    resolver: zodResolver(associateItemsSchema),
    defaultValues: {
      operatorId: '',
      catalogItemId: '',
      customName: '',
      commissionType: 'percentage' as const,
      isActive: true,
    },
  });

  // Set operatorId when component mounts or operatorId changes
  useEffect(() => {
    form.setValue('operatorId', operatorId);
  }, [operatorId, form]);

  // Load catalog items
  useEffect(() => {
    if (isOpen) {
      loadCatalogItems();
      // Reset all states when modal opens
      setDuplicateNameError('');
      setSelectedItem(null);
      setSearchTerm('');
      form.reset({
        operatorId: operatorId,
        catalogItemId: '',
        customName: '',
        commissionType: 'percentage' as const,
        isActive: true,
      });
    }
  }, [isOpen, operatorId, form]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDuplicateNameError('');
      setSelectedItem(null);
      setSearchTerm('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const loadCatalogItems = async () => {
    try {
      setIsLoadingItems(true);
      const items = await getBaseItems();
      
      // Transform the data to match our interface
      const catalogItems: CatalogItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        isActive: item.isActive,
      }));
      
      setCatalogItems(catalogItems);
    } catch (error) {
      console.error('Error loading catalog items:', error);
      toast.error('Erro ao carregar itens do catálogo');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const filteredItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmit = async (data: any) => {
    if (!selectedItem) {
      toast.error('Selecione um item do catálogo');
      return;
    }

    setIsLoading(true);
    setDuplicateNameError(''); // Limpar erro anterior
    
    try {
      const associationData: AssociateItemsInput = {
        operatorId: operatorId, // Use the prop directly
        catalogItemId: selectedItem.id,
        customName: data.customName || selectedItem.name,
        commissionType: 'percentage', // Valor padrão: Comissionamento Direto
        isActive: data.isActive ?? true,
      };

      const result = await associateItems(associationData);
      
      if (result.success) {
        toast.success(result.message || 'Item associado com sucesso!');
        handleCancel();
        router.refresh();
      } else {
        // Verificar se é erro de nome duplicado
        if (result.error && result.error.includes('Já existe um item com o nome')) {
          setDuplicateNameError('O nome customizado já existe nessa operadora');
        } else {
          toast.error(result.error || 'Erro ao associar item');
        }
      }
    } catch (error) {
      console.error('Error associating item:', error);
      toast.error('Erro ao associar item');
      // Reset states on error to prevent corruption
      setDuplicateNameError('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form with default values
    form.reset({
      operatorId: operatorId,
      catalogItemId: '',
      customName: '',
      commissionType: 'percentage' as const,
      isActive: true,
    });
    setSelectedItem(null);
    setSearchTerm('');
    setDuplicateNameError('');
    setIsLoading(false); // Garantir que loading seja falso
    onClose();
  };

  const handleItemSelect = (item: CatalogItem) => {
    setSelectedItem(item);
    setDuplicateNameError(''); // Limpar erro ao selecionar novo item
    form.setValue('catalogItemId', item.id);
    if (!form.getValues('customName')) {
      form.setValue('customName', item.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.modalContent}>
        <DialogHeader>
          <DialogTitle>Associar Item Base</DialogTitle>
          <DialogDescription>
            Selecione um item do catálogo para associar à operadora {operatorName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.formContainer}>
          <div className={styles.scrollableContent}>
            {/* Search */}
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Items List */}
            <div className={styles.itemsSection}>
              <h4 className={styles.sectionTitle}>Itens Disponíveis</h4>
              <div className={styles.itemsList}>
                {isLoadingItems ? (
                  <div className={styles.loadingState}>
                    <Loader2 className={styles.loadingIcon} />
                    <p>Carregando itens...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Package className={styles.emptyIcon} />
                    <p>Nenhum item encontrado</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.itemCard} ${
                        selectedItem?.id === item.id ? styles.itemCardSelected : ''
                      }`}
                      onClick={() => handleItemSelect(item)}
                    >
                      <div className={styles.itemInfo}>
                        <h5 className={styles.itemName}>
                          {item.name}
                        </h5>
                        {item.description && (
                          <p className={styles.itemDescription}>{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Configuration Section */}
            {selectedItem && (
              <div className={styles.configSection}>
                <h4 className={styles.sectionTitle}>Configuração do Item</h4>
                
                <div className={styles.formField}>
                  <label htmlFor="customName" className={styles.formLabel}>
                    Nome Customizado
                  </label>
                  <input
                    id="customName"
                    type="text"
                    placeholder="Nome que aparecerá para esta operadora"
                    {...form.register('customName')}
                    className={styles.formInput}
                    onChange={(e) => {
                      form.setValue('customName', e.target.value);
                      setDuplicateNameError(''); // Limpar erro ao digitar
                    }}
                  />
                  <p className={styles.formDescription}>
                    Deixe em branco para usar o nome padrão: {selectedItem.name}
                  </p>
                  {form.formState.errors.customName && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.customName.message}
                    </p>
                  )}
                  {duplicateNameError && (
                    <p className={styles.errorMessage}>
                      {duplicateNameError}
                    </p>
                  )}
                </div>

                <div className={styles.formField}>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      {...form.register('isActive')}
                      className={styles.checkbox}
                      id="isActive"
                    />
                    <label htmlFor="isActive" className={styles.checkboxLabel}>
                      Item ativo
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.actionsContainer}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedItem}
              className={styles.submitButton}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  Associando...
                </>
              ) : (
                'Associar Item'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}