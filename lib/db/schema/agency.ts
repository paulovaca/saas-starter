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
import { salesFunnelStages } from './funnels';

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
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
