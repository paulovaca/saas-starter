import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  date,
  pgEnum,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums para tipos específicos
export const clientDocumentTypeEnum = pgEnum('client_document_type', ['cpf', 'cnpj']);
export const interactionTypeEnum = pgEnum('interaction_type', ['call', 'email', 'whatsapp', 'meeting', 'note']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected', 'expired', 'awaiting_payment', 'active_travel']);

// Tabela de clientes - versão atualizada
export const clientsNew = pgTable('clients_new', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id').notNull(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  documentType: clientDocumentTypeEnum('document_type'),
  documentNumber: varchar('document_number', { length: 18 }),
  birthDate: date('birth_date'),
  addressZipcode: varchar('address_zipcode', { length: 9 }),
  addressStreet: varchar('address_street', { length: 255 }),
  addressNumber: varchar('address_number', { length: 10 }),
  addressComplement: varchar('address_complement', { length: 100 }),
  addressNeighborhood: varchar('address_neighborhood', { length: 100 }),
  addressCity: varchar('address_city', { length: 100 }),
  addressState: varchar('address_state', { length: 2 }),
  funnelId: uuid('funnel_id').notNull(),
  funnelStageId: uuid('funnel_stage_id').notNull(),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // Índices únicos - email único apenas quando não for null
  emailUniqueIdx: unique('clients_agency_email_unique').on(table.agencyId, table.email),
  documentUniqueIdx: unique('clients_agency_document_unique').on(table.agencyId, table.documentNumber),
  
  // Índices de busca
  agencyUserIdx: index('clients_agency_user_idx').on(table.agencyId, table.userId),
  funnelStageIdx: index('clients_funnel_stage_idx').on(table.funnelStageId),
  createdAtIdx: index('clients_created_at_idx').on(table.createdAt),
  nameIdx: index('clients_name_idx').on(table.name),
  documentIdx: index('clients_document_idx').on(table.documentType, table.documentNumber),
  activeIdx: index('clients_active_idx').on(table.isActive),
}));

// Tabela de interações com clientes
export const clientInteractions = pgTable('client_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull(),
  userId: uuid('user_id').notNull(),
  type: interactionTypeEnum('type').notNull(),
  description: text('description').notNull(),
  contactDate: timestamp('contact_date').notNull(),
  durationMinutes: integer('duration_minutes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  clientContactDateIdx: index('client_interactions_client_contact_date_idx').on(table.clientId, table.contactDate),
  userIdx: index('client_interactions_user_idx').on(table.userId),
  typeIdx: index('client_interactions_type_idx').on(table.type),
}));

// Tabela de tarefas de clientes
export const clientTasks = pgTable('client_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull(),
  assignedTo: uuid('assigned_to').notNull(),
  createdBy: uuid('created_by').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: taskPriorityEnum('priority').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  dueDate: timestamp('due_date').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  clientStatusIdx: index('client_tasks_client_status_idx').on(table.clientId, table.status),
  assignedStatusDueDateIdx: index('client_tasks_assigned_status_due_date_idx').on(table.assignedTo, table.status, table.dueDate),
  dueDateIdx: index('client_tasks_due_date_idx').on(table.dueDate),
  priorityIdx: index('client_tasks_priority_idx').on(table.priority),
}));

// Tabela de transferências de clientes
export const clientTransfers = pgTable('client_transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull(),
  fromUserId: uuid('from_user_id').notNull(),
  toUserId: uuid('to_user_id').notNull(),
  transferredBy: uuid('transferred_by').notNull(),
  reason: text('reason').notNull(),
  transferredAt: timestamp('transferred_at').notNull().defaultNow(),
}, (table) => ({
  clientTransferredAtIdx: index('client_transfers_client_transferred_at_idx').on(table.clientId, table.transferredAt),
  fromUserIdx: index('client_transfers_from_user_idx').on(table.fromUserId),
  toUserIdx: index('client_transfers_to_user_idx').on(table.toUserId),
}));

// Tabela de propostas
export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalNumber: varchar('proposal_number', { length: 20 }).notNull(),
  agencyId: uuid('agency_id').notNull(),
  clientId: uuid('client_id').notNull(),
  userId: uuid('user_id').notNull(),
  operatorId: uuid('operator_id').notNull(),
  status: proposalStatusEnum('status').notNull().default('draft'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }).notNull(),
  commissionPercent: decimal('commission_percent', { precision: 5, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  validUntil: date('valid_until').notNull(),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  sentAt: timestamp('sent_at'),
  decidedAt: timestamp('decided_at'),
  paymentDueAt: timestamp('payment_due_at'),
  activatedAt: timestamp('activated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Índice único para número da proposta por agência
  proposalNumberUniqueIdx: unique('proposals_agency_number_unique').on(table.agencyId, table.proposalNumber),
  
  // Índices de busca
  clientStatusIdx: index('proposals_client_status_idx').on(table.clientId, table.status),
  userStatusIdx: index('proposals_user_status_idx').on(table.userId, table.status),
  statusValidUntilIdx: index('proposals_status_valid_until_idx').on(table.status, table.validUntil),
  createdAtIdx: index('proposals_created_at_idx').on(table.createdAt),
  agencyIdx: index('proposals_agency_idx').on(table.agencyId),
  operatorIdx: index('proposals_operator_idx').on(table.operatorId),
}));

// Tabela de itens de propostas
export const proposalItems = pgTable('proposal_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').notNull(),
  operatorProductId: uuid('operator_product_id').notNull(),
  baseItemId: uuid('base_item_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  customFields: jsonb('custom_fields'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  proposalSortOrderIdx: index('proposal_items_proposal_sort_order_idx').on(table.proposalId, table.sortOrder),
  operatorProductIdx: index('proposal_items_operator_product_idx').on(table.operatorProductId),
  baseItemIdx: index('proposal_items_base_item_idx').on(table.baseItemId),
}));

// Tabela de histórico de status de propostas
export const proposalStatusHistory = pgTable('proposal_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').notNull(),
  fromStatus: proposalStatusEnum('from_status'),
  toStatus: proposalStatusEnum('to_status').notNull(),
  changedBy: uuid('changed_by').notNull(),
  reason: text('reason'),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
}, (table) => ({
  proposalChangedAtIdx: index('proposal_status_history_proposal_changed_at_idx').on(table.proposalId, table.changedAt),
  changedByIdx: index('proposal_status_history_changed_by_idx').on(table.changedBy),
}));

// Tabela de visualizações de propostas
export const proposalViews = pgTable('proposal_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposalId: uuid('proposal_id').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
}, (table) => ({
  proposalViewedAtIdx: index('proposal_views_proposal_viewed_at_idx').on(table.proposalId, table.viewedAt),
}));

// Definindo relações entre tabelas
export const clientsRelations = relations(clientsNew, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [clientsNew.agencyId],
    references: [agencies.id],
  }),
  user: one(users, {
    fields: [clientsNew.userId],
    references: [users.id],
  }),
  funnel: one(salesFunnels, {
    fields: [clientsNew.funnelId],
    references: [salesFunnels.id],
  }),
  funnelStage: one(salesFunnelStages, {
    fields: [clientsNew.funnelStageId],
    references: [salesFunnelStages.id],
  }),
  interactions: many(clientInteractions),
  tasks: many(clientTasks),
  transfers: many(clientTransfers),
  proposals: many(proposals),
}));

export const clientInteractionsRelations = relations(clientInteractions, ({ one }) => ({
  client: one(clientsNew, {
    fields: [clientInteractions.clientId],
    references: [clientsNew.id],
  }),
  user: one(users, {
    fields: [clientInteractions.userId],
    references: [users.id],
  }),
}));

export const clientTasksRelations = relations(clientTasks, ({ one }) => ({
  client: one(clientsNew, {
    fields: [clientTasks.clientId],
    references: [clientsNew.id],
  }),
  assignedUser: one(users, {
    fields: [clientTasks.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [clientTasks.createdBy],
    references: [users.id],
  }),
}));

export const clientTransfersRelations = relations(clientTransfers, ({ one }) => ({
  client: one(clientsNew, {
    fields: [clientTransfers.clientId],
    references: [clientsNew.id],
  }),
  fromUser: one(users, {
    fields: [clientTransfers.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [clientTransfers.toUserId],
    references: [users.id],
  }),
  transferredByUser: one(users, {
    fields: [clientTransfers.transferredBy],
    references: [users.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [proposals.agencyId],
    references: [agencies.id],
  }),
  client: one(clientsNew, {
    fields: [proposals.clientId],
    references: [clientsNew.id],
  }),
  user: one(users, {
    fields: [proposals.userId],
    references: [users.id],
  }),
  operator: one(operators, {
    fields: [proposals.operatorId],
    references: [operators.id],
  }),
  items: many(proposalItems),
  statusHistory: many(proposalStatusHistory),
  views: many(proposalViews),
}));

export const proposalItemsRelations = relations(proposalItems, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalItems.proposalId],
    references: [proposals.id],
  }),
  operatorProduct: one(operatorItems, {
    fields: [proposalItems.operatorProductId],
    references: [operatorItems.id],
  }),
  baseItem: one(baseItems, {
    fields: [proposalItems.baseItemId],
    references: [baseItems.id],
  }),
}));

export const proposalStatusHistoryRelations = relations(proposalStatusHistory, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalStatusHistory.proposalId],
    references: [proposals.id],
  }),
  changedByUser: one(users, {
    fields: [proposalStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const proposalViewsRelations = relations(proposalViews, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalViews.proposalId],
    references: [proposals.id],
  }),
}));

// Importações necessárias (assumindo que existem)
// Essas importações devem ser ajustadas de acordo com a estrutura real
import { agencies } from './agency';
import { users } from './users';
import { salesFunnels, salesFunnelStages } from './funnels';
import { operators, operatorItems } from './operators';
import { baseItems } from './catalog';

// Tipos TypeScript
export type ClientNew = typeof clientsNew.$inferSelect;
export type NewClientNew = typeof clientsNew.$inferInsert;
export type ClientInteraction = typeof clientInteractions.$inferSelect;
export type NewClientInteraction = typeof clientInteractions.$inferInsert;
export type ClientTask = typeof clientTasks.$inferSelect;
export type NewClientTask = typeof clientTasks.$inferInsert;
export type ClientTransfer = typeof clientTransfers.$inferSelect;
export type NewClientTransfer = typeof clientTransfers.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
export type ProposalItem = typeof proposalItems.$inferSelect;
export type NewProposalItem = typeof proposalItems.$inferInsert;
export type ProposalStatusHistory = typeof proposalStatusHistory.$inferSelect;
export type NewProposalStatusHistory = typeof proposalStatusHistory.$inferInsert;
export type ProposalView = typeof proposalViews.$inferSelect;
export type NewProposalView = typeof proposalViews.$inferInsert;
