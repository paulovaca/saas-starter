import { BOOKING_STATUS_LABELS, getAvailableStatusTransitions } from "@/lib/types/booking-status";
import type { CurrentUser } from "@/lib/types/auth";
import styles from "./booking-status-changer.module.css";

interface BookingStatusChangerProps {
  booking: {
    id: string;
    status: string;
  };
  user: CurrentUser;
}

export async function BookingStatusChanger({ booking, user }: BookingStatusChangerProps) {
  const availableTransitions = getAvailableStatusTransitions(booking.status as any);

  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Alterar Status</h3>
      </div>
      
      <div className={styles.cardContent}>
        {availableTransitions.length === 0 ? (
          <div className={styles.emptyStateSmall}>
            <p className={styles.emptyTitle}>Status final - não pode ser alterado</p>
          </div>
        ) : (
          <form className={styles.statusChangerForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Novo Status</label>
              <select className={styles.formSelect} required>
                <option value="">Selecione um status</option>
                {availableTransitions.map((status) => (
                  <option key={status} value={status}>
                    {BOOKING_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Justificativa</label>
              <textarea 
                className={styles.formTextarea} 
                placeholder="Descreva o motivo da mudança..."
                required
              />
            </div>
            
            <button type="submit" className={styles.formButton}>
              Alterar Status
            </button>
          </form>
        )}
      </div>
    </div>
  );
}