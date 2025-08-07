import { getBookingTimeline } from "@/lib/actions/bookings/get-booking-timeline";
import { formatDate } from "@/lib/actions/bookings/utils";
import { TIMELINE_EVENT_LABELS } from "@/lib/types/booking-status";
import styles from "./booking-timeline.module.css";

interface BookingTimelineProps {
  bookingId: string;
}

export async function BookingTimeline({ bookingId }: BookingTimelineProps) {
  try {
    const timelineEvents = await getBookingTimeline(bookingId);

    return (
      <div className={styles.bookingCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Timeline de Eventos</h3>
          <span className={styles.timelineCount}>{timelineEvents.length} eventos</span>
        </div>
        
        <div className={styles.cardContent}>
          {timelineEvents.length === 0 ? (
            <div className={styles.emptyStateSmall}>
              <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={styles.emptyTitle}>Nenhum evento registrado</p>
            </div>
          ) : (
            <div className={styles.timelineList}>
              {timelineEvents.map((event) => (
                <div key={event.id} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      {event.eventType === "created" && (
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      )}
                      {event.eventType === "status_changed" && (
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      )}
                      {event.eventType === "document_uploaded" && (
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      )}
                      {!["created", "status_changed", "document_uploaded"].includes(event.eventType) && (
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/>
                      )}
                    </svg>
                  </div>
                  
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineDescription}>{event.description}</p>
                    <div className={styles.timelineMeta}>
                      <span className={styles.timelineDate}>{formatDate(event.createdAt)}</span>
                      <span className={styles.timelineUser}>por {event.userName || "Sistema"}</span>
                      <span className={styles.timelineType}>{TIMELINE_EVENT_LABELS[event.eventType]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar timeline:", error);
    
    return (
      <div className={styles.bookingCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Timeline de Eventos</h3>
        </div>
        
        <div className={styles.cardContent}>
          <div className={styles.errorState}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.errorTitle}>Erro ao carregar timeline</p>
          </div>
        </div>
      </div>
    );
  }
}