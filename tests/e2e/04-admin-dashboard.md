# E2E Tests: Admin Dashboard

**Route:** `/admin`
**Type:** Authenticated (admin only)

## Prerequisites
- Logged in as admin (meirshal@gmail.com) for school "בליך"

## Tests

### DASH-01: Dashboard loads with correct info
- Navigate to `/admin`
- **Expected:** Shows school name "בליך" (via school switcher component in nav bar)
- **Expected:** Shows correct category count (7)
- **Expected:** Shows correct subject count (29)
- **Expected:** Shows admin email in header (meirshal@gmail.com)

### DASH-02: Navigation links
- On dashboard, check navigation bar
- **Expected:** Links to "לוח בקרה" (dashboard), "קטגוריות" (categories), "מקצועות" (subjects)
- **Expected:** School switcher component visible in nav bar (alongside school initial badge)
- Click "קטגוריות"
- **Expected:** Navigates to `/admin/categories`
- Click "מקצועות"
- **Expected:** Navigates to `/admin/subjects`

### DASH-03: Quick actions
- On dashboard, check quick action links
- **Expected:** "ניהול קטגוריות" link goes to `/admin/categories`
- **Expected:** "ניהול מקצועות" link goes to `/admin/subjects`

### DASH-04: Calculator link
- On dashboard, find "פתח את המחשבון" link
- **Expected:** Links to `/school/blich` (the student-facing calculator)
- Click the link
- **Expected:** Opens the calculator page for the school

### DASH-05: Sign out button
- On dashboard, find "התנתק" button in header
- **Expected:** Button is visible next to admin email
- Click the button
- **Expected:** Logs out and redirects to `/admin/login`

### DASH-06: Info section
- On dashboard, check the info/guide section
- **Expected:** Shows numbered steps for managing the calculator
- **Expected:** Mentions categories, subjects, weights, and sharing the calculator link

## School Switcher

### DASH-07: School switcher — single school
- Admin has access to only one school (e.g., "בליך")
- Navigate to `/admin`
- **Expected:** School name shown as static text in nav bar (not a dropdown)
- **Expected:** School initial badge displayed alongside the name

### DASH-08: School switcher — multiple schools
- Admin has access to 2+ schools (e.g., "בליך" and "הרצליה")
- Navigate to `/admin`
- **Expected:** School switcher renders as a `Select` dropdown in nav bar
- **Expected:** Current school name shown in dropdown trigger
- **Expected:** Dropdown lists all admin's schools
- **Expected:** Bottom option shows "+ בית ספר חדש" to create a new school

### DASH-09: Switch school
- Admin has access to multiple schools, currently viewing "בליך"
- Open school switcher dropdown, select a different school
- **Expected:** POST to `/api/admin/switch-school` with `{ schoolId }`
- **Expected:** `admin-school-id` cookie is updated
- **Expected:** Page refreshes via `router.refresh()`
- **Expected:** Dashboard shows the new school's name, category count, and subject count

### DASH-10: Create school dialog
- Open school switcher dropdown, click "+ בית ספר חדש"
- **Expected:** Dialog opens with two inputs: "שם בית הספר" (name) and "מזהה (slug)" (slug)
- **Expected:** Slug input is LTR with placeholder example (e.g., "my-school")
- Enter name "בית ספר חדש" and slug "new-school"
- Click create button
- **Expected:** POST to `/api/admin/schools` with `{ name, slug }`
- **Expected:** New school created, cookie set to new school, page refreshes
- **Expected:** Dashboard shows 0 categories, 0 subjects for the new empty school

### DASH-11: Create school validation
- Open create school dialog
- Enter invalid slug "INVALID SLUG!"
- **Expected:** Error message: "מזהה חייב להכיל רק אותיות קטנות באנגלית, מספרים ומקפים"
- **Expected:** Slug auto-lowercased on input
- Enter duplicate slug (e.g., "blich")
- **Expected:** Error message: "כתובת בית ספר כבר קיימת"
- **Expected:** Cannot create school with invalid or duplicate slug
