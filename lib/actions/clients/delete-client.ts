'use server'

import { z } from 'zod'
import { createPermissionAction } from '@/lib/actions/action-wrapper'
import { Permission } from '@/lib/auth/permissions'
import { db } from '@/lib/db/drizzle'
import { clientsNew, proposals, activityLog } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AppError } from '@/lib/services/error-handler'

const deleteClientSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido')
})

export const deleteClient = createPermissionAction(
  deleteClientSchema,
  Permission.CLIENT_DELETE,
  async (input, user) => {
    // Apenas Master pode deletar clientes
    if (user.role !== 'MASTER' && user.role !== 'DEVELOPER') {
      throw new AppError('Apenas o Master da agência pode excluir clientes', 'FORBIDDEN')
    }

    // Buscar o cliente
    const client = await db.query.clientsNew.findFirst({
      where: and(
        eq(clientsNew.id, input.clientId),
        eq(clientsNew.agencyId, user.agencyId)
      )
    })

    if (!client) {
      throw new AppError('Cliente não encontrado', 'NOT_FOUND')
    }

    // Verificar se o cliente tem propostas ativas
    const activeProposals = await db.query.proposals.findMany({
      where: and(
        eq(proposals.clientId, input.clientId),
        eq(proposals.status, 'accepted')
      )
    })

    if (activeProposals.length > 0) {
      throw new AppError(
        'Não é possível excluir um cliente com propostas aceitas. Archive o cliente ao invés disso.',
        'CONFLICT'
      )
    }

    // Soft delete - apenas marca como deletado
    const [deletedClient] = await db.update(clientsNew)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(clientsNew.id, input.clientId))
      .returning()

    // Registrar no log de atividades
    await db.insert(activityLog).values({
      userId: user.id,
      agencyId: user.agencyId,
      type: 'DELETE_CLIENT',
      description: `Cliente ${client.name} excluído`,
      metadata: {
        clientId: client.id,
        clientName: client.name,
        deletedBy: user.id
      }
    })

    return {
      success: true,
      message: 'Cliente excluído com sucesso'
    }
  },
  {
    rateLimitKey: 'delete-client',
    rateLimitAttempts: 5,
    logActivity: true,
    activityType: 'client.deleted'
  }
)