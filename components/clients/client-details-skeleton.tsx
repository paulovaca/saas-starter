import styles from './client-details-skeleton.module.css';

export default function ClientDetailsSkeleton() {
  return (
    <div className={styles.clientDetailsSkeleton}>
      {/* Header Skeleton */}
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonHeaderContent}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonContactInfo}>
            <div className={`${styles.skeletonContactItem} ${styles.skeletonContactEmail}`} />
            <div className={`${styles.skeletonContactItem} ${styles.skeletonContactPhone}`} />
          </div>
          <div className={styles.skeletonBadge} />
        </div>
        <div className={styles.skeletonActions}>
          <div className={`${styles.skeletonButton} ${styles.skeletonButtonEdit}`} />
          <div className={`${styles.skeletonButton} ${styles.skeletonButtonInteraction}`} />
          <div className={`${styles.skeletonButton} ${styles.skeletonButtonProposal}`} />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className={styles.skeletonLayout}>
        {/* Sidebar Skeleton */}
        <div className={styles.skeletonSidebar}>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonCardHeader} />
            <div className={styles.skeletonStatsGrid}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={styles.skeletonStatItem}>
                  <div className={styles.skeletonStatValue} />
                  <div className={styles.skeletonStatLabel} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className={styles.skeletonMainContent}>
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonCardHeader} />
            <div className={styles.skeletonInfoGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className={styles.skeletonInfoField}>
                  <div className={styles.skeletonInfoLabel} />
                  <div className={styles.skeletonInfoValue} />
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonCardHeader} />
            <div className={styles.skeletonList}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className={styles.skeletonListItem}>
                  <div className={styles.skeletonListIcon} />
                  <div className={styles.skeletonListContent}>
                    <div className={styles.skeletonListHeader}>
                      <div className={styles.skeletonListTitle} />
                      <div className={styles.skeletonListBadge} />
                    </div>
                    <div className={styles.skeletonListDescription} />
                    <div className={styles.skeletonListMeta}>
                      <div className={styles.skeletonListMetaItem} />
                      <div className={styles.skeletonListMetaItem} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
