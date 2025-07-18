import { db } from '../lib/db/drizzle';
import { clientsNew } from '../lib/db/schema/clients';
import { salesFunnels, salesFunnelStages } from '../lib/db/schema/funnels';
import { eq } from 'drizzle-orm';

async function testClients() {
  console.log('🔍 Verificando clientes no banco...');
  
  // Verificar clientes com funil
  const clients = await db
    .select({
      id: clientsNew.id,
      name: clientsNew.name,
      funnelId: clientsNew.funnelId,
      funnelStageId: clientsNew.funnelStageId,
      funnel: {
        id: salesFunnels.id,
        name: salesFunnels.name,
      },
      funnelStage: {
        id: salesFunnelStages.id,
        name: salesFunnelStages.name,
      },
    })
    .from(clientsNew)
    .leftJoin(salesFunnels, eq(clientsNew.funnelId, salesFunnels.id))
    .leftJoin(salesFunnelStages, eq(clientsNew.funnelStageId, salesFunnelStages.id))
    .limit(5);
  
  console.log('📊 Primeiros 5 clientes:', clients);
  
  // Verificar se há funis no banco
  const funnels = await db.select().from(salesFunnels).limit(5);
  console.log('🎯 Funis disponíveis:', funnels);
  
  // Verificar se há estágios no banco
  const stages = await db.select().from(salesFunnelStages).limit(5);
  console.log('📈 Estágios disponíveis:', stages);
}

testClients().catch(console.error);
