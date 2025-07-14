import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  json,
  real,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT']);

// Agency Table (Multi-tenant)
export const agencies = pgTable('agencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 18 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  country: varchar('country', { length: 50 }).notNull().default('Brasil'),
  isActive: boolean('is_active').notNull().default(true),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Agency Settings
export const agencySettings = pgTable('agency_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id).unique(),
  defaultFunnelId: uuid('default_funnel_id'),
  theme: varchar('theme', { length: 20 }).notNull().default('light'),
  emailNotifications: boolean('email_notifications').notNull().default(true),
  inAppNotifications: boolean('in_app_notifications').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: text('two_factor_secret'),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Sales Funnels
export const salesFunnels = pgTable('sales_funnels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Sales Funnel Stages
export const salesFunnelStages = pgTable('sales_funnel_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  instructions: text('instructions'),
  order: integer('order').notNull(),
  funnelId: uuid('funnel_id').notNull().references(() => salesFunnels.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Base Items (Catalog)
export const baseItems = pgTable('base_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Base Item Fields (Custom Fields)
export const baseItemFields = pgTable('base_item_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'text', 'number', 'date', 'boolean', 'select'
  options: json('options').$type<string[]>(), // For select fields
  isRequired: boolean('is_required').notNull().default(false),
  baseItemId: uuid('base_item_id').notNull().references(() => baseItems.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Operators
export const operators = pgTable('operators', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  website: text('website'),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Operator Items (Association between Operators and Base Items)
export const operatorItems = pgTable('operator_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id),
  baseItemId: uuid('base_item_id').notNull().references(() => baseItems.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Operator Item Payment Methods
export const operatorItemPaymentMethods = pgTable('operator_item_payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  commissionRate: real('commission_rate').notNull(),
  operatorItemId: uuid('operator_item_id').notNull().references(() => operatorItems.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Clients
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  country: varchar('country', { length: 50 }).notNull().default('Brasil'),
  source: varchar('source', { length: 255 }),
  tags: json('tags').$type<string[]>(),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('Ativo'),
  currentStageId: uuid('current_stage_id').references(() => salesFunnelStages.id),
  assignedToId: uuid('assigned_to_id').notNull().references(() => users.id),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const agenciesRelations = relations(agencies, ({ many, one }) => ({
  users: many(users),
  salesFunnels: many(salesFunnels),
  baseItems: many(baseItems),
  operators: many(operators),
  clients: many(clients),
  settings: one(agencySettings),
}));

export const agencySettingsRelations = relations(agencySettings, ({ one }) => ({
  agency: one(agencies, {
    fields: [agencySettings.agencyId],
    references: [agencies.id],
  }),
  defaultFunnel: one(salesFunnels, {
    fields: [agencySettings.defaultFunnelId],
    references: [salesFunnels.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  createdClients: many(clients, { relationName: 'createdClients' }),
  assignedClients: many(clients, { relationName: 'assignedClients' }),
}));

export const salesFunnelsRelations = relations(salesFunnels, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [salesFunnels.agencyId],
    references: [agencies.id],
  }),
  stages: many(salesFunnelStages),
  clients: many(clients),
}));

export const salesFunnelStagesRelations = relations(salesFunnelStages, ({ one, many }) => ({
  funnel: one(salesFunnels, {
    fields: [salesFunnelStages.funnelId],
    references: [salesFunnels.id],
  }),
  clients: many(clients),
}));

export const baseItemsRelations = relations(baseItems, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [baseItems.agencyId],
    references: [agencies.id],
  }),
  fields: many(baseItemFields),
  operatorItems: many(operatorItems),
}));

export const baseItemFieldsRelations = relations(baseItemFields, ({ one }) => ({
  baseItem: one(baseItems, {
    fields: [baseItemFields.baseItemId],
    references: [baseItems.id],
  }),
}));

export const operatorsRelations = relations(operators, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [operators.agencyId],
    references: [agencies.id],
  }),
  items: many(operatorItems),
}));

export const operatorItemsRelations = relations(operatorItems, ({ one, many }) => ({
  operator: one(operators, {
    fields: [operatorItems.operatorId],
    references: [operators.id],
  }),
  baseItem: one(baseItems, {
    fields: [operatorItems.baseItemId],
    references: [baseItems.id],
  }),
  paymentMethods: many(operatorItemPaymentMethods),
}));

export const operatorItemPaymentMethodsRelations = relations(operatorItemPaymentMethods, ({ one }) => ({
  operatorItem: one(operatorItems, {
    fields: [operatorItemPaymentMethods.operatorItemId],
    references: [operatorItems.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  assignedTo: one(users, {
    fields: [clients.assignedToId],
    references: [users.id],
    relationName: 'assignedClients',
  }),
  createdBy: one(users, {
    fields: [clients.createdById],
    references: [users.id],
    relationName: 'createdClients',
  }),
  agency: one(agencies, {
    fields: [clients.agencyId],
    references: [agencies.id],
  }),
  currentStage: one(salesFunnelStages, {
    fields: [clients.currentStageId],
    references: [salesFunnelStages.id],
  }),
}));

// Types
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;
export type AgencySettings = typeof agencySettings.$inferSelect;
export type NewAgencySettings = typeof agencySettings.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SalesFunnel = typeof salesFunnels.$inferSelect;
export type NewSalesFunnel = typeof salesFunnels.$inferInsert;
export type SalesFunnelStage = typeof salesFunnelStages.$inferSelect;
export type NewSalesFunnelStage = typeof salesFunnelStages.$inferInsert;
export type BaseItem = typeof baseItems.$inferSelect;
export type NewBaseItem = typeof baseItems.$inferInsert;
export type BaseItemField = typeof baseItemFields.$inferSelect;
export type NewBaseItemField = typeof baseItemFields.$inferInsert;
export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
export type OperatorItem = typeof operatorItems.$inferSelect;
export type NewOperatorItem = typeof operatorItems.$inferInsert;
export type OperatorItemPaymentMethod = typeof operatorItemPaymentMethods.$inferSelect;
export type NewOperatorItemPaymentMethod = typeof operatorItemPaymentMethods.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_AGENCY = 'CREATE_AGENCY',
  CREATE_CLIENT = 'CREATE_CLIENT',
  UPDATE_CLIENT = 'UPDATE_CLIENT',
  DELETE_CLIENT = 'DELETE_CLIENT',
  TRANSFER_CLIENT = 'TRANSFER_CLIENT',
}
