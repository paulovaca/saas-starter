import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { agencies } from '../agency';
import { users } from '../auth';

// Funis de Venda
export const salesFunnels = pgTable('sales_funnels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Etapas dos Funis
export const salesFunnelStages = pgTable('sales_funnel_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  guidelines: text('guidelines'), // Diretrizes para execução da etapa
  color: varchar('color', { length: 50 }).notNull().default('blue'),
  order: integer('order').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  funnelId: uuid('funnel_id').notNull().references(() => salesFunnels.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Transições entre etapas (para auditoria)
export const stageTransitions = pgTable('stage_transitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromStageId: uuid('from_stage_id').references(() => salesFunnelStages.id),
  toStageId: uuid('to_stage_id').notNull().references(() => salesFunnelStages.id),
  clientId: uuid('client_id').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relações
export const salesFunnelsRelations = relations(salesFunnels, ({ many, one }) => ({
  stages: many(salesFunnelStages),
  agency: one(agencies, {
    fields: [salesFunnels.agencyId],
    references: [agencies.id],
  }),
  createdBy: one(users, {
    fields: [salesFunnels.createdBy],
    references: [users.id],
  }),
}));

export const salesFunnelStagesRelations = relations(salesFunnelStages, ({ one, many }) => ({
  funnel: one(salesFunnels, {
    fields: [salesFunnelStages.funnelId],
    references: [salesFunnels.id],
  }),
  transitionsFrom: many(stageTransitions, { relationName: 'fromStage' }),
  transitionsTo: many(stageTransitions, { relationName: 'toStage' }),
}));

export const stageTransitionsRelations = relations(stageTransitions, ({ one }) => ({
  fromStage: one(salesFunnelStages, {
    fields: [stageTransitions.fromStageId],
    references: [salesFunnelStages.id],
    relationName: 'fromStage',
  }),
  toStage: one(salesFunnelStages, {
    fields: [stageTransitions.toStageId],
    references: [salesFunnelStages.id],
    relationName: 'toStage',
  }),
  user: one(users, {
    fields: [stageTransitions.userId],
    references: [users.id],
  }),
}));

// Tipos TypeScript
export type SalesFunnel = typeof salesFunnels.$inferSelect;
export type NewSalesFunnel = typeof salesFunnels.$inferInsert;
export type SalesFunnelStage = typeof salesFunnelStages.$inferSelect;
export type NewSalesFunnelStage = typeof salesFunnelStages.$inferInsert;
export type StageTransition = typeof stageTransitions.$inferSelect;
export type NewStageTransition = typeof stageTransitions.$inferInsert;
