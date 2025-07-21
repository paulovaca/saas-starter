# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant SaaS application built for travel agencies using Next.js 15, TypeScript, PostgreSQL with Drizzle ORM, and Stripe for payments. The application follows a modular architecture with clear separation between features.

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
npm run db:setup    # Initial database setup
npm run db:migrate  # Run migrations
npm run db:generate # Generate new migrations
npm run db:studio   # Open Drizzle Studio
npm run db:seed     # Seed with demo data

# Build & production
npm run build
npm run start

# Validate environment variables
npm run validate:env
```

## Architecture Overview

### Directory Structure
- `app/` - Next.js App Router pages
  - `(dashboard)/` - Protected routes requiring authentication
  - `(login)/` - Public authentication pages
  - `api/` - API endpoints
- `components/` - React components organized by feature (catalog, clients, funnels, operators) with shared UI components
- `lib/` - Core business logic
  - `actions/` - Server actions organized by feature
  - `auth/` - Authentication logic using JWT in cookies
  - `db/` - Database configuration, Drizzle schema, and migrations
  - `services/` - Service layers (error handling, rate limiting)
  - `validations/` - Zod schemas for data validation

### Key Patterns

1. **Server Actions**: All mutations use Next.js server actions located in `lib/actions/`. Each feature has its own actions file.

2. **Database Schema**: Drizzle ORM schemas are in `lib/db/schema/`. Key entities:
   - `user`, `agency` - Multi-tenancy and authentication
   - `client`, `funnel`, `funnelStage` - Sales pipeline
   - `baseItem`, `operatorBaseItem` - Product catalog
   - `operator` - Suppliers/operators

3. **Authentication Flow**:
   - JWT tokens stored in httpOnly cookies
   - User roles: developer (super admin), master (agency owner), administrator, agent
   - Protected routes use `getCurrentUser()` from `lib/auth/session.ts`

4. **Form Handling**: React Hook Form + Zod validation pattern:
   ```typescript
   const form = useForm<z.infer<typeof schema>>({
     resolver: zodResolver(schema),
   });
   ```

5. **Error Handling**: Centralized error service in `lib/services/error.ts` with actionError helper

6. **Multi-tenancy**: All queries filter by `agencyId` from the current user's session

### Testing Approach

Tests are located in `__tests__/` directory. Run specific tests:
```bash
npm test -- path/to/test.test.ts
```

### Important Considerations

1. **Environment Variables**: Always validate with `npm run validate:env` before starting development
2. **Database Changes**: Generate migrations with `npm run db:generate` after schema changes
3. **Type Safety**: Leverage TypeScript and Zod for runtime validation
4. **Server Components**: Default to server components; use "use client" only when needed
5. **Caching**: Optional Redis cache via Upstash, falls back to in-memory cache

### Current Feature Modules

- **Clients**: Customer management with sales funnel integration
- **Catalog**: Base items (products) management
- **Operators**: Supplier/operator management
- **Funnels**: Sales pipeline configuration
- **Users**: User and role management
- **Settings**: Agency configuration

Each module follows the same pattern with dedicated actions, components, and validations.