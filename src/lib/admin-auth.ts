import { neonAuth } from "@/lib/auth/server";
import { getDb } from "@/db";
import { admins, adminSchools, schools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSelectedSchoolId } from "@/lib/school-selection";

export interface AdminSchool {
  adminId: string;
  schoolId: string;
  school: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Look up all schools an admin has access to.
 * Returns the admin's ID and all associated schools, or null if not found.
 */
export async function getAdminSchools(
  userEmail: string | null | undefined
): Promise<{ adminId: string; schools: Array<{ id: string; name: string; slug: string }> } | null> {
  if (!userEmail) {
    return null;
  }

  const rows = await getDb()
    .select({
      adminId: admins.id,
      schoolId: schools.id,
      schoolName: schools.name,
      schoolSlug: schools.slug,
    })
    .from(admins)
    .innerJoin(adminSchools, eq(admins.id, adminSchools.adminId))
    .innerJoin(schools, eq(adminSchools.schoolId, schools.id))
    .where(eq(admins.email, userEmail));

  if (rows.length === 0) {
    return null;
  }

  return {
    adminId: rows[0].adminId,
    schools: rows.map((row) => ({
      id: row.schoolId,
      name: row.schoolName,
      slug: row.schoolSlug,
    })),
  };
}

/**
 * Look up an admin's school by their email.
 * Returns the admin's school info if found, null otherwise.
 * @deprecated Use getAdminSchools() for multi-school support.
 */
export async function getAdminSchool(
  userEmail: string | null | undefined
): Promise<AdminSchool | null> {
  const result = await getAdminSchools(userEmail);

  if (!result || result.schools.length === 0) {
    return null;
  }

  const school = result.schools[0];
  return {
    adminId: result.adminId,
    schoolId: school.id,
    school,
  };
}

/**
 * Get the current session, verify admin status, and return school info.
 * Resolves the selected school from the cookie (defaults to first school).
 * Throws an error if the user is not authenticated or not an admin.
 */
export async function requireAdmin(): Promise<AdminSchool> {
  const { user } = await neonAuth();

  if (!user?.email) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const result = await getAdminSchools(user.email);

  if (!result || result.schools.length === 0) {
    throw new Error("NOT_ADMIN");
  }

  // Resolve selected school from cookie, default to first school
  const selectedSchoolId = await getSelectedSchoolId();
  const selectedSchool = selectedSchoolId
    ? result.schools.find((s) => s.id === selectedSchoolId)
    : undefined;

  const school = selectedSchool ?? result.schools[0];

  return {
    adminId: result.adminId,
    schoolId: school.id,
    school,
  };
}

/**
 * Like requireAdmin(), but also returns all schools the admin has access to.
 * Used by the layout's school switcher component.
 */
export async function requireAdminWithSchools(): Promise<{
  adminSchool: AdminSchool;
  allSchools: Array<{ id: string; name: string; slug: string }>;
}> {
  const { user } = await neonAuth();

  if (!user?.email) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const result = await getAdminSchools(user.email);

  if (!result || result.schools.length === 0) {
    throw new Error("NOT_ADMIN");
  }

  // Resolve selected school from cookie, default to first school
  const selectedSchoolId = await getSelectedSchoolId();
  const selectedSchool = selectedSchoolId
    ? result.schools.find((s) => s.id === selectedSchoolId)
    : undefined;

  const school = selectedSchool ?? result.schools[0];

  return {
    adminSchool: {
      adminId: result.adminId,
      schoolId: school.id,
      school,
    },
    allSchools: result.schools,
  };
}
