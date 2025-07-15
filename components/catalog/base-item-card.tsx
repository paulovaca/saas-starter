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
}

export function BaseItemCard({ item }: BaseItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este item base? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteBaseItem(item.id);
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
          <h3 className={styles.title}>
            <Link href={`/catalog/${item.id}`} className={styles.titleLink}>
              {item.name}
            </Link>
          </h3>
        </div>
        
        <div className={styles.actions}>
          <Link href={`/catalog/${item.id}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={styles.actionButton}
              disabled={isLoading}
            >
              <Edit3 className={styles.actionIcon} />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={styles.actionButton}
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className={styles.actionIcon} />
          </Button>
        </div>
      </div>

      {item.description && (
        <p className={styles.description}>{item.description}</p>
      )}

      <div className={styles.fieldsSection}>
        <h4 className={styles.fieldsTitle}>
          Campos ({item.customFields.length})
        </h4>
        
        {item.customFields.length > 0 ? (
          <div className={styles.fields}>
            {item.customFields.slice(0, 3).map((field) => (
              <div key={field.id} className={styles.field}>
                <span className={styles.fieldName}>{field.name}</span>
                <span className={styles.fieldType}>
                  {getFieldTypeLabel(field.type)}
                </span>
              </div>
            ))}
            {item.customFields.length > 3 && (
              <div className={styles.moreFields}>
                +{item.customFields.length - 3} campo(s)
              </div>
            )}
          </div>
        ) : (
          <p className={styles.noFields}>Nenhum campo adicionado</p>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>
          Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </span>
        <Link href={`/catalog/${item.id}`}>
          <Button variant="outline" size="sm">
            Gerenciar Campos
          </Button>
        </Link>
      </div>
    </div>
  );
}
