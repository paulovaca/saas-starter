import styles from '../../app/(dashboard)/clients/clients.module.css';

export default function ClientsPageSkeleton() {
  return (
    <div className={styles.clientsContainer}>
      {/* Header Skeleton */}
      <div className={styles.clientsHeader}>
        <div className={styles.clientsHeaderContent}>
          <div style={{ 
            height: '2rem', 
            width: '200px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)' 
          }} />
          <div style={{ 
            height: '1rem', 
            width: '300px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)',
            marginTop: '0.5rem'
          }} />
        </div>
        <div className={styles.clientsActions}>
          <div style={{ 
            height: '40px', 
            width: '120px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)' 
          }} />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className={styles.clientsFilters}>
        <div className={styles.filtersRow}>
          <div style={{ 
            height: '40px', 
            width: '250px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)' 
          }} />
          <div style={{ 
            height: '40px', 
            width: '150px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)' 
          }} />
          <div style={{ 
            height: '40px', 
            width: '150px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)' 
          }} />
          <div style={{ 
            height: '40px', 
            width: '150px', 
            background: 'var(--muted)', 
            borderRadius: 'var(--radius)' 
          }} />
        </div>
      </div>

      {/* View Toggle Skeleton */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          height: '32px', 
          width: '100px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
        <div style={{ 
          height: '32px', 
          width: '80px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
      </div>

      {/* Grid Skeleton */}
      <div className={styles.clientsGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.clientCard}>
            <div className={styles.clientCardHeader}>
              <div>
                <div style={{ 
                  height: '1.5rem', 
                  width: '180px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)' 
                }} />
                <div style={{ 
                  height: '1rem', 
                  width: '200px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)',
                  marginTop: '0.5rem'
                }} />
              </div>
              <div className={styles.clientActions}>
                <div style={{ 
                  height: '32px', 
                  width: '32px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)' 
                }} />
                <div style={{ 
                  height: '32px', 
                  width: '32px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)' 
                }} />
              </div>
            </div>
            
            <div className={styles.clientInfo}>
              <div style={{ 
                height: '1rem', 
                width: '150px', 
                background: 'var(--muted)', 
                borderRadius: 'var(--radius)' 
              }} />
              <div style={{ 
                height: '1rem', 
                width: '120px', 
                background: 'var(--muted)', 
                borderRadius: 'var(--radius)' 
              }} />
              <div style={{ 
                height: '1rem', 
                width: '100px', 
                background: 'var(--muted)', 
                borderRadius: 'var(--radius)' 
              }} />
            </div>
            
            <div className={styles.clientStats}>
              <div className={styles.clientStat}>
                <div style={{ 
                  height: '1.5rem', 
                  width: '40px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)' 
                }} />
                <div style={{ 
                  height: '0.75rem', 
                  width: '60px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)',
                  marginTop: '0.25rem'
                }} />
              </div>
              <div className={styles.clientStat}>
                <div style={{ 
                  height: '1.5rem', 
                  width: '40px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)' 
                }} />
                <div style={{ 
                  height: '0.75rem', 
                  width: '60px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)',
                  marginTop: '0.25rem'
                }} />
              </div>
              <div className={styles.clientStat}>
                <div style={{ 
                  height: '1.5rem', 
                  width: '40px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)' 
                }} />
                <div style={{ 
                  height: '0.75rem', 
                  width: '60px', 
                  background: 'var(--muted)', 
                  borderRadius: 'var(--radius)',
                  marginTop: '0.25rem'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className={styles.pagination}>
        <div style={{ 
          height: '32px', 
          width: '80px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
        <div style={{ 
          height: '32px', 
          width: '32px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
        <div style={{ 
          height: '32px', 
          width: '32px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
        <div style={{ 
          height: '32px', 
          width: '32px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
        <div style={{ 
          height: '32px', 
          width: '80px', 
          background: 'var(--muted)', 
          borderRadius: 'var(--radius)' 
        }} />
      </div>
    </div>
  );
}
