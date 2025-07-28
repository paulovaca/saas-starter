'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar, User, Package } from 'lucide-react';
import AddProductModal from './add-product-modal';
import { calculateSubtotal, formatCurrency } from '@/lib/services/proposal-calculator';
import styles from './create-proposal-modal.module.css';

interface Client {
  id: string;
  name: string;
  email: string;
  documentNumber: string;
  documentType: 'cpf' | 'cnpj';
}

interface ProposalItem {
  id: string;
  operatorId: string;
  operatorName: string;
  baseItemId: string;
  baseItemName: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  customFields: Record<string, any>;
}

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (proposalData: any) => void;
}

export default function CreateProposalModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: CreateProposalModalProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProposalItem | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Load clients when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadAllClients();
    }
  }, [isOpen]);

  const loadAllClients = async () => {
    try {
      console.log('🚀 Starting to load clients...');
      setLoadingClients(true);
      
      const response = await fetch('/api/clients?limit=100');
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📥 Client result:', result);
      
      if (result.clients && Array.isArray(result.clients)) {
        const transformedClients = result.clients.map((client: any) => ({
          id: client.id,
          name: client.name,
          email: client.email || '',
          documentNumber: client.documentNumber || '',
          documentType: client.documentType || 'cpf',
        }));
        
        console.log('✅ Setting clients:', transformedClients);
        setClients(transformedClients);
      } else {
        console.error('No clients in response or invalid format');
        setClients([]);
      }
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
      console.log('🏁 Finished loading clients');
    }
  };

  const handleSelectClient = useCallback((client: Client) => {
    setSelectedClient(client);
  }, []);

  const handleAddProduct = useCallback((product: ProposalItem) => {
    if (editingItem) {
      // Update existing item
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...product, id: editingItem.id } : item
      ));
      setEditingItem(null);
    } else {
      // Add new item
      setItems(prev => [...prev, { ...product, id: `temp-${Date.now()}` }]);
    }
    setShowAddProductModal(false);
  }, [editingItem]);

  const handleEditItem = useCallback((item: ProposalItem) => {
    setEditingItem(item);
    setShowAddProductModal(true);
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal(items.map(item => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })));
  }, [items]);

  const handleSubmit = useCallback(() => {
    if (!selectedClient) {
      alert('Selecione um cliente');
      return;
    }

    if (items.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    const proposalData = {
      clientId: selectedClient.id,
      operatorId: items.length > 0 ? items[0].operatorId : '', // Use operator from first item
      validUntil: new Date(validUntil).toISOString(), // Convert to ISO string for API
      items,
      paymentMethod: '', // Default empty - could add form field later
      notes: '' // Default empty - could add form field later
    };

    console.log('🚀 Sending proposal data:', JSON.stringify(proposalData, null, 2));
    onSubmit?.(proposalData);
    handleClose();
  }, [selectedClient, items, validUntil, calculateTotal, onSubmit]);

  const handleClose = useCallback(() => {
    setSelectedClient(null);
    setItems([]);
    setEditingItem(null);
    setShowAddProductModal(false);
    setClients([]);
    onClose();
  }, [onClose]);


  const formatDocument = (doc: string, type: 'cpf' | 'cnpj') => {
    return type === 'cpf' 
      ? doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const footer = (
    <div className={styles.footer}>
      <Button variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      <Button onClick={handleSubmit}>
        Criar Proposta
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Nova Proposta"
        size="lg"
        footer={footer}
        className={styles.modal}
      >
        <div className={styles.content}>
          {/* Client Selection */}
          <div className={styles.section}>
            <label className={styles.label}>
              <User className={styles.labelIcon} />
              Cliente *
            </label>
            {loadingClients ? (
              <div className={styles.loadingState}>Carregando clientes...</div>
            ) : (
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const clientId = e.target.value;
                  const client = clients.find(c => c.id === clientId);
                  setSelectedClient(client || null);
                }}
                className={styles.input}
                required
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {formatDocument(client.documentNumber, client.documentType)}
                  </option>
                ))}
              </select>
            )}
            
            {clients.length === 0 && !loadingClients && (
              <div className={styles.emptyState}>
                <User className={styles.emptyIcon} />
                <p className={styles.emptyMessage}>Nenhum cliente disponível</p>
                <p className={styles.emptySubMessage}>Cadastre clientes primeiro para criar propostas</p>
              </div>
            )}
          </div>

          {/* Valid Until */}
          <div className={styles.section}>
            <label className={styles.label}>
              <Calendar className={styles.labelIcon} />
              Válida até *
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={styles.input}
            />
          </div>

          {/* Products */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <label className={styles.label}>
                <Package className={styles.labelIcon} />
                Produtos
              </label>
              <Button
                onClick={() => setShowAddProductModal(true)}
                size="sm"
              >
                <Plus className={styles.buttonIcon} />
                Adicionar Produto
              </Button>
            </div>

            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <Package className={styles.emptyIcon} />
                <p className={styles.emptyMessage}>Nenhum produto adicionado</p>
                <p className={styles.emptySubMessage}>Clique em "Adicionar Produto" para começar</p>
              </div>
            ) : (
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <p className={styles.itemOperator}>Operadora: {item.operatorName}</p>
                      </div>
                      <div className={styles.itemActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className={styles.actionIcon} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className={styles.actionIcon} />
                        </Button>
                      </div>
                    </div>
                    <div className={styles.itemDetails}>
                      <span>Qtd: {item.quantity}</span>
                      <span>Valor unit.: {formatCurrency(item.unitPrice)}</span>
                      <span className={styles.itemTotal}>
                        Total: {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className={styles.totalSection}>
              <div className={styles.totalLine}>
                <span className={styles.totalLabel}>Total Geral:</span>
                <span className={styles.totalValue}>
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleAddProduct}
        editingItem={editingItem}
      />
    </>
  );
}