import { db } from '@/lib/db/drizzle';
import { clientsNew } from '@/lib/db/schema/clients';
import { getDefaultFunnelForAgency, getFirstStageForFunnel } from '@/lib/db/queries/sales-funnels';
import { eq, isNull } from 'drizzle-orm';

// Script para corrigir clientes sem funil
async function fixClientsWithoutFunnel() {
  console.log('Iniciando correção de clientes sem funil...');
  
  try {
    // Buscar clientes sem funil
    const clientsWithoutFunnel = await db
      .select({
        id: clientsNew.id,
        agencyId: clientsNew.agencyId,
        name: clientsNew.name,
        funnelId: clientsNew.funnelId,
        funnelStageId: clientsNew.funnelStageId
      })
      .from(clientsNew)
      .where(
        isNull(clientsNew.funnelId)
      );

    console.log(`Encontrados ${clientsWithoutFunnel.length} clientes sem funil`);

    if (clientsWithoutFunnel.length === 0) {
      console.log('Nenhum cliente sem funil encontrado.');
      return;
    }

    // Agrupar por agência
    const clientsByAgency = clientsWithoutFunnel.reduce((acc, client) => {
      if (!acc[client.agencyId]) {
        acc[client.agencyId] = [];
      }
      acc[client.agencyId].push(client);
      return acc;
    }, {} as Record<string, typeof clientsWithoutFunnel>);

    // Corrigir cada agência
    for (const [agencyId, clients] of Object.entries(clientsByAgency)) {
      console.log(`Processando ${clients.length} clientes da agência ${agencyId}`);
      
      // Buscar funil padrão da agência
      const defaultFunnel = await getDefaultFunnelForAgency(agencyId);
      
      if (!defaultFunnel) {
        console.log(`Agência ${agencyId} não tem funil padrão. Pulando...`);
        continue;
      }

      // Buscar primeira etapa do funil
      const firstStage = await getFirstStageForFunnel(defaultFunnel.id);
      
      if (!firstStage) {
        console.log(`Funil ${defaultFunnel.id} não tem etapas. Pulando...`);
        continue;
      }

      // Atualizar clientes
      for (const client of clients) {
        await db
          .update(clientsNew)
          .set({
            funnelId: defaultFunnel.id,
            funnelStageId: firstStage.id,
            updatedAt: new Date()
          })
          .where(eq(clientsNew.id, client.id));
        
        console.log(`Cliente ${client.name} (${client.id}) atualizado com funil ${defaultFunnel.name}`);
      }
    }

    console.log('Correção concluída!');
  } catch (error) {
    console.error('Erro ao corrigir clientes:', error);
  }
}

// Executar o script
fixClientsWithoutFunnel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
