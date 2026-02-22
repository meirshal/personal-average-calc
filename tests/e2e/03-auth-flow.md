# E2E Tests: Authentication Flow

**Routes:** `/admin/login`, `/admin`, `/api/auth/[...path]`
**Type:** Auth (Neon Auth + Google OAuth)

## Tests

### AUTH-01: Login page loads
- Navigate to `/admin/login`
- **Expected:** Page returns HTTP 200
- **Expected:** Title is "התחברות למערכת ניהול"
- **Expected:** Sign-in form with email/password fields visible
- **Expected:** "Sign in with Google" button visible

### AUTH-02: Unauthenticated redirect to login
- Navigate to `/admin` without being logged in
- **Expected:** Redirects (307) to `/admin/login`
- Navigate to `/admin/categories` without being logged in
- **Expected:** Redirects (307) to `/admin/login`
- Navigate to `/admin/subjects` without being logged in
- **Expected:** Redirects (307) to `/admin/login`

### AUTH-03: Login page does NOT redirect loop
- Navigate to `/admin/login` without being logged in
- **Expected:** Page renders the login form (HTTP 200)
- **Expected:** No infinite redirect loop (was a previous bug)

### AUTH-04: Google OAuth flow - account selection
- On `/admin/login`, click "Sign in with Google"
- **Expected:** Redirects to Google account chooser
- **Expected:** Google page shows "to continue to neon.tech"

### AUTH-05: Google OAuth flow - successful login
- Select the admin account (meirshal@gmail.com) on Google
- **Expected:** Google authenticates and redirects back to app
- **Expected:** Neon Auth middleware exchanges session verifier
- **Expected:** Session cookie is set on app domain
- **Expected:** User lands on `/admin` dashboard (not login page)

### AUTH-06: OAuth session verifier exchange
- After Google OAuth, the callback URL is `/admin?neon_auth_session_verifier=xxx`
- **Expected:** Middleware matcher includes `/admin` (exact match)
- **Expected:** Middleware detects verifier param + challenge cookie
- **Expected:** Exchanges verifier for session via Neon Auth server
- **Expected:** Redirects to `/admin` without verifier param, with session cookies set

### AUTH-07: Already authenticated redirect
- Log in with Google successfully
- Navigate to `/admin/login`
- **Expected:** Server-side `neonAuth()` detects user
- **Expected:** Automatically redirects to `/admin`

### AUTH-08: Sign out
- While authenticated, click "התנתק" (sign out) button
- **Expected:** Session is cleared
- **Expected:** Redirects to `/admin/login`
- Navigate to `/admin`
- **Expected:** Redirects to `/admin/login` (no longer authenticated)

### AUTH-09: Non-admin email rejection
- Log in with a Google account not in the `admins` table
- **Expected:** User sees "אין לך הרשאות" or equivalent unauthorized message
- **Expected:** Cannot access admin dashboard

### AUTH-10: API route protection (unauthenticated)
- `GET /api/admin/categories` without session cookie
- **Expected:** Returns 401 Unauthorized
- `GET /api/admin/subjects` without session cookie
- **Expected:** Returns 401 Unauthorized
- `POST /api/admin/seed` without session cookie
- **Expected:** Returns 401 Unauthorized

### AUTH-11: API route protection (wrong school)
- Authenticate as admin for school A
- Try to access/modify data for school B via API
- **Expected:** Queries are scoped to admin's school only
- **Expected:** Cannot see or modify other schools' data

### AUTH-12: Public API routes remain accessible
- `GET /api/schools/blich/config` without session cookie
- **Expected:** Returns 200 with valid JSON config
- **Expected:** No authentication required for public endpoints

### AUTH-13: Session persistence across page navigation
- Log in successfully
- Navigate between `/admin`, `/admin/categories`, `/admin/subjects`
- **Expected:** Remains authenticated on all pages
- **Expected:** No re-login required between navigation
