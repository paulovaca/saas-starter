import { db } from '../lib/db/drizzle';
import { bookings } from '../lib/db/schema/bookings';
import { proposals } from '../lib/db/schema/clients';
import { eq, sql } from 'drizzle-orm';

async function checkBookings() {
  try {
    console.log('🔍 Verificando estado atual do banco de dados...\n');
    
    // 1. Contar propostas com status active_booking
    const activeProposalsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(proposals)
      .where(eq(proposals.status, 'active_booking'));
    
    console.log(`📊 Propostas com status 'active_booking': ${activeProposalsCount[0].count}`);
    
    // 2. Contar TODAS as reservas
    const allBookingsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings);
    
    console.log(`📚 Total de reservas no banco: ${allBookingsCount[0].count}`);
    
    // 3. Listar TODAS as reservas com detalhes
    const allBookings = await db
      .select()
      .from(bookings);
    
    if (allBookings.length > 0) {
      console.log('\n📋 TODAS AS RESERVAS NO BANCO:');
      allBookings.forEach(booking => {
        console.log(`\n  ID: ${booking.id}`);
        console.log(`  Número: ${booking.bookingNumber}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Proposta ID: ${booking.proposalId}`);
        console.log(`  Agência ID: ${booking.agencyId}`);
        console.log(`  Criado em: ${booking.createdAt}`);
        console.log(`  Metadata:`, JSON.stringify(booking.metadata, null, 2));
      });
    } else {
      console.log('\n❌ NENHUMA RESERVA ENCONTRADA NO BANCO!');
    }
    
    // 4. Verificar propostas active_booking e suas reservas
    const activeProposals = await db
      .select()
      .from(proposals)
      .where(eq(proposals.status, 'active_booking'));
    
    console.log('\n🔍 VERIFICANDO PROPOSTAS ACTIVE_BOOKING:');
    for (const proposal of activeProposals) {
      console.log(`\n  Proposta ${proposal.proposalNumber} (${proposal.id}):`);
      
      // Verificar se tem reserva
      const hasBooking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.proposalId, proposal.id))
        .limit(1);
      
      if (hasBooking.length > 0) {
        console.log(`    ✅ TEM reserva: ${hasBooking[0].bookingNumber} (Status: ${hasBooking[0].status})`);
      } else {
        console.log(`    ❌ NÃO tem reserva`);
      }
    }
    
    // 5. Verificar estrutura da tabela
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'bookings'
    `);
    
    console.log('\n📊 Tabela bookings existe?', tableCheck.length > 0 ? 'SIM' : 'NÃO');
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    process.exit();
  }
}

console.log('🚀 Executando verificação...\n');
checkBookings();