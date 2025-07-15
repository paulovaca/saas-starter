import { getBaseItems } from '@/lib/actions/catalog';
import { BaseItemsList } from './base-items-list';
import { CreateBaseItemButton } from './create-base-item-button';
import styles from './base-items-page-content.module.css';

export async function BaseItemsPageContent() {
  const baseItems = await getBaseItems();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h2 className={styles.title}>Itens Base</h2>
            <p className={styles.description}>
              Gerencie os itens base que comporão os portfólios das operadoras
            </p>
          </div>
          <CreateBaseItemButton />
        </div>
      </div>

      <div className={styles.content}>
        <BaseItemsList items={baseItems} />
      </div>
    </div>
  );
}
