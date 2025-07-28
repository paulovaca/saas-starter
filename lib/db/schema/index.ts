// Re-export all schemas from their respective modules
export * from './auth';
export * from './agency';
export * from './activity';
export * from './users';
export * from './funnels';
export * from './catalog';
export * from './operators';
export * from './clients';

// Import tables for relations
import { users, passwordResetTokens, emailVerificationTokens, userInvitations, activeSessions } from './auth';
import { 
  agencies, 
  agencySettings, 
  clients 
} from './agency';
import {
  baseItems,
  baseItemFields,
} from './catalog';
import { salesFunnels, salesFunnelStages, stageTransitions } from './funnels';
import { activityLog, systemNotifications } from './activity';
import { userRelations } from './users';
import { 
  operators, 
  operatorItems, 
  commissionRules, 
  operatorDocuments 
} from './operators';
import { relations } from 'drizzle-orm';

// Define relations between schemas

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  createdClients: many(clients, { relationName: 'createdClients' }),
  assignedClients: many(clients, { relationName: 'assignedClients' }),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  sentInvitations: many(userInvitations),
  sessions: many(activeSessions),
  activities: many(activityLog),
  notifications: many(systemNotifications),
}));

// Agency relations
export const agenciesRelations = relations(agencies, ({ many, one }) => ({
  users: many(users),
  salesFunnels: many(salesFunnels),
  baseItems: many(baseItems),
  operators: many(operators),
  clients: many(clients),
  settings: one(agencySettings),
  activityLog: many(activityLog),
  notifications: many(systemNotifications),
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

// Sales funnel relations
export const salesFunnelsRelations = relations(salesFunnels, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [salesFunnels.agencyId],
    references: [agencies.id],
  }),
  stages: many(salesFunnelStages),
  clients: many(clients),
  agencySettings: many(agencySettings),
}));

export const salesFunnelStagesRelations = relations(salesFunnelStages, ({ one, many }) => ({
  funnel: one(salesFunnels, {
    fields: [salesFunnelStages.funnelId],
    references: [salesFunnels.id],
  }),
  clients: many(clients),
}));

// Base items relations
export const baseItemsRelations = relations(baseItems, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [baseItems.agencyId],
    references: [agencies.id],
  }),
  customFields: many(baseItemFields),
  operatorItems: many(operatorItems),
}));

export const baseItemFieldsRelations = relations(baseItemFields, ({ one }) => ({
  baseItem: one(baseItems, {
    fields: [baseItemFields.baseItemId],
    references: [baseItems.id],
  }),
}));

// Operator relations
export const operatorsRelations = relations(operators, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [operators.agencyId],
    references: [agencies.id],
  }),
  items: many(operatorItems),
  documents: many(operatorDocuments),
}));

export const operatorItemsRelations = relations(operatorItems, ({ one, many }) => ({
  operator: one(operators, {
    fields: [operatorItems.operatorId],
    references: [operators.id],
  }),
  catalogItem: one(baseItems, {
    fields: [operatorItems.catalogItemId],
    references: [baseItems.id],
  }),
  commissionRules: many(commissionRules),
}));

export const commissionRulesRelations = relations(commissionRules, ({ one }) => ({
  operatorItem: one(operatorItems, {
    fields: [commissionRules.operatorItemId],
    references: [operatorItems.id],
  }),
}));

export const operatorDocumentsRelations = relations(operatorDocuments, ({ one }) => ({
  operator: one(operators, {
    fields: [operatorDocuments.operatorId],
    references: [operators.id],
  }),
}));

// Client relations
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

// Auth relations
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));

export const userInvitationsRelations = relations(userInvitations, ({ one }) => ({
  invitedBy: one(users, {
    fields: [userInvitations.invitedById],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [userInvitations.agencyId],
    references: [agencies.id],
  }),
}));

export const activeSessionsRelations = relations(activeSessions, ({ one }) => ({
  user: one(users, {
    fields: [activeSessions.userId],
    references: [users.id],
  }),
}));

// Activity relations
export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [activityLog.agencyId],
    references: [agencies.id],
  }),
}));

export const systemNotificationsRelations = relations(systemNotifications, ({ one }) => ({
  user: one(users, {
    fields: [systemNotifications.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [systemNotifications.agencyId],
    references: [agencies.id],
  }),
}));

