'use server'

import { z } from 'zod'
import { createAuthenticatedAction } from '@/lib/actions/action-wrapper'
import { db } from '@/lib/db/drizzle'
import { clientsNew, activityLog } from '@/lib/db/schema'
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

    // Cliente inicia na Jornada Geral - etapa 'em_qualificacao'

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
      jornadaStage: 'em_qualificacao',
      dealStatus: 'active',
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