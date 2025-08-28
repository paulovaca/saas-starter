# GEMINI.md

## Project Overview

This is a Next.js SaaS starter template designed for building and launching modern, feature-rich web applications. It provides a solid foundation with essential SaaS functionalities already implemented, allowing developers to focus on their core business logic.

The project is built with a modern tech stack, including:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Database:** [Postgres](https://www.postgresql.org/)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Payments:** [Stripe](https://stripe.com/)
*   **UI:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
*   **Authentication:** JWT-based authentication with session management
*   **Testing:** [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/)

Key features include a marketing landing page, pricing page with Stripe Checkout, a user dashboard, role-based access control (RBAC), and an activity logging system.

## Building and Running

### Prerequisites

*   Node.js (v18 or later)
*   pnpm
*   Stripe CLI
*   PostgreSQL database

### Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file by running the setup script:
    ```bash
    pnpm db:setup
    ```
    This will guide you through the process of setting up your database and Stripe credentials.

3.  **Run database migrations:**
    ```bash
    pnpm db:migrate
    ```

4.  **Seed the database:**
    ```bash
    pnpm db:seed
    ```
    This will create a default user and agency for testing.

### Running the Application

*   **Development:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

*   **Production Build:**
    ```bash
    pnpm build
    ```

*   **Start Production Server:**
    ```bash
    pnpm start
    ```

### Testing

*   **Run all tests:**
    ```bash
    pnpm test
    ```

*   **Run tests in watch mode:**
    ```bash
    pnpm test:watch
    ```

*   **Generate test coverage report:**
    ```bash
    pnpm test:coverage
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS with CSS Variables for theming, as defined in `tailwind.config.ts` and `app/globals.css`. UI components are built using shadcn/ui.
*   **State Management:** SWR is used for data fetching and caching.
*   **Authentication:** Authentication is handled via JWTs stored in cookies. Middleware (`middleware.ts`) protects routes and manages sessions.
*   **Database:** Drizzle ORM is used for database access. The schema is defined in `lib/db/schema.ts`, and migrations are managed with `drizzle-kit`.
*   **API Routes:** API routes are located in `app/api/`.
*   **Components:** Reusable UI components are located in the `components/` directory.
*   **Linting and Formatting:** The project uses the default Next.js ESLint and Prettier configuration.
