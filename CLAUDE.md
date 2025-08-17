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
    - `schema/` - Modular schema definitions (auth, agency, clients, etc.)
  - `services/` - Cross-cutting concerns (error handling, rate limiting, activity logging)
  - `validations/` - Zod schemas with Brazilian business logic validation
- `scripts/` - Utility scripts for environment validation, database operations

### Data Architecture

**Multi-Tenant Entity Hierarchy:**
```
Agency (Root Tenant)
├── Users (DEVELOPER/MASTER/ADMIN/AGENT roles)
├── Sales Funnels → Stages → Client Progression
├── Base Items → Operator Items → Commission Rules
├── Clients → Interactions/Tasks → Proposals → Bookings
└── Activity Log (Comprehensive audit trail)
```

**Key Database Patterns:**
- **Multi-tenancy**: Every entity scoped by `agencyId` with automatic filtering
- **Audit Trails**: `createdAt`, `updatedAt`, and dedicated history tables
- **Soft Deletes**: `deletedAt` fields for data retention
- **Brazilian Compliance**: CPF/CNPJ validation, CEP formatting, state codes
- **Flexible Schema**: JSON fields for custom data with type safety
- **Modular Schema Organization**: Schemas split into logical modules (auth, agency, clients, etc.)

### Authentication & Permission System

**Role-Based Access Control:**
- **DEVELOPER**: System-wide super admin access
- **MASTER**: Full agency owner permissions + billing management
- **ADMIN**: Client/operator management, settings read-only
- **AGENT**: Restricted to own clients, read-only catalog access

**Security Implementation:**
- JWT tokens in httpOnly cookies with 24-hour expiration
- Database session tracking with device information
- CSRF protection with dedicated middleware (lib/auth/csrf.ts)
- Comprehensive security headers in middleware.ts (XSS, clickjacking, content sniffing)
- Automatic session refresh and cleanup via SessionManager
- Protected routes defined in middleware.ts: `/users`, `/funnels`, `/catalog`, `/operators`, `/clients`, `/proposals`, `/reports`, `/profile`, `/settings`

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

**Action Wrapper Features:**
- Automatic Zod validation with detailed error messages
- Authentication and permission checks
- Rate limiting (configurable per action)
- Activity logging for audit trails
- Standardized error responses (ActionResponse<T>)
- Database error handling with user-friendly messages

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
- Automatic client advancement through stages

**Product Catalog System:**
- Base items as templates with custom fields
- Operator-specific variations with pricing
- Flexible commission rules (percentage, fixed, tiered)
- Hierarchical item relationships

**Client Relationship Management:**
- Enhanced client records with Brazilian document validation
- Interaction history with duration tracking
- Task management with priority and assignment
- Proposal generation with approval workflow
- Booking management with status tracking

**Supplier/Operator Management:**
- Contact information and document storage
- Custom product variations and pricing
- Commission rule configuration
- Associated items cascade deletion

### Development Environment

**Required Environment Variables:**
```bash
DATABASE_URL        # PostgreSQL connection (Docker or remote)
AUTH_SECRET         # JWT secret (minimum 32 characters)
CSRF_SECRET         # CSRF protection secret (minimum 32 characters)
BASE_URL            # Application URL (defaults to localhost:3000)
```

**Optional Integrations:**
```bash
# Stripe payments
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# Upstash Redis (falls back to in-memory if not configured)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Email notifications
EMAIL_FROM
EMAIL_SERVER

# Monitoring
SENTRY_DSN
```

**Setup Process:**
1. Copy `.env.example` to `.env` and configure variables
2. Run `npm run db:setup` for interactive database configuration
3. Run `npm run db:migrate` to apply database schema
4. Run `npm run db:seed` for demo data
5. Environment validation runs automatically before dev/build
6. Default seeded credentials: `admin@demoagency.com` / `admin123`

### Testing Strategy

**Configuration (jest.config.js):**
- Jest with jsdom environment
- Tests in `__tests__/` directory with coverage reporting
- Module path mapping with `@/` alias
- Node.js polyfills for crypto and TextEncoder
- Transform ignores for jose module (ES modules handling)

**Test Coverage:**
- Collect from `lib/**` and `app/**`
- Exclude type definitions, node_modules, and build outputs

**Running Tests:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Code Style and Architecture Principles

- **Never use inline styles** - Always use CSS files for styling
- **Server-first approach** - Default to server components, minimize client-side JavaScript
- **Type safety** - TypeScript strict mode + Zod for runtime validation
- **Multi-tenant by default** - All queries automatically scoped by agency
- **Permission-driven UI** - Components hide/show based on user permissions
- **Brazilian market compliance** - Built-in CPF/CNPJ/CEP validation
- **Error handling** - Centralized error handling with user-friendly messages
- **Modular code organization** - Separate concerns into logical modules

### Key Security Considerations

- All server actions require authentication and proper permissions
- Agent role users can only access their own assigned clients
- Database queries are automatically scoped by `agencyId`
- CSRF protection for all state-changing operations (except Stripe webhooks)
- Comprehensive activity logging for audit compliance
- Rate limiting to prevent abuse (configurable per action)
- Security headers configured in middleware for XSS, clickjacking protection
- Session management with automatic cleanup of expired sessions
- Password hashing with bcrypt (10 salt rounds)

### Middleware Configuration

The middleware.ts file handles:
- Authentication checks for protected routes
- CSRF token validation for mutations
- Security headers injection
- Session refresh and validation
- Automatic redirects for authenticated/unauthenticated users

### Database Migration Workflow

1. Make schema changes in `lib/db/schema/` modules
2. Run `npm run db:generate` to create migration files
3. Review generated migrations in `drizzle/` directory
4. Run `npm run db:migrate` to apply changes
5. Use `npm run db:studio` for visual database management