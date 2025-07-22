import styles from '../../app/(dashboard)/clients/clients.module.css';
import skeletonStyles from './clients-page-skeleton.module.css';

export default function ClientsPageSkeleton() {
  return (
    <div className={styles.clientsContainer}>
      {/* Header Skeleton */}
      <div className={styles.clientsHeader}>
        <div className={styles.clientsHeaderContent}>
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.headerTitle}`} />
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.headerSubtitle}`} />
        </div>
        <div className={styles.clientsActions}>
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.headerButton}`} />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className={styles.clientsFilters}>
        <div className={styles.filtersRow}>
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.filterInput}`} />
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.filterSelect}`} />
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.filterSelect}`} />
          <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.filterSelect}`} />
        </div>
      </div>

      {/* View Toggle Skeleton */}
      <div className={skeletonStyles.viewToggleContainer}>
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.viewToggleLeft}`} />
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.viewToggleRight}`} />
      </div>

      {/* Grid Skeleton */}
      <div className={styles.clientsGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.clientCard}>
            <div className={styles.clientCardHeader}>
              <div>
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardTitle}`} />
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardSubtitle}`} />
              </div>
              <div className={styles.clientActions}>
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardAction}`} />
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardAction}`} />
              </div>
            </div>
            
            <div className={styles.clientInfo}>
              <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardInfo}`} />
              <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardInfoMedium}`} />
              <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.cardInfoSmall}`} />
            </div>
            
            <div className={styles.clientStats}>
              <div className={styles.clientStat}>
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.statValue}`} />
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.statLabel}`} />
              </div>
              <div className={styles.clientStat}>
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.statValue}`} />
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.statLabel}`} />
              </div>
              <div className={styles.clientStat}>
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.statValue}`} />
                <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.statLabel}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className={styles.pagination}>
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.paginationButton}`} />
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.paginationButtonSmall}`} />
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.paginationButtonSmall}`} />
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.paginationButtonSmall}`} />
        <div className={`${skeletonStyles.skeletonPlaceholder} ${skeletonStyles.paginationButton}`} />
      </div>
    </div>
  );
}
