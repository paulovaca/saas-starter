import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Re-export the user enum and table from auth.ts for consistency
export { userRoleEnum, users, type User, type NewUser } from './auth';
import { users, type User } from './auth';
import { agencies } from './agency';

// User Relations
export const userRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  // Future relations can be added here
}));

// Additional types for users module
export type UserWithAgency = User & {
  agency: {
    id: string;
    name: string;
  };
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'DEVELOPER' | 'MASTER' | 'ADMIN' | 'AGENT';
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  avatar: string | null;
};
