import styles from "./page-header.module.css";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderContent}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description && (
            <p className={styles.pageDescription}>{description}</p>
          )}
        </div>
        
        {children && (
          <div className={styles.pageHeaderActions}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}