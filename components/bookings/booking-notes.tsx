import type { User } from "@/lib/types/auth";

interface BookingNotesProps {
  bookingId: string;
  user: User;
}

export async function BookingNotes({ bookingId, user }: BookingNotesProps) {
  return (
    <div className="booking-card">
      <div className="card-header">
        <h3 className="card-title">Anotações</h3>
      </div>
      
      <div className="card-content">
        <form className="notes-form">
          <div className="form-group">
            <textarea 
              className="form-textarea" 
              placeholder="Adicione uma anotação..."
              rows={3}
            />
          </div>
          
          <button type="submit" className="form-button">
            Adicionar Anotação
          </button>
        </form>
        
        <div className="notes-list">
          <div className="empty-state-small">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="empty-title">Nenhuma anotação</p>
          </div>
        </div>
      </div>
    </div>
  );
}