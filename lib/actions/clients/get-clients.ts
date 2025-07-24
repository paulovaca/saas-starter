'use server'

import { z } from 'zod'
import { createPermissionAction } from '@/lib/actions/action-wrapper'
import { Permission } from '@/lib/auth/permissions'
import { db } from '@/lib/db/drizzle'
import { clientsNew, clientInteractions, users, salesFunnelStages } from '@/lib/db/schema'
import { eq, and, like, or, desc, asc, isNull, sql } from 'drizzle-orm'

const getClientsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  funnelId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'lastInteraction']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const getClients = createPermissionAction(
  getClientsSchema,
  Permission.CLIENT_READ,
  async (input, user) => {
    const { page, limit, search, funnelId, stageId, userId, isActive, sortBy, sortOrder } = input
    const offset = ((page || 1) - 1) * (limit || 20)

    // Base query conditions
    const conditions = [
      eq(clientsNew.agencyId, user.agencyId),
      isNull(clientsNew.deletedAt)
    ]

    // Agents can only see their own clients
    if (user.role === 'AGENT') {
      conditions.push(eq(clientsNew.userId, user.id))
    } else if (userId) {
      // Admin/Master filtering by specific user
      conditions.push(eq(clientsNew.userId, userId))
    }

    // Filter by active status
    if (isActive !== undefined) {
      conditions.push(eq(clientsNew.isActive, isActive))
    }

    // Filter by funnel
    if (funnelId) {
      conditions.push(eq(clientsNew.funnelId, funnelId))
    }

    // Filter by stage
    if (stageId) {
      conditions.push(eq(clientsNew.funnelStageId, stageId))
    }

    // Search conditions
    if (search) {
      const searchPattern = `%${search}%`
      conditions.push(
        or(
          like(clientsNew.name, searchPattern),
          like(clientsNew.email, searchPattern),
          like(clientsNew.phone, searchPattern),
          like(clientsNew.documentNumber, searchPattern)
        )!
      )
    }

    // Build the query
    const query = db
      .select({
        client: clientsNew,
        user: users,
        stage: salesFunnelStages,
        lastInteraction: sql<string>`
          (SELECT MAX(contact_date) 
           FROM client_interactions 
           WHERE client_interactions.client_id = ${clientsNew.id})
        `.as('last_interaction')
      })
      .from(clientsNew)
      .leftJoin(users, eq(clientsNew.userId, users.id))
      .leftJoin(salesFunnelStages, eq(clientsNew.funnelStageId, salesFunnelStages.id))
      .where(and(...conditions))

    // Apply sorting
    let orderByClause
    switch (sortBy) {
      case 'name':
        orderByClause = sortOrder === 'asc' ? asc(clientsNew.name) : desc(clientsNew.name)
        break
      case 'updatedAt':
        orderByClause = sortOrder === 'asc' ? asc(clientsNew.updatedAt) : desc(clientsNew.updatedAt)
        break
      case 'lastInteraction':
        orderByClause = sortOrder === 'asc' 
          ? asc(sql`last_interaction`) 
          : desc(sql`last_interaction`)
        break
      case 'createdAt':
      default:
        orderByClause = sortOrder === 'asc' ? asc(clientsNew.createdAt) : desc(clientsNew.createdAt)
    }

    // Execute queries
    const [clients, totalCount] = await Promise.all([
      query
        .orderBy(orderByClause)
        .limit(limit || 20)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(clientsNew)
        .where(and(...conditions))
    ])

    // Format the response
    const formattedClients = clients.map(({ client, user, stage, lastInteraction }) => ({
      ...client,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null,
      stage: stage ? {
        id: stage.id,
        name: stage.name,
        color: stage.color
      } : null,
      lastInteraction
    }))

    return {
      clients: formattedClients,
      pagination: {
        page,
        limit,
        total: Number(totalCount[0].count),
        totalPages: Math.ceil(Number(totalCount[0].count) / (limit || 20))
      }
    }
  },
  {
    rateLimitKey: 'get-clients',
    rateLimitAttempts: 100
  }
)