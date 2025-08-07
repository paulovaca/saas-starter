import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq, and, lte } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { proposals, proposalStatusHistory } from '@/lib/db/schema/clients';
import { ProposalStatus } from '@/lib/types/proposal';

// Chave secreta para autenticar chamadas de cron
const CRON_SECRET = process.env.CRON_SECRET || 'default-secret';

export async function POST() {
  try {
    // Verificar autenticação para cron jobs
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (authorization !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final do dia

    console.log(`🕐 [EXPIRE-JOB] Iniciando verificação de propostas expiradas - ${today.toISOString()}`);

    // Buscar propostas enviadas que passaram da validade
    const expiredProposals = await db
      .select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        validUntil: proposals.validUntil,
        agencyId: proposals.agencyId,
        clientId: proposals.clientId,
      })
      .from(proposals)
      .where(
        and(
          eq(proposals.status, ProposalStatus.SENT),
          lte(proposals.validUntil, today.toISOString().split('T')[0])
        )
      );

    console.log(`📋 [EXPIRE-JOB] Encontradas ${expiredProposals.length} propostas para expirar`);

    const results = [];

    // Expirar cada proposta
    for (const proposal of expiredProposals) {
      try {
        console.log(`⏰ [EXPIRE-JOB] Expirando proposta ${proposal.proposalNumber} (${proposal.id})`);

        // Atualizar status da proposta
        await db
          .update(proposals)
          .set({
            status: ProposalStatus.EXPIRED,
            updatedAt: new Date(),
          })
          .where(eq(proposals.id, proposal.id));

        // Registrar no histórico
        await db.insert(proposalStatusHistory).values({
          proposalId: proposal.id,
          fromStatus: ProposalStatus.SENT,
          toStatus: ProposalStatus.EXPIRED,
          changedBy: 'system', // ID especial para ações do sistema
          reason: 'Expirada automaticamente por prazo de validade',
          changedAt: new Date(),
        });

        results.push({
          proposalId: proposal.id,
          proposalNumber: proposal.proposalNumber,
          success: true,
        });

        console.log(`✅ [EXPIRE-JOB] Proposta ${proposal.proposalNumber} expirada com sucesso`);
      } catch (error) {
        console.error(`❌ [EXPIRE-JOB] Erro ao expirar proposta ${proposal.proposalNumber}:`, error);
        
        results.push({
          proposalId: proposal.id,
          proposalNumber: proposal.proposalNumber,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`🎯 [EXPIRE-JOB] Processamento concluído: ${successCount} sucessos, ${errorCount} erros`);

    return NextResponse.json({
      success: true,
      message: `Processadas ${expiredProposals.length} propostas`,
      results: {
        total: expiredProposals.length,
        expired: successCount,
        errors: errorCount,
      },
      details: results,
    });
  } catch (error) {
    console.error('❌ [EXPIRE-JOB] Erro geral no job de expiração:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificação manual (apenas em desenvolvimento)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint disponível apenas em desenvolvimento' }, { status: 403 });
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const expiredProposals = await db
    .select({
      id: proposals.id,
      proposalNumber: proposals.proposalNumber,
      validUntil: proposals.validUntil,
      status: proposals.status,
    })
    .from(proposals)
    .where(
      and(
        eq(proposals.status, ProposalStatus.SENT),
        lte(proposals.validUntil, today.toISOString().split('T')[0])
      )
    );

  return NextResponse.json({
    message: 'Propostas que seriam expiradas',
    count: expiredProposals.length,
    proposals: expiredProposals,
    today: today.toISOString().split('T')[0],
  });
}