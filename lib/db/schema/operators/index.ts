import { pgTable, uuid, varchar, text, real, boolean, timestamp, json, pgEnum } from 'drizzle-orm/pg-core';
import { agencies } from '../agency';

// Enum for commission types
export const commissionTypeEnum = pgEnum('commission_type', ['percentage', 'fixed', 'tiered']);

// Enum for document types
export const documentTypeEnum = pgEnum('document_type', [
  'contract',
  'price_table',
  'marketing_material',
  'other'
]);

// Operators table
export const operators = pgTable('operators', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  logo: text('logo'),
  cnpj: varchar('cnpj', { length: 18 }),
  description: text('description'),
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  website: text('website'),
  address: text('address'),
  notes: text('notes'),
  agencyId: uuid('agency_id').notNull().references(() => agencies.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Operator Items (Products/Services offered by operators)
export const operatorItems = pgTable('operator_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id),
  catalogItemId: uuid('catalog_item_id').notNull(), // Reference to base catalog items
  customName: varchar('custom_name', { length: 255 }), // Custom name for this operator
  customValues: json('custom_values').$type<Record<string, any>>(), // Custom field values
  commissionType: commissionTypeEnum('commission_type').notNull().default('percentage'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Commission Rules
export const commissionRules = pgTable('commission_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorItemId: uuid('operator_item_id').notNull().references(() => operatorItems.id),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // 'default', 'tiered', 'conditional'
  minValue: real('min_value'),
  maxValue: real('max_value'),
  percentage: real('percentage'),
  fixedValue: real('fixed_value'),
  conditions: json('conditions').$type<Record<string, any>>(), // Payment method, duration, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Operator Documents
export const operatorDocuments = pgTable('operator_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id),
  documentType: documentTypeEnum('document_type').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  documentUrl: text('document_url').notNull(),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

// Types
export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
export type OperatorItem = typeof operatorItems.$inferSelect;
export type NewOperatorItem = typeof operatorItems.$inferInsert;
export type CommissionRule = typeof commissionRules.$inferSelect;
export type NewCommissionRule = typeof commissionRules.$inferInsert;
export type OperatorDocument = typeof operatorDocuments.$inferSelect;
export type NewOperatorDocument = typeof operatorDocuments.$inferInsert;
