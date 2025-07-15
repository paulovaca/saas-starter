import { pgTable, unique, uuid, varchar, text, boolean, timestamp, foreignKey, json, integer, real, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityType = pgEnum("activity_type", ['SIGN_UP', 'SIGN_IN', 'SIGN_OUT', 'UPDATE_PASSWORD', 'DELETE_ACCOUNT', 'UPDATE_ACCOUNT', 'CREATE_AGENCY', 'UPDATE_AGENCY', 'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT', 'TRANSFER_CLIENT', 'CREATE_PROPOSAL', 'UPDATE_PROPOSAL', 'DELETE_PROPOSAL', 'CREATE_FUNNEL', 'UPDATE_FUNNEL', 'DELETE_FUNNEL', 'CREATE_OPERATOR', 'UPDATE_OPERATOR', 'DELETE_OPERATOR', 'CREATE_BASE_ITEM', 'UPDATE_BASE_ITEM', 'DELETE_BASE_ITEM', 'INVITE_USER', 'ACCEPT_INVITATION', 'CHANGE_USER_ROLE', 'DEACTIVATE_USER', 'ACTIVATE_USER', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED', 'SUBSCRIPTION_CANCELLED'])
export const userRole = pgEnum("user_role", ['DEVELOPER', 'MASTER', 'ADMIN', 'AGENT'])


export const agencies = pgTable("agencies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	cnpj: varchar({ length: 18 }),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 50 }),
	country: varchar({ length: 50 }).default('Brasil').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripeProductId: text("stripe_product_id"),
	planName: varchar("plan_name", { length: 50 }),
	subscriptionStatus: varchar("subscription_status", { length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("agencies_stripe_customer_id_unique").on(table.stripeCustomerId),
	unique("agencies_stripe_subscription_id_unique").on(table.stripeSubscriptionId),
]);

export const agencySettings = pgTable("agency_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agencyId: uuid("agency_id").notNull(),
	defaultFunnelId: uuid("default_funnel_id"),
	theme: varchar({ length: 20 }).default('light').notNull(),
	emailNotifications: boolean("email_notifications").default(true).notNull(),
	inAppNotifications: boolean("in_app_notifications").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "agency_settings_agency_id_agencies_id_fk"
		}),
	unique("agency_settings_agency_id_unique").on(table.agencyId),
]);

export const baseItems = pgTable("base_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	agencyId: uuid("agency_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "base_items_agency_id_agencies_id_fk"
		}),
]);

export const baseItemFields = pgTable("base_item_fields", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	options: json(),
	isRequired: boolean("is_required").default(false).notNull(),
	baseItemId: uuid("base_item_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.baseItemId],
			foreignColumns: [baseItems.id],
			name: "base_item_fields_base_item_id_base_items_id_fk"
		}),
]);

export const salesFunnelStages = pgTable("sales_funnel_stages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	order: integer().notNull(),
	funnelId: uuid("funnel_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	description: text(),
	color: varchar({ length: 50 }).default('blue').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by").notNull(),
	guidelines: text(),
}, (table) => [
	foreignKey({
			columns: [table.funnelId],
			foreignColumns: [salesFunnels.id],
			name: "sales_funnel_stages_funnel_id_sales_funnels_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sales_funnel_stages_created_by_users_id_fk"
		}),
]);

export const clients = pgTable("clients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }).notNull(),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 50 }),
	country: varchar({ length: 50 }).default('Brasil').notNull(),
	source: varchar({ length: 255 }),
	tags: json(),
	notes: text(),
	status: varchar({ length: 50 }).default('Ativo').notNull(),
	currentStageId: uuid("current_stage_id"),
	assignedToId: uuid("assigned_to_id").notNull(),
	createdById: uuid("created_by_id").notNull(),
	agencyId: uuid("agency_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.currentStageId],
			foreignColumns: [salesFunnelStages.id],
			name: "clients_current_stage_id_sales_funnel_stages_id_fk"
		}),
	foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "clients_agency_id_agencies_id_fk"
		}),
]);

export const operatorItems = pgTable("operator_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	operatorId: uuid("operator_id").notNull(),
	baseItemId: uuid("base_item_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.operatorId],
			foreignColumns: [operators.id],
			name: "operator_items_operator_id_operators_id_fk"
		}),
	foreignKey({
			columns: [table.baseItemId],
			foreignColumns: [baseItems.id],
			name: "operator_items_base_item_id_base_items_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: text().notNull(),
	name: varchar({ length: 255 }).notNull(),
	avatar: text(),
	role: userRole().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
	twoFactorSecret: text("two_factor_secret"),
	agencyId: uuid("agency_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	phone: varchar({ length: 20 }),
	lastLogin: timestamp("last_login", { mode: 'string' }),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const operatorItemPaymentMethods = pgTable("operator_item_payment_methods", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	commissionRate: real("commission_rate").notNull(),
	operatorItemId: uuid("operator_item_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.operatorItemId],
			foreignColumns: [operatorItems.id],
			name: "operator_item_payment_methods_operator_item_id_operator_items_i"
		}),
]);

export const operators = pgTable("operators", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 20 }),
	website: text(),
	agencyId: uuid("agency_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "operators_agency_id_agencies_id_fk"
		}),
]);

export const activityLog = pgTable("activity_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: activityType().notNull(),
	description: text(),
	userId: uuid("user_id"),
	agencyId: uuid("agency_id").notNull(),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: uuid("entity_id"),
	metadata: json(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const systemNotifications = pgTable("system_notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	type: varchar({ length: 20 }).default('info').notNull(),
	userId: uuid("user_id"),
	agencyId: uuid("agency_id"),
	isRead: boolean("is_read").default(false).notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	metadata: json(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	token: text().notNull(),
	userId: uuid("user_id").notNull(),
	newEmail: varchar("new_email", { length: 255 }),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_verification_tokens_user_id_users_id_fk"
		}),
	unique("email_verification_tokens_token_unique").on(table.token),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	token: text().notNull(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}),
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const userInvitations = pgTable("user_invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	role: userRole().notNull(),
	token: text().notNull(),
	agencyId: uuid("agency_id").notNull(),
	invitedById: uuid("invited_by_id").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitedById],
			foreignColumns: [users.id],
			name: "user_invitations_invited_by_id_users_id_fk"
		}),
	unique("user_invitations_token_unique").on(table.token),
]);

export const userSessions = pgTable("user_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	sessionToken: text("session_token").notNull(),
	userAgent: text("user_agent"),
	ipAddress: varchar("ip_address", { length: 45 }),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	lastActiveAt: timestamp("last_active_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_users_id_fk"
		}),
	unique("user_sessions_session_token_unique").on(table.sessionToken),
]);

export const salesFunnels = pgTable("sales_funnels", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	agencyId: uuid("agency_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	description: text(),
	createdBy: uuid("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sales_funnels_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.agencyId],
			foreignColumns: [agencies.id],
			name: "sales_funnels_agency_id_agencies_id_fk"
		}).onDelete("cascade"),
]);

export const stageTransitions = pgTable("stage_transitions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fromStageId: uuid("from_stage_id"),
	toStageId: uuid("to_stage_id").notNull(),
	clientId: uuid("client_id").notNull(),
	userId: uuid("user_id").notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fromStageId],
			foreignColumns: [salesFunnelStages.id],
			name: "stage_transitions_from_stage_id_sales_funnel_stages_id_fk"
		}),
	foreignKey({
			columns: [table.toStageId],
			foreignColumns: [salesFunnelStages.id],
			name: "stage_transitions_to_stage_id_sales_funnel_stages_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "stage_transitions_user_id_users_id_fk"
		}),
]);
