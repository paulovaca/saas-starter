import Link from "next/link";
import { getBookings } from "@/lib/actions/bookings/get-bookings";
import { formatDate } from "@/lib/actions/bookings/utils";
import { BOOKING_STATUS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, type BookingStatus } from "@/lib/types/booking-status";
import type { User } from "@/lib/types/auth";
import "./bookings-list.css";

interface BookingsListProps {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
  };
  user: User;
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
        <div className="bookings-list">
          <div className="list-header">
            <h2 className="list-title">Reservas</h2>
            <span className="list-count">0 reservas encontradas</span>
          </div>
          
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="empty-state-title">Nenhuma reserva encontrada</h3>
            <p className="empty-state-description">
              Quando uma proposta for aceita e confirmada como paga, uma reserva será criada automaticamente aqui.
            </p>
          </div>
        </div>
      );
    }

    const totalPages = Math.ceil(total / limit);

    return (
      <div className="bookings-list">
        <div className="list-header">
          <h2 className="list-title">Reservas</h2>
          <span className="list-count">{total} reserva{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="table-container">
          <table className="bookings-table">
            <thead className="table-header">
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
                <tr key={booking.id} className="table-row">
                  <td className="table-cell">
                    <div className="booking-number">
                      <strong>{booking.bookingNumber}</strong>
                      {booking.metadata?.proposalNumber && (
                        <div className="proposal-ref">
                          Proposta: {booking.metadata.proposalNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="table-cell">
                    <div className="client-info">
                      {booking.clientName || "Cliente não encontrado"}
                      {booking.clientEmail && (
                        <div className="client-email">{booking.clientEmail}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="table-cell">
                    <span className={`status-badge status-${BOOKING_STATUS_COLORS[booking.status]}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  
                  <td className="table-cell">
                    {booking.metadata?.totalAmount ? (
                      <div className="amount">
                        R$ {parseFloat(booking.metadata.totalAmount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    ) : (
                      <span className="amount-na">-</span>
                    )}
                  </td>
                  
                  <td className="table-cell">
                    <div className="date-info">
                      <div>{formatDate(booking.createdAt)}</div>
                      <div className="created-by">
                        por {booking.createdByName || "Sistema"}
                      </div>
                    </div>
                  </td>
                  
                  <td className="table-cell">
                    <div className="actions">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="action-button action-button-primary"
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
      <div className="bookings-list">
        <div className="list-header">
          <h2 className="list-title">Reservas</h2>
        </div>
        
        <div className="error-state">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="error-title">Erro ao carregar reservas</h3>
          <p className="error-description">
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
    <div className="pagination">
      {currentPage > 1 && (
        <Link href={generatePageUrl(currentPage - 1)} className="pagination-button">
          ‹
        </Link>
      )}
      
      {startPage > 1 && (
        <>
          <Link href={generatePageUrl(1)} className="pagination-button">
            1
          </Link>
          {startPage > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}
      
      {pages.map((page) => (
        <Link
          key={page}
          href={generatePageUrl(page)}
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
        >
          {page}
        </Link>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
          <Link href={generatePageUrl(totalPages)} className="pagination-button">
            {totalPages}
          </Link>
        </>
      )}
      
      {currentPage < totalPages && (
        <Link href={generatePageUrl(currentPage + 1)} className="pagination-button">
          ›
        </Link>
      )}
    </div>
  );
}