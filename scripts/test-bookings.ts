import { db } from '../lib/db/drizzle';
import { bookings } from '../lib/db/schema/bookings';
import { proposals, clientsNew } from '../lib/db/schema/clients';
import { eq, and, sql } from 'drizzle-orm';

async function testBookings() {
  try {
    console.log('🔍 Iniciando teste de bookings...\n');

    // 1. Testar conexão
    const testConnection = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Conexão com BD OK\n');

    // 2. Buscar TODAS as propostas (sem filtro de agência por enquanto)
    const allProposals = await db
      .select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        status: proposals.status,
        agencyId: proposals.agencyId,
        totalAmount: proposals.totalAmount
      })
      .from(proposals);

    console.log(`📊 Total de propostas no banco: ${allProposals.length}`);
    
    // Agrupar por status
    const statusCount: Record<string, number> = {};
    allProposals.forEach(p => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });
    
    console.log('📈 Propostas por status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    // 3. Buscar propostas com status active_booking
    const activeProposals = allProposals.filter(p => p.status === 'active_booking');
    console.log(`\n🎯 Propostas com status 'active_booking': ${activeProposals.length}`);
    
    if (activeProposals.length > 0) {
      console.log('Lista de propostas ativas:');
      activeProposals.forEach(p => {
        console.log(`   - ${p.proposalNumber} (ID: ${p.id}, Agência: ${p.agencyId})`);
      });
    }

    // 4. Buscar TODAS as reservas
    const allBookings = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        proposalId: bookings.proposalId,
        agencyId: bookings.agencyId,
        status: bookings.status
      })
      .from(bookings);

    console.log(`\n📚 Total de reservas no banco: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('Lista de reservas:');
      allBookings.forEach(b => {
        console.log(`   - ${b.bookingNumber} (Proposta: ${b.proposalId}, Agência: ${b.agencyId})`);
      });
    }

    // 5. Verificar quais propostas active_booking NÃO têm reserva
    console.log('\n🔍 Verificando propostas sem reserva:');
    const proposalsWithoutBooking = [];
    
    for (const proposal of activeProposals) {
      const hasBooking = allBookings.find(b => b.proposalId === proposal.id);
      
      if (!hasBooking) {
        proposalsWithoutBooking.push(proposal);
        console.log(`   ⚠️ Proposta ${proposal.proposalNumber} (${proposal.id}) NÃO tem reserva!`);
      } else {
        console.log(`   ✅ Proposta ${proposal.proposalNumber} tem reserva ${hasBooking.bookingNumber}`);
      }
    }

    // 6. Verificar estrutura das tabelas
    console.log('\n🏗️ Verificando estrutura das tabelas...');
    
    const proposalsColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'proposals'
      AND column_name IN ('id', 'proposal_number', 'status', 'agency_id')
    `);
    
    console.log('Colunas da tabela proposals:');
    proposalsColumns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    const bookingsColumns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      AND column_name IN ('id', 'booking_number', 'proposal_id', 'agency_id', 'status')
    `);
    
    console.log('\nColunas da tabela bookings:');
    bookingsColumns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`   - Total de propostas: ${allProposals.length}`);
    console.log(`   - Propostas com status 'active_booking': ${activeProposals.length}`);
    console.log(`   - Total de reservas: ${allBookings.length}`);
    console.log(`   - Propostas 'active_booking' SEM reserva: ${proposalsWithoutBooking.length}`);

    if (proposalsWithoutBooking.length > 0) {
      console.log('\n⚠️ AÇÃO NECESSÁRIA:');
      console.log('   Execute a sincronização em /bookings/sync para criar as reservas faltantes.');
    }

  } catch (error) {
    console.error('\n❌ Erro no teste:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    process.exit();
  }
}

// Executar o teste
console.log('🚀 Executando teste de bookings...\n');
testBookings();