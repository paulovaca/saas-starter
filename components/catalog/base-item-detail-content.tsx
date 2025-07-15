'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react';
import { BaseItem, BaseItemField, FIELD_TYPES } from '@/lib/db/schema/catalog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { removeBaseItemField } from '@/lib/actions/catalog';
import { AddFieldModal } from './add-field-modal';
import { EditFieldModal } from './edit-field-modal';
import styles from './base-item-detail-content.module.css';

interface BaseItemDetailContentProps {
  item: BaseItem & { customFields: BaseItemField[] };
}

export function BaseItemDetailContent({ item }: BaseItemDetailContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<BaseItemField | null>(null);

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Tem certeza que deseja remover este campo? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      await removeBaseItemField(fieldId);
      // A página será recarregada automaticamente pelo router
    } catch (error) {
      console.error('Erro ao remover campo:', error);
      alert(error instanceof Error ? error.message : 'Erro ao remover campo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldAdded = () => {
    // O router atualizará automaticamente a página
    window.location.reload();
  };

  const handleEditField = (field: BaseItemField) => {
    setEditingField(field);
  };

  const handleFieldUpdated = () => {
    setEditingField(null);
    // O router atualizará automaticamente a página
    window.location.reload();
  };

  const getFieldTypeLabel = (fieldType: string) => {
    const type = FIELD_TYPES.find(t => t.value === fieldType);
    return type?.label || fieldType;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/catalog" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} />
            Voltar para Itens Base
          </Link>
        </div>
        
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{item.name}</h1>
          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.fieldsSection}>
          <div className={styles.fieldsHeader}>
            <h2 className={styles.fieldsTitle}>
              Campos Customizados ({item.customFields.length})
            </h2>
            <Button
              onClick={() => setShowAddField(true)}
              disabled={isLoading}
              className={styles.addButton}
            >
              <Plus className={styles.addIcon} />
              Adicionar Campo
            </Button>
          </div>

          {item.customFields.length > 0 ? (
            <div className={styles.fieldsList}>
              {item.customFields.map((field) => (
                <Card key={field.id} className={styles.fieldCard}>
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldInfo}>
                      <h3 className={styles.fieldName}>{field.name}</h3>
                      <span className={styles.fieldType}>
                        {getFieldTypeLabel(field.type)}
                      </span>
                      {field.isRequired && (
                        <span className={styles.requiredBadge}>Obrigatório</span>
                      )}
                    </div>
                    
                    <div className={styles.fieldActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.actionButton}
                        onClick={() => handleEditField(field)}
                        disabled={isLoading}
                        title="Editar campo"
                      >
                        <Edit3 className={styles.actionIcon} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.actionButton}
                        onClick={() => handleDeleteField(field.id)}
                        disabled={isLoading}
                        title="Remover campo"
                      >
                        <Trash2 className={styles.actionIcon} />
                      </Button>
                    </div>
                  </div>
                  
                  {field.options && field.options.length > 0 && (
                    <div className={styles.fieldOptions}>
                      <strong>Opções:</strong>
                      <ul className={styles.optionsList}>
                        {field.options.map((option, index) => (
                          <li key={index} className={styles.optionItem}>
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <h3 className={styles.emptyTitle}>Nenhum campo customizado</h3>
                <p className={styles.emptyDescription}>
                  Adicione campos customizados para estruturar as informações deste item base.
                </p>
                <Button
                  onClick={() => setShowAddField(true)}
                  className={styles.emptyAction}
                >
                  <Plus className={styles.addIcon} />
                  Adicionar Primeiro Campo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar campo */}
      <AddFieldModal
        baseItemId={item.id}
        isOpen={showAddField}
        onClose={() => setShowAddField(false)}
        onSuccess={handleFieldAdded}
      />

      {/* Modal para editar campo */}
      {editingField && (
        <EditFieldModal
          field={editingField}
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
          onSuccess={handleFieldUpdated}
        />
      )}
    </div>
  );
}
