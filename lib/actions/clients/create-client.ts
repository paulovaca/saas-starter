'use server'

import { z } from 'zod'
import { createAuthenticatedAction } from '@/lib/actions/action-wrapper'
import { db } from '@/lib/db/drizzle'
import { clientsNew, activityLog, agencySettings, salesFunnelStages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AppError } from '@/lib/services/error-handler'
import { validateCPF, validateCNPJ } from '@/lib/validations/brazilian'

const createClientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  documentType: z.enum(['cpf', 'cnpj']).optional(),
  documentNumber: z.string().optional(),
  birthDate: z.string().optional(),
  addressZipcode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  funnelId: z.string().uuid('ID do funil inválido').optional(),
  funnelStageId: z.string().uuid('ID da etapa inválido').optional(),
  notes: z.string().optional()
}).refine(data => {
  if (data.documentType && data.documentNumber) {
    if (data.documentType === 'cpf') {
      return validateCPF(data.documentNumber)
    } else if (data.documentType === 'cnpj') {
      return validateCNPJ(data.documentNumber)
    }
  }
  return true
}, {
  message: 'Documento inválido',
  path: ['documentNumber']
})

export const createClient = createAuthenticatedAction(
  createClientSchema,
  async (input, user) => {
    // Verificar se email é único na agência (quando fornecido)
    if (input.email) {
      const existingClient = await db.query.clientsNew.findFirst({
        where: and(
          eq(clientsNew.agencyId, user.agencyId),
          eq(clientsNew.email, input.email)
        )
      })

      if (existingClient) {
        throw new AppError('Já existe um cliente com este email', 'CONFLICT')
      }
    }

    // Verificar se documento é único na agência (quando fornecido)
    if (input.documentNumber) {
      const existingClient = await db.query.clientsNew.findFirst({
        where: and(
          eq(clientsNew.agencyId, user.agencyId),
          eq(clientsNew.documentNumber, input.documentNumber)
        )
      })

      if (existingClient) {
        throw new AppError('Já existe um cliente com este documento', 'CONFLICT')
      }
    }

    // Se não foi especificado funil, usar o padrão da agência
    let funnelId = input.funnelId
    let funnelStageId = input.funnelStageId

    if (!funnelId) {
      const settings = await db.query.agencySettings.findFirst({
        where: eq(agencySettings.agencyId, user.agencyId)
      })

      if (settings?.defaultFunnelId) {
        funnelId = settings.defaultFunnelId
        
        // Buscar a primeira etapa do funil padrão
        const firstStage = await db.query.salesFunnelStages.findFirst({
          where: eq(salesFunnelStages.funnelId, funnelId),
          orderBy: (stages, { asc }) => [asc(stages.order)]
        })

        if (firstStage) {
          funnelStageId = firstStage.id
        }
      }
    }

    if (!funnelId || !funnelStageId) {
      throw new AppError('Funil ou etapa não especificados e nenhum funil padrão configurado', 'INVALID_INPUT')
    }

    // Criar o cliente
    const [newClient] = await db.insert(clientsNew).values({
      agencyId: user.agencyId,
      userId: user.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      birthDate: input.birthDate || undefined,
      addressZipcode: input.addressZipcode,
      addressStreet: input.addressStreet,
      addressNumber: input.addressNumber,
      addressComplement: input.addressComplement,
      addressNeighborhood: input.addressNeighborhood,
      addressCity: input.addressCity,
      addressState: input.addressState,
      funnelId,
      funnelStageId,
      notes: input.notes,
      isActive: true
    }).returning()

    // Registrar no log de atividades
    await db.insert(activityLog).values({
      userId: user.id,
      agencyId: user.agencyId,
      type: 'CREATE_CLIENT',
      description: `Cliente ${newClient.name} criado`,
      metadata: {
        clientId: newClient.id,
        clientName: newClient.name
      }
    })

    return newClient
  },
  {
    rateLimitKey: 'create-client',
    rateLimitAttempts: 20,
    logActivity: true,
    activityType: 'client.created'
  }
)