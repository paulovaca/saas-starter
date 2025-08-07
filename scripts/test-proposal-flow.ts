/**
 * Script para testar o fluxo completo de propostas
 * 
 * Execute com: npx tsx scripts/test-proposal-flow.ts
 */

import { db } from '@/lib/db/drizzle';
import { proposals, proposalItems, proposalStatusHistory } from '@/lib/db/schema/clients';
import { eq, and } from 'drizzle-orm';
import { 
  ProposalStatus,
  ProposalStatusTransitions,
  isValidTransition,
  type ProposalStatusType 
} from '@/lib/types/proposal';

// Cores para output colorido
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(message: string, color: keyof typeof colors = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(test: string, passed: boolean, error?: string, details?: any) {
  results.push({ test, passed, error, details });
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${test}`, color);
  if (error) {
    log(`   Error: ${error}`, 'red');
  }
  if (details) {
    log(`   Details: ${JSON.stringify(details, null, 2)}`, 'cyan');
  }
}

async function testDatabaseSchema() {
  log('\n🔍 Testando Schema do Banco de Dados...', 'blue');

  try {
    // Testar se as novas colunas existem na tabela proposals
    const [testProposal] = await db
      .select({
        id: proposals.id,
        status: proposals.status,
        approvedAt: proposals.approvedAt,
        contractAt: proposals.contractAt,
        cancelledAt: proposals.cancelledAt,
        contractData: proposals.contractData,
        contractUrl: proposals.contractUrl,
        approvalEvidence: proposals.approvalEvidence,
        rejectionReason: proposals.rejectionReason,
        cancellationReason: proposals.cancellationReason,
      })
      .from(proposals)
      .limit(1);

    addResult('Schema - Novas colunas da tabela proposals', true);
  } catch (error) {
    addResult('Schema - Novas colunas da tabela proposals', false, error instanceof Error ? error.message : 'Erro desconhecido');
  }

  try {
    // Testar se a tabela de histórico existe
    const [testHistory] = await db
      .select()
      .from(proposalStatusHistory)
      .limit(1);

    addResult('Schema - Tabela de histórico de status', true);
  } catch (error) {
    addResult('Schema - Tabela de histórico de status', false, error instanceof Error ? error.message : 'Erro desconhecido');
  }
}

async function testStatusTransitions() {
  log('\n🔄 Testando Transições de Status...', 'blue');

  // Testar transições válidas
  const validTests = [
    { from: 'draft' as ProposalStatusType, to: 'sent' as ProposalStatusType },
    { from: 'sent' as ProposalStatusType, to: 'approved' as ProposalStatusType },
    { from: 'approved' as ProposalStatusType, to: 'contract' as ProposalStatusType },
    { from: 'contract' as ProposalStatusType, to: 'awaiting_payment' as ProposalStatusType },
    { from: 'awaiting_payment' as ProposalStatusType, to: 'active_booking' as ProposalStatusType },
    { from: 'sent' as ProposalStatusType, to: 'rejected' as ProposalStatusType },
    { from: 'sent' as ProposalStatusType, to: 'expired' as ProposalStatusType },
    { from: 'rejected' as ProposalStatusType, to: 'draft' as ProposalStatusType }, // Reativar
    { from: 'expired' as ProposalStatusType, to: 'draft' as ProposalStatusType }, // Reativar
  ];

  for (const { from, to } of validTests) {
    const isValid = isValidTransition(from, to);
    addResult(`Transição válida: ${from} → ${to}`, isValid);
  }

  // Testar transições inválidas
  const invalidTests = [
    { from: 'draft' as ProposalStatusType, to: 'approved' as ProposalStatusType }, // Pula envio
    { from: 'sent' as ProposalStatusType, to: 'active_booking' as ProposalStatusType }, // Pula aprovação
    { from: 'active_booking' as ProposalStatusType, to: 'draft' as ProposalStatusType }, // Status final
    { from: 'cancelled' as ProposalStatusType, to: 'sent' as ProposalStatusType }, // Status final
  ];

  for (const { from, to } of invalidTests) {
    const isValid = isValidTransition(from, to);
    addResult(`Transição inválida bloqueada: ${from} → ${to}`, !isValid);
  }
}

async function testProposalCreationAndFlow() {
  log('\n📋 Testando Criação e Fluxo de Proposta...', 'blue');

  try {
    // Buscar uma agência e usuário para teste
    const agencies = await db.query.agencies.findFirst();
    const users = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.agencyId, agencies?.id || '')
    });

    if (!agencies || !users) {
      addResult('Setup de teste', false, 'Nenhuma agência ou usuário encontrado para teste');
      return;
    }

    // Buscar um cliente para teste
    const clients = await db.query.clientsNew.findFirst({
      where: (clients, { eq }) => eq(clients.agencyId, agencies.id)
    });

    if (!clients) {
      addResult('Setup de teste', false, 'Nenhum cliente encontrado para teste');
      return;
    }

    // Buscar um operador para teste
    const operators = await db.query.operators.findFirst({
      where: (operators, { eq }) => eq(operators.agencyId, agencies.id)
    });

    if (!operators) {
      addResult('Setup de teste', false, 'Nenhum operador encontrado para teste');
      return;
    }

    addResult('Setup de teste', true, undefined, {
      agency: agencies.name,
      user: users.name,
      client: clients.name,
      operator: operators.name
    });

    // Criar proposta de teste
    const [testProposal] = await db
      .insert(proposals)
      .values({
        proposalNumber: `TEST-${Date.now()}`,
        agencyId: agencies.id,
        clientId: clients.id,
        userId: users.id,
        operatorId: operators.id,
        status: ProposalStatus.DRAFT,
        subtotal: '1000.00',
        totalAmount: '1000.00',
        commissionAmount: '100.00',
        commissionPercent: '10.00',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        notes: 'Proposta de teste criada pelo script de teste',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!testProposal) {
      addResult('Criação de proposta', false, 'Falha ao criar proposta de teste');
      return;
    }

    addResult('Criação de proposta', true, undefined, {
      id: testProposal.id,
      number: testProposal.proposalNumber,
      status: testProposal.status
    });

    // Testar transições de status
    const statusFlow: ProposalStatusType[] = [
      'sent',
      'approved', 
      'contract',
      'awaiting_payment',
      'active_booking'
    ];

    let currentStatus: ProposalStatusType = 'draft';

    for (const nextStatus of statusFlow) {
      try {
        // Atualizar status
        await db
          .update(proposals)
          .set({
            status: nextStatus,
            updatedAt: new Date(),
            ...(nextStatus === 'sent' && { sentAt: new Date() }),
            ...(nextStatus === 'approved' && { approvedAt: new Date() }),
            ...(nextStatus === 'contract' && { contractAt: new Date() }),
            ...(nextStatus === 'active_booking' && { activatedAt: new Date() }),
          })
          .where(eq(proposals.id, testProposal.id));

        // Registrar no histórico
        await db.insert(proposalStatusHistory).values({
          proposalId: testProposal.id,
          fromStatus: currentStatus,
          toStatus: nextStatus,
          changedBy: users.id,
          reason: `Teste automático de transição`,
          changedAt: new Date(),
        });

        currentStatus = nextStatus;
        addResult(`Transição para ${nextStatus}`, true);
      } catch (error) {
        addResult(`Transição para ${nextStatus}`, false, error instanceof Error ? error.message : 'Erro desconhecido');
      }
    }

    // Verificar histórico criado
    const history = await db
      .select()
      .from(proposalStatusHistory)
      .where(eq(proposalStatusHistory.proposalId, testProposal.id));

    const expectedHistoryCount = statusFlow.length;
    const actualHistoryCount = history.length;
    
    addResult(
      `Histórico de transições (${actualHistoryCount}/${expectedHistoryCount})`,
      actualHistoryCount === expectedHistoryCount,
      actualHistoryCount !== expectedHistoryCount ? 'Contagem de histórico não confere' : undefined,
      history.map(h => ({ from: h.fromStatus, to: h.toStatus, reason: h.reason }))
    );

    // Limpeza: remover proposta de teste
    await db.delete(proposalStatusHistory).where(eq(proposalStatusHistory.proposalId, testProposal.id));
    await db.delete(proposals).where(eq(proposals.id, testProposal.id));
    
    addResult('Limpeza da proposta de teste', true);

  } catch (error) {
    addResult('Teste de fluxo completo', false, error instanceof Error ? error.message : 'Erro desconhecido');
  }
}

async function testConstants() {
  log('\n📚 Testando Constantes e Tipos...', 'blue');

  // Testar se todos os status têm transições definidas
  const allStatuses = Object.values(ProposalStatus);
  
  for (const status of allStatuses) {
    const hasTransitions = status in ProposalStatusTransitions;
    addResult(`Status ${status} tem transições definidas`, hasTransitions);
  }

  // Testar se não há status órfãos
  const usedInTransitions = new Set<string>();
  for (const transitions of Object.values(ProposalStatusTransitions)) {
    for (const status of transitions) {
      usedInTransitions.add(status);
    }
  }
  
  for (const status of Object.keys(ProposalStatusTransitions)) {
    usedInTransitions.add(status);
  }

  const orphanedStatuses = allStatuses.filter(status => !usedInTransitions.has(status));
  addResult('Nenhum status órfão', orphanedStatuses.length === 0, 
    orphanedStatuses.length > 0 ? `Status órfãos: ${orphanedStatuses.join(', ')}` : undefined);
}

async function runTests() {
  log('🚀 Iniciando Testes do Sistema de Propostas\n', 'magenta');
  
  const startTime = Date.now();

  await testDatabaseSchema();
  await testStatusTransitions();
  await testConstants();
  await testProposalCreationAndFlow();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Resumo dos resultados
  log('\n📊 Resumo dos Testes', 'magenta');
  log('━'.repeat(50), 'white');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  log(`Total de testes: ${total}`, 'white');
  log(`Passou: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`Falhou: ${failed}`, failed === 0 ? 'green' : 'red');
  log(`Duração: ${duration.toFixed(2)}s`, 'white');
  log(`Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%`, 
    passed === total ? 'green' : (passed / total >= 0.8 ? 'yellow' : 'red'));

  if (failed > 0) {
    log('\n❌ Testes que falharam:', 'red');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        log(`  • ${r.test}`, 'red');
        if (r.error) {
          log(`    ${r.error}`, 'red');
        }
      });
  }

  log('\n' + '━'.repeat(50), 'white');
  
  if (passed === total) {
    log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.', 'green');
  } else {
    log(`⚠️  ${failed} teste(s) falharam. Verifique os erros acima.`, 'yellow');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Executar testes
runTests().catch((error) => {
  log(`\n💥 Erro fatal durante os testes: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});