# E2E Tests: Cross-Cutting Concerns

**Type:** Integration / cross-feature tests

## Admin-to-Student Data Flow

### CC-01: Category changes propagate to calculator
- Admin creates a new category
- Student reloads `/school/blich`
- **Expected:** New category section appears in calculator
- Admin deletes the category
- Student reloads
- **Expected:** Category section disappears

### CC-02: Subject changes propagate to calculator
- Admin creates a subject with components
- Student reloads calculator
- **Expected:** Subject appears under correct category
- **Expected:** Toggle works, grade inputs show correct components/weights

### CC-03: Weight changes affect calculations
- Admin changes component weights for a subject
- Student reloads and enters grades
- **Expected:** Final grade calculated with new weights
- **Expected:** Weighted average reflects updated calculation

### CC-04: Level changes propagate
- Admin adds a new level to a subject
- Student reloads
- **Expected:** Level selector shows the new option
- **Expected:** Selecting the new level shows correct components

## Multi-School Isolation

### CC-05: Data isolation between schools
- Admin has access to multiple schools via `admin_school` junction table (e.g., blich and test-school)
- Add categories/subjects to each school
- **Expected:** `/school/blich` only shows blich's data
- **Expected:** `/school/test-school` only shows test-school's data
- **Expected:** Admin switching between schools in the switcher sees only the selected school's data
- **Expected:** CRUD operations scope to the `admin-school-id` cookie value

### CC-06: Admin scoped to their selected school
- Admin logs in (auto-selects first school or last-used school via `admin-school-id` cookie)
- All admin pages show only the selected school's data
- **Expected:** Dashboard shows selected school name and stats
- **Expected:** Categories list only selected school's categories
- **Expected:** Subjects list only selected school's subjects
- **Expected:** School switcher in nav bar reflects the current selection

## Performance

### CC-07: Page load times
- Landing page: < 2 seconds
- Calculator page: < 2 seconds
- Admin dashboard: < 3 seconds
- API config endpoint: < 1 second

### CC-08: API response caching
- GET `/api/schools/blich/config`
- **Expected:** Cache-Control header present
- **Expected:** Subsequent requests served faster (CDN cache)

## Security

### CC-09: No XSS in user-generated content
- Create a category with name containing `<script>alert('xss')</script>`
- **Expected:** Script tags are escaped/sanitized in both admin and student views
- **Expected:** No script execution

### CC-10: SQL injection protection
- Attempt SQL injection via API inputs
- **Expected:** Drizzle ORM parameterized queries prevent injection
- **Expected:** Zod validation rejects malformed input

### CC-11: CSRF protection
- Admin API routes are protected by session cookies
- **Expected:** SameSite cookie attribute prevents CSRF
- **Expected:** Cannot perform admin actions from external origins

## Error Handling

### CC-12: Database connection failure
- If database is unreachable
- **Expected:** Pages show appropriate error (not raw stack trace)
- **Expected:** Student calculator falls back gracefully

### CC-13: Invalid URL parameters
- `/school/` (no slug)
- **Expected:** 404 or redirect
- `/admin/subjects/invalid-uuid`
- **Expected:** 404 or "subject not found" message

## School Switcher Persistence

### CC-14: School selection persists across navigation
- Admin with multiple schools selects school B in the switcher
- Navigate between `/admin`, `/admin/categories`, `/admin/subjects`
- **Expected:** School B remains selected on all pages (cookie persists)
- **Expected:** All pages show school B's data consistently

### CC-15: API data isolation after school switch
- Admin switches from school A to school B via the switcher
- Perform CRUD operations (create category, create subject)
- **Expected:** New data created under school B only
- Switch back to school A
- **Expected:** School A's data unchanged, no cross-contamination

### CC-16: Create school auto-adds junction table entry
- Admin creates a new school via the create school dialog
- **Expected:** New row in `admin_school` table linking current admin to new school
- **Expected:** Admin can immediately access the new school (auto-switched)
- **Expected:** New school appears in school switcher dropdown
