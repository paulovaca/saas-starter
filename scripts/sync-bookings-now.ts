import { db } from '../lib/db/drizzle';
import { bookings, bookingTimeline } from '../lib/db/schema/bookings';
import { proposals, clientsNew } from '../lib/db/schema/clients';
import { eq } from 'drizzle-orm';
import { generateBookingNumber } from '../lib/actions/bookings/utils';

async function syncBookingsNow() {
  try {
    console.log('🔄 Iniciando sincronização de reservas...\n');

    // Buscar propostas com status active_booking
    const activeProposals = await db
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
        clientName: clientsNew.name,
        clientEmail: clientsNew.email,
        clientPhone: clientsNew.phone
      })
      .from(proposals)
      .leftJoin(clientsNew, eq(proposals.clientId, clientsNew.id))
      .where(eq(proposals.status, 'active_booking'));

    console.log(`📊 Encontradas ${activeProposals.length} propostas com status 'active_booking'\n`);

    let created = 0;
    let skipped = 0;

    for (const proposal of activeProposals) {
      // Verificar se já existe reserva
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

      // Criar reserva
      console.log(`✨ Criando reserva para proposta ${proposal.proposalNumber}...`);
      
      const bookingNumber = await generateBookingNumber(proposal.agencyId);
      
      const [newBooking] = await db
        .insert(bookings)
        .values({
          proposalId: proposal.id,
          agencyId: proposal.agencyId,
          bookingNumber: bookingNumber,
          status: 'pending_documents', // Status inicial
          notes: proposal.notes,
          createdBy: proposal.userId,
          metadata: {
            additionalInfo: {
              proposalNumber: proposal.proposalNumber,
              clientId: proposal.clientId,
              clientName: proposal.clientName,
              clientEmail: proposal.clientEmail,
              clientPhone: proposal.clientPhone,
              operatorId: proposal.operatorId,
              totalAmount: proposal.totalAmount,
              paymentMethod: proposal.paymentMethod,
              responsibleUserId: proposal.userId
            }
          }
        })
        .returning();

      // Adicionar evento na timeline
      await db.insert(bookingTimeline).values({
        bookingId: newBooking.id,
        eventType: 'created',
        description: `Reserva criada automaticamente a partir da proposta ${proposal.proposalNumber}`,
        userId: proposal.userId,
        metadata: {
          additionalInfo: {
            proposalId: proposal.id,
            proposalNumber: proposal.proposalNumber,
            automaticCreation: true,
            syncScript: true
          }
        }
      });

      console.log(`✅ Reserva ${bookingNumber} criada com sucesso!`);
      created++;
    }

    console.log('\n📊 RESULTADO DA SINCRONIZAÇÃO:');
    console.log(`   ✅ Reservas criadas: ${created}`);
    console.log(`   ⏭️ Propostas já sincronizadas: ${skipped}`);
    
    if (created > 0) {
      console.log('\n🎉 Sincronização concluída com sucesso!');
      console.log('   As reservas agora devem aparecer em /bookings');
    }

  } catch (error) {
    console.error('\n❌ Erro na sincronização:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    process.exit();
  }
}

// Executar sincronização
console.log('🚀 Executando sincronização de reservas...\n');
syncBookingsNow();