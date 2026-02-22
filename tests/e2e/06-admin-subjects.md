# E2E Tests: Admin Subject Management

**Route:** `/admin/subjects`, `/admin/subjects/new`, `/admin/subjects/[id]`
**Type:** Authenticated (admin only)

## Prerequisites
- Logged in as admin for school "בליך"
- Default subjects seeded (29 subjects across 7 categories)

## Tests

### SUB-01: Subjects list page loads
- Navigate to `/admin/subjects`
- **Expected:** Page loads with all 29 subjects
- **Expected:** Subjects grouped by category
- **Expected:** Each subject shows name, units, and category

### SUB-02: Create new subject - simple
- Click "הוסף מקצוע" (add subject) button
- Navigate to `/admin/subjects/new`
- Fill in:
  - Name: "מקצוע בדיקה"
  - Category: select "מדעים וטכנולוגיה"
  - Units: 3
  - Has levels: No
- Add components:
  - Component 1: "בחינה" weight 0.60
  - Component 2: "עבודה" weight 0.40
- Click save
- **Expected:** Subject created successfully
- **Expected:** Redirects to subjects list
- **Expected:** New subject appears in the list
- **Expected:** Appears in student calculator under the selected category

### SUB-03: Create subject with levels
- Create a new subject:
  - Name: "מקצוע עם רמות"
  - Has levels: Yes
- Add Level 1: "3 יח"ל" with units=3
  - Component: "בחינה" weight 1.00
- Add Level 2: "5 יח"ל" with units=5
  - Component: "בחינה" weight 0.70
  - Component: "עבודה" weight 0.30
- Click save
- **Expected:** Subject created with both levels
- **Expected:** Student calculator shows level selector for this subject

### SUB-04: Create subject with dependency
- Create a new subject:
  - Name: "מקצוע תלוי"
  - Depends on: select "מקצוע בדיקה"
  - Dependency weight: 0.40
  - Dependency label: "ציון מקצוע בדיקה"
- Add components with weights summing to 0.60 (1.0 - depWeight)
- Click save
- **Expected:** Subject created with dependency reference
- **Expected:** Student calculator shows dependency info when both subjects enabled

### SUB-05: Edit subject
- Navigate to `/admin/subjects/[id]` for "מקצוע בדיקה"
- Change name to "מקצוע מעודכן"
- Change units to 5
- Click save
- **Expected:** Subject updated in list
- **Expected:** Changes reflected in student calculator

### SUB-06: Edit subject components
- Edit "מקצוע מעודכן"
- Change component weights to 0.50 / 0.50
- Click save
- **Expected:** Weights update
- **Expected:** Student calculator uses new weights for grade calculation

### SUB-07: Delete subject
- Click delete on "מקצוע מעודכן"
- **Expected:** Confirmation dialog
- Confirm deletion
- **Expected:** Subject removed from list
- **Expected:** Subject no longer appears in student calculator

### SUB-08: Weight validation - valid
- Create or edit a subject
- Set component weights that sum to exactly 1.00
- **Expected:** Save succeeds
- **Expected:** Weight validator shows green/valid state

### SUB-09: Weight validation - invalid
- Create or edit a subject
- Set component weights that sum to 0.80 (not 1.00)
- **Expected:** Weight validator shows error (red)
- **Expected:** Warning message about weights not summing to 1.00
- Try to save
- **Expected:** Either prevents save or shows warning

### SUB-10: Weight validation with dependency
- Edit a subject with dependency (depWeight = 0.40)
- Set component weights to sum to 0.60
- **Expected:** Total = components (0.60) + dependency (0.40) = 1.00
- **Expected:** Weight validator shows valid

### SUB-11: Component CRUD within subject
- Edit a subject
- Add a new component
- **Expected:** Component appears in editor
- Change component name and weight
- **Expected:** Updates reflected
- Delete a component
- **Expected:** Component removed

### SUB-12: Level CRUD within subject
- Edit a multi-level subject
- Add a new level
- **Expected:** Level appears with its own component editor
- Delete a level
- **Expected:** Level and its components removed

### SUB-13: School scoping
- All subject operations only affect the admin's school
- **Expected:** API calls include school_id scoping
- **Expected:** Cannot see/modify subjects from other schools

### SUB-14: Input validation
- Try to create a subject with empty name
- **Expected:** Validation error
- Try to create with negative units
- **Expected:** Validation error
- Try to create with no components
- **Expected:** Appropriate error or default behavior

### SUB-15: Seed subjects
- On the admin dashboard, click "Seed" button (if available)
- **Expected:** Seeds all 30 default Bagrut subjects
- **Expected:** Does not duplicate if subjects already exist
- **Expected:** All subjects appear correctly in student calculator

### SUB-16: API endpoints
- `GET /api/admin/subjects` (authenticated)
- **Expected:** Returns all subjects for admin's school
- `POST /api/admin/subjects` with subject data
- **Expected:** Creates subject with components, returns 201
- `GET /api/admin/subjects/[id]` (authenticated)
- **Expected:** Returns subject with components and levels
- `PUT /api/admin/subjects/[id]` with updated data
- **Expected:** Updates subject and components atomically
- `DELETE /api/admin/subjects/[id]`
- **Expected:** Deletes subject and cascades to components/levels

### SUB-17: Changes reflect in student calculator
- Create a new subject via admin
- Navigate to `/school/blich`
- **Expected:** New subject appears in the calculator
- Edit the subject weights via admin
- Reload student calculator
- **Expected:** Updated weights are used for calculation
- Delete the subject via admin
- Reload student calculator
- **Expected:** Subject no longer appears
