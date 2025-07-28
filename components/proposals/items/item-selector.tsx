'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemSummary from './item-summary';
import styles from './item-selector.module.css';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
}

interface OperatorProduct {
  id: string;
  baseItemId: string;
  name: string;
  description?: string;
  customFields: CustomField[];
  basePrice?: number;
  allowPriceEdit: boolean;
}

interface ProposalItem {
  id: string;
  operatorProductId: string;
  baseItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customFields?: Record<string, any>;
}

interface ItemSelectorProps {
  data: {
    operatorId?: string;
    items: ProposalItem[];
  };
  onComplete: (data: { items: ProposalItem[] }) => void;
  onUpdate: (data: { items: ProposalItem[] }) => void;
}

export default function ItemSelector({ data, onComplete, onUpdate }: ItemSelectorProps) {
  const [products, setProducts] = useState<OperatorProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<OperatorProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<ProposalItem[]>(data.items || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OperatorProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!data.operatorId) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockProducts: OperatorProduct[] = [
          {
            id: '1',
            baseItemId: 'base-1',
            name: 'Hospedagem Hotel 5 Estrelas',
            description: 'Hospedagem em hotel de luxo com café da manhã incluído',
            allowPriceEdit: false,
            basePrice: 450.00,
            customFields: [
              { id: 'checkin', name: 'Data de Check-in', type: 'date', required: true },
              { id: 'checkout', name: 'Data de Check-out', type: 'date', required: true },
              { id: 'adults', name: 'Número de Adultos', type: 'number', required: true },
              { id: 'children', name: 'Número de Crianças', type: 'number', required: false },
              { id: 'room_type', name: 'Tipo de Quarto', type: 'select', required: true, 
                options: ['Standard', 'Superior', 'Deluxe', 'Suíte'] }
            ]
          },
          {
            id: '2',
            baseItemId: 'base-2',
            name: 'Passagem Aérea Nacional',
            description: 'Passagem aérea para destinos nacionais',
            allowPriceEdit: true,
            customFields: [
              { id: 'origin', name: 'Origem', type: 'text', required: true },
              { id: 'destination', name: 'Destino', type: 'text', required: true },
              { id: 'departure_date', name: 'Data de Ida', type: 'date', required: true },
              { id: 'return_date', name: 'Data de Volta', type: 'date', required: false },
              { id: 'class', name: 'Classe', type: 'select', required: true,
                options: ['Econômica', 'Executiva', 'Primeira Classe'] }
            ]
          },
          {
            id: '3',
            baseItemId: 'base-3',
            name: 'Ingresso Parque Temático',
            description: 'Entrada para parques de diversão',
            allowPriceEdit: false,
            basePrice: 120.00,
            customFields: [
              { id: 'park_name', name: 'Nome do Parque', type: 'text', required: true },
              { id: 'visit_date', name: 'Data da Visita', type: 'date', required: true },
              { id: 'ticket_type', name: 'Tipo de Ingresso', type: 'select', required: true,
                options: ['Inteira', 'Meia-entrada', 'Idoso', 'Criança'] }
            ]
          }
        ];

        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [data.operatorId]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleAddItem = useCallback((product: OperatorProduct) => {
    setSelectedProduct(product);
    setShowAddForm(true);
  }, []);

  const handleSaveItem = useCallback((itemData: Partial<ProposalItem>) => {
    if (!selectedProduct) return;

    const newItem: ProposalItem = {
      id: `temp-${Date.now()}`,
      operatorProductId: selectedProduct.id,
      baseItemId: selectedProduct.baseItemId,
      name: selectedProduct.name,
      quantity: itemData.quantity || 1,
      unitPrice: itemData.unitPrice || selectedProduct.basePrice || 0,
      subtotal: (itemData.quantity || 1) * (itemData.unitPrice || selectedProduct.basePrice || 0),
      customFields: itemData.customFields
    };

    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    onUpdate({ items: updatedItems });
    setShowAddForm(false);
    setSelectedProduct(null);
  }, [selectedProduct, selectedItems, onUpdate]);

  const handleRemoveItem = useCallback((itemId: string) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    onUpdate({ items: updatedItems });
  }, [selectedItems, onUpdate]);

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.subtotal, 0);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className={styles.itemsContainer}>
      <div className={styles.itemsMain}>
        <h2 className={styles.sectionTitle}>Adicionar Itens à Proposta</h2>
        
        <div className={styles.itemSelector}>
          <div className={styles.itemSearch}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.itemsList}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{product.name}</h3>
                    {product.description && (
                      <p className={styles.itemDescription}>{product.description}</p>
                    )}
                    <div className={styles.itemFields}>
                      <Package className={styles.itemFieldsIcon} />
                      {product.customFields.length} campos customizados
                      {product.basePrice && (
                        <span className={styles.itemPrice}>
                          A partir de R$ {product.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddItem(product)}
                    className={styles.addButton}
                  >
                    <Plus className={styles.addButtonIcon} />
                    Adicionar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </div>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className={styles.selectedItemsSection}>
            <h3 className={styles.selectedItemsTitle}>Itens Adicionados</h3>
            <div className={styles.selectedItemsList}>
              {selectedItems.map((item) => (
                <div key={item.id} className={styles.selectedItemCard}>
                  <div className={styles.selectedItemInfo}>
                    <h4 className={styles.selectedItemName}>{item.name}</h4>
                    <p className={styles.selectedItemDetails}>
                      Qtd: {item.quantity} × R$ {item.unitPrice.toFixed(2)} =
                      <span className={styles.selectedItemTotal}>R$ {item.subtotal.toFixed(2)}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.itemsSidebar}>
        <ItemSummary 
          items={selectedItems}
          total={calculateTotal()}
        />
      </div>

      {/* TODO: Add ItemForm modal for adding/editing items */}
      
      <div className={styles.actions}>
        <Button
          onClick={() => onComplete({ items: selectedItems })}
          disabled={selectedItems.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}