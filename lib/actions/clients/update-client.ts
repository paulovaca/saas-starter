'use server'

import { z } from 'zod'
import { createPermissionAction } from '@/lib/actions/action-wrapper'
import { Permission } from '@/lib/auth/permissions'
import { db } from '@/lib/db/drizzle'
import { clientsNew, activityLog } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { AppError } from '@/lib/services/error-handler'
import { clientUpdateSchema as baseClientUpdateSchema } from '@/lib/validations/clients/client.schema'

const updateClientSchema = baseClientUpdateSchema.extend({
  clientId: z.string().uuid('ID do cliente inválido')
})

export const updateClient = createPermissionAction(
  updateClientSchema,
  Permission.CLIENT_UPDATE,
  async (input, user) => {
    const { clientId, ...updateData } = input

    // Buscar o cliente
    const client = await db.query.clientsNew.findFirst({
      where: and(
        eq(clientsNew.id, clientId),
        eq(clientsNew.agencyId, user.agencyId)
      )
    })

    if (!client) {
      throw new AppError('Cliente não encontrado', 'NOT_FOUND')
    }

    // Verificar permissões
    // Agents só podem editar seus próprios clientes
    if (user.role === 'AGENT' && client.userId !== user.id) {
      throw new AppError('Você só pode editar seus próprios clientes', 'FORBIDDEN')
    }

    // Verificar unicidade de email se foi alterado
    if (updateData.email && updateData.email !== client.email) {
      const existingClient = await db.query.clientsNew.findFirst({
        where: and(
          eq(clientsNew.agencyId, user.agencyId),
          eq(clientsNew.email, updateData.email),
          ne(clientsNew.id, clientId)
        )
      })

      if (existingClient) {
        throw new AppError('Já existe um cliente com este email', 'CONFLICT')
      }
    }

    // Verificar unicidade de documento se foi alterado
    if (updateData.documentNumber && updateData.documentNumber !== client.documentNumber) {
      const existingClient = await db.query.clientsNew.findFirst({
        where: and(
          eq(clientsNew.agencyId, user.agencyId),
          eq(clientsNew.documentNumber, updateData.documentNumber),
          ne(clientsNew.id, clientId)
        )
      })

      if (existingClient) {
        throw new AppError('Já existe um cliente com este documento', 'CONFLICT')
      }
    }

    // Preparar dados para atualização
    const dataToUpdate: any = {
      ...updateData,
      updatedAt: new Date()
    }

    // birthDate vem como Date do schema, mas Drizzle espera string para o tipo date
    if (updateData.birthDate instanceof Date) {
      dataToUpdate.birthDate = updateData.birthDate.toISOString().split('T')[0];
    }
    
    // Converter strings vazias para null
    if (updateData.email === '') {
      dataToUpdate.email = null
    }
    if (updateData.addressZipcode === '') {
      dataToUpdate.addressZipcode = null
    }
    if (updateData.addressState === '') {
      dataToUpdate.addressState = null
    }

    // Atualizar o cliente
    const [updatedClient] = await db.update(clientsNew)
      .set(dataToUpdate)
      .where(eq(clientsNew.id, clientId))
      .returning()

    // Registrar mudanças no log
    const changes: any = {}
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== client[key as keyof typeof client]) {
        changes[key] = {
          from: client[key as keyof typeof client],
          to: updateData[key as keyof typeof updateData]
        }
      }
    })

    if (Object.keys(changes).length > 0) {
      await db.insert(activityLog).values({
        userId: user.id,
        agencyId: user.agencyId,
        type: 'UPDATE_CLIENT',
        description: `Cliente ${updatedClient.name} atualizado`,
        metadata: {
          clientId: updatedClient.id,
          clientName: updatedClient.name,
          changes
        }
      })
    }

    return updatedClient
  },
  {
    rateLimitKey: 'update-client',
    rateLimitAttempts: 30,
    logActivity: true,
    activityType: 'client.updated'
  }
)