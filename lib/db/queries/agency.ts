import { eq, and, desc, asc, or, ilike } from 'drizzle-orm';
import { db } from '../drizzle';
import { 
  agencies,
  agencySettings,
  salesFunnels,
  salesFunnelStages,
  baseItems,
  baseItemFields,
  operators,
  operatorItems,
  operatorItemPaymentMethods,
  clients,
  type Agency,
  type NewAgency,
  type AgencySettings,
  type NewAgencySettings,
  type SalesFunnel,
  type NewSalesFunnel,
  type SalesFunnelStage,
  type NewSalesFunnelStage,
  type BaseItem,
  type NewBaseItem,
  type Operator,
  type NewOperator,
  type Client,
  type NewClient
} from '../schema/agency';
import { users } from '../schema/auth';

// Agency functions

/**
 * Get agency by ID
 */
export async function getAgencyById(id: string) {
  const result = await db
    .select()
    .from(agencies)
    .where(eq(agencies.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new agency
 */
export async function createAgency(agencyData: NewAgency): Promise<Agency> {
  const result = await db.insert(agencies).values(agencyData).returning();
  return result[0];
}

/**
 * Update agency information
 */
export async function updateAgency(id: string, updates: Partial<NewAgency>) {
  const result = await db
    .update(agencies)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(agencies.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Get agency by Stripe customer ID
 */
export async function getAgencyByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(agencies)
    .where(eq(agencies.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update agency subscription information
 */
export async function updateAgencySubscription(
  agencyId: string,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(agencies)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(agencies.id, agencyId));
}

// Agency Settings functions

/**
 * Get agency settings
 */
export async function getAgencySettings(agencyId: string) {
  const result = await db
    .select()
    .from(agencySettings)
    .where(eq(agencySettings.agencyId, agencyId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create agency settings
 */
export async function createAgencySettings(settingsData: NewAgencySettings) {
  const result = await db.insert(agencySettings).values(settingsData).returning();
  return result[0];
}

/**
 * Update agency settings
 */
export async function updateAgencySettings(agencyId: string, updates: Partial<NewAgencySettings>) {
  const result = await db
    .update(agencySettings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(agencySettings.agencyId, agencyId))
    .returning();

  return result[0] || null;
}

// Sales Funnel functions

/**
 * Get all sales funnels for an agency
 */
export async function getSalesFunnelsByAgency(agencyId: string) {
  return await db
    .select()
    .from(salesFunnels)
    .where(eq(salesFunnels.agencyId, agencyId))
    .orderBy(asc(salesFunnels.name));
}

/**
 * Get default sales funnel for an agency
 */
export async function getDefaultSalesFunnel(agencyId: string) {
  const result = await db
    .select()
    .from(salesFunnels)
    .where(and(eq(salesFunnels.agencyId, agencyId), eq(salesFunnels.isDefault, true)))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new sales funnel
 */
export async function createSalesFunnel(funnelData: NewSalesFunnel) {
  const result = await db.insert(salesFunnels).values(funnelData).returning();
  return result[0];
}

/**
 * Update sales funnel
 */
export async function updateSalesFunnel(id: string, updates: Partial<NewSalesFunnel>) {
  const result = await db
    .update(salesFunnels)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(salesFunnels.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Delete sales funnel
 */
export async function deleteSalesFunnel(id: string) {
  await db.delete(salesFunnels).where(eq(salesFunnels.id, id));
}

// Sales Funnel Stages functions

/**
 * Get stages for a sales funnel
 */
export async function getSalesFunnelStages(funnelId: string) {
  return await db
    .select()
    .from(salesFunnelStages)
    .where(eq(salesFunnelStages.funnelId, funnelId))
    .orderBy(asc(salesFunnelStages.order));
}

/**
 * Create sales funnel stage
 */
export async function createSalesFunnelStage(stageData: NewSalesFunnelStage) {
  const result = await db.insert(salesFunnelStages).values(stageData).returning();
  return result[0];
}

/**
 * Update sales funnel stage
 */
export async function updateSalesFunnelStage(id: string, updates: Partial<NewSalesFunnelStage>) {
  const result = await db
    .update(salesFunnelStages)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(salesFunnelStages.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Delete sales funnel stage
 */
export async function deleteSalesFunnelStage(id: string) {
  await db.delete(salesFunnelStages).where(eq(salesFunnelStages.id, id));
}

// Base Items functions

/**
 * Get all base items for an agency
 */
export async function getBaseItemsByAgency(agencyId: string) {
  return await db
    .select()
    .from(baseItems)
    .where(eq(baseItems.agencyId, agencyId))
    .orderBy(asc(baseItems.name));
}

/**
 * Get base item by ID with fields
 */
export async function getBaseItemWithFields(id: string) {
  const item = await db
    .select()
    .from(baseItems)
    .where(eq(baseItems.id, id))
    .limit(1);

  if (!item[0]) return null;

  const fields = await db
    .select()
    .from(baseItemFields)
    .where(eq(baseItemFields.baseItemId, id))
    .orderBy(asc(baseItemFields.name));

  return {
    ...item[0],
    fields,
  };
}

/**
 * Create a new base item
 */
export async function createBaseItem(itemData: NewBaseItem) {
  const result = await db.insert(baseItems).values(itemData).returning();
  return result[0];
}

/**
 * Update base item
 */
export async function updateBaseItem(id: string, updates: Partial<NewBaseItem>) {
  const result = await db
    .update(baseItems)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(baseItems.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Delete base item
 */
export async function deleteBaseItem(id: string) {
  await db.delete(baseItems).where(eq(baseItems.id, id));
}

// Operators functions

/**
 * Get all operators for an agency
 */
export async function getOperatorsByAgency(agencyId: string) {
  return await db
    .select()
    .from(operators)
    .where(eq(operators.agencyId, agencyId))
    .orderBy(asc(operators.name));
}

/**
 * Create a new operator
 */
export async function createOperator(operatorData: NewOperator) {
  const result = await db.insert(operators).values(operatorData).returning();
  return result[0];
}

/**
 * Update operator
 */
export async function updateOperator(id: string, updates: Partial<NewOperator>) {
  const result = await db
    .update(operators)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(operators.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Delete operator
 */
export async function deleteOperator(id: string) {
  await db.delete(operators).where(eq(operators.id, id));
}

// Clients functions

/**
 * Get all clients for an agency
 */
export async function getClientsByAgency(agencyId: string, limit = 50, offset = 0) {
  return await db
    .select()
    .from(clients)
    .where(eq(clients.agencyId, agencyId))
    .orderBy(desc(clients.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get client by ID
 */
export async function getClientById(id: string) {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new client
 */
export async function createClient(clientData: NewClient) {
  const result = await db.insert(clients).values(clientData).returning();
  return result[0];
}

/**
 * Update client
 */
export async function updateClient(id: string, updates: Partial<NewClient>) {
  const result = await db
    .update(clients)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(clients.id, id))
    .returning();

  return result[0] || null;
}

/**
 * Delete client
 */
export async function deleteClient(id: string) {
  await db.delete(clients).where(eq(clients.id, id));
}

/**
 * Get clients assigned to a user
 */
export async function getClientsByAssignedUser(userId: string, agencyId: string) {
  return await db
    .select()
    .from(clients)
    .where(and(eq(clients.assignedToId, userId), eq(clients.agencyId, agencyId)))
    .orderBy(desc(clients.updatedAt));
}

/**
 * Search clients by name, email, or phone
 */
export async function searchClients(agencyId: string, searchTerm: string) {
  return await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.agencyId, agencyId),
        or(
          ilike(clients.firstName, `%${searchTerm}%`),
          ilike(clients.lastName, `%${searchTerm}%`),
          ilike(clients.email, `%${searchTerm}%`),
          ilike(clients.phone, `%${searchTerm}%`)
        )
      )
    )
    .orderBy(desc(clients.updatedAt))
    .limit(20);
}

/**
 * Get agency for a specific user ID
 */
export async function getAgencyForUser(userId: string) {
  const result = await db
    .select({
      agency: agencies,
      settings: agencySettings,
    })
    .from(users)
    .leftJoin(agencies, eq(users.agencyId, agencies.id))
    .leftJoin(agencySettings, eq(agencies.id, agencySettings.agencyId))
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0 || !result[0].agency) {
    return null;
  }

  return {
    ...result[0].agency,
    settings: result[0].settings,
  };
}
