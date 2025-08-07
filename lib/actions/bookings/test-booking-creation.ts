import { getCurrentUser } from "@/lib/auth/session";
import { createBookingFromProposal } from "./booking-triggers";
import { db } from "@/lib/db/drizzle";
import { proposals } from "@/lib/db/schema/clients";
import { eq, and } from "drizzle-orm";

/**
 * Função de teste para criar uma reserva a partir de uma proposta existente
 */
export async function testBookingCreation() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Buscar uma proposta existente com status "active_booking" (Negócio/Viagem Ativo)
    const existingProposal = await db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.agencyId, user.agencyId),
          eq(proposals.status, "active_booking")
        )
      )
      .limit(1);

    if (existingProposal.length === 0) {
      throw new Error("Nenhuma proposta com status 'active_booking' encontrada para teste");
    }

    const proposal = existingProposal[0];
    console.log("Proposta encontrada para teste:", proposal.proposalNumber);

    // Criar reserva a partir da proposta
    const bookingId = await createBookingFromProposal(proposal.id, user.id);
    
    console.log("Reserva criada com sucesso:", bookingId);
    
    return {
      success: true,
      bookingId,
      proposalNumber: proposal.proposalNumber
    };

  } catch (error) {
    console.error("Erro no teste de criação de reserva:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}