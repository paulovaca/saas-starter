import { pgView } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { clientsNew } from './clients';
import { proposals } from './clients';

// View para relatórios consolidados da Jornada Geral dos clientes
export const clientJornada = pgView('client_jornada').as((qb) => 
  qb.select({
    clientId: clientsNew.id,
    clientName: clientsNew.name,
    jornadaStage: clientsNew.jornadaStage,
    dealStatus: clientsNew.dealStatus,
    agencyId: clientsNew.agencyId,
    userId: clientsNew.userId,
    proposalFunnels: sql<Record<string, any>[]>`JSONB_AGG(
      CASE 
        WHEN ${proposals.id} IS NOT NULL THEN
          JSONB_BUILD_OBJECT(
            'funnelId', ${proposals.funnelId},
            'funnelStageId', ${proposals.funnelStageId},
            'proposalId', ${proposals.id},
            'proposalStatus', ${proposals.status}
          )
        ELSE NULL
      END
    ) FILTER (WHERE ${proposals.id} IS NOT NULL)`.as('proposal_funnels')
  })
  .from(clientsNew)
  .leftJoin(proposals, sql`${clientsNew.id} = ${proposals.clientId}`)
  .groupBy(
    clientsNew.id,
    clientsNew.name,
    clientsNew.jornadaStage,
    clientsNew.dealStatus,
    clientsNew.agencyId,
    clientsNew.userId
  )
);

// Tipo TypeScript para a view
export type ClientJornada = typeof clientJornada.$inferSelect;