import type { CurrentUser } from "@/lib/types/auth";

interface BookingDocumentsProps {
  bookingId: string;
  user: CurrentUser;
}

export async function BookingDocuments({ bookingId, user }: BookingDocumentsProps) {
  return (
    <div className="booking-card">
      <div className="card-header">
        <h3 className="card-title">Documentos</h3>
        <button className="action-button action-button-primary">
          Adicionar Documento
        </button>
      </div>
      
      <div className="card-content">
        <div className="empty-state-small">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="empty-title">Sistema de documentos em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}