import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  json,
  real,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  assignedToId: uuid('assigned_to_id').notNull(),
  createdById: uuid('created_by_id').notNull(),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Types
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;
export type AgencySettings = typeof agencySettings.$inferSelect;
export type NewAgencySettings = typeof agencySettings.$inferInsert;
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
