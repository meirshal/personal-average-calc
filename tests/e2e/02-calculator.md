# E2E Tests: Student Calculator

**Route:** `/school/[slug]`
**Type:** Public (no auth required)

## Setup
- School "בליך" (slug: `blich`) must exist with seeded subjects
- Clear localStorage before each test

## Tests

### CALC-01: Page loads with correct school data
- Navigate to `/school/blich`
- **Expected:** Page returns HTTP 200
- **Expected:** Title contains "בליך"
- **Expected:** All 7 categories rendered: מקצועות חובה, מדעים וטכנולוגיה, חברה ורוח, הרחבות, שפות, אמנויות, נוספים
- **Expected:** All 29 subjects rendered across categories
- **Expected:** Response time < 2 seconds

### CALC-02: Summary bar initial state
- Load calculator page (fresh, no localStorage)
- **Expected:** "יחידות לימוד" shows 0
- **Expected:** "ממוצע משוקלל" shows em-dash (—)
- **Expected:** Summary bar is sticky at top of page

### CALC-03: Subject toggle ON
- Click toggle switch for "היסטוריה"
- **Expected:** Toggle switches to ON (blue)
- **Expected:** Grade input fields appear (components: פנימי 30%, חיצוני 70%)
- **Expected:** Subject card expands to show inputs

### CALC-04: Subject toggle OFF
- Toggle "היסטוריה" ON, then toggle it OFF
- **Expected:** Toggle switches back to OFF (gray)
- **Expected:** Grade input fields disappear
- **Expected:** Summary bar resets to 0 units and — average

### CALC-05: Grade input and weighted average
- Toggle "היסטוריה" ON
- Enter grade 90 for פנימי (weight 0.30)
- Enter grade 80 for חיצוני (weight 0.70)
- **Expected:** Final grade shows 83.0 (90*0.30 + 80*0.70)
- **Expected:** Summary bar shows 2 units
- **Expected:** Weighted average shows 83.0

### CALC-06: Multiple subjects average
- Toggle "היסטוריה" ON with grades 90/80 (final: 83.0, 2 units)
- Toggle "אנגלית" ON with grade 85 for all components (final: 85.0, 5 units)
- **Expected:** Summary shows 7 total units
- **Expected:** Weighted average = (83.0*2 + 85.0*5) / 7 = 84.43

### CALC-07: Math level selector
- Toggle "מתמטיקה" ON
- **Expected:** Level selector appears with options: "4 יח"ל" and "5 יח"ל"
- **Expected:** Default level is "4 יח"ל" (first option)
- Switch to "5 יח"ל"
- **Expected:** Components update to show the 5-unit level components
- **Expected:** Units in summary update accordingly

### CALC-08: Grade clamping
- Toggle any subject ON
- Enter grade 150 (above max)
- **Expected:** Value is clamped to 100
- Enter grade -10 (below min)
- **Expected:** Value is clamped to 0

### CALC-09: Component weights sum to 1.0
- For every subject in the database
- **Expected:** All component weights sum to exactly 1.00
- **Expected:** For multi-level subjects, each level's components sum to 1.00

### CALC-10: Subject dependency
- Toggle "תנ"ך" ON and enter grades (e.g., final = 83)
- Toggle "תנ"ך מורחב" ON
- **Expected:** Dependency info shows that תנ"ך grade is included (depWeight = 0.40)
- Enter grades for תנ"ך מורחב components
- **Expected:** Final grade includes base subject grade: components + 83*0.40

### CALC-11: LocalStorage persistence
- Toggle several subjects ON and enter grades
- Reload the page (F5)
- **Expected:** All toggled subjects remain ON
- **Expected:** All entered grades are preserved
- **Expected:** Selected level for math is preserved
- **Expected:** Summary bar shows same values as before reload

### CALC-12: LocalStorage scoped by school
- Enter grades on `/school/blich`
- Navigate to `/school/other-school` (if exists)
- **Expected:** Grades from "blich" do not appear on "other-school"

### CALC-13: RTL Hebrew layout
- Load calculator page
- **Expected:** `dir="rtl"` on wrapper element
- **Expected:** Subject names right-aligned
- **Expected:** Toggle switches positioned on left side
- **Expected:** Category headers right-aligned with icons

### CALC-14: Mobile responsive layout
- View calculator at 375px width
- **Expected:** Subject cards are full-width
- **Expected:** Grade inputs stack properly
- **Expected:** Summary bar remains readable
- **Expected:** No horizontal overflow

### CALC-15: Non-existent school
- Navigate to `/school/nonexistent-slug`
- **Expected:** Shows 404 or "school not found" message
- **Expected:** Does not crash with an error
