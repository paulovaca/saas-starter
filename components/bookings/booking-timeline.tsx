import { getBookingTimeline } from "@/lib/actions/bookings/get-booking-timeline";
import { formatDate } from "@/lib/actions/bookings/utils";
import { TIMELINE_EVENT_LABELS } from "@/lib/types/booking-status";
import "./booking-timeline.css";

interface BookingTimelineProps {
  bookingId: string;
}

export async function BookingTimeline({ bookingId }: BookingTimelineProps) {
  try {
    const timelineEvents = await getBookingTimeline(bookingId);

    return (
      <div className="booking-card">
        <div className="card-header">
          <h3 className="card-title">Timeline de Eventos</h3>
          <span className="timeline-count">{timelineEvents.length} eventos</span>
        </div>
        
        <div className="card-content">
          {timelineEvents.length === 0 ? (
            <div className="empty-state-small">
              <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="empty-title">Nenhum evento registrado</p>
            </div>
          ) : (
            <div className="timeline-list">
              {timelineEvents.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-icon">
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
                  
                  <div className="timeline-content">
                    <p className="timeline-description">{event.description}</p>
                    <div className="timeline-meta">
                      <span className="timeline-date">{formatDate(event.createdAt)}</span>
                      <span className="timeline-user">por {event.userName || "Sistema"}</span>
                      <span className="timeline-type">{TIMELINE_EVENT_LABELS[event.eventType]}</span>
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
      <div className="booking-card">
        <div className="card-header">
          <h3 className="card-title">Timeline de Eventos</h3>
        </div>
        
        <div className="card-content">
          <div className="error-state">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="error-title">Erro ao carregar timeline</p>
          </div>
        </div>
      </div>
    );
  }
}