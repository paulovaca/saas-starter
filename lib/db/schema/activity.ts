import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  json,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Activity Type Enum
export const activityTypeEnum = pgEnum('activity_type', [
  'SIGN_UP',
  'SIGN_IN', 
  'SIGN_OUT',
  'UPDATE_PASSWORD',
  'DELETE_ACCOUNT',
  'UPDATE_ACCOUNT',
  'CREATE_AGENCY',
  'UPDATE_AGENCY',
  'CREATE_CLIENT',
  'UPDATE_CLIENT',
  'DELETE_CLIENT',
  'TRANSFER_CLIENT',
  'CREATE_PROPOSAL',
  'UPDATE_PROPOSAL',
  'DELETE_PROPOSAL',
  'CREATE_FUNNEL',
  'UPDATE_FUNNEL',
  'DELETE_FUNNEL',
  'CREATE_OPERATOR',
  'UPDATE_OPERATOR',
  'DELETE_OPERATOR',
  'CREATE_BASE_ITEM',
  'UPDATE_BASE_ITEM',
  'DELETE_BASE_ITEM',
  'INVITE_USER',
  'ACCEPT_INVITATION',
  'CHANGE_USER_ROLE',
  'DEACTIVATE_USER',
  'ACTIVATE_USER',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'SUBSCRIPTION_CREATED',
  'SUBSCRIPTION_UPDATED',
  'SUBSCRIPTION_CANCELLED',
]);

// Activity Log Table
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: activityTypeEnum('type').notNull(),
  description: text('description'),
  userId: uuid('user_id'), // Can be null for system activities
  agencyId: uuid('agency_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }), // 'client', 'proposal', 'user', etc.
  entityId: uuid('entity_id'), // ID of the entity being affected
  metadata: json('metadata').$type<Record<string, any>>(), // Additional context data
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Activity Types for TypeScript
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_AGENCY = 'CREATE_AGENCY',
  UPDATE_AGENCY = 'UPDATE_AGENCY',
  CREATE_CLIENT = 'CREATE_CLIENT',
  UPDATE_CLIENT = 'UPDATE_CLIENT',
  DELETE_CLIENT = 'DELETE_CLIENT',
  TRANSFER_CLIENT = 'TRANSFER_CLIENT',
  CREATE_PROPOSAL = 'CREATE_PROPOSAL',
  UPDATE_PROPOSAL = 'UPDATE_PROPOSAL',
  DELETE_PROPOSAL = 'DELETE_PROPOSAL',
  CREATE_FUNNEL = 'CREATE_FUNNEL',
  UPDATE_FUNNEL = 'UPDATE_FUNNEL',
  DELETE_FUNNEL = 'DELETE_FUNNEL',
  CREATE_OPERATOR = 'CREATE_OPERATOR',
  UPDATE_OPERATOR = 'UPDATE_OPERATOR',
  DELETE_OPERATOR = 'DELETE_OPERATOR',
  CREATE_BASE_ITEM = 'CREATE_BASE_ITEM',
  UPDATE_BASE_ITEM = 'UPDATE_BASE_ITEM',
  DELETE_BASE_ITEM = 'DELETE_BASE_ITEM',
  INVITE_USER = 'INVITE_USER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CHANGE_USER_ROLE = 'CHANGE_USER_ROLE',
  DEACTIVATE_USER = 'DEACTIVATE_USER',
  ACTIVATE_USER = 'ACTIVATE_USER',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
}

// System Notifications Table
export const systemNotifications = pgTable('system_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('info'), // 'info', 'warning', 'error', 'success'
  userId: uuid('user_id'), // If null, it's a system-wide notification
  agencyId: uuid('agency_id'), // If null, it's for all agencies (developer notifications)
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  metadata: json('metadata').$type<Record<string, any>>(),
  expiresAt: timestamp('expires_at'), // Optional expiration
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type NewActivityLogEntry = typeof activityLog.$inferInsert;
export type SystemNotification = typeof systemNotifications.$inferSelect;
export type NewSystemNotification = typeof systemNotifications.$inferInsert;
