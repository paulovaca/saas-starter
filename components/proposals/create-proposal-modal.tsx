'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar, User, Package, Target } from 'lucide-react';
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
  id?: string;
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
  initialData?: any;
  isDuplicate?: boolean;
}

export default function CreateProposalModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData,
  isDuplicate = false
}: CreateProposalModalProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string>('');
  const [funnels, setFunnels] = useState<any[]>([]);
  const [funnelStages, setFunnelStages] = useState<any[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(false);
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().split('T')[0];
  });
  
  // Get tomorrow's date for validation
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProposalItem | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Load clients and funnels when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadAllClients();
      loadFunnels();
    }
  }, [isOpen]);

  // Load funnel stages when funnel is selected
  React.useEffect(() => {
    if (selectedFunnel) {
      loadFunnelStages(selectedFunnel);
    } else {
      setFunnelStages([]);
      setSelectedFunnelStage('');
    }
  }, [selectedFunnel]);

  // Load initial data for duplication
  React.useEffect(() => {
    if (isOpen && initialData) {
      console.log('🔄 Loading initial data for duplication:', initialData);
      
      // Set client if provided
      if (initialData.clientId && clients.length > 0) {
        const client = clients.find(c => c.id === initialData.clientId);
        if (client) {
          setSelectedClient(client);
        }
      }
      
      // Set other fields
      if (initialData.validUntil) {
        setValidUntil(initialData.validUntil);
      }
      
      // Set items if provided
      if (initialData.items && Array.isArray(initialData.items)) {
        const formattedItems = initialData.items.map((item: any, index: number) => ({
          id: `temp_${index}`, // Temporary ID for UI
          operatorId: item.operatorId || '',
          operatorName: item.operatorName || '',
          baseItemId: item.baseItemId || '',
          baseItemName: item.baseItemName || item.name || '',
          name: item.name || '',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          subtotal: Number(item.quantity || 1) * Number(item.unitPrice || 0),
          customFields: item.customFields || {}
        }));
        setItems(formattedItems);
      }
      
      console.log('✅ Initial data loaded successfully');
    }
  }, [isOpen, initialData, clients]);

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

  const loadFunnels = async () => {
    try {
      setLoadingFunnels(true);
      const response = await fetch('/api/funnels');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar funis');
      }
      
      const result = await response.json();
      if (result.funnels && Array.isArray(result.funnels)) {
        setFunnels(result.funnels);
      }
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
      setFunnels([]);
    } finally {
      setLoadingFunnels(false);
    }
  };

  const loadFunnelStages = async (funnelId: string) => {
    try {
      const response = await fetch(`/api/funnels/${funnelId}/stages`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar etapas do funil');
      }
      
      const result = await response.json();
      if (result.stages && Array.isArray(result.stages)) {
        setFunnelStages(result.stages);
        // Automaticamente selecionar a primeira etapa se não houver seleção
        if (!selectedFunnelStage && result.stages.length > 0) {
          setSelectedFunnelStage(result.stages[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar etapas do funil:', error);
      setFunnelStages([]);
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

    if (!selectedFunnel) {
      alert('Selecione um funil');
      return;
    }

    if (items.length === 0) {
      alert('Adicione pelo menos um produto');
      return;
    }

    // Validate items have required fields
    const invalidItems = items.filter(item => 
      !item.operatorId || !item.operatorName || !item.baseItemId || !item.baseItemName || !item.name
    );
    
    if (invalidItems.length > 0) {
      alert('Alguns produtos estão com dados incompletos. Verifique se todos os campos obrigatórios estão preenchidos.');
      return;
    }

    // Validate date - must be at least tomorrow
    const selectedDate = new Date(validUntil);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Reset time to start of day
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      alert('A data de validade deve ser a partir de amanhã');
      return;
    }

    const proposalData = {
      clientId: selectedClient.id,
      operatorId: items.length > 0 ? items[0].operatorId : '', // Use operator from first item
      funnelId: selectedFunnel,
      funnelStageId: selectedFunnelStage || undefined,
      validUntil: validUntil, // Keep as YYYY-MM-DD format
      items: items.map(item => ({
        operatorId: item.operatorId,
        operatorName: item.operatorName,
        baseItemId: item.baseItemId,
        baseItemName: item.baseItemName,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        customFields: item.customFields || {}
      })),
      paymentMethod: '', // Default empty - could add form field later
      notes: '' // Default empty - could add form field later
    };

    console.log('🚀 Sending proposal data:', JSON.stringify(proposalData, null, 2));
    onSubmit?.(proposalData);
    handleClose();
  }, [selectedClient, items, validUntil, onSubmit]);

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
        {isDuplicate ? 'Duplicar Proposta' : 'Criar Proposta'}
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isDuplicate ? "Duplicar Proposta" : "Nova Proposta"}
        size="lg"
        footer={footer}
        className={styles.modal}
        preventClose={true}
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

          {/* Funnel Selection */}
          <div className={styles.section}>
            <label className={styles.label}>
              <Target className={styles.labelIcon} />
              Funil *
            </label>
            {loadingFunnels ? (
              <div className={styles.loadingState}>Carregando funis...</div>
            ) : (
              <select
                value={selectedFunnel}
                onChange={(e) => setSelectedFunnel(e.target.value)}
                className={styles.input}
                required
              >
                <option value="">Selecione um funil...</option>
                {funnels.map((funnel) => (
                  <option key={funnel.id} value={funnel.id}>
                    {funnel.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Funnel Stage Selection */}
          {selectedFunnel && (
            <div className={styles.section}>
              <label className={styles.label}>
                <Target className={styles.labelIcon} />
                Etapa do Funil
              </label>
              <select
                value={selectedFunnelStage}
                onChange={(e) => setSelectedFunnelStage(e.target.value)}
                className={styles.input}
              >
                <option value="">Selecionar etapa (padrão: primeira)</option>
                {funnelStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              <small className={styles.helpText}>
                Se não selecionada, usará a primeira etapa do funil
              </small>
            </div>
          )}

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
              min={getTomorrowDate()}
              className={styles.input}
              title="A data deve ser a partir de amanhã"
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
                          onClick={() => item.id && handleRemoveItem(item.id)}
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