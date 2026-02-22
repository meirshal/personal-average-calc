# E2E Tests: Admin Dashboard

**Route:** `/admin`
**Type:** Authenticated (admin only)

## Prerequisites
- Logged in as admin (meirshal@gmail.com) for school "בליך"

## Tests

### DASH-01: Dashboard loads with correct info
- Navigate to `/admin`
- **Expected:** Shows school name "בליך"
- **Expected:** Shows correct category count (7)
- **Expected:** Shows correct subject count (29)
- **Expected:** Shows admin email in header (meirshal@gmail.com)

### DASH-02: Navigation links
- On dashboard, check navigation bar
- **Expected:** Links to "לוח בקרה" (dashboard), "קטגוריות" (categories), "מקצועות" (subjects)
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
