# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly to database
npm run db:studio    # Interactive DB viewer
npm run db:seed      # Seed initial subject data (tsx scripts/seed-subjects.ts)
npm run db:create-school  # Create a new school
npm run db:add-admin      # Add admin user by email
```

## Stack

Next.js 15 (App Router) + React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Radix primitives), Drizzle ORM on Neon Postgres, Neon Auth (OAuth). Deployed on Vercel.

## Architecture

Israeli bagrut (matriculation exam) weighted-average calculator with multi-school support and an admin dashboard.

### Data model

School → Categories → Subjects → Components (with weights). Subjects may have **Levels** (e.g., Math 4-unit vs 5-unit), in which case components belong to the level instead of the subject directly. Two "extended" subjects (תנ"ך מורחב, אזרחות מורחב) **depend on** a base subject — 40% of their final grade comes from the base subject's calculated grade via `dependsOnId`/`depWeight`.

### Grade calculation (`src/lib/calculator.ts`)

```
finalGrade = Σ(componentGrade × weight) + baseSubjectGrade × depWeight
schoolAverage = Σ(finalGrade × units) / Σ(units)   // enabled subjects with grades only
```

### Route structure

- `/` — Landing page (school selector)
- `/school/[slug]` — Public calculator (no auth)
- `/admin/login` — OAuth login
- `/admin/*` — Protected dashboard (categories, subjects CRUD)
- `/api/schools/[slug]/config` — Public config endpoint (cached 5m)
- `/api/admin/*` — Protected admin APIs with Zod validation

### Auth flow

Neon Auth middleware (`src/middleware.ts`) protects `/admin/*`. `requireAdmin()` in `src/lib/admin-auth.ts` verifies the session user's email exists in the `admin` table for their school.

### Key directories

- `src/components/calculator/` — Calculator UI (SubjectCard, ComponentInput, LevelSelector, DependencyInfo, SummaryBar)
- `src/components/admin/` — Admin forms and lists (SubjectForm, CategoriesClient, etc.)
- `src/components/ui/` — shadcn/ui primitives (do not edit manually — generated via `npx shadcn@latest add`)
- `src/db/schema.ts` — Drizzle schema (all tables)
- `src/lib/types.ts` — Shared TypeScript interfaces
- `src/hooks/useCalculator.ts` — Calculator state management (grades, enabled subjects, levels, localStorage persistence)

## E2E Tests

Manual test descriptions in `tests/e2e/` (98 test cases across 8 files). No automated test framework — tests are markdown checklists meant to be executed manually or via browser automation (Playwright). Covers landing page, calculator, auth flow, admin CRUD, API endpoints, and cross-cutting concerns (performance, security, RTL). Test school: `blich`.

## Conventions

- **Hebrew RTL**: Root layout sets `dir="rtl" lang="he"`. All UI text is Hebrew. Grade inputs are LTR numbers.
- **Tailwind v4**: Uses CSS-layer-based Tailwind. Do NOT add unlayered global CSS resets (e.g., `* { margin: 0 }`) — they override all Tailwind utilities.
- **shadcn/ui**: Components in `src/components/ui/` were added manually (not via `shadcn init`) due to Tailwind v4. Use `npx shadcn@latest add <component>` for new ones.
- **Database**: UUIDs for PKs, `sortOrder` integer for ordering, cascade deletes on foreign keys. All admin queries are scoped by `schoolId`.
- **Environment**: Requires `DATABASE_URL` and `NEON_AUTH_BASE_URL` in `.env.local`.
