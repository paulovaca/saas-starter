import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb, index } from "drizzle-orm/pg-core";
// import { relations } from "drizzle-orm";
// import { proposals } from "./clients";
// import { users } from "./users";
// import { agencies } from "./agency";

// Enum para status das reservas
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_documents",   // Aguardando documentos
  "under_analysis",      // Em análise
  "approved",           // Aprovado
  "pending_installation", // Aguardando instalação
  "installed",          // Instalado
  "active",             // Ativo
  "cancelled",          // Cancelado
  "suspended"           // Suspenso
]);

// Enum para tipos de documentos
export const bookingDocumentTypeEnum = pgEnum("booking_document_type", [
  "rg_cpf",              // RG/CPF
  "proof_of_residence",  // Comprovante de residência
  "proof_of_income",     // Comprovante de renda
  "signed_contract",     // Contrato assinado
  "other"               // Outros documentos
]);

// Enum para tipos de eventos na timeline
export const timelineEventEnum = pgEnum("timeline_event", [
  "created",            // Reserva criada
  "status_changed",     // Status alterado
  "document_uploaded",  // Documento enviado
  "document_removed",   // Documento removido
  "note_added",         // Anotação adicionada
  "client_contacted",   // Cliente contatado
  "installation_scheduled", // Instalação agendada
  "other"              // Outros eventos
]);

// Tabela principal de reservas
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposalId: uuid("proposal_id").notNull(), // .references(() => proposals.id),
  agencyId: uuid("agency_id").notNull(), // .references(() => agencies.id),
  funnelId: uuid("funnel_id"),
  funnelStageId: uuid("funnel_stage_id"),
  bookingNumber: varchar("booking_number", { length: 50 }).notNull().unique(),
  status: bookingStatusEnum("status").notNull().default("pending_documents"),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<{
    installationDate?: string;
    installationAddress?: string;
    technician?: string;
    additionalInfo?: Record<string, any>;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: uuid("created_by").notNull() // .references(() => users.id)
}, (table) => ({
  funnelIdx: index('bookings_funnel_idx').on(table.funnelId, table.funnelStageId, table.proposalId),
}));

// Histórico de mudanças de status
export const bookingStatusHistory = pgTable("booking_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull(), // .references(() => bookings.id),
  previousStatus: bookingStatusEnum("previous_status").notNull(),
  newStatus: bookingStatusEnum("new_status").notNull(),
  reason: text("reason").notNull(),
  metadata: jsonb("metadata").$type<{
    automaticChange?: boolean;
    triggeredBy?: string;
    additionalInfo?: Record<string, any>;
  }>(),
  userId: uuid("user_id").notNull(), // .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Documentos da reserva
export const bookingDocuments = pgTable("booking_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull(), // .references(() => bookings.id),
  documentType: bookingDocumentTypeEnum("document_type").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: varchar("file_size", { length: 50 }),
  mimeType: varchar("mime_type", { length: 100 }),
  metadata: jsonb("metadata").$type<{
    originalName?: string;
    uploadedFrom?: string;
    validatedAt?: string;
    validatedBy?: string;
    rejectionReason?: string;
  }>(),
  uploadedBy: uuid("uploaded_by").notNull(), // .references(() => users.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at")
});

// Timeline de eventos da reserva
export const bookingTimeline = pgTable("booking_timeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull(), // .references(() => bookings.id),
  eventType: timelineEventEnum("event_type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").$type<{
    previousValue?: any;
    newValue?: any;
    documentId?: string;
    relatedEntity?: string;
    additionalInfo?: Record<string, any>;
  }>(),
  userId: uuid("user_id").notNull(), // .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Relações - comentadas temporariamente para migration
// export const bookingsRelations = relations(bookings, ({ one, many }) => ({
//   proposal: one(proposals, {
//     fields: [bookings.proposalId],
//     references: [proposals.id]
//   }),
//   agency: one(agencies, {
//     fields: [bookings.agencyId],
//     references: [agencies.id]
//   }),
//   createdByUser: one(users, {
//     fields: [bookings.createdBy],
//     references: [users.id]
//   }),
//   statusHistory: many(bookingStatusHistory),
//   documents: many(bookingDocuments),
//   timeline: many(bookingTimeline)
// }));

// export const bookingStatusHistoryRelations = relations(bookingStatusHistory, ({ one }) => ({
//   booking: one(bookings, {
//     fields: [bookingStatusHistory.bookingId],
//     references: [bookings.id]
//   }),
//   user: one(users, {
//     fields: [bookingStatusHistory.userId],
//     references: [users.id]
//   })
// }));

// export const bookingDocumentsRelations = relations(bookingDocuments, ({ one }) => ({
//   booking: one(bookings, {
//     fields: [bookingDocuments.bookingId],
//     references: [bookings.id]
//   }),
//   uploadedByUser: one(users, {
//     fields: [bookingDocuments.uploadedBy],
//     references: [users.id]
//   })
// }));

// export const bookingTimelineRelations = relations(bookingTimeline, ({ one }) => ({
//   booking: one(bookings, {
//     fields: [bookingTimeline.bookingId],
//     references: [bookings.id]
//   }),
//   user: one(users, {
//     fields: [bookingTimeline.userId],
//     references: [users.id]
//   })
// }));