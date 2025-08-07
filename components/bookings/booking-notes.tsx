import type { CurrentUser } from "@/lib/types/auth";
import styles from "./booking-notes.module.css";

interface BookingNotesProps {
  bookingId: string;
  user: CurrentUser;
}

export async function BookingNotes({ bookingId, user }: BookingNotesProps) {
  return (
    <div className={styles.bookingCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Anotações</h3>
      </div>
      
      <div className={styles.cardContent}>
        <form className={styles.notesForm}>
          <div className={styles.formGroup}>
            <textarea 
              className={styles.formTextarea} 
              placeholder="Adicione uma anotação..."
              rows={3}
            />
          </div>
          
          <button type="submit" className={styles.formButton}>
            Adicionar Anotação
          </button>
        </form>
        
        <div className={styles.notesList}>
          <div className={styles.emptyStateSmall}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className={styles.emptyTitle}>Nenhuma anotação</p>
          </div>
        </div>
      </div>
    </div>
  );
}