'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import styles from './client-selector.module.css';

interface Client {
  id: string;
  name: string;
  email: string;
  documentNumber: string;
  documentType: 'cpf' | 'cnpj';
  hasOpenProposal?: boolean;
}

interface ClientSelectorProps {
  data: any;
  onComplete: (data: { clientId: string }) => void;
  onUpdate: (data: { clientId: string }) => void;
}

export default function ClientSelector({ data, onComplete, onUpdate }: ClientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search clients
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setClients([]);
      return;
    }

    const searchClients = async () => {
      setIsSearching(true);
      try {
        // TODO: Replace with actual API call
        const mockClients: Client[] = [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@example.com',
            documentNumber: '123.456.789-00',
            documentType: 'cpf'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@example.com',
            documentNumber: '987.654.321-00',
            documentType: 'cpf',
            hasOpenProposal: true
          }
        ];
        
        const filtered = mockClients.filter(client => 
          client.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          client.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          client.documentNumber.includes(debouncedSearch)
        );
        
        setClients(filtered);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching clients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchClients();
  }, [debouncedSearch]);

  const handleSelectClient = useCallback((client: Client) => {
    if (client.hasOpenProposal) {
      alert('Este cliente já possui uma proposta em aberto.');
      return;
    }
    
    setSelectedClient(client);
    setSearchQuery(client.name);
    setShowResults(false);
    onUpdate({ clientId: client.id });
  }, [onUpdate]);

  const formatDocument = (doc: string, type: 'cpf' | 'cnpj') => {
    return type === 'cpf' 
      ? doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className={styles.clientSelectorContainer}>
      <h2 className={styles.sectionTitle}>Selecione o Cliente</h2>
      
      <div ref={searchRef} className={styles.searchContainer}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => debouncedSearch && setShowResults(true)}
          placeholder="Buscar por nome, email ou CPF/CNPJ..."
          className={styles.searchInput}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.addButton}
          onClick={() => {/* TODO: Open create client modal */}}
        >
          <Plus className={styles.addButtonIcon} />
        </Button>

        {showResults && clients.length > 0 && (
          <div className={styles.searchResults}>
            {clients.map((client) => (
              <div
                key={client.id}
                className={`${styles.searchItem} ${
                  selectedClient?.id === client.id ? styles.selected : ''
                }`}
                onClick={() => handleSelectClient(client)}
              >
                <div className={styles.clientInfo}>
                  <div className={styles.clientName}>{client.name}</div>
                  <div className={styles.clientDetails}>
                    {formatDocument(client.documentNumber, client.documentType)} • {client.email}
                  </div>
                  {client.hasOpenProposal && (
                    <div className={styles.openProposalWarning}>
                      <AlertCircle className={styles.warningIcon} />
                      Possui proposta em aberto
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && debouncedSearch && clients.length === 0 && !isSearching && (
          <div className={styles.searchResults}>
            <div className={styles.noResults}>
              Nenhum cliente encontrado
            </div>
          </div>
        )}
      </div>

      {selectedClient && (
        <div className={styles.selectedClient}>
          <h3 className={styles.selectedClientTitle}>Cliente Selecionado:</h3>
          <div className={styles.selectedClientDetails}>
            <p className={styles.selectedClientDetail}><strong>Nome:</strong> {selectedClient.name}</p>
            <p className={styles.selectedClientDetail}><strong>Email:</strong> {selectedClient.email}</p>
            <p className={styles.selectedClientDetail}>
              <strong>{selectedClient.documentType.toUpperCase()}:</strong>{' '}
              {formatDocument(selectedClient.documentNumber, selectedClient.documentType)}
            </p>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          onClick={() => selectedClient && onComplete({ clientId: selectedClient.id })}
          disabled={!selectedClient}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}