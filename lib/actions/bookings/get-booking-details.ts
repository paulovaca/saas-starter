import { db } from "@/lib/db/drizzle";
import { bookings } from "@/lib/db/schema/bookings";
import { users } from "@/lib/db/schema/users";
import { proposals, clientsNew } from "@/lib/db/schema/clients";
import { operators } from "@/lib/db/schema/operators";
import { eq, and } from "drizzle-orm";
import type { BookingStatus } from "@/lib/types/booking-status";

interface BookingDetails {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  notes: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string | null;
  
  // Dados da proposta
  proposalId: string;
  proposalNumber: string | null;
  totalAmount: string | null;
  paymentMethod: string | null;
  
  // Dados do cliente
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientDocument: string | null;
  
  // Dados da operadora
  operatorName: string | null;
  operatorContact: string | null;
  
  // Dados do agente responsável
  agentName: string | null;
  agentEmail: string | null;
}

export async function getBookingDetails(
  bookingId: string,
  agencyId: string,
  userId?: string
): Promise<BookingDetails | null> {
  try {
    // Buscar dados básicos da reserva
    const bookingQuery = db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        status: bookings.status,
        notes: bookings.notes,
        metadata: bookings.metadata,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        createdBy: bookings.createdBy,
        proposalId: bookings.proposalId,
        createdByName: users.name
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.createdBy, users.id))
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.agencyId, agencyId)
        )
      )
      .limit(1);

    const bookingResults = await bookingQuery;

    if (!bookingResults || bookingResults.length === 0) {
      return null;
    }

    const booking = bookingResults[0];

    // Buscar dados da proposta relacionada
    let proposalData = null;
    if (booking.proposalId) {
      const proposalQuery = await db
        .select({
          proposalNumber: proposals.proposalNumber,
          totalAmount: proposals.totalAmount,
          paymentMethod: proposals.paymentMethod,
          clientId: proposals.clientId,
          operatorId: proposals.operatorId,
          userId: proposals.userId
        })
        .from(proposals)
        .where(eq(proposals.id, booking.proposalId))
        .limit(1);

      if (proposalQuery.length > 0) {
        proposalData = proposalQuery[0];
      }
    }

    // Verificar permissões para agentes
    if (userId && proposalData) {
      // Se for um agente, verificar se a proposta pertence a ele
      const userRole = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userRole.length > 0 && userRole[0].role === 'AGENT') {
        if (proposalData.userId !== userId) {
          return null; // Agente não tem acesso a esta reserva
        }
      }
    }

    // Buscar dados do cliente
    let clientData = null;
    if (proposalData?.clientId) {
      const clientQuery = await db
        .select({
          name: clientsNew.name,
          email: clientsNew.email,
          phone: clientsNew.phone,
          documentNumber: clientsNew.documentNumber
        })
        .from(clientsNew)
        .where(eq(clientsNew.id, proposalData.clientId))
        .limit(1);

      if (clientQuery.length > 0) {
        clientData = clientQuery[0];
      }
    }

    // Buscar dados da operadora
    let operatorData = null;
    if (proposalData?.operatorId) {
      const operatorQuery = await db
        .select({
          name: operators.name,
          contactEmail: operators.contactEmail
        })
        .from(operators)
        .where(eq(operators.id, proposalData.operatorId))
        .limit(1);

      if (operatorQuery.length > 0) {
        operatorData = operatorQuery[0];
      }
    }

    // Buscar dados do agente responsável
    let agentData = null;
    if (proposalData?.userId) {
      const agentQuery = await db
        .select({
          name: users.name,
          email: users.email
        })
        .from(users)
        .where(eq(users.id, proposalData.userId))
        .limit(1);

      if (agentQuery.length > 0) {
        agentData = agentQuery[0];
      }
    }

    // Montar objeto de retorno
    const bookingDetails: BookingDetails = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      notes: booking.notes,
      metadata: booking.metadata,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      createdBy: booking.createdBy,
      createdByName: booking.createdByName,
      
      proposalId: booking.proposalId,
      proposalNumber: proposalData?.proposalNumber || null,
      totalAmount: proposalData?.totalAmount || null,
      paymentMethod: proposalData?.paymentMethod || null,
      
      clientName: clientData?.name || null,
      clientEmail: clientData?.email || null,
      clientPhone: clientData?.phone || null,
      clientDocument: clientData?.documentNumber || null,
      
      operatorName: operatorData?.name || null,
      operatorContact: operatorData?.contactEmail || null,
      
      agentName: agentData?.name || null,
      agentEmail: agentData?.email || null
    };

    return bookingDetails;

  } catch (error) {
    console.error("Erro ao buscar detalhes da reserva:", error);
    throw new Error("Falha ao carregar detalhes da reserva");
  }
}