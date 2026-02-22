# E2E Tests: Admin Category Management

**Route:** `/admin/categories`
**Type:** Authenticated (admin only)

## Prerequisites
- Logged in as admin for school "בליך"
- Default 7 categories seeded

## Tests

### CAT-01: Categories page loads
- Navigate to `/admin/categories`
- **Expected:** Page loads with list of all 7 categories
- **Expected:** Each category shows name, icon, and sort order
- **Expected:** Categories ordered by sort_order

### CAT-02: Category list contents
- Check the category list
- **Expected:** Contains all 7 default categories:
  - מקצועות חובה (📚)
  - מדעים וטכנולוגיה (🔬)
  - חברה ורוח (🌍)
  - הרחבות (📖)
  - שפות (🗣️)
  - אמנויות (🎨)
  - נוספים (⭐)

### CAT-03: Create new category
- Click "הוסף קטגוריה" (add category) button
- Enter name: "קטגוריית בדיקה"
- Enter icon: "🧪"
- Click save
- **Expected:** New category appears in the list
- **Expected:** Success toast/notification shown
- Navigate to `/school/blich`
- **Expected:** New category appears in the student calculator

### CAT-04: Edit category
- Click edit button on "קטגוריית בדיקה"
- Change name to "קטגוריה מעודכנת"
- Click save
- **Expected:** Category name updates in the list
- **Expected:** Change reflected in student calculator after reload

### CAT-05: Delete category
- Click delete button on "קטגוריה מעודכנת"
- **Expected:** Confirmation dialog appears
- Confirm deletion
- **Expected:** Category removed from list
- **Expected:** Category no longer appears in student calculator

### CAT-06: Delete category with subjects
- Try to delete a category that has subjects (e.g., "מקצועות חובה")
- **Expected:** Either prevents deletion with error, or cascades to delete subjects
- **Expected:** Data integrity maintained

### CAT-07: Category sort order
- Verify categories display in correct sort order
- **Expected:** Categories appear in the same order in admin and student calculator

### CAT-08: School scoping
- All category operations only affect the admin's school
- **Expected:** API calls include school_id scoping
- **Expected:** Cannot see/modify categories from other schools

### CAT-09: Input validation
- Try to create a category with empty name
- **Expected:** Validation error shown
- **Expected:** Category not created

### CAT-10: API endpoints
- `GET /api/admin/categories` (authenticated)
- **Expected:** Returns all categories for admin's school as JSON
- `POST /api/admin/categories` with `{ name, icon, sortOrder }`
- **Expected:** Creates category, returns 201
- `PUT /api/admin/categories/[id]` with updated fields
- **Expected:** Updates category, returns 200
- `DELETE /api/admin/categories/[id]`
- **Expected:** Deletes category, returns 200
