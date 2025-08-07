import type { CurrentUser } from "@/lib/types/auth";
import styles from "./booking-documents.module.css";

interface BookingDocumentsProps {
  bookingId: string;
  user: CurrentUser;
}

export async function BookingDocuments({ bookingId, user }: BookingDocumentsProps) {
  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Documentos</h3>
        <button className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
          Adicionar Documento
        </button>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.emptyStateSmall}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={styles.emptyTitle}>Sistema de documentos em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}