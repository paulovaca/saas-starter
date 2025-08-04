import { db } from "@/lib/db/drizzle";
import { bookings } from "@/lib/db/schema/bookings";
import { users } from "@/lib/db/schema/users";
import { proposals, clientsNew } from "@/lib/db/schema/clients";
import { eq, and, ilike, gte, lte, desc, sql } from "drizzle-orm";
import type { BookingStatus } from "@/lib/types/booking-status";
import { BOOKING_STATUS } from "@/lib/types/booking-status";

interface GetBookingsParams {
  agencyId: string;
  userId?: string; // Para filtrar apenas reservas do agente
  status?: BookingStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface BookingWithRelations {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  notes: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  createdByName: string | null;
  clientName: string | null;
  clientEmail: string | null;
  proposalNumber: string | null;
}

interface GetBookingsResult {
  bookings: BookingWithRelations[];
  total: number;
  hasMore: boolean;
}

export async function getBookings(params: GetBookingsParams): Promise<GetBookingsResult> {
  const {
    agencyId,
    userId,
    status,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = params;

  try {
    // Construir condições WHERE
    const whereConditions = [eq(bookings.agencyId, agencyId)];

    // Filtro por status - validar se é um status válido
    if (status) {
      const validStatuses = Object.values(BOOKING_STATUS);
      if (validStatuses.includes(status)) {
        whereConditions.push(eq(bookings.status, status));
      }
      // Ignora status inválidos silenciosamente
    }

    // Filtro por busca (número da reserva ou cliente)
    if (search) {
      whereConditions.push(
        sql`(
          ${bookings.bookingNumber} ILIKE ${`%${search}%`} OR
          ${bookings.metadata}->>'proposalNumber' ILIKE ${`%${search}%`}
        )`
      );
    }

    // Filtro por data de início
    if (startDate) {
      whereConditions.push(gte(bookings.createdAt, new Date(startDate)));
    }

    // Filtro por data de fim
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      whereConditions.push(lte(bookings.createdAt, endDateObj));
    }

    // Para agentes, filtrar apenas suas reservas através das propostas
    if (userId) {
      // Buscar propostas do agente
      const userProposals = await db
        .select({ id: proposals.id })
        .from(proposals)
        .where(
          and(
            eq(proposals.agencyId, agencyId),
            eq(proposals.userId, userId)
          )
        );

      if (userProposals.length > 0) {
        const proposalIds = userProposals.map(p => p.id);
        // Usar IN em vez de ANY para compatibilidade
        whereConditions.push(
          sql`${bookings.proposalId} IN (${sql.join(proposalIds.map(id => sql`${id}`), sql`, `)})`
        );
      } else {
        // Se o agente não tem propostas, retornar vazio
        return {
          bookings: [],
          total: 0,
          hasMore: false
        };
      }
    }

    // Calcular offset
    const offset = (page - 1) * limit;

    // Query principal - primeiro vamos verificar se há alguma reserva
    const bookingsQuery = db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        status: bookings.status,
        notes: bookings.notes,
        metadata: bookings.metadata,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        createdByName: users.name,
        proposalId: bookings.proposalId
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.createdBy, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset);

    const bookingsResults = await bookingsQuery;

    // Buscar dados dos clientes para cada reserva
    const bookingsWithClients: BookingWithRelations[] = [];

    for (const booking of bookingsResults) {
      let clientName = null;
      let clientEmail = null;
      let proposalNumber = null;

      // Buscar dados da proposta e cliente
      if (booking.proposalId) {
        const proposalData = await db
          .select({
            proposalNumber: proposals.proposalNumber,
            clientId: proposals.clientId
          })
          .from(proposals)
          .where(eq(proposals.id, booking.proposalId))
          .limit(1);

        if (proposalData.length > 0) {
          proposalNumber = proposalData[0].proposalNumber;

          // Buscar dados do cliente
          if (proposalData[0].clientId) {
            const clientData = await db
              .select({
                name: clientsNew.name,
                email: clientsNew.email
              })
              .from(clientsNew)
              .where(eq(clientsNew.id, proposalData[0].clientId))
              .limit(1);

            if (clientData.length > 0) {
              clientName = clientData[0].name;
              clientEmail = clientData[0].email;
            }
          }
        }
      }

      bookingsWithClients.push({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        notes: booking.notes,
        metadata: booking.metadata,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        createdByName: booking.createdByName,
        clientName,
        clientEmail,
        proposalNumber
      });
    }

    // Contar total de registros
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(and(...whereConditions));

    const [{ count: total }] = await countQuery;

    const hasMore = offset + bookingsResults.length < total;

    return {
      bookings: bookingsWithClients,
      total,
      hasMore
    };

  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    throw new Error("Falha ao carregar reservas");
  }
}