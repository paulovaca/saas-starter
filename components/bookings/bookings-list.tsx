import Link from "next/link";
import { getBookings } from "@/lib/actions/bookings/get-bookings";
import { formatDate } from "@/lib/actions/bookings/utils";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type BookingStatus } from "@/lib/types/booking-status";
import type { CurrentUser } from "@/lib/types/auth";
import styles from "./bookings-list.module.css";

interface BookingsListProps {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
  };
  user: CurrentUser;
}

export async function BookingsList({ searchParams, user }: BookingsListProps) {
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  
  try {
    // Validar status antes de enviar para a função
    const validStatuses = Object.values(BOOKING_STATUS);
    const statusParam = searchParams.status && validStatuses.includes(searchParams.status as BookingStatus) 
      ? searchParams.status as BookingStatus 
      : undefined;
      
    const result = await getBookings({
      agencyId: user.agencyId,
      userId: user.role === "AGENT" ? user.id : undefined,
      status: statusParam,
      search: searchParams.search,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      page,
      limit
    });

    const { bookings, total, hasMore } = result;

    if (bookings.length === 0) {
      return (
        <div className={styles.bookingsList}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Reservas</h2>
            <span className={styles.listCount}>0 reservas encontradas</span>
          </div>
          
          <div className={styles.emptyState}>
            <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className={styles.emptyStateTitle}>Nenhuma reserva encontrada</h3>
            <p className={styles.emptyStateDescription}>
              Quando uma proposta for aceita e confirmada como paga, uma reserva será criada automaticamente aqui.
            </p>
          </div>
        </div>
      );
    }

    const totalPages = Math.ceil(total / limit);

    return (
      <div className={styles.bookingsList}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>Reservas</h2>
          <span className={styles.listCount}>{total} reserva{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}</span>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.bookingsTable}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Criada em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.bookingNumber}>
                      <strong>{booking.bookingNumber}</strong>
                      {booking.metadata?.proposalNumber && (
                        <div className={styles.proposalRef}>
                          Proposta: {booking.metadata.proposalNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className={styles.tableCell}>
                    <div className={styles.clientInfo}>
                      {booking.clientName || "Cliente não encontrado"}
                      {booking.clientEmail && (
                        <div className={styles.clientEmail}>{booking.clientEmail}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${styles[`status${BOOKING_STATUS_COLORS[booking.status].charAt(0).toUpperCase() + BOOKING_STATUS_COLORS[booking.status].slice(1)}`]}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  
                  <td className={styles.tableCell}>
                    {booking.metadata?.totalAmount ? (
                      <div className={styles.amount}>
                        R$ {parseFloat(booking.metadata.totalAmount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    ) : (
                      <span className={styles.amountNa}>-</span>
                    )}
                  </td>
                  
                  <td className={styles.tableCell}>
                    <div className={styles.dateInfo}>
                      <div>{formatDate(booking.createdAt)}</div>
                      <div className={styles.createdBy}>
                        por {booking.createdByName || "Sistema"}
                      </div>
                    </div>
                  </td>
                  
                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar reservas:", error);
    
    return (
      <div className={styles.bookingsList}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>Reservas</h2>
        </div>
        
        <div className={styles.errorState}>
          <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={styles.errorTitle}>Erro ao carregar reservas</h3>
          <p className={styles.errorDescription}>
            Ocorreu um erro ao carregar as reservas. Tente novamente.
          </p>
        </div>
      </div>
    );
  }
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  const generatePageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });
    
    if (page > 1) {
      params.set("page", page.toString());
    }
    
    return `/bookings?${params.toString()}`;
  };

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.pagination}>
      {currentPage > 1 && (
        <Link href={generatePageUrl(currentPage - 1)} className={styles.paginationButton}>
          ‹
        </Link>
      )}
      
      {startPage > 1 && (
        <>
          <Link href={generatePageUrl(1)} className={styles.paginationButton}>
            1
          </Link>
          {startPage > 2 && <span className={styles.paginationEllipsis}>...</span>}
        </>
      )}
      
      {pages.map((page) => (
        <Link
          key={page}
          href={generatePageUrl(page)}
          className={`${styles.paginationButton} ${page === currentPage ? styles.active : ''}`}
        >
          {page}
        </Link>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.paginationEllipsis}>...</span>}
          <Link href={generatePageUrl(totalPages)} className={styles.paginationButton}>
            {totalPages}
          </Link>
        </>
      )}
      
      {currentPage < totalPages && (
        <Link href={generatePageUrl(currentPage + 1)} className={styles.paginationButton}>
          ›
        </Link>
      )}
    </div>
  );
}