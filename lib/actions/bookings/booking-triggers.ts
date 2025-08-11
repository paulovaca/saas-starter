import { db } from "@/lib/db/drizzle";
import { bookings, bookingTimeline } from "@/lib/db/schema/bookings";
import { proposals, clientsNew } from "@/lib/db/schema/clients";
import { eq } from "drizzle-orm";
import { generateBookingNumber } from "./utils";
import { BOOKING_STATUS } from "@/lib/types/booking-status";

/**
 * Criar reserva automaticamente quando proposta tem status ACTIVE_BOOKING (Negócio/Viagem Ativo)
 */
export async function createBookingFromProposal(
  proposalId: string,
  userId: string
): Promise<string> {
  // Buscar dados completos da proposta com cliente
  const proposal = await db
    .select({
      id: proposals.id,
      proposalNumber: proposals.proposalNumber,
      agencyId: proposals.agencyId,
      clientId: proposals.clientId,
      userId: proposals.userId,
      operatorId: proposals.operatorId,
      totalAmount: proposals.totalAmount,
      paymentMethod: proposals.paymentMethod,
      notes: proposals.notes,
      validUntil: proposals.validUntil,
      approvedAt: proposals.approvedAt,
      contractData: proposals.contractData,
      clientName: clientsNew.name,
      clientEmail: clientsNew.email,
      clientPhone: clientsNew.phone
    })
    .from(proposals)
    .leftJoin(clientsNew, eq(proposals.clientId, clientsNew.id))
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal || proposal.length === 0) {
    throw new Error("Proposta não encontrada");
  }

  const proposalData = proposal[0];

  // Verificar se já existe uma reserva para esta proposta
  const existingBooking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.proposalId, proposalId))
    .limit(1);

  if (existingBooking && existingBooking.length > 0) {
    console.log("Reserva já existe para esta proposta:", existingBooking[0].id);
    return existingBooking[0].id;
  }

  // Gerar número único de reserva
  const bookingNumber = await generateBookingNumber(proposalData.agencyId);

  // Criar a reserva com todos os dados relevantes
  const [newBooking] = await db
    .insert(bookings)
    .values({
      proposalId: proposalId,
      agencyId: proposalData.agencyId,
      bookingNumber: bookingNumber,
      status: BOOKING_STATUS.PENDING_DOCUMENTS,
      notes: proposalData.notes,
      createdBy: userId,
      metadata: {
        additionalInfo: {
          proposalNumber: proposalData.proposalNumber,
          clientId: proposalData.clientId,
          clientName: proposalData.clientName,
          clientEmail: proposalData.clientEmail,
          clientPhone: proposalData.clientPhone,
          operatorId: proposalData.operatorId,
          totalAmount: proposalData.totalAmount,
          paymentMethod: proposalData.paymentMethod,
          approvedAt: proposalData.approvedAt,
          contractData: proposalData.contractData,
          responsibleUserId: proposalData.userId
        }
      }
    })
    .returning();

  // Adicionar evento na timeline
  await db.insert(bookingTimeline).values({
    bookingId: newBooking.id,
    eventType: "created",
    description: `Reserva criada automaticamente a partir da proposta ${proposalData.proposalNumber}`,
    userId: userId,
    metadata: {
      additionalInfo: {
        proposalId: proposalId,
        proposalNumber: proposalData.proposalNumber,
        automaticCreation: true
      }
    }
  });

  console.log("Nova reserva criada:", newBooking.id, "Número:", bookingNumber);
  
  return newBooking.id;
}

/**
 * Cancelar reserva quando proposta é cancelada
 */
export async function cancelBookingFromProposal(
  proposalId: string,
  userId: string,
  reason: string
): Promise<void> {
  // Buscar reserva associada à proposta
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.proposalId, proposalId))
    .limit(1);

  if (!booking || booking.length === 0) {
    console.log("Nenhuma reserva encontrada para esta proposta");
    return;
  }

  const bookingData = booking[0];

  // Só cancela se não estiver já cancelada
  if (bookingData.status === BOOKING_STATUS.CANCELLED) {
    console.log("Reserva já está cancelada");
    return;
  }

  // Atualizar status para cancelado
  await db
    .update(bookings)
    .set({
      status: BOOKING_STATUS.CANCELLED,
      updatedAt: new Date()
    })
    .where(eq(bookings.id, bookingData.id));

  // Adicionar evento na timeline
  await db.insert(bookingTimeline).values({
    bookingId: bookingData.id,
    eventType: "status_changed",
    description: `Reserva cancelada: ${reason}`,
    userId: userId,
    metadata: {
      previousValue: bookingData.status,
      newValue: BOOKING_STATUS.CANCELLED,
      additionalInfo: {
        reason: reason,
        automaticChange: true
      }
    }
  });

  console.log("Reserva cancelada:", bookingData.id);
}

/**
 * Notificar responsáveis sobre nova reserva
 */
export async function notifyBookingCreated(bookingId: string): Promise<void> {
  // TODO: Implementar sistema de notificações
  // Por enquanto, apenas log
  console.log("Notificação: Nova reserva criada -", bookingId);
}