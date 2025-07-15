import { relations } from "drizzle-orm/relations";
import { agencies, agencySettings, baseItems, baseItemFields, salesFunnels, salesFunnelStages, users, clients, operators, operatorItems, operatorItemPaymentMethods, emailVerificationTokens, passwordResetTokens, userInvitations, userSessions, stageTransitions } from "./schema";

export const agencySettingsRelations = relations(agencySettings, ({one}) => ({
	agency: one(agencies, {
		fields: [agencySettings.agencyId],
		references: [agencies.id]
	}),
}));

export const agenciesRelations = relations(agencies, ({many}) => ({
	agencySettings: many(agencySettings),
	baseItems: many(baseItems),
	clients: many(clients),
	operators: many(operators),
	salesFunnels: many(salesFunnels),
}));

export const baseItemsRelations = relations(baseItems, ({one, many}) => ({
	agency: one(agencies, {
		fields: [baseItems.agencyId],
		references: [agencies.id]
	}),
	baseItemFields: many(baseItemFields),
	operatorItems: many(operatorItems),
}));

export const baseItemFieldsRelations = relations(baseItemFields, ({one}) => ({
	baseItem: one(baseItems, {
		fields: [baseItemFields.baseItemId],
		references: [baseItems.id]
	}),
}));

export const salesFunnelStagesRelations = relations(salesFunnelStages, ({one, many}) => ({
	salesFunnel: one(salesFunnels, {
		fields: [salesFunnelStages.funnelId],
		references: [salesFunnels.id]
	}),
	user: one(users, {
		fields: [salesFunnelStages.createdBy],
		references: [users.id]
	}),
	clients: many(clients),
	stageTransitions_fromStageId: many(stageTransitions, {
		relationName: "stageTransitions_fromStageId_salesFunnelStages_id"
	}),
	stageTransitions_toStageId: many(stageTransitions, {
		relationName: "stageTransitions_toStageId_salesFunnelStages_id"
	}),
}));

export const salesFunnelsRelations = relations(salesFunnels, ({one, many}) => ({
	salesFunnelStages: many(salesFunnelStages),
	user: one(users, {
		fields: [salesFunnels.createdBy],
		references: [users.id]
	}),
	agency: one(agencies, {
		fields: [salesFunnels.agencyId],
		references: [agencies.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	salesFunnelStages: many(salesFunnelStages),
	emailVerificationTokens: many(emailVerificationTokens),
	passwordResetTokens: many(passwordResetTokens),
	userInvitations: many(userInvitations),
	userSessions: many(userSessions),
	salesFunnels: many(salesFunnels),
	stageTransitions: many(stageTransitions),
}));

export const clientsRelations = relations(clients, ({one}) => ({
	salesFunnelStage: one(salesFunnelStages, {
		fields: [clients.currentStageId],
		references: [salesFunnelStages.id]
	}),
	agency: one(agencies, {
		fields: [clients.agencyId],
		references: [agencies.id]
	}),
}));

export const operatorItemsRelations = relations(operatorItems, ({one, many}) => ({
	operator: one(operators, {
		fields: [operatorItems.operatorId],
		references: [operators.id]
	}),
	baseItem: one(baseItems, {
		fields: [operatorItems.baseItemId],
		references: [baseItems.id]
	}),
	operatorItemPaymentMethods: many(operatorItemPaymentMethods),
}));

export const operatorsRelations = relations(operators, ({one, many}) => ({
	operatorItems: many(operatorItems),
	agency: one(agencies, {
		fields: [operators.agencyId],
		references: [agencies.id]
	}),
}));

export const operatorItemPaymentMethodsRelations = relations(operatorItemPaymentMethods, ({one}) => ({
	operatorItem: one(operatorItems, {
		fields: [operatorItemPaymentMethods.operatorItemId],
		references: [operatorItems.id]
	}),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({one}) => ({
	user: one(users, {
		fields: [emailVerificationTokens.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const userInvitationsRelations = relations(userInvitations, ({one}) => ({
	user: one(users, {
		fields: [userInvitations.invitedById],
		references: [users.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const stageTransitionsRelations = relations(stageTransitions, ({one}) => ({
	salesFunnelStage_fromStageId: one(salesFunnelStages, {
		fields: [stageTransitions.fromStageId],
		references: [salesFunnelStages.id],
		relationName: "stageTransitions_fromStageId_salesFunnelStages_id"
	}),
	salesFunnelStage_toStageId: one(salesFunnelStages, {
		fields: [stageTransitions.toStageId],
		references: [salesFunnelStages.id],
		relationName: "stageTransitions_toStageId_salesFunnelStages_id"
	}),
	user: one(users, {
		fields: [stageTransitions.userId],
		references: [users.id]
	}),
}));