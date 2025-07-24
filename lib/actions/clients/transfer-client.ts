'use server'

import { z } from 'zod'
import { createPermissionAction } from '@/lib/actions/action-wrapper'
import { Permission } from '@/lib/auth/permissions'
import { db } from '@/lib/db/drizzle'
import { clientsNew, clientTransfers, activityLog, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AppError } from '@/lib/services/error-handler'

const transferClientSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  toUserId: z.string().uuid('ID do usuário inválido'),
  reason: z.string().min(20, 'A justificativa deve ter pelo menos 20 caracteres'),
  notifyNewAgent: z.boolean().default(true)
})

export const transferClient = createPermissionAction(
  transferClientSchema,
  Permission.CLIENT_UPDATE,
  async (input, user) => {
    // Verificar se o usuário tem permissão de Admin ou Master
    if (user.role !== 'ADMIN' && user.role !== 'MASTER' && user.role !== 'DEVELOPER') {
      throw new AppError('Apenas administradores podem transferir clientes', 'FORBIDDEN')
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

    // Verificar se o novo responsável existe e pertence à mesma agência
    const newUser = await db.query.users.findFirst({
      where: and(
        eq(users.id, input.toUserId),
        eq(users.agencyId, user.agencyId)
      )
    })

    if (!newUser) {
      throw new AppError('Usuário não encontrado', 'NOT_FOUND')
    }

    // Verificar se o novo responsável não é o mesmo atual
    if (client.userId === input.toUserId) {
      throw new AppError('O cliente já está atribuído a este usuário', 'INVALID_INPUT')
    }

    // Verificar se o novo responsável está ativo
    if (!newUser.isActive) {
      throw new AppError('O usuário selecionado está inativo', 'INVALID_INPUT')
    }

    // Iniciar transação
    const result = await db.transaction(async (tx) => {
      // Criar registro de transferência
      const [transfer] = await tx.insert(clientTransfers).values({
        clientId: input.clientId,
        fromUserId: client.userId,
        toUserId: input.toUserId,
        transferredBy: user.id,
        reason: input.reason,
        transferredAt: new Date()
      }).returning()

      // Atualizar o cliente
      const [updatedClient] = await tx.update(clientsNew)
        .set({
          userId: input.toUserId,
          updatedAt: new Date()
        })
        .where(eq(clientsNew.id, input.clientId))
        .returning()

      // Registrar no log de atividades
      await tx.insert(activityLog).values({
        userId: user.id,
        agencyId: user.agencyId,
        type: 'client.transferred',
        description: `Cliente ${client.name} transferido de ${client.userId} para ${input.toUserId}`,
        metadata: {
          clientId: input.clientId,
          clientName: client.name,
          fromUserId: client.userId,
          toUserId: input.toUserId,
          reason: input.reason,
          notifyNewAgent: input.notifyNewAgent
        }
      })

      // TODO: Se notifyNewAgent for true, enviar email para o novo responsável
      if (input.notifyNewAgent) {
        // Implementar envio de email
        console.log(`Notificar ${newUser.email} sobre novo cliente atribuído`)
      }

      return {
        client: updatedClient,
        transfer
      }
    })

    return result
  },
  {
    rateLimitKey: 'transfer-client',
    rateLimitAttempts: 10,
    logActivity: true,
    activityType: 'client.transferred'
  }
)