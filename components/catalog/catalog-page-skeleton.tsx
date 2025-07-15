import styles from './catalog-page-skeleton.module.css';

export function CatalogPageSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.contentWrapper}>
        {/* Sidebar skeleton */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.skeletonText} style={{ width: '120px', height: '20px' }} />
            <div className={styles.skeletonButton} />
          </div>
          
          <div className={styles.categoryList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.categoryItem}>
                <div className={styles.skeletonText} style={{ width: '100px', height: '16px' }} />
                <div className={styles.skeletonText} style={{ width: '20px', height: '16px' }} />
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
                  <div className={styles.skeletonText} style={{ width: '150px', height: '20px' }} />
                  <div className={styles.skeletonBadge} />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.skeletonText} style={{ width: '100%', height: '16px' }} />
                  <div className={styles.skeletonText} style={{ width: '80%', height: '16px' }} />
                  <div className={styles.skeletonText} style={{ width: '60%', height: '16px' }} />
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.skeletonText} style={{ width: '100px', height: '14px' }} />
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
