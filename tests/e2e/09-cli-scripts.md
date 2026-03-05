# E2E Tests: CLI Scripts

**Type:** CLI (Node.js scripts via `tsx`)

## Prerequisites
- Database accessible via `DATABASE_URL` in `.env.local`
- At least one school exists (e.g., "בליך" / `blich`)

## Tests

### CLI-01: add-admin adds admin to school
- Run `npm run db:add-admin` with a new email and school slug
- **Expected:** Admin row created in `admins` table (if not exists)
- **Expected:** Row inserted in `admin_school` junction table linking admin to school
- **Expected:** Success message shown

### CLI-02: add-admin adds same admin to second school
- Admin already has access to school A
- Run `npm run db:add-admin` with the same email and school B's slug
- **Expected:** No duplicate admin row created
- **Expected:** New `admin_school` row links existing admin to school B
- **Expected:** Admin now has access to both schools

### CLI-03: add-admin detects duplicate association
- Admin already has access to a school
- Run `npm run db:add-admin` with the same email and same school slug
- **Expected:** Script detects existing `admin_school` row
- **Expected:** Message: "already has access" or equivalent
- **Expected:** No duplicate junction table entry created

### CLI-04: remove-admin removes from specific school
- Admin has access to schools A and B
- Run `npm run db:remove-admin` with `--school` flag specifying school A
- **Expected:** Removes only the `admin_school` row for school A
- **Expected:** Admin still has access to school B
- **Expected:** Admin row in `admins` table preserved

### CLI-05: remove-admin removes admin entirely
- Admin has access to one or more schools
- Run `npm run db:remove-admin` without `--school` flag
- **Expected:** Removes all `admin_school` rows for the admin
- **Expected:** Admin row removed from `admins` table
- **Expected:** Admin can no longer log in to any school's dashboard

### CLI-06: list-schools shows all schools
- Run `npm run db:list-schools` (via `scripts/list-schools.ts`)
- **Expected:** Lists all schools with name, slug, and admin count
- **Expected:** Output formatted as a readable table or list

### CLI-07: list-schools shows admin associations
- Multiple admins associated with different schools
- Run `npm run db:list-schools`
- **Expected:** Each school shows its associated admin emails
- **Expected:** Admins with access to multiple schools appear under each relevant school
