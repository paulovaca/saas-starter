import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { bookings } from '@/lib/db/schema/bookings';
import { proposals, clientsNew } from '@/lib/db/schema/clients';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    console.log('🔍 Testando conexão com BD e verificando dados...');
    console.log('👤 Usuário:', { id: user.id, agencyId: user.agencyId, role: user.role });

    // 1. Verificar conexão com BD
    const testConnection = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Conexão com BD OK:', testConnection);

    // 2. Contar total de propostas
    const totalProposals = await db
      .select({ count: sql<number>`count(*)` })
      .from(proposals)
      .where(eq(proposals.agencyId, user.agencyId));
    
    console.log('📊 Total de propostas na agência:', totalProposals[0].count);

    // 3. Buscar propostas com status active_booking
    const activeProposals = await db
      .select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        status: proposals.status,
        clientId: proposals.clientId,
        totalAmount: proposals.totalAmount,
        createdAt: proposals.createdAt
      })
      .from(proposals)
      .where(
        and(
          eq(proposals.agencyId, user.agencyId),
          eq(proposals.status, 'active_booking')
        )
      );

    console.log(`🎯 Propostas com status 'active_booking': ${activeProposals.length}`);
    activeProposals.forEach(p => {
      console.log(`  - ${p.proposalNumber} (ID: ${p.id})`);
    });

    // 4. Contar total de reservas
    const totalBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.agencyId, user.agencyId));
    
    console.log('📚 Total de reservas na agência:', totalBookings[0].count);

    // 5. Buscar todas as reservas
    const allBookings = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        proposalId: bookings.proposalId,
        status: bookings.status,
        createdAt: bookings.createdAt
      })
      .from(bookings)
      .where(eq(bookings.agencyId, user.agencyId));

    console.log('📋 Todas as reservas:');
    allBookings.forEach(b => {
      console.log(`  - ${b.bookingNumber} (Proposta: ${b.proposalId}, Status: ${b.status})`);
    });

    // 6. Verificar propostas active_booking SEM reserva
    const proposalsWithoutBooking = [];
    for (const proposal of activeProposals) {
      const hasBooking = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(eq(bookings.proposalId, proposal.id))
        .limit(1);

      if (hasBooking.length === 0) {
        proposalsWithoutBooking.push(proposal);
        console.log(`⚠️ Proposta ${proposal.proposalNumber} NÃO tem reserva criada!`);
      } else {
        console.log(`✅ Proposta ${proposal.proposalNumber} tem reserva: ${hasBooking[0].id}`);
      }
    }

    // 7. Verificar estrutura da tabela bookings
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `);
    
    console.log('🏗️ Estrutura da tabela bookings:', tableInfo);

    const result = {
      connection: 'OK',
      user: {
        id: user.id,
        agencyId: user.agencyId,
        role: user.role
      },
      summary: {
        totalProposals: totalProposals[0].count,
        activeProposals: activeProposals.length,
        totalBookings: totalBookings[0].count,
        proposalsWithoutBooking: proposalsWithoutBooking.length
      },
      activeProposals: activeProposals.map(p => ({
        id: p.id,
        proposalNumber: p.proposalNumber,
        status: p.status,
        totalAmount: p.totalAmount
      })),
      allBookings: allBookings.map(b => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        proposalId: b.proposalId,
        status: b.status
      })),
      proposalsWithoutBooking: proposalsWithoutBooking.map(p => ({
        id: p.id,
        proposalNumber: p.proposalNumber
      })),
      tableColumns: tableInfo
    };

    console.log('📊 Resultado final:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      error: 'Erro ao testar',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}