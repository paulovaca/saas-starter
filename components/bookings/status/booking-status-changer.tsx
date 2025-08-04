import { BOOKING_STATUS_LABELS, getAvailableStatusTransitions } from "@/lib/types/booking-status";
import type { User } from "@/lib/types/auth";

interface BookingStatusChangerProps {
  booking: {
    id: string;
    status: string;
  };
  user: User;
}

export async function BookingStatusChanger({ booking, user }: BookingStatusChangerProps) {
  const availableTransitions = getAvailableStatusTransitions(booking.status as any);

  return (
    <div className="booking-card">
      <div className="card-header">
        <h3 className="card-title">Alterar Status</h3>
      </div>
      
      <div className="card-content">
        {availableTransitions.length === 0 ? (
          <div className="empty-state-small">
            <p className="empty-title">Status final - não pode ser alterado</p>
          </div>
        ) : (
          <form className="status-changer-form">
            <div className="form-group">
              <label className="form-label">Novo Status</label>
              <select className="form-select" required>
                <option value="">Selecione um status</option>
                {availableTransitions.map((status) => (
                  <option key={status} value={status}>
                    {BOOKING_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Justificativa</label>
              <textarea 
                className="form-textarea" 
                placeholder="Descreva o motivo da mudança..."
                required
              />
            </div>
            
            <button type="submit" className="form-button">
              Alterar Status
            </button>
          </form>
        )}
      </div>
    </div>
  );
}