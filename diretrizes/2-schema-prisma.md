Schema prisma para o sistema do arquivo - PRD: CRM SaaS para Agências de Viagens

// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  DEVELOPER
  MASTER
  ADMIN
  AGENT
}

model User {
  id                String      @id @default(uuid())
  email             String      @unique
  password          String
  name              String
  avatar            String?
  role              UserRole
  isActive          Boolean     @default(true)
  twoFactorEnabled  Boolean     @default(false)
  twoFactorSecret   String?
  agencyId          String
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relationships
  agency            Agency      @relation(fields: [agencyId], references: [id])
  createdClients    Client[]
  assignedClients   Client[]    @relation("AgentClients")
  proposals         Proposal[]
  reservations      Reservation[]
  tasks             Task[]
  interactions      Interaction[]
  logs              Log[]
  commissions       Commission[]
  transfersMade     ClientTransfer[] @relation("MadeTransfers")
  transfersReceived ClientTransfer[] @relation("ReceivedTransfers")

  @@index([agencyId])
}

model Agency {
  id              String      @id @default(uuid())
  name            String
  cnpj            String?
  email           String
  phone           String?
  address         String?
  city            String?
  state           String?
  country         String      @default("Brasil")
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  users           User[]
  clients         Client[]
  salesFunnels    SalesFunnel[]
  baseItems       BaseItem[]
  operators       Operator[]
  proposals       Proposal[]
  reservations    Reservation[]
  financialRecords FinancialRecord[]
  logs            Log[]
  settings        AgencySettings?
}

model AgencySettings {
  id              String      @id @default(uuid())
  agencyId        String      @unique
  defaultFunnelId String?
  theme           String      @default("light")
  emailNotifications Boolean  @default(true)
  inAppNotifications Boolean  @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  agency          Agency      @relation(fields: [agencyId], references: [id])
  defaultFunnel   SalesFunnel? @relation(fields: [defaultFunnelId], references: [id])
}

model Client {
  id              String      @id @default(uuid())
  firstName       String
  lastName        String
  email           String?
  phone           String
  address         String?
  city            String?
  state           String?
  country         String      @default("Brasil")
  source          String?
  tags            String[]
  notes           String?
  status          String      @default("Ativo")
  currentStageId  String?
  assignedToId    String
  createdById     String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  assignedTo      User        @relation("AgentClients", fields: [assignedToId], references: [id])
  createdBy       User        @relation(fields: [createdById], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])
  currentStage    SalesFunnelStage? @relation(fields: [currentStageId], references: [id])
  proposals       Proposal[]
  reservations    Reservation[]
  interactions    Interaction[]
  tasks           Task[]
  transfers       ClientTransfer[]
  documents       Document[]

  @@index([assignedToId])
  @@index([createdById])
  @@index([agencyId])
  @@index([currentStageId])
}

model SalesFunnel {
  id              String      @id @default(uuid())
  name            String
  isDefault       Boolean     @default(false)
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  agency          Agency      @relation(fields: [agencyId], references: [id])
  stages          SalesFunnelStage[]
  clients         Client[]

  @@index([agencyId])
}

model SalesFunnelStage {
  id              String      @id @default(uuid())
  name            String
  instructions    String?
  order           Int
  funnelId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  funnel          SalesFunnel @relation(fields: [funnelId], references: [id])
  clients         Client[]

  @@index([funnelId])
}

model BaseItem {
  id              String      @id @default(uuid())
  name            String
  description     String?
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  agency          Agency      @relation(fields: [agencyId], references: [id])
  fields          BaseItemField[]
  operatorItems   OperatorItem[]

  @@index([agencyId])
}

model BaseItemField {
  id              String      @id @default(uuid())
  name            String
  type            String      // 'text', 'number', 'date', 'boolean', 'select'
  options         String[]    // For select fields
  isRequired      Boolean     @default(false)
  baseItemId      String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  baseItem        BaseItem    @relation(fields: [baseItemId], references: [id])

  @@index([baseItemId])
}

model Operator {
  id              String      @id @default(uuid())
  name            String
  contactEmail    String?
  contactPhone    String?
  website         String?
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  agency          Agency      @relation(fields: [agencyId], references: [id])
  items           OperatorItem[]
  proposals       ProposalItem[]

  @@index([agencyId])
}

model OperatorItem {
  id              String      @id @default(uuid())
  operatorId      String
  baseItemId      String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  operator        Operator    @relation(fields: [operatorId], references: [id])
  baseItem        BaseItem    @relation(fields: [baseItemId], references: [id])
  paymentMethods  OperatorItemPaymentMethod[]
  proposalItems   ProposalItem[]

  @@index([operatorId])
  @@index([baseItemId])
}

model OperatorItemPaymentMethod {
  id              String      @id @default(uuid())
  name            String
  commissionRate  Float
  operatorItemId  String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  operatorItem    OperatorItem @relation(fields: [operatorItemId], references: [id])

  @@index([operatorItemId])
}

model Proposal {
  id              String      @id @default(uuid())
  clientId        String
  createdById     String
  agencyId        String
  expirationDate  DateTime
  status          String      @default("Draft") // Draft, Sent, Accepted, Rejected, Paid
  totalAmount     Float
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  client          Client      @relation(fields: [clientId], references: [id])
  createdBy       User        @relation(fields: [createdById], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])
  items           ProposalItem[]
  reservation     Reservation?
  financialRecord FinancialRecord?

  @@index([clientId])
  @@index([createdById])
  @@index([agencyId])
}

model ProposalItem {
  id              String      @id @default(uuid())
  proposalId      String
  operatorItemId  String
  paymentMethodId String
  customFields    Json
  price           Float
  commission      Float
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  proposal        Proposal    @relation(fields: [proposalId], references: [id])
  operatorItem    OperatorItem @relation(fields: [operatorItemId], references: [id])
  paymentMethod   OperatorItemPaymentMethod @relation(fields: [paymentMethodId], references: [id])

  @@index([proposalId])
  @@index([operatorItemId])
  @@index([paymentMethodId])
}

model Reservation {
  id              String      @id @default(uuid())
  proposalId      String      @unique
  clientId        String
  assignedToId    String
  agencyId        String
  status          String      @default("Pending") // Pending, Confirmed, In Progress, Completed, Cancelled
  startDate       DateTime?
  endDate         DateTime?
  totalAmount     Float
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  proposal        Proposal    @relation(fields: [proposalId], references: [id])
  client          Client      @relation(fields: [clientId], references: [id])
  assignedTo      User        @relation(fields: [assignedToId], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])
  documents       Document[]
  financialRecord FinancialRecord?

  @@index([clientId])
  @@index([assignedToId])
  @@index([agencyId])
}

model Document {
  id              String      @id @default(uuid())
  name            String
  url             String
  type            String
  clientId        String?
  reservationId   String?
  createdById     String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  client          Client?     @relation(fields: [clientId], references: [id])
  reservation     Reservation? @relation(fields: [reservationId], references: [id])
  createdBy       User        @relation(fields: [createdById], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([clientId])
  @@index([reservationId])
  @@index([createdById])
  @@index([agencyId])
}

model FinancialRecord {
  id              String      @id @default(uuid())
  type            String      // 'income', 'expense'
  category        String
  amount          Float
  date            DateTime
  description     String?
  proposalId      String?
  reservationId   String?
  createdById     String
  agencyId        String
  isManual        Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  proposal        Proposal?   @relation(fields: [proposalId], references: [id])
  reservation     Reservation? @relation(fields: [reservationId], references: [id])
  createdBy       User        @relation(fields: [createdById], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])
  commission      Commission?

  @@index([proposalId])
  @@index([reservationId])
  @@index([createdById])
  @@index([agencyId])
}

model Commission {
  id              String      @id @default(uuid())
  userId          String
  amount          Float
  status          String      @default("pending") // pending, paid
  financialRecordId String?
  proposalId      String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  user            User        @relation(fields: [userId], references: [id])
  financialRecord FinancialRecord? @relation(fields: [financialRecordId], references: [id])
  proposal        Proposal    @relation(fields: [proposalId], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([userId])
  @@index([financialRecordId])
  @@index([proposalId])
  @@index([agencyId])
}

model Task {
  id              String      @id @default(uuid())
  title           String
  description     String?
  dueDate         DateTime
  isCompleted     Boolean     @default(false)
  clientId        String?
  createdById     String
  assignedToId    String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  client          Client?     @relation(fields: [clientId], references: [id])
  createdBy       User        @relation(fields: [createdById], references: [id])
  assignedTo      User        @relation(fields: [assignedToId], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([clientId])
  @@index([createdById])
  @@index([assignedToId])
  @@index([agencyId])
}

model Interaction {
  id              String      @id @default(uuid())
  type            String      // 'call', 'email', 'meeting', 'note'
  content         String
  clientId        String
  createdById     String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  client          Client      @relation(fields: [clientId], references: [id])
  createdBy       User        @relation(fields: [createdById], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([clientId])
  @@index([createdById])
  @@index([agencyId])
}

model ClientTransfer {
  id              String      @id @default(uuid())
  clientId        String
  fromUserId      String
  toUserId        String
  reason          String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  client          Client      @relation(fields: [clientId], references: [id])
  fromUser        User        @relation("MadeTransfers", fields: [fromUserId], references: [id])
  toUser          User        @relation("ReceivedTransfers", fields: [toUserId], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([clientId])
  @@index([fromUserId])
  @@index([toUserId])
  @@index([agencyId])
}

model Log {
  id              String      @id @default(uuid())
  action          String
  entityType      String
  entityId        String
  details         Json?
  userId          String
  agencyId        String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  user            User        @relation(fields: [userId], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([userId])
  @@index([agencyId])
}

model Notification {
  id              String      @id @default(uuid())
  type            String
  title           String
  message         String
  isRead          Boolean     @default(false)
  userId          String
  agencyId        String
  relatedEntityId String?
  relatedEntityType String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relationships
  user            User        @relation(fields: [userId], references: [id])
  agency          Agency      @relation(fields: [agencyId], references: [id])

  @@index([userId])
  @@index([agencyId])
}

