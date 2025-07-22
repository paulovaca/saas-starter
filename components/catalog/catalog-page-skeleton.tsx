import styles from './catalog-page-skeleton.module.css';

export function CatalogPageSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.contentWrapper}>
        {/* Sidebar skeleton */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={`${styles.skeletonText} ${styles.textWidth120Height20}`} />
            <div className={styles.skeletonButton} />
          </div>
          
          <div className={styles.categoryList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.categoryItem}>
                <div className={`${styles.skeletonText} ${styles.textWidth100Height16}`} />
                <div className={`${styles.skeletonText} ${styles.textWidth20Height16}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className={styles.mainContent}>
          {/* Toolbar skeleton */}
          <div className={styles.toolbar}>
            <div className={styles.searchSection}>
              <div className={styles.skeletonInput} />
              <div className={styles.skeletonSelect} />
            </div>
            <div className={styles.actions}>
              <div className={styles.skeletonButton} />
              <div className={styles.skeletonButton} />
            </div>
          </div>

          {/* Items grid skeleton */}
          <div className={styles.itemsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.itemCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.skeletonText} ${styles.textWidth150Height20}`} />
                  <div className={styles.skeletonBadge} />
                </div>
                <div className={styles.cardContent}>
                  <div className={`${styles.skeletonText} ${styles.textWidth100PercentHeight16}`} />
                  <div className={`${styles.skeletonText} ${styles.textWidth80PercentHeight16}`} />
                  <div className={`${styles.skeletonText} ${styles.textWidth60PercentHeight16}`} />
                </div>
                <div className={styles.cardFooter}>
                  <div className={`${styles.skeletonText} ${styles.textWidth100Height14}`} />
                  <div className={styles.skeletonButton} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
