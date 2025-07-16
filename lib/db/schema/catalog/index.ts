import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  json,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Base Items - Itens base que comporão os portfólios das operadoras
export const baseItems = pgTable('base_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  agencyId: uuid('agency_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Custom Fields
export const baseItemFields = pgTable('base_item_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  baseItemId: uuid('base_item_id').notNull().references(() => baseItems.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'text', 'number', 'date', 'select', 'multiselect', 'boolean', 'currency', 'percentage'
  options: json('options').$type<string[]>(), // For select/multiselect fields
  isRequired: boolean('is_required').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Define relations
export const baseItemsRelations = relations(baseItems, ({ many }) => ({
  customFields: many(baseItemFields),
}));

export const baseItemFieldsRelations = relations(baseItemFields, ({ one }) => ({
  item: one(baseItems, {
    fields: [baseItemFields.baseItemId],
    references: [baseItems.id],
  }),
}));

// Types
export type BaseItem = typeof baseItems.$inferSelect;
export type NewBaseItem = typeof baseItems.$inferInsert;
export type BaseItemField = typeof baseItemFields.$inferSelect;
export type NewBaseItemField = typeof baseItemFields.$inferInsert;

// Field type options
export const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'percentage', label: 'Porcentagem (%)' },
  { value: 'currency', label: 'Valor (R$)' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Seleção Única' },
  { value: 'multiselect', label: 'Seleção Múltipla' },
  { value: 'boolean', label: 'Sim/Não' },
] as const;

export type FieldType = typeof FIELD_TYPES[number]['value'];
