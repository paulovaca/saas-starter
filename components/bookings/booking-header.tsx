import Link from "next/link";
import { formatDate } from "@/lib/actions/bookings/utils";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/types/booking-status";
import type { CurrentUser } from "@/lib/types/auth";
import styles from "./booking-header.module.css";

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
    <div className={styles.bookingHeader}>
      <div className={styles.headerTop}>
        <div className={styles.headerInfo}>
          <h1 className={styles.bookingTitle}>Reserva {booking.bookingNumber}</h1>
          <p className={styles.bookingSubtitle}>
            {booking.proposalNumber && `Proposta: ${booking.proposalNumber} • `}
            Criada em {formatDate(booking.createdAt)}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <Link href="/bookings" className={styles.backButton}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
          
          <div className={`${styles.statusBadge} ${styles[`status${BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS].charAt(0).toUpperCase() + BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS].slice(1)}`]}`}>
            {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
          </div>
        </div>
      </div>
      
      <div className={styles.headerGrid}>
        <div className={styles.infoGroup}>
          <span className={styles.infoLabel}>Cliente</span>
          <div className={styles.infoValue}>
            {booking.clientName || "Nome não informado"}
            {booking.clientEmail && (
              <div className={styles.infoSecondary}>{booking.clientEmail}</div>
            )}
            {booking.clientPhone && (
              <div className={styles.infoSecondary}>{booking.clientPhone}</div>
            )}
          </div>
        </div>
        
        <div className={styles.infoGroup}>
          <span className={styles.infoLabel}>Operadora</span>
          <div className={styles.infoValue}>
            {booking.operatorName || "Não informada"}
          </div>
        </div>
        
        <div className={styles.infoGroup}>
          <span className={styles.infoLabel}>Agente Responsável</span>
          <div className={styles.infoValue}>
            {booking.agentName || "Não atribuído"}
          </div>
        </div>
        
        <div className={styles.infoGroup}>
          <span className={styles.infoLabel}>Valor Total</span>
          <div className={`${styles.infoValue} ${styles.infoValueLarge}`}>
            {formatCurrency(booking.totalAmount)}
          </div>
        </div>
        
        {booking.paymentMethod && (
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Forma de Pagamento</span>
            <div className={styles.infoValue}>
              {booking.paymentMethod}
            </div>
          </div>
        )}
      </div>
      
      {booking.notes && (
        <div className={styles.headerNotes}>
          <span className={styles.infoLabel}>Observações da Proposta</span>
          <div className={styles.notesContent}>
            {booking.notes}
          </div>
        </div>
      )}
    </div>
  );
}