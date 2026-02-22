# E2E Test Suite - Bagrut Calculator

## Overview

End-to-end test descriptions for the multi-school Bagrut grade calculator web application.

**Production URL:** https://personal-average-calc.vercel.app
**Test School:** בליך (slug: `blich`)
**Admin Account:** meirshal@gmail.com

## Test Files

| File | Area | Tests |
|------|------|-------|
| [01-landing-page.md](./01-landing-page.md) | Landing page | 6 tests |
| [02-calculator.md](./02-calculator.md) | Student calculator | 15 tests |
| [03-auth-flow.md](./03-auth-flow.md) | Authentication | 13 tests |
| [04-admin-dashboard.md](./04-admin-dashboard.md) | Admin dashboard | 6 tests |
| [05-admin-categories.md](./05-admin-categories.md) | Category management | 10 tests |
| [06-admin-subjects.md](./06-admin-subjects.md) | Subject management | 17 tests |
| [07-api-endpoints.md](./07-api-endpoints.md) | API endpoints | 18 tests |
| [08-cross-cutting.md](./08-cross-cutting.md) | Cross-cutting concerns | 13 tests |

**Total: 98 test cases**

## Test Categories

### Public (no auth)
- Landing page rendering and navigation
- Calculator functionality (toggles, grades, averages, levels, dependencies)
- LocalStorage persistence
- Public API responses

### Authentication
- Google OAuth flow (redirect, account selection, callback, session exchange)
- Protected route access
- Sign out flow
- Non-admin rejection

### Admin (authenticated)
- Dashboard stats and navigation
- Category CRUD operations
- Subject CRUD with levels, components, dependencies
- Weight validation (components must sum to 1.0)
- Seed default subjects

### Integration
- Admin changes propagate to student calculator
- Multi-school data isolation
- Performance requirements
- Security (XSS, SQL injection, CSRF)

## Tech Stack Context

- **Framework:** Next.js 15 (App Router)
- **Auth:** Neon Auth (Google OAuth via Better Auth)
- **Database:** Neon Postgres (Drizzle ORM)
- **UI:** React 19 + Tailwind CSS
- **Validation:** Zod
- **State:** localStorage (student grades), server sessions (admin)
