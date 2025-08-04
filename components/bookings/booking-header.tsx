import Link from "next/link";
import { formatDate } from "@/lib/actions/bookings/utils";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/types/booking-status";
import type { CurrentUser } from "@/lib/types/auth";
import "./booking-header.css";

interface BookingHeaderProps {
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    proposalNumber: string | null;
    totalAmount: string | null;
    paymentMethod: string | null;
    clientName: string | null;
    clientEmail: string | null;
    clientPhone: string | null;
    operatorName: string | null;
    agentName: string | null;
  };
  user: CurrentUser;
}

export function BookingHeader({ booking, user }: BookingHeaderProps) {
  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(parseFloat(value));
  };

  return (
    <div className="booking-header">
      <div className="header-top">
        <div className="header-info">
          <h1 className="booking-title">Reserva {booking.bookingNumber}</h1>
          <p className="booking-subtitle">
            {booking.proposalNumber && `Proposta: ${booking.proposalNumber} • `}
            Criada em {formatDate(booking.createdAt)}
          </p>
        </div>
        
        <div className="header-actions">
          <Link href="/bookings" className="back-button">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
          
          <div className={`status-badge status-${BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS]}`}>
            {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
          </div>
        </div>
      </div>
      
      <div className="header-grid">
        <div className="info-group">
          <span className="info-label">Cliente</span>
          <div className="info-value">
            {booking.clientName || "Nome não informado"}
            {booking.clientEmail && (
              <div className="info-secondary">{booking.clientEmail}</div>
            )}
            {booking.clientPhone && (
              <div className="info-secondary">{booking.clientPhone}</div>
            )}
          </div>
        </div>
        
        <div className="info-group">
          <span className="info-label">Operadora</span>
          <div className="info-value">
            {booking.operatorName || "Não informada"}
          </div>
        </div>
        
        <div className="info-group">
          <span className="info-label">Agente Responsável</span>
          <div className="info-value">
            {booking.agentName || "Não atribuído"}
          </div>
        </div>
        
        <div className="info-group">
          <span className="info-label">Valor Total</span>
          <div className="info-value info-value-large">
            {formatCurrency(booking.totalAmount)}
          </div>
        </div>
        
        {booking.paymentMethod && (
          <div className="info-group">
            <span className="info-label">Forma de Pagamento</span>
            <div className="info-value">
              {booking.paymentMethod}
            </div>
          </div>
        )}
      </div>
      
      {booking.notes && (
        <div className="header-notes">
          <span className="info-label">Observações da Proposta</span>
          <div className="notes-content">
            {booking.notes}
          </div>
        </div>
      )}
    </div>
  );
}