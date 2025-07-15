'use client';

import { BaseItem, BaseItemField } from '@/lib/db/schema/catalog';
import { BaseItemCard } from './base-item-card';
import styles from './base-items-list.module.css';

interface BaseItemsListProps {
  items: (BaseItem & { customFields: BaseItemField[] })[];
}

export function BaseItemsList({ items }: BaseItemsListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <h3 className={styles.emptyTitle}>Nenhum item base encontrado</h3>
          <p className={styles.emptyDescription}>
            Crie seu primeiro item base para começar a estruturar os portfólios das operadoras.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Itens Base ({items.length})</h2>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <BaseItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
