'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { BaseItem, BaseItemField, FIELD_TYPES } from '@/lib/db/schema/catalog';
import { Button } from '@/components/ui/button';
import { deleteBaseItem } from '@/lib/actions/catalog';
import styles from './base-item-card.module.css';

interface BaseItemCardProps {
  item: BaseItem & { customFields: BaseItemField[] };
  onItemDeleted?: () => void;
}

export function BaseItemCard({ item, onItemDeleted }: BaseItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este item base? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteBaseItem(item.id);
      onItemDeleted?.();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir item');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldTypeLabel = (fieldType: string) => {
    const type = FIELD_TYPES.find(t => t.value === fieldType);
    return type?.label || fieldType;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>
              <Link href={`/catalog/${item.id}`} className={styles.titleLink}>
                {item.name}
              </Link>
            </h3>
            {!item.isActive && (
              <span className={styles.inactiveBadge}>Inativo</span>
            )}
          </div>
          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
        </div>
        
        <div className={styles.actions}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={styles.actionButton}
            onClick={handleDelete}
            disabled={isLoading}
            title="Excluir item base"
          >
            <Trash2 className={styles.actionIcon} />
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.fieldsSection}>
          <div className={styles.fieldsHeader}>
            <div className={styles.fieldsInfo}>
              <span className={styles.fieldsCount}>
                {item.customFields.length} campo{item.customFields.length !== 1 ? 's' : ''}
              </span>
              {item.customFields.length > 0 && (
                <span className={styles.fieldsSeparator}>•</span>
              )}
              <span className={styles.fieldsStatus}>
                {item.customFields.length > 0 ? 'Configurado' : 'Sem campos'}
              </span>
            </div>
          </div>
          
          {item.customFields.length > 0 ? (
            <div className={styles.fieldsList}>
              {item.customFields.slice(0, 4).map((field) => (
                <div key={field.id} className={styles.fieldTag}>
                  <span className={styles.fieldName}>{field.name}</span>
                  <span className={styles.fieldType}>
                    {getFieldTypeLabel(field.type)}
                  </span>
                  {field.isRequired && (
                    <span className={styles.requiredIndicator}>*</span>
                  )}
                </div>
              ))}
              {item.customFields.length > 4 && (
                <div className={styles.moreFields}>
                  +{item.customFields.length - 4} campos
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyFields}>
              <span className={styles.emptyFieldsText}>
                Este item base ainda não possui campos customizados
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </span>
        <Link href={`/catalog/${item.id}`}>
          <Button variant="outline" size="sm" className={styles.manageButton}>
            Gerenciar Campos
          </Button>
        </Link>
      </div>
    </div>
  );
}
