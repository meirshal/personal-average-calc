# E2E Tests: Landing Page

**Route:** `/`
**Type:** Public (no auth required)

## Tests

### LP-01: Page loads successfully
- Navigate to `https://personal-average-calc.vercel.app/`
- **Expected:** Page returns HTTP 200
- **Expected:** Title is "מחשבון ממוצע בגרות"
- **Expected:** Response time < 2 seconds

### LP-02: Hebrew RTL layout
- Navigate to landing page
- **Expected:** `<html>` has `lang="he"` and `dir="rtl"`
- **Expected:** All text renders right-to-left
- **Expected:** Header text "מחשבון ממוצע בגרות" is centered

### LP-03: School list from database
- Navigate to landing page
- **Expected:** School "בליך" appears in the list
- **Expected:** Each school has a clickable link to `/school/{slug}`
- **Expected:** School list is fetched dynamically from the database (not hardcoded)

### LP-04: School link navigation
- Click on "בליך" school card
- **Expected:** Navigates to `/school/blich`
- **Expected:** Calculator page loads for that school

### LP-05: Empty state
- When no schools exist in the database
- **Expected:** Page still loads without errors
- **Expected:** Shows appropriate empty state message

### LP-06: Mobile responsive
- View landing page at 375px width (mobile)
- **Expected:** School cards stack vertically
- **Expected:** Text remains readable
- **Expected:** No horizontal scrolling
