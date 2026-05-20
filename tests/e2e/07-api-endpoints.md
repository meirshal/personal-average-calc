# E2E Tests: API Endpoints

**Type:** HTTP API tests (curl-based)

## Public Endpoints

### API-01: GET /api/schools/[slug]/config
- `curl https://personal-average-calc.vercel.app/api/schools/blich/config`
- **Expected:** HTTP 200
- **Expected:** JSON response with `{ id, name, slug, categories: [...] }`
- **Expected:** Categories array has 7 items
- **Expected:** Total subjects across categories = 29
- **Expected:** Each subject has `components` array with weights summing to 1.00
- **Expected:** Multi-level subjects have `levels` array
- **Expected:** Response time < 2 seconds
- **Expected:** Cache-Control header set (public, s-maxage=300)

### API-02: GET /api/schools/[slug]/config - non-existent school
- `curl https://personal-average-calc.vercel.app/api/schools/nonexistent/config`
- **Expected:** HTTP 404
- **Expected:** JSON error response `{ error: "School not found" }`

## Protected Admin Endpoints - Unauthenticated

### API-03: GET /api/admin/categories - no auth
- `curl https://personal-average-calc.vercel.app/api/admin/categories`
- **Expected:** HTTP 401 Unauthorized

### API-04: GET /api/admin/subjects - no auth
- `curl https://personal-average-calc.vercel.app/api/admin/subjects`
- **Expected:** HTTP 401 Unauthorized

### API-05: POST /api/admin/seed - no auth
- `curl -X POST https://personal-average-calc.vercel.app/api/admin/seed`
- **Expected:** HTTP 401 Unauthorized

### API-06: POST /api/admin/categories - no auth
- `curl -X POST https://personal-average-calc.vercel.app/api/admin/categories -H 'Content-Type: application/json' -d '{"name":"test"}'`
- **Expected:** HTTP 401 Unauthorized

### API-07: PUT /api/admin/categories/[id] - no auth
- `curl -X PUT https://personal-average-calc.vercel.app/api/admin/categories/some-id`
- **Expected:** HTTP 401 Unauthorized

### API-08: DELETE /api/admin/categories/[id] - no auth
- `curl -X DELETE https://personal-average-calc.vercel.app/api/admin/categories/some-id`
- **Expected:** HTTP 401 Unauthorized

## Protected Admin Endpoints - Authenticated

### API-09: GET /api/admin/categories - authenticated
- With valid session cookie
- **Expected:** HTTP 200
- **Expected:** JSON array of categories for admin's school only
- **Expected:** Each category has `{ id, name, icon, sortOrder, schoolId }`

### API-10: POST /api/admin/categories - create
- With valid session cookie
- Body: `{ "name": "Test Category", "icon": "🧪", "sortOrder": 99 }`
- **Expected:** HTTP 201
- **Expected:** Returns created category with `id`
- **Expected:** Category scoped to admin's school

### API-11: PUT /api/admin/categories/[id] - update
- With valid session cookie
- Body: `{ "name": "Updated Category" }`
- **Expected:** HTTP 200
- **Expected:** Category name updated

### API-12: DELETE /api/admin/categories/[id] - delete
- With valid session cookie
- **Expected:** HTTP 200
- **Expected:** Category removed from database

### API-13: POST /api/admin/subjects - create
- With valid session cookie
- Body: `{ "name": "Test Subject", "categoryId": "<id>", "units": 3, "hasLevels": false, "components": [{ "name": "Exam", "weight": 1.0, "sortOrder": 0 }] }`
- **Expected:** HTTP 201
- **Expected:** Returns created subject with components

### API-14: PUT /api/admin/subjects/[id] - update
- With valid session cookie
- Body: updated subject data with components
- **Expected:** HTTP 200
- **Expected:** Subject and components updated atomically

### API-15: DELETE /api/admin/subjects/[id] - delete
- With valid session cookie
- **Expected:** HTTP 200
- **Expected:** Subject and related components/levels cascade deleted

### API-16: POST /api/admin/seed - seed defaults
- With valid session cookie
- **Expected:** HTTP 200
- **Expected:** Creates default 30 Bagrut subjects for the school
- **Expected:** Idempotent - does not duplicate if already seeded

## Input Validation

### API-17: POST /api/admin/categories - invalid input
- Empty name: `{ "name": "" }`
- **Expected:** HTTP 400 with validation error
- Missing name: `{}`
- **Expected:** HTTP 400 with validation error

### API-18: POST /api/admin/subjects - invalid input
- Missing category: `{ "name": "Test" }`
- **Expected:** HTTP 400 with validation error
- Invalid units: `{ "name": "Test", "categoryId": "x", "units": -1 }`
- **Expected:** HTTP 400 with validation error

## School Management Endpoints

### API-19: POST /api/admin/switch-school - no auth
- `curl -X POST https://personal-average-calc.vercel.app/api/admin/switch-school -H 'Content-Type: application/json' -d '{"schoolId":"some-id"}'`
- **Expected:** HTTP 401 Unauthorized

### API-20: POST /api/admin/switch-school - authenticated valid
- With valid session cookie
- Body: `{ "schoolId": "<id-of-school-admin-has-access-to>" }`
- **Expected:** HTTP 200
- **Expected:** `admin-school-id` cookie set to the new school ID
- **Expected:** Cookie attributes: httpOnly, sameSite=lax, path=/admin, 1yr expiry

### API-21: POST /api/admin/switch-school - forbidden school
- With valid session cookie
- Body: `{ "schoolId": "<id-of-school-admin-has-NO-access-to>" }`
- **Expected:** HTTP 403 Forbidden
- **Expected:** Error message in Hebrew: "אין לך הרשאה לבית ספר זה"

### API-22: POST /api/admin/switch-school - invalid input
- With valid session cookie
- Body: `{}` (missing schoolId)
- **Expected:** HTTP 400 with Zod validation error

### API-23: POST /api/admin/schools - no auth
- `curl -X POST https://personal-average-calc.vercel.app/api/admin/schools -H 'Content-Type: application/json' -d '{"name":"Test","slug":"test"}'`
- **Expected:** HTTP 401 Unauthorized

### API-24: POST /api/admin/schools - create school
- With valid session cookie
- Body: `{ "name": "בית ספר חדש", "slug": "new-school" }`
- **Expected:** HTTP 201
- **Expected:** Returns created school with `{ id, name, slug }`
- **Expected:** `admin_school` junction table entry created for current admin
- **Expected:** `admin-school-id` cookie set to the new school's ID

### API-25: POST /api/admin/schools - duplicate slug
- With valid session cookie
- Body: `{ "name": "Another School", "slug": "blich" }` (slug already exists)
- **Expected:** HTTP 409 Conflict
- **Expected:** Error message: "כתובת בית ספר כבר קיימת"

### API-26: POST /api/admin/schools - invalid slug format
- With valid session cookie
- Body: `{ "name": "Test", "slug": "INVALID SLUG!" }`
- **Expected:** HTTP 400 with validation error
- **Expected:** Slug must match pattern: lowercase alphanumeric + hyphens only
