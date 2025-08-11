'use server';

import { db } from "@/lib/db/drizzle";
import { bookings } from "@/lib/db/schema/bookings";
import { proposals, clientsNew } from "@/lib/db/schema/clients";
import { eq, and, isNull } from "drizzle-orm";
import { createBookingFromProposal } from "./booking-triggers";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Sincronizar propostas com status ACTIVE_BOOKING que não têm reserva criada
 * Este script deve ser executado para migrar propostas existentes
 */
export async function syncActiveProposals() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  try {
    console.log("🔄 Iniciando sincronização de propostas ativas...");
    
    // Buscar todas as propostas com status active_booking da agência
    const activeProposals = await db
      .select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        agencyId: proposals.agencyId,
        status: proposals.status
      })
      .from(proposals)
      .where(
        and(
          eq(proposals.agencyId, user.agencyId),
          eq(proposals.status, 'active_booking')
        )
      );

    console.log(`📊 Encontradas ${activeProposals.length} propostas com status 'Reserva Ativa'`);

    if (activeProposals.length === 0) {
      return {
        success: true,
        message: "Nenhuma proposta com status 'Reserva Ativa' encontrada",
        created: 0,
        skipped: 0
      };
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Para cada proposta ativa, verificar se tem reserva
    for (const proposal of activeProposals) {
      try {
        // Verificar se já existe reserva para esta proposta
        const existingBooking = await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(eq(bookings.proposalId, proposal.id))
          .limit(1);

        if (existingBooking.length > 0) {
          console.log(`⏭️ Proposta ${proposal.proposalNumber} já tem reserva`);
          skipped++;
          continue;
        }

        // Criar reserva para proposta sem reserva
        console.log(`✨ Criando reserva para proposta ${proposal.proposalNumber}...`);
        const bookingId = await createBookingFromProposal(proposal.id, user.id);
        console.log(`✅ Reserva criada com sucesso: ${bookingId}`);
        created++;

      } catch (error) {
        const errorMsg = `Erro ao criar reserva para proposta ${proposal.proposalNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const result = {
      success: errors.length === 0,
      message: `Sincronização concluída: ${created} reservas criadas, ${skipped} já existentes`,
      created,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log("🎉 Sincronização finalizada:", result);
    return result;

  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    throw new Error(
      error instanceof Error ? error.message : "Erro ao sincronizar propostas"
    );
  }
}

/**
 * Verificar quantas propostas ativas não têm reserva
 */
export async function checkUnsyncedProposals() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  try {
    // Buscar propostas ativas sem reserva usando LEFT JOIN
    const unsyncedProposals = await db
      .select({
        proposalId: proposals.id,
        proposalNumber: proposals.proposalNumber,
        bookingId: bookings.id
      })
      .from(proposals)
      .leftJoin(bookings, eq(proposals.id, bookings.proposalId))
      .where(
        and(
          eq(proposals.agencyId, user.agencyId),
          eq(proposals.status, 'active_booking'),
          isNull(bookings.id)
        )
      );

    return {
      success: true,
      count: unsyncedProposals.length,
      proposals: unsyncedProposals.map(p => ({
        id: p.proposalId,
        proposalNumber: p.proposalNumber
      }))
    };

  } catch (error) {
    console.error("Erro ao verificar propostas não sincronizadas:", error);
    throw new Error("Erro ao verificar propostas");
  }
}