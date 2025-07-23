# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant SaaS application built for travel agencies using Next.js 15, TypeScript, PostgreSQL with Drizzle ORM, and Stripe for payments. The application implements comprehensive role-based access control, Brazilian market compliance features, and sophisticated business logic for managing clients, operators, and sales funnels.

## Essential Commands

### Development
```bash
# Start development server (with Turbopack)
npm run dev

# Run tests
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage

# Database operations
npm run db:setup    # Interactive PostgreSQL setup (Docker or remote)
npm run db:migrate  # Run migrations
npm run db:generate # Generate new migrations after schema changes
npm run db:studio   # Open Drizzle Studio
npm run db:seed     # Seed with demo data (admin@demoagency.com / admin123)

# Build & production
npm run build
npm run start

# Environment validation (runs automatically before dev/build)
npm run validate:env
```

## Architecture Overview

### Core Directory Structure
- `app/` - Next.js App Router with route groups
  - `(dashboard)/` - Protected routes with middleware authentication
  - `(login)/` - Public authentication pages
  - `api/` - API endpoints with role-based access control
- `components/` - React components organized by business domain
- `lib/` - Business logic and infrastructure
  - `actions/` - Server actions with universal wrapper (validation, permissions, rate limiting)
  - `auth/` - JWT authentication, session management, permission system
  - `db/` - Drizzle configuration, schemas, queries, and migrations
  - `services/` - Cross-cutting concerns (error handling, rate limiting, activity logging)
  - `validations/` - Zod schemas with Brazilian business logic validation

### Data Architecture

**Multi-Tenant Entity Hierarchy:**
```
Agency (Root Tenant)
├── Users (DEVELOPER/MASTER/ADMIN/AGENT roles)
├── Sales Funnels → Stages → Client Progression
├── Base Items → Operator Items → Commission Rules
├── Clients → Interactions/Tasks → Proposals
└── Activity Log (Comprehensive audit trail)
```

**Key Database Patterns:**
- **Multi-tenancy**: Every entity scoped by `agencyId` with automatic filtering
- **Audit Trails**: `createdAt`, `updatedAt`, and dedicated history tables
- **Soft Deletes**: `deletedAt` fields for data retention
- **Brazilian Compliance**: CPF/CNPJ validation, CEP formatting, state codes
- **Flexible Schema**: JSON fields for custom data with type safety

### Authentication & Permission System

**Role-Based Access Control:**
- **DEVELOPER**: System-wide super admin access
- **MASTER**: Full agency owner permissions + billing management
- **ADMIN**: Client/operator management, settings read-only
- **AGENT**: Restricted to own clients, read-only catalog access

**Security Implementation:**
- JWT tokens in httpOnly cookies with 24-hour expiration
- Database session tracking with device information
- CSRF protection with dedicated middleware
- Comprehensive security headers (XSS, clickjacking, content sniffing)
- Automatic session refresh and cleanup

**Permission Middleware:**
```typescript
// Server actions automatically wrapped with:
- Input validation (Zod schemas)
- Authentication verification
- Permission-based authorization
- Rate limiting per user/action
- Activity logging for audit trails
- Multi-tenant data scoping
```

### Server Actions Pattern

All mutations use the universal action wrapper (`lib/actions/action-wrapper.ts`):

```typescript
export const createOperator = createPermissionAction(
  createOperatorSchema,           // Zod validation
  Permission.OPERATOR_CREATE,     // Required permission
  async (input, user) => {        // Auto-scoped business logic
    // Automatic agencyId filtering and audit logging
  },
  {
    rateLimitKey: 'create-operator',
    logActivity: true
  }
);
```

### Query Patterns

**Multi-Tenant Data Access:**
- All queries automatically filter by `user.agencyId`
- Type-safe joins using Drizzle relations
- Efficient search with proper indexing
- Role-based data filtering (agents see only their own clients)

### Form Handling & Validation

**Hierarchical Zod Schemas:**
```typescript
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});

// Brazilian business logic validation
const cpfSchema = z.string().refine(validateCPF, 'CPF inválido');
const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido');
```

### Business Logic Modules

**Sales Pipeline Management:**
- Customizable funnels with ordered stages
- Client progression tracking with audit trails
- Stage-specific instructions and color coding

**Product Catalog System:**
- Base items as templates with custom fields
- Operator-specific variations with pricing
- Flexible commission rules (percentage, fixed, tiered)

**Client Relationship Management:**
- Enhanced client records with Brazilian document validation
- Interaction history with duration tracking
- Task management with priority and assignment
- Proposal generation with approval workflow

**Supplier/Operator Management:**
- Contact information and document storage
- Custom product variations and pricing
- Commission rule configuration

### Development Environment

**Required Configuration:**
- `DATABASE_URL` - PostgreSQL connection (Docker or remote)
- `AUTH_SECRET` - JWT secret (minimum 32 characters)
- `BASE_URL` - Application URL (defaults to localhost:3000)

**Optional Integrations:**
- Stripe for payments (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
- Upstash Redis for caching (falls back to in-memory)
- SMTP for email notifications

**Setup Process:**
1. Run `npm run db:setup` for interactive database configuration
2. Environment validation runs automatically before dev/build
3. Default seeded credentials: `admin@demoagency.com` / `admin123`

### Testing Strategy

- Jest with jsdom environment
- Tests in `__tests__/` directory with coverage reporting
- Module path mapping with `@/` alias
- Node.js polyfills for crypto and TextEncoder

### Code Style and Architecture Principles

- **Never use inline styles** - Always use CSS files
- **Server-first approach** - Default to server components, minimal client-side JS
- **Type safety** - TypeScript + Zod for runtime validation
- **Multi-tenant by default** - All queries automatically scoped by agency
- **Permission-driven UI** - Components hide/show based on user permissions
- **Brazilian market compliance** - Built-in CPF/CNPJ/CEP validation

### Key Security Considerations

- All server actions require authentication and proper permissions
- Agent role users can only access their own assigned clients
- Database queries are automatically scoped by `agencyId`
- CSRF protection for all state-changing operations
- Comprehensive activity logging for audit compliance
- Rate limiting to prevent abuse